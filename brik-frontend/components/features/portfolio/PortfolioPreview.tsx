'use client';

import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, Sparkles } from 'lucide-react';

import PortfolioHoldingsList from './presenters/PortfolioHoldingsList';
import type { PortfolioBalance } from '@/lib/types/portfolio.types';
import { GradientText } from '@/components/ui/common';

const previewBalances: PortfolioBalance[] = [
  {
    symbol: 'LINK',
    name: 'Chainlink',
    balance: '0.00116312',
    balanceFormatted: '0.00116312',
    decimals: 18,
    chainId: 56,
    chainName: 'BNB Smart Chain',
    contractAddress: '0x514910771af9ca656af840dff83e8264ecf986ca',
    usdValue: 0.02,
    price: Number.NaN,
    image: '/images/new/logo1.jpg',
  },
  {
    symbol: 'XAUT',
    name: 'Tether Gold',
    balance: '0.00024000',
    balanceFormatted: '0.00024000',
    decimals: 18,
    chainId: 1,
    chainName: 'Ethereum',
    contractAddress: '0x68749665ff8d2d112fa859aa293f07a622782f38',
    usdValue: 0.01,
    price: Number.NaN,
    image: '/images/new/logo1.jpg',
  },
  {
    symbol: 'PAXG',
    name: 'PAX Gold',
    balance: '0.00021000',
    balanceFormatted: '0.00021000',
    decimals: 18,
    chainId: 1,
    chainName: 'Ethereum',
    contractAddress: '0x45804880de22913dafe09f4980848ece6ecbaf78',
    usdValue: 0.01,
    price: Number.NaN,
    image: '/images/new/logo1.jpg',
  },
  {
    symbol: 'RSR',
    name: 'Reserve Rights',
    balance: '14.20500000',
    balanceFormatted: '14.20500000',
    decimals: 18,
    chainId: 1,
    chainName: 'Ethereum',
    contractAddress: '0x8762db106b2c2a0bccb3a80d1ed41273552616e8',
    usdValue: 0.00,
    price: Number.NaN,
    image: '/images/new/logo1.jpg',
  },
  {
    symbol: 'XAUM',
    name: 'Matrixdock Gold',
    balance: '0.00009500',
    balanceFormatted: '0.00009500',
    decimals: 18,
    chainId: 56,
    chainName: 'BNB Smart Chain',
    contractAddress: '0x0000000000000000000000000000000000000005',
    usdValue: 0.00,
    price: Number.NaN,
    image: '/images/new/logo1.jpg',
  },
  {
    symbol: 'CPOOL',
    name: 'Clearpool',
    balance: '0.00086611',
    balanceFormatted: '0.00086611',
    decimals: 18,
    chainId: 1,
    chainName: 'Ethereum',
    contractAddress: '0x0000000000000000000000000000000000000006',
    usdValue: 0.01,
    price: Number.NaN,
    image: '/images/new/logo1.jpg',
  },
];

const performanceWindows = [
  {
    label: '24 hours',
    changeUSD: 0.01,
    changePercent: 10.32,
  },
  {
    label: '7 days',
    changeUSD: 0.0,
    changePercent: -3.47,
  },
  {
    label: '30 days',
    changeUSD: -0.02,
    changePercent: -23.1,
  },
];

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

export default function PortfolioPreview() {
  const totalValue = previewBalances.reduce((acc, holding) => acc + holding.usdValue, 0);
  const assetCount = previewBalances.length;

  return (
    <section
      className="relative min-h-screen w-full overflow-hidden"
      aria-labelledby="portfolio-preview-heading"
    >
      {/* Subtle gradient background with noise texture for depth */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#1C1C1C] via-[#1A1A24] to-[#1C1C1C]"
        aria-hidden="true"
      />

      {/* Ambient light effects for visual interest */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#6107E0] rounded-full blur-[150px] opacity-[0.08]"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#00bf63] rounded-full blur-[140px] opacity-[0.06]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-14 px-6 py-24 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col items-center gap-5 text-center"
        >
          {/* <span className="rounded-full border border-[#322042] bg-[#271338] px-4 py-1 text-sm font-medium uppercase nothingclass[0.3em] text-[#a78bfa]">
            Portfolio Intelligence
          </span> */}
          <h2
            className="max-w-3xl font-burbank text-4xl font-extrabold  md:text-5xl"
            style={{
              background: 'linear-gradient(90deg, #870BDD 0%, #FF0CE7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Preview your cross-chain portfolio snapshot
          </h2>
          <p className="max-w-2xl text-lg text-gray-300 md:text-xl">
            This example mirrors exactly what you&apos;ll see after connecting a wallet: live balances, token counts, and period-over-period shifts.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="flex flex-col gap-10"
        >
          <div className="rounded-3xl border border-[#2a2a2a] bg-gradient-to-br from-[#232323] via-[#1f1f1f] to-[#232029] p-8 shadow-[0_0_80px_-35px_rgba(97,7,224,0.8)]">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium uppercase  text-[#ffd700]">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Total portfolio value
                </div>
                <div className="mt-4 flex flex-col gap-3 md:gap-6">
                  <p className="text-5xl font-bold text-white md:text-6xl">
                    {currencyFormatter.format(totalValue)}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="rounded-full bg-[#ffd700] px-3 py-1 font-semibold text-[#1f1f1f]">
                      {assetCount} assets
                    </span>
                    <span className="rounded-full bg-[#1b2f45] px-3 py-1 font-semibold text-[#7dd3fc]">
                      Multi-chain coverage
                    </span>
                  </div>
                </div>
                <p className="mt-3 max-w-xl text-sm text-gray-400">
                  Balances refresh from on-chain data the moment you connect your wallet. This preview uses illustrative numbers only.
                </p>
              </div>

              <dl className="grid w-full grid-cols-1 gap-4 text-left sm:grid-cols-3 lg:max-w-xl">
                {performanceWindows.map((window) => {
                  const isGain = window.changeUSD >= 0;
                  const TrendIcon = isGain ? ArrowUpRight : ArrowDownRight;
                  const trendLabel = `${isGain ? '+' : ''}${window.changePercent.toFixed(2)}% ${isGain ? 'gain' : 'loss'}`;

                  return (
                    <div
                      key={window.label}
                      className="rounded-2xl border border-[#2f2f2f] bg-[#1f1f1f] p-4 shadow-[0_0_40px_-28px_rgba(97,7,224,0.6)]"
                    >
                      <dt className="text-xs uppercase nothingclass[0.2em] text-gray-400">{window.label}</dt>
                      <dd className="mt-2 flex flex-col gap-2 text-white">
                        <span className="text-lg font-semibold">
                          {currencyFormatter.format(window.changeUSD)}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold ${
                            isGain ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          <TrendIcon className="h-4 w-4" aria-hidden="true" />
                          {trendLabel}
                        </span>
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="text-left text-sm font-semibold uppercase nothingclass[0.25em] text-[#ffd700]">
              Asset holdings
            </h3>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            >
              <PortfolioHoldingsList balances={previewBalances} />
            </motion.div>
            <p className="text-xs text-gray-500">
              Values shown are for demonstration. Visit the portfolio page to see live positions, prices, and updated performance windows.
            </p>
          </div>

          <motion.a
            href="/portfolio"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex w-full items-center text-center font-burbank text-xl bg-[#ffd700] text-[#1c1c1c] justify-center gap-2 rounded-xl border border-[#412f6b]  px-6 py-4  font-semibold uppercase nothingclass[0.2em]  transition hover:bg-[#bdc00e] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c1c1c]"
          >
            Explore full portfolio dashboard
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
