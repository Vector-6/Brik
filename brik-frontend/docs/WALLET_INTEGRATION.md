# Wallet Integration Documentation

This document provides an overview of the Rainbow Wallet integration implemented in the Brik frontend application.

## 🎯 Overview

The application now supports wallet connections using **RainbowKit** + **Wagmi** + **Viem**, providing a seamless Web3 experience for users across multiple chains.

## 🔗 Supported Networks

The application supports the following 6 blockchain networks:

1. **Ethereum Mainnet** (Chain ID: 1)
2. **BNB Smart Chain** (Chain ID: 56)
3. **Polygon** (Chain ID: 137)
4. **Arbitrum One** (Chain ID: 42161)
5. **Optimism** (Chain ID: 10)
6. **Avalanche C-Chain** (Chain ID: 43114)

## 📦 Dependencies

The following packages have been installed:

```json
{
  "@rainbow-me/rainbowkit": "^2.2.9",
  "wagmi": "^2.x",
  "viem": "^2.x"
}
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Required: Get your project ID from https://cloud.reown.com/
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Optional: Custom RPC endpoints for better reliability
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
```

### Wagmi Configuration

Location: `lib/config/wagmi.ts`

The wagmi configuration includes:
- All 6 supported chains
- RPC transports with fallback to public RPCs
- WalletConnect project ID
- SSR support for Next.js

### Provider Setup

Location: `app/providers.tsx`

The application is wrapped with:
1. `WagmiProvider` - Wagmi configuration
2. `QueryClientProvider` - React Query for caching
3. `RainbowKitProvider` - Wallet UI and connection logic

## 🎨 Components

### ConnectButton

Location: `components/features/auth/ConnectButton.tsx`

A custom-styled wallet connection button that matches Brik's design system. Features:
- Custom gradient styling
- Chain selector
- Account display with balance
- Wrong network detection
- Mobile responsive

### Integration Points

1. **Navbar** - ConnectButton in top-right corner
2. **SwapCardContainer** - Wallet connection check before swaps
3. **SwapStatusModal** - Transaction tracking with explorer links

## 🪝 Hooks

### useWallet

Location: `components/features/swap/hooks/useWallet.ts`

Provides easy access to wallet state:

```typescript
const { wallet, balance, disconnect, shortAddress } = useWallet();

// Check connection
if (!wallet.isConnected) {
  return <ConnectButton />;
}

// Display info
console.log(wallet.address); // 0x1234...
console.log(wallet.chainId); // 1
console.log(balance?.formatted); // "1.5 ETH"
console.log(shortAddress); // "0x1234...5678"
```

### useChainSwitch

Location: `components/features/swap/hooks/useChainSwitch.ts`

Handles chain switching:

```typescript
const { switchChain, isPending, chains } = useChainSwitch();

// Switch to Polygon
await switchChain(137);
```

### Updated useSwapLogic

Now includes wallet integration:
- Checks wallet connection before allowing swaps
- Provides wallet address and chain ID
- Validates quotes exist before swap

## 🛠️ Utilities

### Chain Utilities

Location: `lib/utils/chain.ts`

```typescript
import { getChainName, getBlockExplorerUrl, isSupportedChain } from '@/lib/utils/chain';

// Get chain name
const name = getChainName(1); // "Ethereum"

// Get explorer URL
const url = getBlockExplorerUrl(1, '0x123...'); // "https://etherscan.io/tx/0x123..."

// Check if supported
const supported = isSupportedChain(137); // true
```

### Wallet Error Handling

Location: `lib/utils/walletErrors.ts`

```typescript
import {
  getWalletErrorMessage,
  classifyWalletError,
  logWalletError
} from '@/lib/utils/walletErrors';

try {
  // ... wallet operation
} catch (error) {
  const message = getWalletErrorMessage(error);
  const type = classifyWalletError(error);
  logWalletError('swap', error, { amount, token });
}
```

## 📝 Type Definitions

Location: `lib/types/wallet.types.ts`

Comprehensive TypeScript types for:
- `WalletState` - Connection status and info
- `WalletBalance` - Token balance data
- `TransactionState` - Transaction status
- `SwapTransaction` - Swap-specific data
- `WalletError` - Error classification

## 🔒 Security Features

1. **Chain Validation** - Blocks operations on unsupported chains
2. **Connection Checks** - Requires wallet connection before swaps
3. **Error Classification** - User-friendly error messages
4. **Transaction Tracking** - Links to block explorers for verification

## 🚀 Usage Flow

1. **User Visits App**
   - Navbar shows "Connect Wallet" button

2. **User Clicks Connect**
   - RainbowKit modal opens
   - User selects wallet (MetaMask, WalletConnect, etc.)
   - Wallet prompts for connection approval

3. **Wallet Connected**
   - Navbar shows connected address and chain
   - User can switch chains using chain selector
   - Swap interface becomes available

4. **User Navigates to Swap**
   - If not connected, shows "Connect Your Wallet" message
   - If wrong chain, shows "Unsupported Network" message
   - If connected and correct chain, shows swap interface

5. **User Performs Swap**
   - Selects tokens and enters amount
   - Clicks swap button
   - Wallet prompts for transaction approval
   - Transaction is submitted
   - Modal shows pending state with spinner
   - On success, shows success with explorer link
   - On error, shows user-friendly error message

## 🧪 Testing Checklist

- [ ] Connect with MetaMask
- [ ] Connect with WalletConnect (mobile)
- [ ] Connect with Coinbase Wallet
- [ ] Switch between all 6 chains
- [ ] Detect wrong network
- [ ] Display balance correctly
- [ ] Disconnect wallet
- [ ] Responsive on mobile
- [ ] Transaction success flow
- [ ] Transaction error handling
- [ ] User rejection handling

## 📚 Resources

- [RainbowKit Documentation](https://rainbowkit.com/docs/installation)
- [Wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)
- [WalletConnect Cloud](https://cloud.reown.com/)

## 🐛 Troubleshooting

### "Project ID is not set"
- Add `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` to `.env.local`
- Get a free project ID from https://cloud.reown.com/

### "Chain not supported"
- Check if the chain ID is in `lib/constants/chains.ts`
- Verify wagmi config includes the chain

### "Transaction failing"
- Check user has sufficient balance
- Verify gas estimation
- Check if token approval is needed
- Review contract interaction logs

## 🔮 Future Enhancements

1. **Phase 5 & 7 (Excluded from this implementation)**
   - Token approval flow for ERC20 swaps
   - Smart contract integration
   - On-chain transaction execution
   - Transaction history tracking
   - Gas estimation

2. **Potential Additions**
   - Multi-wallet support
   - Hardware wallet support (Ledger, Trezor)
   - ENS name resolution
   - Transaction batching
   - Gas price optimization
   - Slippage protection UI
   - Token balance display in swap interface

## 📞 Support

For issues or questions about the wallet integration:
1. Check this documentation
2. Review the component source code
3. Check RainbowKit/Wagmi documentation
4. Contact the development team

---

**Last Updated:** October 21, 2025
**Version:** 1.0.0
