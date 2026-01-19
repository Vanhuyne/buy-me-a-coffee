export interface DonationState {
  amount: string;
  message: string;
  selectedPreset: number | null;
  copied: boolean;
  txHash: string;
  error: string;
  txStep: 'idle' | 'approving' | 'donating' | 'success';
}

export interface CreatorInfo {
  address: string;
  name: string;
  bio: string;
  emoji: string;
}