/**
 * Payout Execution Service
 * Handles sending USDC payments to users on-chain
 * Can be used for manual admin payments or automated execution
 */

import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import {
  createWalletClient,
  http,
  parseUnits,
  PublicClient,
  createPublicClient,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import {
  mainnet,
  bsc,
  polygon,
  arbitrum,
  optimism,
  avalanche,
} from 'viem/chains';
import { Payout, PayoutDocument, PayoutStatus } from '../schemas/payout.schema';
import { CHAIN_CONFIG } from '../constants/chain-config.constant';

// ERC20 ABI for USDC transfer
const ERC20_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

@Injectable()
export class PayoutExecutionService {
  private readonly logger = new Logger(PayoutExecutionService.name);
  private readonly chains: Map<number, any>;
  private readonly publicClients: Map<number, PublicClient>;

  constructor(
    @InjectModel(Payout.name) private payoutModel: Model<PayoutDocument>,
    private configService: ConfigService,
  ) {
    // Initialize chain configurations
    this.chains = new Map([
      [1, mainnet],
      [56, bsc],
      [137, polygon],
      [42161, arbitrum],
      [10, optimism],
      [43114, avalanche],
    ]);

    // Initialize public clients for reading blockchain state
    this.publicClients = new Map();
    Object.entries(CHAIN_CONFIG).forEach(([chainId, config]) => {
      const chain = this.chains.get(Number(chainId));
      if (chain) {
        const client = createPublicClient({
          chain,
          transport: http(config.rpcUrl),
        }) as PublicClient;
        this.publicClients.set(Number(chainId), client);
      }
    });
  }

  /**
   * Execute a pending payout
   * Sends USDC on-chain using the configured payout wallet
   */
  async executePayout(payoutId: string): Promise<PayoutDocument> {
    const payout = await this.payoutModel.findById(payoutId).exec();

    if (!payout) {
      throw new NotFoundException(`Payout ${payoutId} not found`);
    }

    if (payout.status !== PayoutStatus.PENDING) {
      throw new BadRequestException(
        `Payout ${payoutId} is not pending (status: ${payout.status})`,
      );
    }

    // Get payout wallet private key from env
    const payoutPrivateKey = this.configService.get<string>(
      'PAYOUT_WALLET_PRIVATE_KEY',
    );

    if (!payoutPrivateKey) {
      throw new BadRequestException(
        'PAYOUT_WALLET_PRIVATE_KEY not configured. Cannot execute payouts.',
      );
    }

    try {
      // Update status to processing
      payout.status = PayoutStatus.PROCESSING;
      await payout.save();

      const chain = this.chains.get(payout.chainId);
      if (!chain) {
        throw new Error(`Unsupported chain: ${payout.chainId}`);
      }

      const chainConfig = CHAIN_CONFIG[payout.chainId];
      if (!chainConfig) {
        throw new Error(`Chain config not found for ${payout.chainId}`);
      }

      // Create wallet client
      const account = privateKeyToAccount(payoutPrivateKey as `0x${string}`);
      const walletClient = createWalletClient({
        account,
        chain,
        transport: http(chainConfig.rpcUrl),
      });

      // USDC has 6 decimals
      const usdcDecimals = 6;
      const amountInUnits = parseUnits(
        payout.amountUsd.toFixed(6),
        usdcDecimals,
      );

      // Send USDC transfer transaction
      this.logger.log(
        `Sending ${payout.amountUsd} USDC to ${payout.walletAddress} on chain ${payout.chainId}`,
      );

      const txHash = await walletClient.writeContract({
        address: payout.tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [payout.walletAddress as `0x${string}`, amountInUnits],
      });

      this.logger.log(`Payout transaction sent: ${txHash}`);

      // Wait for transaction confirmation
      const publicClient = this.publicClients.get(payout.chainId);
      if (publicClient) {
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash,
        });

        if (receipt.status === 'reverted') {
          throw new Error('Transaction reverted on chain');
        }

        this.logger.log(`Payout transaction confirmed: ${txHash}`);
      }

      // Update payout with success
      payout.status = PayoutStatus.COMPLETED;
      payout.txHash = txHash;
      payout.paidAt = new Date();
      await payout.save();

      this.logger.log(`Payout ${payoutId} completed successfully`);

      return payout;
    } catch (error) {
      this.logger.error(`Failed to execute payout ${payoutId}:`, error);

      // Update payout with failure
      payout.status = PayoutStatus.FAILED;
      payout.failureReason =
        error instanceof Error ? error.message : 'Unknown error';
      await payout.save();

      throw error;
    }
  }

  /**
   * Execute multiple payouts in batch
   */
  async executePayoutBatch(payoutIds: string[]): Promise<{
    successful: string[];
    failed: string[];
  }> {
    const successful: string[] = [];
    const failed: string[] = [];

    for (const payoutId of payoutIds) {
      try {
        await this.executePayout(payoutId);
        successful.push(payoutId);
      } catch (error) {
        this.logger.error(`Failed to execute payout ${payoutId}:`, error);
        failed.push(payoutId);
      }
    }

    return { successful, failed };
  }

  /**
   * Get payout wallet balance for a chain
   */
  async getPayoutWalletBalance(chainId: number): Promise<{
    balance: string;
    balanceUsd: number;
  }> {
    const payoutPrivateKey = this.configService.get<string>(
      'PAYOUT_WALLET_PRIVATE_KEY',
    );

    if (!payoutPrivateKey) {
      throw new BadRequestException('PAYOUT_WALLET_PRIVATE_KEY not configured');
    }

    const account = privateKeyToAccount(payoutPrivateKey as `0x${string}`);
    const publicClient = this.publicClients.get(chainId);

    if (!publicClient) {
      throw new BadRequestException(`Unsupported chain: ${chainId}`);
    }

    const chainConfig = CHAIN_CONFIG[chainId];
    if (!chainConfig) {
      throw new BadRequestException(`Chain config not found for ${chainId}`);
    }

    // Read USDC balance
    const balance = (await publicClient.readContract({
      address: chainConfig.usdc as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [account.address],
    })) as bigint;

    // USDC has 6 decimals
    const balanceUsd = Number(balance) / 1_000_000;

    return {
      balance: balance.toString(),
      balanceUsd,
    };
  }

  /**
   * Get pending payouts for admin approval
   */
  async getPendingPayouts(limit: number = 50): Promise<PayoutDocument[]> {
    return this.payoutModel
      .find({ status: PayoutStatus.PENDING })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Get all payouts with filtering
   */
  async getAllPayouts(
    status?: PayoutStatus,
    chainId?: number,
    limit: number = 100,
  ): Promise<PayoutDocument[]> {
    const query: any = {};
    if (status) query.status = status;
    if (chainId) query.chainId = chainId;

    return this.payoutModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Manually approve a payout (sets status to PENDING if needed)
   */
  async approvePayout(payoutId: string): Promise<PayoutDocument> {
    const payout = await this.payoutModel.findById(payoutId).exec();

    if (!payout) {
      throw new NotFoundException(`Payout ${payoutId} not found`);
    }

    if (payout.status !== PayoutStatus.PENDING) {
      throw new BadRequestException(
        `Payout is not in pending approval status`,
      );
    }

    this.logger.log(`Payout ${payoutId} approved by admin`);
    return payout;
  }

  /**
   * Reject a payout
   */
  async rejectPayout(
    payoutId: string,
    reason: string,
  ): Promise<PayoutDocument> {
    const payout = await this.payoutModel.findById(payoutId).exec();

    if (!payout) {
      throw new NotFoundException(`Payout ${payoutId} not found`);
    }

    payout.status = PayoutStatus.FAILED;
    payout.failureReason = `Rejected by admin: ${reason}`;
    await payout.save();

    this.logger.log(`Payout ${payoutId} rejected: ${reason}`);
    return payout;
  }
}
