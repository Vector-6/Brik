/**
 * Rewards Module
 * Complete rewards system for Brik platform
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RewardsController } from './rewards.controller';
import { AdminPayoutController } from './controllers/admin-payout.controller';
import { RewardsService } from './services/rewards.service';
import { SwapVerificationService } from './services/swap-verification.service';
import { PointsService } from './services/points.service';
import { CashbackService } from './services/cashback.service';
import { ReferralService } from './services/referral.service';
import { MysteryBoxService } from './services/mystery-box.service';
import { AntiAbuseService } from './services/anti-abuse.service';
import { PayoutExecutionService } from './services/payout-execution.service';
import { BlockchainModule } from '../blockchain/blockchain.module';

// Schemas
import { User, UserSchema } from './schemas/user.schema';
import { Swap, SwapSchema } from './schemas/swap.schema';
import { Fee, FeeSchema } from './schemas/fee.schema';
import {
  PointsLedger,
  PointsLedgerSchema,
} from './schemas/points-ledger.schema';
import {
  CashbackBatch,
  CashbackBatchSchema,
} from './schemas/cashback-batch.schema';
import {
  ReferralCode,
  ReferralCodeSchema,
} from './schemas/referral-code.schema';
import {
  ReferralEarning,
  ReferralEarningSchema,
} from './schemas/referral-earning.schema';
import {
  RewardPool,
  RewardPoolSchema,
} from './schemas/reward-pool.schema';
import {
  MysteryBox,
  MysteryBoxSchema,
} from './schemas/mystery-box.schema';
import { Payout, PayoutSchema } from './schemas/payout.schema';
import {
  RewardEvent,
  RewardEventSchema,
} from './schemas/reward-event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Swap.name, schema: SwapSchema },
      { name: Fee.name, schema: FeeSchema },
      { name: PointsLedger.name, schema: PointsLedgerSchema },
      { name: CashbackBatch.name, schema: CashbackBatchSchema },
      { name: ReferralCode.name, schema: ReferralCodeSchema },
      { name: ReferralEarning.name, schema: ReferralEarningSchema },
      { name: RewardPool.name, schema: RewardPoolSchema },
      { name: MysteryBox.name, schema: MysteryBoxSchema },
      { name: Payout.name, schema: PayoutSchema },
      { name: RewardEvent.name, schema: RewardEventSchema },
    ]),
    BlockchainModule,
  ],
  controllers: [RewardsController, AdminPayoutController],
  providers: [
    RewardsService,
    SwapVerificationService,
    PointsService,
    CashbackService,
    ReferralService,
    MysteryBoxService,
    AntiAbuseService,
    PayoutExecutionService,
  ],
  exports: [
    RewardsService,
    PointsService,
    CashbackService,
    ReferralService,
    MysteryBoxService,
  ],
})
export class RewardsModule {}
