/**
 * Chart API Route - Demo Implementation
 * This is a placeholder route for testing chart functionality
 * Replace with actual backend integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { TokenHistoryResponse, TokenHistoryParams } from '@/lib/types/chart.types';

// Mock data generator
function generateMockData(symbol: string, days: string): TokenHistoryResponse {
  const daysNum = days === 'max' ? 365 : parseInt(days);
  const interval = daysNum <= 1 ? 300000 : daysNum <= 7 ? 3600000 : 86400000; // 5m, 1h, 1d
  const now = Date.now();
  const startTime = now - (daysNum * 24 * 60 * 60 * 1000);
  
  // Generate realistic price data with some volatility
  const basePrice = 1000 + Math.random() * 2000;
  const data: Array<{timestamp: number, value: number}> = [];
  
  for (let t = startTime; t <= now; t += interval) {
    const timeProgress = (t - startTime) / (now - startTime);
    const trend = Math.sin(timeProgress * Math.PI * 2) * 0.1;
    const volatility = (Math.random() - 0.5) * 0.05;
    const price = basePrice * (1 + trend + volatility);
    
    data.push({
      timestamp: t,
      value: Math.max(price, 1) // Ensure positive price
    });
  }
  
  // Generate market cap and volume based on price
  const marketCaps = data.map(point => ({
    timestamp: point.timestamp,
    value: point.value * (10000000 + Math.random() * 5000000) // Mock market cap
  }));
  
  const totalVolumes = data.map(point => ({
    timestamp: point.timestamp,
    value: point.value * (50000 + Math.random() * 200000) // Mock volume
  }));
  
  return {
    symbol: symbol.toUpperCase(),
    name: `Mock ${symbol.toUpperCase()}`,
    currency: 'usd',
    days,
    interval: daysNum <= 1 ? '5m' : daysNum <= 7 ? '1h' : '1d',
    prices: data,
    marketCaps,
    totalVolumes
  };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await context.params;
    const { searchParams } = new URL(request.url);
    
    const days = searchParams.get('days') || '30';
    const currency = searchParams.get('currency') || 'usd';
    
    // Validate symbol (you can add real validation here)
    if (!symbol || symbol.length < 2) {
      return NextResponse.json(
        {
          statusCode: 400,
          message: 'Invalid token symbol',
          error: 'Bad Request'
        },
        { status: 400 }
      );
    }
    
    // Check if it's a supported token (mock check)
    const supportedTokens = ['BTC', 'ETH', 'USDC', 'USDT', 'BNB', 'XAUT', 'PAXG', 'WBTC'];
    if (!supportedTokens.includes(symbol.toUpperCase())) {
      return NextResponse.json(
        {
          statusCode: 404,
          message: `Token ${symbol.toUpperCase()} is not supported`,
          error: 'Not Found'
        },
        { status: 404 }
      );
    }
    
    // Generate mock data
    const data = generateMockData(symbol, days);
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Chart API Error:', error);
    return NextResponse.json(
      {
        statusCode: 500,
        message: 'Internal server error',
        error: 'Internal Server Error'
      },
      { status: 500 }
    );
  }
}
