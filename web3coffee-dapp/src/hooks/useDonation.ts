'use client';

import { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';
import { DONATION_ABI, DONATION_CONTRACT, USDC_DECIMALS } from '@/constants';
import { DonationState } from '@/types';

export const useDonation = (creatorAddress: string) => {
  const { writeContract: donate, isPending: isDonating } = useWriteContract();
  const [state, setState] = useState<DonationState>({
    amount: '',
    message: '',
    selectedPreset: null,
    copied: false,
    txHash: '',
    error: '',
    txStep: 'idle'
  });

  const executeDonation = async (amount: string, message: string) => {
    return new Promise<boolean>((resolve) => {
      setState(prev => ({ ...prev, txStep: 'donating' }));
      const amountInWei = parseUnits(amount, USDC_DECIMALS);

      donate(
        {
          address: DONATION_CONTRACT,
          abi: DONATION_ABI,
          functionName: 'donate',
          args: [amountInWei, message, creatorAddress as `0x${string}`]
        },
        {
          onSuccess: (data) => {
            setState(prev => ({
              ...prev,
              txStep: 'success',
              txHash: data
            }));
            resolve(true);
          },
          onError: (error: any) => {
            setState(prev => ({
              ...prev,
              error: error?.message || 'Donation failed',
              txStep: 'idle'
            }));
            resolve(false);
          }
        }
      );
    });
  };

  return { state, setState, executeDonation, isDonating };
};