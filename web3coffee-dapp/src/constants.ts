
// Contract
export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;
export const DONATION_CONTRACT = '0x742d35Cc6634C0532925a3b844Bc9e7595f42b5e' as const;
export const USDC_DECIMALS = 6;

// Donation
export const DONATION_PRESETS = [5, 10, 20, 50];
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

// ABIs
export const USDC_ABI = [
  {
    constant: true,
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function'
  }
] as const;

export const DONATION_ABI = [
  {
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'message', type: 'string' },
      { name: 'creator', type: 'address' }
    ],
    name: 'donate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;

// Helper functions
export const formatBalance = (balance: bigint | undefined): string => {
  if (!balance) return '0';
  return (Number(balance) / 10 ** USDC_DECIMALS).toFixed(2);
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