import type {
  TokenConfig,
  ChainConfig,
  TokenLookupMap,
  TokenByCoinGeckoIdMap,
  ChainLookupMap,
  TokensByChainMap,
} from '../interfaces/token.interface';

/**
 * Chain Configurations
 * Supported blockchain networks with RPC and block explorer URLs
 */

export const ETHEREUM_CHAIN: ChainConfig = {
  id: 1,
  name: 'Ethereum',
  rpcUrl: 'https://eth.llamarpc.com',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  blockExplorer: 'https://etherscan.io',
};

export const BSC_CHAIN: ChainConfig = {
  id: 56,
  name: 'BNB Smart Chain',
  rpcUrl: 'https://bsc-dataseed.binance.org',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  blockExplorer: 'https://bscscan.com',
};

export const POLYGON_CHAIN: ChainConfig = {
  id: 137,
  name: 'Polygon',
  rpcUrl: 'https://polygon-rpc.com',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  blockExplorer: 'https://polygonscan.com',
};

export const ARBITRUM_CHAIN: ChainConfig = {
  id: 42161,
  name: 'Arbitrum One',
  rpcUrl: 'https://arb1.arbitrum.io/rpc',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  blockExplorer: 'https://arbiscan.io',
};

export const OPTIMISM_CHAIN: ChainConfig = {
  id: 10,
  name: 'Optimism',
  rpcUrl: 'https://mainnet.optimism.io',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  blockExplorer: 'https://optimistic.etherscan.io',
};

export const AVALANCHE_CHAIN: ChainConfig = {
  id: 43114,
  name: 'Avalanche C-Chain',
  rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
  nativeCurrency: {
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18,
  },
  blockExplorer: 'https://snowtrace.io',
};

export const ALL_CHAINS: ChainConfig[] = [
  ETHEREUM_CHAIN,
  BSC_CHAIN,
  POLYGON_CHAIN,
  ARBITRUM_CHAIN,
  OPTIMISM_CHAIN,
  AVALANCHE_CHAIN,
];

/**
 * RWA Token Configurations
 * Real World Asset tokens with contract addresses on supported chains
 */

export const XAUT_TOKEN: TokenConfig = {
  symbol: 'XAUT',
  name: 'Tether Gold',
  decimals: 6,
  coingeckoId: 'tether-gold',
  addresses: {
    1: '0x68749665ff8d2d112fa859aa293f07a622782f38', // Ethereum
  },
  image:
    'https://coin-images.coingecko.com/coins/images/10481/large/Tether_Gold.png?1696510471',
};

export const PAXG_TOKEN: TokenConfig = {
  symbol: 'PAXG',
  name: 'PAX Gold',
  decimals: 18,
  coingeckoId: 'pax-gold',
  addresses: {
    1: '0x45804880de22913dafe09f4980848ece6ecbaf78', // Ethereum
  },
  image:
    'https://coin-images.coingecko.com/coins/images/9519/large/paxgold.png?1696509604',
};

export const CPOOL_TOKEN: TokenConfig = {
  symbol: 'CPOOL',
  name: 'Clearpool',
  decimals: 18,
  coingeckoId: 'clearpool',
  addresses: {
    1: '0x66761fa41377003622aee3c7675fc7b5c1c2fac5', // Ethereum
  },
  image:
    'https://coin-images.coingecko.com/coins/images/19252/large/photo_2022-08-31_12.45.02.jpeg?1696518697',
};

export const XAUM_TOKEN: TokenConfig = {
  symbol: 'XAUM',
  name: 'Matrixdock Gold',
  decimals: 18,
  coingeckoId: 'matrixdock-gold',
  addresses: {
    1: '0x2103e845c5e135493bb6c2a4f0b8651956ea8682', // Ethereum
    56: '0x23ae4fd8e7844cdbc97775496ebd0e8248656028', // BSC
  },
  image:
    'https://coin-images.coingecko.com/coins/images/51962/large/xaum_200px_logo_1x.png?1733560735',
};

export const GFI_TOKEN: TokenConfig = {
  symbol: 'GFI',
  name: 'Goldfinch',
  decimals: 18,
  coingeckoId: 'goldfinch',
  addresses: {
    1: '0xdab396ccf3d84cf2d07c4454e10c8a6f5b008d2b', // Ethereum
  },
  image:
    'https://coin-images.coingecko.com/coins/images/19081/large/GOLDFINCH.png?1696518531',
};

export const TRU_TOKEN: TokenConfig = {
  symbol: 'TRU',
  name: 'TrueFi',
  decimals: 8,
  coingeckoId: 'truefi',
  addresses: {
    1: '0x4c19596f5aaff459fa38b0f7ed92f11ae6543784', // Ethereum
  },
  image:
    'https://coin-images.coingecko.com/coins/images/13180/large/truefi_glyph_color.png?1696512963',
};

export const BOSON_TOKEN: TokenConfig = {
  symbol: 'BOSON',
  name: 'Boson Protocol',
  decimals: 18,
  coingeckoId: 'boson-protocol',
  addresses: {
    1: '0xc477d038d5420c6a9e0b031712f61c5120090de9', // Ethereum
    137: '0x9b3b0703d392321ad24338ff1f846650437a43c9', // Polygon
  },
  image:
    'https://coin-images.coingecko.com/coins/images/14710/large/boson_logo.png?1696514381',
};

export const HIFI_TOKEN: TokenConfig = {
  symbol: 'HIFI',
  name: 'Hifi Finance',
  decimals: 18,
  coingeckoId: 'hifi-finance',
  addresses: {
    1: '0x4b9278b94a1112cad404048903b8d343a810b07e', // Ethereum
  },
  image:
    'https://coin-images.coingecko.com/coins/images/28712/large/hft.png?1696527693',
};

export const OUSD_TOKEN: TokenConfig = {
  symbol: 'OUSD',
  name: 'Origin Dollar',
  decimals: 18,
  coingeckoId: 'origin-dollar',
  addresses: {
    1: '0x2a8e1e676ec238d8a992307b495b45b3feaa5e86', // Ethereum
  },
  image:
    'https://coin-images.coingecko.com/coins/images/12589/large/ousd-logo-200x200.png?1696512399',
};

export const LAND_TOKEN: TokenConfig = {
  symbol: 'LAND',
  name: 'Landshare',
  decimals: 18,
  coingeckoId: 'landshare',
  addresses: {
    56: '0xa73164db271931cf952cbaeff9e8f5817b42fa5c', // BSC
    137: '0xc03e6ad83de7c58c9166ff08d66b960d78e64105', // Polygon
    // 42161: '0x27bc2757fab0b8ab406016d1f71d8123452095d3', // Arbitrum, returns 404 for quotes
  },
  image:
    'https://coin-images.coingecko.com/coins/images/17507/large/Landshare.png?1696517046',
};

export const SPCX_TOKEN: TokenConfig = {
  symbol: 'SPCX',
  name: 'Paimon SpaceX SPV Token',
  decimals: 18,
  coingeckoId: 'paimon-spacex-spv-token',
  addresses: {
    56: '0x872109274218cb50f310e2bfb160d135b502a9d5', // BSC
  },
  image:
    'https://coin-images.coingecko.com/coins/images/66692/large/SPCX-tokenicon.png?1750265437',
};

export const STRP_TOKEN: TokenConfig = {
  symbol: 'STRP',
  name: 'Paimon Stripe SPV Token',
  decimals: 18,
  coingeckoId: 'paimon-stripe-spv-token',
  addresses: {
    56: '0x13578c16e3dc631737e93ed6bbef428faa9bbaf7', // BSC
  },
  image:
    'https://coin-images.coingecko.com/coins/images/67794/large/STRP-tokenicon.png?1753886320',
};

export const CRSR_TOKEN: TokenConfig = {
  symbol: 'CRSR',
  name: 'Paimon Cursor SPV Token',
  decimals: 18,
  coingeckoId: 'paimon-cursor-spv-token',
  addresses: {
    56: '0x8d52f97ab2803e9c23d949d377c019770dbf1ff3', // BSC
  },
  image:
    'https://coin-images.coingecko.com/coins/images/67807/large/CRSR-tokenicon.png?1753917104',
};

export const XAI_TOKEN: TokenConfig = {
  symbol: 'XAI',
  name: 'Paimon xAI SPV Token',
  decimals: 18,
  coingeckoId: 'paimon-xai-spv-token',
  addresses: {
    56: '0x43ff4cf60f75fbcc91be7d5036710ffcf2a80459', // Arbitrum
  },
  image:
    'https://coin-images.coingecko.com/coins/images/67793/large/XAI-tokenicon.png?1753886127',
};

export const CFG_TOKEN: TokenConfig = {
  symbol: 'CFG',
  name: 'Centrifuge',
  decimals: 18,
  coingeckoId: 'centrifuge',
  addresses: {
    1: '0xcccccccccc33d538dbc2ee4feab0a7a1ff4e8a94', // Ethereum
  },
  image:
    'https://coin-images.coingecko.com/coins/images/15380/large/centrifuge.PNG?1696515027',
};

export const LINK_TOKEN: TokenConfig = {
  symbol: 'LINK',
  name: 'Chainlink',
  decimals: 18,
  coingeckoId: 'chainlink',
  addresses: {
    1: '0x514910771af9ca656af840dff83e8264ecf986ca', // Ethereum
    56: '0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd', // BSC
    137: '0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39', // Polygon
    42161: '0xf97f4df75117a78c1a5a0dbb814af92458539fb4', // Arbitrum
    10: '0x350a791bfc2c21f9ed5d10980dad2e2638ffa7f6', // Optimism
    43114: '0x5947bb275c521040051d82396192181b413227a3', // Avalanche
  },
  image:
    'https://coin-images.coingecko.com/coins/images/877/large/chainlink-new-logo.png?1547034700',
};

export const RSR_TOKEN: TokenConfig = {
  symbol: 'RSR',
  name: 'Reserve Rights',
  decimals: 18,
  coingeckoId: 'reserve-rights-token',
  addresses: {
    1: '0x320623b8e4ff03373931769a31fc52a4e78b5d70', // Ethereum
    // 42161: '0xca5ca9083702c56b481d1eec86f1776fdbd2e594', // Arbitrum, returns 404 for quotes
  },
  image:
    'https://coin-images.coingecko.com/coins/images/8365/large/RSR_Blue_Circle_1000.png?1721777856',
};

export const IVVON_TOKEN: TokenConfig = {
  symbol: 'IVVON',
  name: 'iShares Core S&P 500 ETF (Ondo Tokenized ETF)',
  decimals: 18,
  coingeckoId: 'ishares-core-s-p-500-etf-ondo-tokenized-etf',
  addresses: {
    1: '0x62ca254a363dc3c748e7e955c20447ab5bf06ff7', // Ethereum
  },
  image:
    'https://coin-images.coingecko.com/coins/images/68650/large/ivvon_160x160.png?1756156270',
};

export const QQQON_TOKEN: TokenConfig = {
  symbol: 'QQQON',
  name: 'Invesco QQQ ETF (Ondo Tokenized ETF)',
  decimals: 18,
  coingeckoId: 'invesco-qqq-etf-ondo-tokenized-etf',
  addresses: {
    1: '0x0e397938c1aa0680954093495b70a9f5e2249aba', // Ethereum
  },
  image:
    'https://coin-images.coingecko.com/coins/images/68654/large/qqqon_160x160.png?1756156339',
};

export const EFAON_TOKEN: TokenConfig = {
  symbol: 'EFAON',
  name: 'iShares MSCI EAFE ETF (Ondo Tokenized ETF)',
  decimals: 18,
  coingeckoId: 'ishares-msci-eafe-etf-ondo-tokenized-etf',
  addresses: {
    1: '0x4111b60bc87f2bd1e81e783e271d7f0ec6ee088b', // Ethereum
  },
  image:
    'https://coin-images.coingecko.com/coins/images/68555/large/efaon_160x160.png?1756105748',
};

export const MSTRX_TOKEN: TokenConfig = {
  symbol: 'MSTRX',
  name: 'MicroStrategy xStock',
  decimals: 18,
  coingeckoId: 'microstrategy-xstock',
  addresses: {
    1: '0xae2f842ef90c0d5213259ab82639d5bbf649b08e', // Ethereum
    56: '0xae2f842ef90c0d5213259ab82639d5bbf649b08e', // BSC
  },
  image:
    'https://coin-images.coingecko.com/coins/images/55631/large/Ticker_MSTR__Company_Name_MicroStrategy__size_200x200_2x.png?1746862528',
};

export const IWFON_TOKEN: TokenConfig = {
  symbol: 'IWFON',
  name: 'iShares Russell 1000 Growth ETF (Ondo Tokenized ETF) ',
  decimals: 18,
  coingeckoId: 'ishares-russell-1000-growth-etf-ondo-tokenized-etf',
  addresses: {
    1: '0x8d05432c2786e3f93f1a9a62b9572dbf54f3ea06', // Ethereum
  },
  image:
    'https://coin-images.coingecko.com/coins/images/68570/large/iwfon_160x160.png?1756106267',
};

export const QQQX_TOKEN: TokenConfig = {
  symbol: 'QQQX',
  name: 'Nasdaq xStock',
  decimals: 18,
  coingeckoId: 'nasdaq-xstock',
  addresses: {
    1: '0xa753a7395cae905cd615da0b82a53e0560f250af', // Ethereum
    56: '0xa753a7395cae905cd615da0b82a53e0560f250af', // BSC
  },
  image:
    'https://coin-images.coingecko.com/coins/images/66696/large/QQQx.png?1750266952',
};

export const PRO_TOKEN: TokenConfig = {
  symbol: 'PRO',
  name: 'Propy',
  decimals: 8,
  coingeckoId: 'propy',
  addresses: {
    1: '0x226bb599a12c826476e3a771454697ea52e9e220', // Ethereum
  },
  image:
    'https://coin-images.coingecko.com/coins/images/869/large/propy-pro-logo.png?1737476645',
};

export const PLUME_TOKEN: TokenConfig = {
  symbol: 'PLUME',
  name: 'Plume',
  decimals: 18,
  coingeckoId: 'plume',
  addresses: {
    1: '0x4c1746a800d224393fe2470c70a35717ed4ea5f1', // Ethereum
  },
  image:
    'https://coin-images.coingecko.com/coins/images/53623/large/plume-token.png?1736896935',
};

export const PALM_TOKEN: TokenConfig = {
  symbol: 'PALM',
  name: 'Palm Economy',
  decimals: 6,
  coingeckoId: 'palm-economy',
  addresses: {
    56: '0x502a641decfe32b1e3d030e05effb8ae5146e64b', // BSC
  },
  image:
    'https://coin-images.coingecko.com/coins/images/55256/large/PALM_Token_Vector.png?1745037772',
};

export const STBL_TOKEN: TokenConfig = {
  symbol: 'STBL',
  name: 'STBL',
  decimals: 18,
  coingeckoId: 'stbl',
  addresses: {
    56: '0x8dedf84656fa932157e27c060d8613824e7979e3', // BSC
  },
  image:
    'https://coin-images.coingecko.com/coins/images/69277/large/stbl.png?1758022676',
};

export const ALL_RWA_TOKENS: TokenConfig[] = [
  XAUT_TOKEN,
  PAXG_TOKEN,
  CPOOL_TOKEN,
  XAUM_TOKEN,
  GFI_TOKEN,
  TRU_TOKEN,
  BOSON_TOKEN,
  HIFI_TOKEN,
  OUSD_TOKEN,
  LAND_TOKEN,
  SPCX_TOKEN,
  STRP_TOKEN,
  CRSR_TOKEN,
  XAI_TOKEN,
  CFG_TOKEN,
  LINK_TOKEN,
  RSR_TOKEN,
  // IVVON_TOKEN, returns 404 for quotes
  QQQON_TOKEN,
  // EFAON_TOKEN, returns 404 for quotes
  // MSTRX_TOKEN, returns 404 for quotes
  // IWFON_TOKEN, returns 404 for quotes
  // QQQX_TOKEN, returns 404 for quotes
  // PRO_TOKEN, returns 404 for quotes
  PLUME_TOKEN,
  PALM_TOKEN,
  STBL_TOKEN,
];

/**
 * Crypto Token Configurations
 * Standard cryptocurrency tokens for payments and liquidity
 */

export const USDT_TOKEN: TokenConfig = {
  symbol: 'USDT',
  name: 'Tether USD',
  decimals: 6,
  coingeckoId: 'tether',
  addresses: {
    1: '0xdac17f958d2ee523a2206206994597c13d831ec7', // Ethereum
    // 56: '0x55d398326f99059fF775485246999027B3197955', // BSC
    137: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', // Polygon
    42161: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', // Arbitrum
    10: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58', // Optimism
    43114: '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7', // Avalanche
  },
  image:
    'https://coin-images.coingecko.com/coins/images/325/large/Tether.png?1696501661',
};

export const USDC_TOKEN: TokenConfig = {
  symbol: 'USDC',
  name: 'USD Coin',
  decimals: 6,
  coingeckoId: 'usd-coin',
  addresses: {
    1: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // Ethereum
    // 56: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', // BSC
    137: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359', // Polygon (USDC.e)
    42161: '0xaf88d065e77c8cc2239327c5edb3a432268e5831', // Arbitrum
    10: '0x0b2c639c533813f4aa9d7837caf62653d097ff85', // Optimism
    43114: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e', // Avalanche
  },
  image:
    'https://coin-images.coingecko.com/coins/images/6319/large/usdc.png?1696506694',
};

export const ETH_TOKEN: TokenConfig = {
  symbol: 'ETH',
  name: 'Ether',
  decimals: 18,
  coingeckoId: 'ethereum',
  addresses: {
    1: '0x0000000000000000000000000000000000000000', // Ethereum (native)
  },
  image:
    'https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1595348880',
};

export const ALL_CRYPTO_TOKENS: TokenConfig[] = [
  USDT_TOKEN,
  USDC_TOKEN,
  ETH_TOKEN,
];

/**
 * Combined Token Arrays
 */

export const ALL_TOKENS: TokenConfig[] = [
  ...ALL_RWA_TOKENS,
  ...ALL_CRYPTO_TOKENS,
];

/**
 * Performance-Optimized Lookup Maps
 * Pre-computed for O(1) access
 */

export const TOKEN_BY_COINGECKO_ID: TokenByCoinGeckoIdMap = ALL_TOKENS.reduce(
  (acc, token) => {
    acc[token.coingeckoId] = token;
    return acc;
  },
  {} as TokenByCoinGeckoIdMap,
);

export const CHAIN_BY_ID: ChainLookupMap = ALL_CHAINS.reduce((acc, chain) => {
  acc[chain.id] = chain;
  return acc;
}, {} as ChainLookupMap);

export const TOKEN_BY_SYMBOL_NORMALIZED: TokenLookupMap = ALL_TOKENS.reduce(
  (acc, token) => {
    acc[token.symbol.toLowerCase()] = token;
    return acc;
  },
  {} as TokenLookupMap,
);

export const TOKENS_BY_CHAIN: TokensByChainMap = ALL_TOKENS.reduce(
  (acc, token) => {
    Object.keys(token.addresses).forEach((chainIdStr) => {
      const chainId = parseInt(chainIdStr, 10);
      if (!acc[chainId]) {
        acc[chainId] = [];
      }
      acc[chainId].push(token);
    });
    return acc;
  },
  {} as TokensByChainMap,
);

/**
 * Helper Functions
 * Utility functions for token and chain lookups
 */

export function getChainById(chainId: number): ChainConfig | undefined {
  return CHAIN_BY_ID[chainId];
}

export function getTokenBySymbol(symbol: string): TokenConfig | undefined {
  return TOKEN_BY_SYMBOL_NORMALIZED[symbol.toLowerCase()];
}

export function getTokenByCoinGeckoId(
  coingeckoId: string,
): TokenConfig | undefined {
  return TOKEN_BY_COINGECKO_ID[coingeckoId];
}

export function getTokensByChain(chainId: number): TokenConfig[] {
  return TOKENS_BY_CHAIN[chainId] || [];
}

export function getAllCoinGeckoIds(): string[] {
  return ALL_TOKENS.map((token) => token.coingeckoId);
}

export function isTokenAvailableOnChain(
  tokenSymbol: string,
  chainId: number,
): boolean {
  const token = getTokenBySymbol(tokenSymbol);
  if (!token) return false;
  return token.addresses[chainId] !== undefined;
}

export function getTokenAddress(
  tokenSymbol: string,
  chainId: number,
): string | undefined {
  const token = getTokenBySymbol(tokenSymbol);
  if (!token) return undefined;
  return token.addresses[chainId];
}
