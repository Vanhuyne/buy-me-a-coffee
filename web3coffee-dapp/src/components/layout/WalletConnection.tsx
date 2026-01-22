'use client';

import { useAppKitAccount } from '@reown/appkit/react';
import { useAppKit } from '@reown/appkit/react';
import { useAppKitNetwork } from '@reown/appkit/react';
import { useBalance } from 'wagmi';
import { truncateAddress } from '@/lib/constants';

export function WalletConnection() {
  const { address, isConnected } = useAppKitAccount();
  const { open } = useAppKit();
  const { caipNetwork } = useAppKitNetwork();

  const { data: ethBalance } = useBalance({
    address: address as `0x${string}`, 
    query: { enabled: !!address }
  });

  if (!isConnected) {
    return (
      <button
        onClick={() => open()}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 cursor-pointer"
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <button
      onClick={() => open({ view: 'Account' })}
      className="w-full bg-white border border-gray-200 rounded-lg p-4 hover:border-orange-300 hover:bg-orange-50 transition duration-200 text-left cursor-pointer"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-mono text-gray-900">{address ? truncateAddress(address) : '...'}</span>
        <span className="text-xs text-green-600 font-medium">Connected</span>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-gray-700">
          {ethBalance ? (
            `${(Number(ethBalance.value) / 10 ** ethBalance.decimals).toFixed(4)} ${ethBalance.symbol}`
          ) : (
            '0.0000 ETH'
          )}
        </p>
        <p className="text-xs text-gray-500">
          {caipNetwork?.name || 'Unknown Network'}
        </p>
      </div>
    </button>
  );
}