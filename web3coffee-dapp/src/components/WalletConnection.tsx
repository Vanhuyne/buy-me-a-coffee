'use client';

import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { useReadContract } from 'wagmi';
import { USDC_ABI, USDC_ADDRESS, formatBalance, truncateAddress } from '@/constants';

export function WalletConnection() {
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();

  const { data: balanceData } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: [address!],
    query: { enabled: !!address }
  }) as { data: bigint | undefined };

  if (!isConnected) {
    return (
      <button
        onClick={() => open()}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition"
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3">
      <p className="text-xs text-green-700 font-semibold">✓ Connected</p>
      <p className="text-sm font-mono text-gray-900">{truncateAddress(address!)}</p>
      {balanceData && (
        <p className="text-xs text-green-600 mt-1">
          💰 Balance: {formatBalance(balanceData)} USDC
        </p>
      )}
    </div>
  );
}