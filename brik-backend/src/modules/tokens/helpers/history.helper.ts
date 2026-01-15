import { DataPointDto } from '../dto/data-point.dto';
// No external date lib used for day alignment to avoid extra dependency

export type Granularity = '5m' | '1h' | '1d';

export function normalizeCoinGeckoMarketChart(raw: {
  prices?: any[];
  market_caps?: any[];
  total_volumes?: any[];
}): {
  prices: DataPointDto[];
  marketCaps: DataPointDto[];
  totalVolumes: DataPointDto[];
} {
  // CoinGecko returns arrays of [timestamp, value] where timestamp is in ms
  const toData = (arr: unknown): DataPointDto[] => {
    if (!Array.isArray(arr)) return [];
    return (arr as unknown[])
      .filter((p) => Array.isArray(p) && p.length >= 2)
      .map((p: any[]) => ({ timestamp: Number(p[0]), value: Number(p[1]) }));
  };

  return {
    prices: toData(raw?.prices),
    marketCaps: toData(raw?.market_caps),
    totalVolumes: toData(raw?.total_volumes),
  };
}

export function downsamplePoints(
  points: DataPointDto[],
  granularity: Granularity,
): DataPointDto[] {
  if (!points || points.length === 0) return [];

  // Sort points by timestamp
  const sorted = [...points].sort((a, b) => a.timestamp - b.timestamp);

  const buckets = new Map<number, { timestamp: number; values: number[] }>();

  // Determine bucket size in ms
  let bucketSize = 5 * 60 * 1000; // default 5m
  if (granularity === '1h') bucketSize = 60 * 60 * 1000;
  if (granularity === '1d') bucketSize = 24 * 60 * 60 * 1000;

  for (const p of sorted) {
    // For daily, align to 00:00 UTC
    let bucketKey = Math.floor(p.timestamp / bucketSize) * bucketSize;
    if (granularity === '1d') {
      // Align to 00:00 UTC (start of day)
      const dt = new Date(p.timestamp);
      dt.setUTCHours(0, 0, 0, 0);
      const dayStart = dt.getTime();
      bucketKey = dayStart;
    }

    if (!buckets.has(bucketKey)) {
      buckets.set(bucketKey, { timestamp: bucketKey, values: [p.value] });
    } else {
      buckets.get(bucketKey)!.values.push(p.value);
    }
  }

  // For price - choose last point in bucket
  const result: DataPointDto[] = [];
  for (const [, bucket] of buckets.entries()) {
    // use last value
    const value = bucket.values[bucket.values.length - 1];
    result.push({ timestamp: bucket.timestamp, value });
  }

  // Sort again to ensure ascending
  return result.sort((a, b) => a.timestamp - b.timestamp);
}

export function roundValue(value: number, precision?: number | 'full') {
  if (precision === 'full') return value;
  if (precision === undefined) return value;
  return Number(value.toFixed(precision));
}
