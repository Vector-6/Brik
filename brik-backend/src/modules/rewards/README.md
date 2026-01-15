# Rewards System

Complete rewards system implementation for Brik platform based on the rewards system requirements document.

## Overview

The rewards system implements:
- **Brik Points**: Core currency earned from swaps (points = brik_fee_usd × 100)
- **Cashback**: Every 3 swaps, users earn 5-10% cashback on fees
- **Referral Rewards**: 5% of Brik fee, activates after referee completes 2 swaps
- **Mystery Boxes**: Gamified reward sink funded by 10% of platform fees
- **Anti-Abuse**: Daily caps, wash-trade detection, minimum swap sizes

## Architecture

### Database Schemas

All schemas are in `schemas/`:
- `user.schema.ts` - User data and stats
- `swap.schema.ts` - Verified swap records
- `fee.schema.ts` - Individual fees for cashback calculation
- `points-ledger.schema.ts` - Points transaction history
- `cashback-batch.schema.ts` - Groups of 3 fees for cashback
- `referral-code.schema.ts` - Referral codes
- `referral-earning.schema.ts` - Individual referral earnings
- `reward-pool.schema.ts` - Mystery box pool balance
- `mystery-box.schema.ts` - Mystery box opens and payouts
- `payout.schema.ts` - All cash payouts
- `reward-event.schema.ts` - Single source of truth for all reward events

### Services

- `SwapVerificationService` - Verifies swaps on-chain using viem
- `PointsService` - Manages points calculation and ledger
- `CashbackService` - Handles 3-swap cashback logic
- `ReferralService` - Manages referral codes and earnings
- `MysteryBoxService` - Handles mystery box opening and pool
- `AntiAbuseService` - Implements anti-abuse measures
- `RewardsService` - Main orchestrator

## API Endpoints

### Swap Verification

**POST** `/api/rewards/verify-swap`

Verify a swap and calculate rewards.

Request body:
```json
{
  "txHash": "0x...",
  "chainId": 1,
  "walletAddress": "0x...",
  "quoteData": {...},
  "swapValueUsd": 100,
  "brikFeeUsd": 0.5
}
```

Response:
```json
{
  "success": true,
  "swapId": "...",
  "pointsEarned": 50,
  "swapsUntilCashback": 2,
  "cashbackTriggered": false,
  "message": "..."
}
```

### Rewards Overview

**GET** `/api/rewards/overview/:walletAddress`

Get complete rewards overview for a wallet.

Response:
```json
{
  "walletAddress": "0x...",
  "totalPoints": 500,
  "swapsUntilCashback": 1,
  "claimableCashbackUsd": 2.5,
  "claimableReferralEarningsUsd": 1.0,
  "totalSwaps": 5,
  "currentStreak": 3,
  "canOpenMysteryBox": true
}
```

### Claim Rewards

**POST** `/api/rewards/claim`

Claim cashback, referral, or mystery box rewards.

Request body:
```json
{
  "type": "cashback", // or "referral" or "mystery_box"
  "walletAddress": "0x...",
  "cashbackBatchId": "..." // for cashback
}
```

### Referral System

**POST** `/api/rewards/referral/create`
Create a referral code for a wallet.

**POST** `/api/rewards/referral/use`
Use a referral code when signing up.

**GET** `/api/rewards/referral/stats/:walletAddress`
Get referral statistics.

### Mystery Box

**POST** `/api/rewards/mystery-box/open`
Open a mystery box (costs 100 points).

**GET** `/api/rewards/mystery-box/info/:walletAddress`
Get mystery box eligibility info.

### Points

**GET** `/api/rewards/points/ledger/:walletAddress`
Get points transaction history.

### Cashback

**GET** `/api/rewards/cashback/progress/:walletAddress`
Get cashback progress (X / 3 swaps).

**GET** `/api/rewards/claimable/:walletAddress`
Get total claimable rewards summary.

## Swap Lifecycle

1. **Swap Initiation**: Frontend submits swap with tx hash, quote data, wallet
2. **Verification**: Backend verifies transaction on-chain
3. **Reward Calculation**: Points, cashback, referral earnings calculated
4. **Rewards Become Claimable**: User sees updated balances

## Key Rules

- Minimum swap size: $25 USD
- Minimum Brik fee: $0.05 USD
- Points formula: `points = brik_fee_usd × 100`
- Cashback: Every 3 swaps, 5-10% of sum of last 3 fees
- Referral: 5% of fee, activates after 2 referee swaps
- Mystery box: 1 per day, costs 100 points
- Daily cashback cap: $100 USD
- Daily referral cap: $50 USD

## Anti-Abuse

- Wash-trade detection (same tokens swapped back/forth quickly)
- Daily reward caps
- Minimum swap size enforcement
- Claim rate limiting (via status checks)

## Notes

- All payouts are claim-based (no auto-withdrawals)
- Points cannot be converted directly to USDC
- Mystery box pool funded by 10% of all platform fees
- Reward events table is single source of truth for UI state
