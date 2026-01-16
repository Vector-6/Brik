# Integration Guide: Swap Reward Feedback

## Quick Start

This guide shows how to integrate the new Swap Reward Feedback system with your existing swap flow.

---

## Step 1: Install Dependencies

```bash
cd brik-frontend
yarn add canvas-confetti @types/canvas-confetti
```

Already done ✅ - Check `package.json`

---

## Step 2: Import Components in SwapCardContainer

**File:** `brik-frontend/components/features/swap/containers/SwapCardContainer.tsx`

Add these imports at the top:

```typescript
import { useSwapRewards } from "../hooks/useSwapRewards";
import SwapRewardFeedback from "../SwapRewardFeedback";
```

---

## Step 3: Initialize Hook

Inside the `SwapCardContainer` component function, add:

```typescript
export default function SwapCardContainer() {
  // ... existing hooks ...

  // Add swap rewards hook
  const {
    showFeedback,
    rewardData,
    handleSwapSuccess,
    closeFeedback
  } = useSwapRewards();

  // ... rest of component ...
}
```

---

## Step 4: Trigger on Swap Success

Find your swap success handler (likely in `useSwapState` or similar). After a successful swap execution, call:

```typescript
// Example: In your swap success callback
const onSwapSuccess = useCallback((executedRoute: RouteExtended) => {
  // Your existing success logic...

  // Add reward feedback trigger
  handleSwapSuccess({
    txHash: executedRoute.transactionHash || '',
    fromToken: fromToken.address,
    toToken: toToken.address,
    fromAmount: fromAmount,
    toAmount: toAmount,
    chainId: fromToken.chainId,
    estimatedBrikFee: calculateBrikFee(fromAmount, fromToken), // Implement this
  });

}, [handleSwapSuccess, fromToken, toToken, fromAmount, toAmount]);
```

### Calculate Brik Fee

Add a helper function to estimate the Brik fee:

```typescript
/**
 * Calculate Brik fee from swap amount
 * Adjust this based on your actual fee structure
 */
function calculateBrikFee(amount: string, token: Token): number {
  const amountNum = parseFloat(amount);
  const feePercentage = 0.01; // 1% fee (adjust as needed)
  const feeInToken = amountNum * feePercentage;

  // Convert to USD using token price
  const feeInUSD = feeInToken * (token.currentPriceUSD || 0);

  return feeInUSD;
}
```

---

## Step 5: Render Modal

Add the `SwapRewardFeedback` component to your JSX return statement (after other modals):

```typescript
return (
  <>
    {/* ... existing components ... */}

    {/* Swap Success Modal (existing) */}
    <SwapSuccessModal
      isOpen={modalState.type === SwapModalType.Success}
      onClose={closeModal}
      // ... props
    />

    {/* NEW: Swap Reward Feedback Modal */}
    <SwapRewardFeedback
      isOpen={showFeedback}
      onClose={closeFeedback}
      swapData={rewardData}
    />
  </>
);
```

---

## Complete Example

Here's a minimal example of the integration:

```typescript
"use client";

import { useSwapRewards } from "../hooks/useSwapRewards";
import SwapRewardFeedback from "../SwapRewardFeedback";

export default function SwapCardContainer() {
  // Existing hooks
  const { address } = useAccount();
  const { fromToken, toToken, fromAmount, toAmount } = useSwapState();

  // NEW: Rewards hook
  const { showFeedback, rewardData, handleSwapSuccess, closeFeedback } = useSwapRewards();

  // Calculate Brik fee
  const calculateBrikFee = (amount: string, token: Token): number => {
    const amountNum = parseFloat(amount);
    const feePercentage = 0.01; // 1% fee
    return amountNum * feePercentage * (token.currentPriceUSD || 0);
  };

  // Swap execution handler
  const executeSwap = async () => {
    try {
      // Your swap logic...
      const result = await lifiSDK.executeRoute(route);

      // On success, trigger reward feedback
      if (result.status === 'success') {
        handleSwapSuccess({
          txHash: result.transactionHash,
          fromToken: fromToken.address,
          toToken: toToken.address,
          fromAmount: fromAmount,
          toAmount: toAmount,
          chainId: fromToken.chainId,
          estimatedBrikFee: calculateBrikFee(fromAmount, fromToken),
        });
      }
    } catch (error) {
      console.error('Swap failed:', error);
    }
  };

  return (
    <>
      {/* Swap UI */}
      <div>
        <button onClick={executeSwap}>
          Execute Swap
        </button>
      </div>

      {/* Reward Feedback Modal */}
      <SwapRewardFeedback
        isOpen={showFeedback}
        onClose={closeFeedback}
        swapData={rewardData}
      />
    </>
  );
}
```

---

## Backend Integration

The `useSwapRewards` hook automatically calls:

```
POST /rewards/verify-swap
```

**Request Body:**
```json
{
  "walletAddress": "0x...",
  "txHash": "0x...",
  "fromToken": "0x...",
  "toToken": "0x...",
  "fromAmount": "1.5",
  "toAmount": "1502.34",
  "chainId": 1
}
```

**Expected Response:**
```json
{
  "success": true,
  "swap": {
    "swapId": "abc123",
    "pointsEarned": 40,
    "brikFeeUsd": 0.40
  },
  "progress": {
    "swapsCompleted": 1,
    "swapsRemaining": 2,
    "estimatedCashbackUsd": 0.02
  }
}
```

Ensure your backend endpoint matches this structure.

---

## Testing

### Test Scenarios

1. **First Swap (1/3)**
   - Execute a swap
   - Should show: "+X Brik Points" and "1 / 3 swaps toward cashback"
   - Progress bar at 33%

2. **Second Swap (2/3)**
   - Execute another swap
   - Should show: "2 / 3 swaps toward cashback"
   - Progress bar at 66%
   - Required UX copy visible

3. **Third Swap (3/3)**
   - Execute third swap
   - Should show: "Cashback ready to claim!"
   - Progress bar at 100%
   - Green success message

4. **Backend Offline**
   - Disconnect backend
   - Execute swap
   - Should still show estimated rewards
   - No errors in console

### Manual Testing Checklist

- [ ] Confetti animation triggers
- [ ] Points earned displays correctly
- [ ] Cashback progress updates
- [ ] Required UX copy shows: "X / 3 swaps completed — cashback loading..."
- [ ] Modal auto-closes after 5 seconds
- [ ] Manual close button works
- [ ] "View All Rewards" button redirects to /rewards
- [ ] Persistent widget updates after modal closes
- [ ] Mobile responsive (test on 375px width)

---

## Troubleshooting

### Modal doesn't appear
**Check:**
- Is `showFeedback` state being set to `true`?
- Is `SwapRewardFeedback` component rendered in JSX?
- Console errors?

### Points calculation wrong
**Check:**
- Is `estimatedBrikFee` calculated correctly?
- Backend formula: `points = brik_fee_usd × 100`
- Minimum fee: $0.05

### Progress bar not updating
**Check:**
- Is React Query cache invalidated after swap?
- Check network tab for `/rewards/cashback/progress` call
- Is `walletAddress` being passed correctly?

### Confetti not showing
**Check:**
- Is `canvas-confetti` installed?
- Check browser console for import errors
- Try: `yarn add canvas-confetti`

---

## Performance Considerations

### Optimizations Applied

1. **Estimated Data First:** Shows immediately without waiting for backend
2. **Background Verification:** Backend call happens asynchronously
3. **Query Invalidation:** Only invalidates relevant queries, not all
4. **Debounced Refreshes:** Persistent widget refreshes every 30s, not every second

### Best Practices

- Don't call `handleSwapSuccess` multiple times per swap
- Use transaction hash as idempotency key
- Handle backend errors gracefully (show estimated data)
- Clear modal state on unmount

---

## Next Steps

After integrating the swap feedback:

1. **Test thoroughly** - All 3 swap scenarios
2. **Monitor backend** - Check `/rewards/verify-swap` response times
3. **Gather user feedback** - Is the feedback celebratory enough?
4. **A/B test** - Try different confetti amounts, auto-close timings

---

## Support

Questions? Check:
- `WEEK1_IMPLEMENTATION.md` - Full technical details
- `components/features/swap/hooks/useSwapRewards.ts` - Hook source code
- Backend logs - For verification issues

---

**Last Updated:** January 2026
**Status:** Ready for Integration
