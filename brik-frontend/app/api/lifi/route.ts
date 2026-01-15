/**
 * LI.FI API Route Handler
 * Server-side API route for LI.FI operations that require API key
 *
 * This route acts as a secure proxy for LI.FI SDK operations,
 * keeping the API key on the server side.
 */

import { NextRequest, NextResponse } from "next/server";
import { getRoutes, getQuote, getChains, getTokens } from "@lifi/sdk";
import type { RoutesRequest, QuoteRequest } from "@lifi/types";

// Import server-side config to ensure SDK is initialized with API key
import "@/lib/config/lifi.server";

// ============================================================================
// API Route Handler
// ============================================================================

/**
 * Handle LI.FI API requests
 *
 * Supported operations:
 * - GET /api/lifi/chains - Get supported chains
 * - GET /api/lifi/tokens?chainId=1 - Get tokens for a chain
 * - POST /api/lifi/routes - Get swap routes
 * - POST /api/lifi/quote - Get swap quote
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get("operation");

    switch (operation) {
      case "chains": {
        const chains = await getChains();
        return NextResponse.json({ success: true, data: chains });
      }

      case "tokens": {
        const chainId = searchParams.get("chainId");
        if (!chainId) {
          return NextResponse.json(
            { success: false, error: "chainId parameter is required" },
            { status: 400 }
          );
        }
        const tokens = await getTokens();
        return NextResponse.json({ success: true, data: tokens });
      }

      default:
        return NextResponse.json(
          { success: false, error: "Invalid operation. Use: chains, tokens" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("LI.FI API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, ...params } = body;

    switch (operation) {
      case "routes": {
        const routesRequest = params as RoutesRequest;
        const routes = await getRoutes(routesRequest);
        return NextResponse.json({ success: true, data: routes });
      }

      case "quote": {
        const quoteRequest = params as QuoteRequest;
        const quote = await getQuote(quoteRequest);
        return NextResponse.json({ success: true, data: quote });
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid operation. Use: routes, quote",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("LI.FI API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
