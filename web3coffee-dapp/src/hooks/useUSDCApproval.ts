'use client';

import { useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';
import { USDC_ABI, USDC_ADDRESS, DONATION_CONTRACT, USDC_DECIMALS } from '@/constants';

export const useUSDCApproval = () => {
  const { writeContract: approveUSDC, isPending: isApprovingUSDC } =
    useWriteContract();

  const approve = async (amount: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const amountInWei = parseUnits(amount, USDC_DECIMALS);

      approveUSDC(
        {
          address: USDC_ADDRESS,
          abi: USDC_ABI,
          functionName: 'approve',
          args: [DONATION_CONTRACT, amountInWei]
        },
        {
          onSuccess: () => resolve(true),
          onError: (error: any) => {
            console.error(error?.message);
            resolve(false);
          }
        }
      );
    });
  };

  return { approve, isApprovingUSDC };
};