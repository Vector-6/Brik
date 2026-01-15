import { fromSmallestUnit } from '@/lib/utils/amountConversion'
import { getChainName } from '@/lib/constants/chains'

import type { RouteExtended } from '@/lib/types/lifi.types'
import type { Token } from '@/lib/types/token.types'
import type { GasCost, StepType } from '@lifi/types'

export interface StepSummary {
  id: string
  type: StepType | 'lifi'
  typeLabel: string
  tool: string
  toolName: string
  toolKey?: string
  toolLogoURI?: string
  fromChainId: number
  toChainId: number
  fromTokenSymbol: string
  toTokenSymbol: string
  executionDurationSeconds: number | null
}

export interface GasCostSummary {
  chainId: number | null
  tokenSymbol: string
  tokenDecimals: number | null
  amount: string | null
  amountUSD: number | null
}

export interface QuoteMetrics {
  steps: StepSummary[]
  routeLabels: string[]
  tools: string[]
  chains: number[]
  minReceivedAmount: string | null
  minReceivedRaw: string | null
  minReceivedUSD: number | null
  slippagePercentage: number | null
  priceImpactPercentage: number | null
  estimatedDurationSeconds: number | null
  gasCostTotalUSD: number | null
  gasCostBreakdown: GasCostSummary[]
}

const STEP_TYPE_LABEL: Record<string, string> = {
  swap: 'Swap',
  cross: 'Bridge',
  protocol: 'Protocol',
  custom: 'Custom',
  lifi: 'Li.FI',
}

export function buildQuoteMetrics(
  route: RouteExtended,
  toToken?: Token | null,
): QuoteMetrics {
  const steps = route.steps.map<StepSummary>((step, index) => {
    const toolName = step.toolDetails?.name ?? step.tool
    const type = (step.type ?? 'swap') as StepType | 'lifi'

    return {
      id: step.id ?? `step-${index}`,
      type,
      typeLabel: STEP_TYPE_LABEL[type] ?? 'Step',
      tool: step.tool,
      toolName,
      toolKey: step.toolDetails?.key,
      toolLogoURI: step.toolDetails?.logoURI,
      fromChainId: step.action.fromChainId,
      toChainId: step.action.toChainId,
      fromTokenSymbol: step.action.fromToken.symbol,
      toTokenSymbol: step.action.toToken.symbol,
      executionDurationSeconds:
        typeof step.estimate?.executionDuration === 'number'
          ? step.estimate.executionDuration
          : null,
    }
  })

  const tools = Array.from(new Set(steps.map((step) => step.toolName))).filter(Boolean)

  const chains = Array.from(
    new Set(
      steps
        .flatMap((step) => [step.fromChainId, step.toChainId])
        .filter((chainId): chainId is number => typeof chainId === 'number'),
    ),
  )

  const routeLabels = steps.map((step) => {
    const typeLabel = step.typeLabel
    const chainLabel = buildChainLabel(step.fromChainId, step.toChainId)
    return `${typeLabel} • ${step.toolName}${chainLabel ? ` (${chainLabel})` : ''}`
  })

  const minReceivedRaw = route.toAmountMin ?? null
  const minReceivedAmount = convertAmount(minReceivedRaw, toToken?.decimals)

  const minReceivedUSD = safeParseFloat(route.toAmountUSD)

  const slippagePercentage = deriveSlippage(route)

  const priceImpactPercentage = derivePriceImpact(route)

  const estimatedDurationSeconds = computeEstimatedDuration(route)

  const gas = aggregateGasCosts(route)

  return {
    steps,
    routeLabels,
    tools,
    chains,
    minReceivedAmount,
    minReceivedRaw,
    minReceivedUSD,
    slippagePercentage,
    priceImpactPercentage,
    estimatedDurationSeconds,
    gasCostTotalUSD: gas.totalUSD,
    gasCostBreakdown: gas.breakdown,
  }
}

function buildChainLabel(fromChainId?: number, toChainId?: number): string {
  const fromName = typeof fromChainId === 'number' ? getChainName(fromChainId) : null
  const toName = typeof toChainId === 'number' ? getChainName(toChainId) : null

  if (fromName && toName) {
    if (fromChainId === toChainId) {
      return fromName
    }
    return `${fromName} → ${toName}`
  }

  return fromName ?? toName ?? ''
}

function convertAmount(value: string | null, decimals?: number): string | null {
  if (!value) {
    return null
  }

  if (decimals === undefined) {
    const numeric = safeParseFloat(value)
    return numeric !== null ? numeric.toString() : value
  }

  if (/^\d+$/.test(value)) {
    try {
      return fromSmallestUnit(value, decimals, Math.min(8, decimals))
    } catch (error) {
      console.warn('Failed to convert amount from smallest unit', error)
      return null
    }
  }

  return value
}

function deriveSlippage(route: RouteExtended): number | null {
  for (const step of route.steps) {
    if (typeof step.action.slippage === 'number') {
      return step.action.slippage * 100
    }
  }
  return null
}

function derivePriceImpact(route: RouteExtended): number | null {
  const fromUsd = safeParseFloat(route.fromAmountUSD)
  const toUsd = safeParseFloat(route.toAmountUSD)

  if (fromUsd === null || toUsd === null || fromUsd === 0) {
    return null
  }

  const impact = ((toUsd - fromUsd) / fromUsd) * 100
  if (!Number.isFinite(impact)) {
    return null
  }

  return impact
}

function computeEstimatedDuration(route: RouteExtended): number | null {
  const total = route.steps.reduce((sum, step) => {
    if (typeof step.estimate?.executionDuration === 'number') {
      return sum + step.estimate.executionDuration
    }
    return sum
  }, 0)

  return total > 0 ? total : null
}

function aggregateGasCosts(route: RouteExtended): {
  totalUSD: number | null
  breakdown: GasCostSummary[]
} {
  const breakdown: GasCostSummary[] = []
  let totalUSD = 0

  route.steps.forEach((step) => {
    step.estimate?.gasCosts?.forEach((gasCost) => {
      const amountUSD = safeParseFloat(gasCost.amountUSD)
      if (amountUSD !== null) {
        totalUSD += amountUSD
      }

      breakdown.push(buildGasCostSummary(gasCost))
    })
  })

  return {
    totalUSD: totalUSD > 0 ? totalUSD : null,
    breakdown,
  }
}

function buildGasCostSummary(gasCost: GasCost): GasCostSummary {
  const amount = normaliseGasAmount(gasCost)
  const amountUSD = safeParseFloat(gasCost.amountUSD)

  return {
    chainId: gasCost.token?.chainId ?? null,
    tokenSymbol: gasCost.token?.symbol ?? 'N/A',
    tokenDecimals: gasCost.token?.decimals ?? null,
    amount,
    amountUSD,
  }
}

function normaliseGasAmount(gasCost: GasCost): string | null {
  const value = gasCost.amount
  const decimals = gasCost.token?.decimals

  if (!value) {
    return null
  }

  if (decimals !== undefined && /^\d+$/.test(value)) {
    try {
      return fromSmallestUnit(value, decimals, Math.min(6, decimals))
    } catch (error) {
      console.warn('Failed to convert gas cost amount from smallest unit', error)
    }
  }

  const numeric = safeParseFloat(value)
  return numeric !== null ? numeric.toString() : value
}

function safeParseFloat(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null
  }

  const numeric = typeof value === 'string' ? Number.parseFloat(value) : value

  if (Number.isFinite(numeric)) {
    return numeric
  }

  return null
}


