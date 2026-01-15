# Chart Integration Documentation

## Overview

This document describes the chart integration added to the Brik frontend application. The charts display token price history, market cap, and volume data using a responsive, lightweight chart library (Recharts).

## Features

- ✅ **Responsive Design**: Charts work on all screen sizes without overflowing
- ✅ **Portfolio Integration**: Mini charts in portfolio holding cards  
- ✅ **Asset Detail Integration**: Full-featured charts on asset detail pages
- ✅ **Multiple Timeframes**: 1D, 7D, 30D, 90D, 180D, 1Y, MAX
- ✅ **Multiple Chart Types**: Price, Market Cap, Volume
- ✅ **Interactive Tooltips**: Hover for detailed data points
- ✅ **Error Handling**: Graceful fallbacks when data is unavailable
- ✅ **Loading States**: Skeleton loading animations
- ✅ **Auto-refresh**: Periodic data updates
- ✅ **Trend Indicators**: Visual indicators for price movement

## Components

### 1. TokenChart (Main Chart Component)

Full-featured chart component with all controls and options.

```tsx
import { TokenChart } from '@/components/features/chart';

<TokenChart
  symbol="BTC"
  height={500}
  defaultTimeframe="30D"
  showTimeframes={true}
  showChartTypes={true}
  className="w-full"
/>
```

**Props:**
- `symbol`: Token symbol (required)
- `height`: Chart height in pixels (default: 400)
- `showTimeframes`: Show timeframe selector (default: true)
- `showChartTypes`: Show chart type selector (default: true) 
- `defaultTimeframe`: Initial timeframe (default: '30D')
- `defaultType`: Initial chart type (default: 'price')
- `className`: Additional CSS classes

### 2. CompactTokenChart (Mini Chart)

Lightweight chart for previews and cards.

```tsx
import { CompactTokenChart } from '@/components/features/chart';

<CompactTokenChart
  symbol="ETH"
  timeframe="7D"
  height={80}
  showTrend={true}
  className="w-full"
/>
```

**Props:**
- `symbol`: Token symbol (required)
- `timeframe`: Chart timeframe (default: '7D')
- `height`: Chart height in pixels (default: 80)
- `showTrend`: Show trend indicator (default: true)
- `className`: Additional CSS classes

### 3. AssetDetailChart (Asset Page Chart)

Pre-configured chart for asset detail pages.

```tsx
import { AssetDetailChart } from '@/components/features/asset-detail';

<AssetDetailChart
  symbol={asset.symbol}
  tokenName={asset.name}
  defaultTimeframe="30D"
/>
```

### 4. HoldingCardWithChart (Portfolio Card)

Enhanced portfolio holding card with integrated mini chart.

```tsx
import { HoldingCardWithChart } from '@/components/features/portfolio';

<HoldingCardWithChart
  balance={portfolioBalance}
  index={0}
/>
```

## API Integration

### Backend API Endpoint

The charts connect to your backend chart API:

```
GET {BASE_URL}/api/coin/{symbol}/history
```

**Query Parameters:**
- `days`: Time period ('1', '7', '30', '90', '180', '365', 'max')
- `currency`: Target currency (default: 'usd')
- `interval`: Data interval ('5m', '1h', '1d') 
- `precision`: Price precision ('full' or '0'-'18')
- `from`/`to`: Unix timestamps for custom ranges

**Response Format:**
```typescript
interface TokenHistoryResponse {
  symbol: string;
  name?: string;
  currency: string;
  days: string;
  interval: string;
  prices: DataPoint[];
  marketCaps: DataPoint[];
  totalVolumes: DataPoint[];
}

interface DataPoint {
  timestamp: number; // Unix timestamp in milliseconds
  value: number;     // Price/market cap/volume value
}
```

### Configuration

Update your environment variables to point to your backend:

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
```

If not set, defaults to `http://localhost:3000/api` for local development.

## Usage Examples

### Portfolio Page

Charts are automatically integrated into portfolio holdings:

```tsx
// Portfolio holdings now show mini charts
<PortfolioHoldingsList balances={balances} />
```

Each holding card includes:
- Mini price chart (7-day view)
- Expandable detailed chart view
- Trend indicators
- Click to view full chart on asset page

### Asset Detail Page

Full chart integration is automatic:

```tsx
// Asset detail pages now include comprehensive charts
<AssetDetailPageContainer assetId="BTC" />
```

Features include:
- Multiple timeframes (1D to MAX)
- Multiple chart types (Price, Market Cap, Volume)
- Interactive tooltips
- Responsive design
- Trend indicators

### Custom Implementation

For custom use cases:

```tsx
import { useTokenChart } from '@/components/features/chart';

function MyCustomComponent() {
  const { data, isLoading, error } = useTokenChart('BTC', {
    timeframe: '7D',
    enabled: true,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.map(point => (
        <div key={point.timestamp}>
          {point.price}
        </div>
      ))}
    </div>
  );
}
```

## Responsive Design

Charts are fully responsive and handle all screen sizes:

- **Mobile (< 768px)**: Simplified controls, stacked layout
- **Tablet (768px - 1024px)**: Compact controls, optimized spacing
- **Desktop (> 1024px)**: Full controls, maximum chart area

## Error Handling

Charts gracefully handle various error scenarios:

- **Token not found (404)**: Shows "Chart Unavailable" message
- **Network errors**: Automatic retry with exponential backoff
- **Invalid data**: Fallback to placeholder chart icon
- **Loading states**: Skeleton animations

## Performance

- **Data Caching**: 2-minute stale time, 5-minute cache
- **Auto-refresh**: 5-minute intervals for live data
- **Lazy Loading**: Charts only load when visible
- **Optimized Rendering**: Recharts handles efficient updates

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Troubleshooting

### Chart not displaying
1. Check browser console for API errors
2. Verify `NEXT_PUBLIC_API_URL` environment variable
3. Ensure backend API is accessible
4. Check token symbol is supported

### Performance issues
1. Reduce `refetchInterval` in `useTokenChart` hook
2. Increase `staleTime` for less frequent updates
3. Use `CompactTokenChart` for better performance

### Responsive issues
1. Ensure parent container has proper width constraints
2. Check for CSS overflow conflicts
3. Test on various screen sizes

## Future Enhancements

- Real-time WebSocket updates
- Additional technical indicators (RSI, MACD)
- Volume overlay charts
- Comparison charts (multiple tokens)
- Export chart data to CSV
- Custom date range picker
