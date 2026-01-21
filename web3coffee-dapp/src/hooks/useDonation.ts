'use client';

import { useState } from 'react';
import { useWriteContract, useReadContract } from 'wagmi';
import { parseUnits } from 'viem';
import { DONATION_ABI, DONATION_CONTRACT } from '@/constants';
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

  // Get required ETH amount for USD donation
  const { data: requiredEth } = useReadContract({
    address: DONATION_CONTRACT,
    abi: DONATION_ABI,
    functionName: 'getUsdToEth',
    args: state.amount ? [parseUnits(state.amount, 8)] : undefined, // USD with 8 decimals
  });

  const executeDonation = async (amount: string, message: string) => {
    return new Promise<boolean>((resolve) => {
      setState(prev => ({ ...prev, txStep: 'donating' }));
      
      // Convert USD amount to 8 decimals for Chainlink price feed
      const usdAmountIn8Decimals = parseUnits(amount, 8);

      donate(
        {
          address: DONATION_CONTRACT,
          abi: DONATION_ABI,
          functionName: 'donateWithUsdAmount',
          args: [creatorAddress as `0x${string}`, usdAmountIn8Decimals, message],
          value: requiredEth || BigInt(0) // Send required ETH amount
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

  return { state, setState, executeDonation, isDonating, requiredEth };
};