
// Contract - Web3CoffeeOptimized deployed on Base Sepolia
export const DONATION_CONTRACT = '0x91d0427efdfab2e970c59ff58f913394312febc1' as const;

// Donation
export const DONATION_PRESETS = [5, 10, 20, 50]; // USD amounts
export const PLATFORM_FEE = 2;
export const MESSAGE_MAX_LENGTH = 200;

// Creator
export const CREATOR_INFO = {
  address: '0x742d35Cc6634C0532925a3b844Bc9e7595f42b5e',
  name: 'John Dev',
  bio: 'Full-stack developer, sharing Web3 tips & tricks',
  emoji: '👨‍💻'
} as const;

// Recent Donations (Mock)
export const RECENT_DONATIONS = [
  { name: 'Alice', amount: 10, message: 'Love your content!' },
  { name: 'Bob', amount: 5, message: 'Thanks for the tips' },
  { name: 'Carol', amount: 20, message: 'Keep it up!' }
];

// Web3CoffeeOptimized ABI
export const DONATION_ABI = [
  {
    type: 'function',
    name: 'donateWithEth',
    inputs: [
      { name: 'creator', type: 'address' },
      { name: 'message', type: 'string' }
    ],
    outputs: [],
    stateMutability: 'payable'
  },
  {
    type: 'function',
    name: 'donateWithUsdAmount',
    inputs: [
      { name: 'creator', type: 'address' },
      { name: 'usdAmount', type: 'uint256' },
      { name: 'message', type: 'string' }
    ],
    outputs: [],
    stateMutability: 'payable'
  },
  {
    type: 'function',
    name: 'getBalance',
    inputs: [{ name: 'creator', type: 'address' }],
    outputs: [
      { name: 'ethBalance', type: 'uint256' },
      { name: 'usdBalance', type: 'uint256' }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'getLatestPrice',
    inputs: [],
    outputs: [{ name: 'price', type: 'int256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'getEthToUsd',
    inputs: [{ name: 'ethAmount', type: 'uint256' }],
    outputs: [{ name: 'usdAmount', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'getUsdToEth',
    inputs: [{ name: 'usdAmount', type: 'uint256' }],
    outputs: [{ name: 'ethAmount', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'withdraw',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'withdrawAll',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'event',
    name: 'Donation',
    inputs: [
      { name: 'creator', type: 'address', indexed: true },
      { name: 'supporter', type: 'address', indexed: true },
      { name: 'ethAmount', type: 'uint256', indexed: false },
      { name: 'usdAmount', type: 'uint256', indexed: false },
      { name: 'message', type: 'string', indexed: false }
    ],
    anonymous: false
  }
] as const;

// Helper functions
export const formatBalance = (balance: bigint | undefined): string => {
  if (!balance) return '0';
  return (Number(balance) / 10 ** 18).toFixed(4); // ETH has 18 decimals
};

export const formatUSD = (amount: bigint | undefined): string => {
  if (!amount) return '0';
  return (Number(amount) / 10 ** 8).toFixed(2); // USD from Chainlink has 8 decimals
};

export const formatFee = (amount: string, feePercent: number): string => {
  if (!amount) return '0.00';
  return (parseFloat(amount) * feePercent / 100).toFixed(2);
};

export const formatCreatorAmount = (amount: string, fee: string): string => {
  if (!amount) return '0.00';
  return (parseFloat(amount) - parseFloat(fee)).toFixed(2);
};

export const truncateAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};