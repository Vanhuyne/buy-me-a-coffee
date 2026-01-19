'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Wallet, LogOut } from 'lucide-react';

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-green-700 font-semibold">✓ Connected</p>
          <p className="text-sm font-mono text-gray-900">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
        <button
          onClick={() => disconnect()}
          className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded transition flex items-center gap-1"
        >
          <LogOut size={14} />
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={status === 'pending'}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
        >
          <Wallet size={20} />
          Connect {connector.name}
        </button>
      ))}
      {error && <p className="text-red-600 text-sm">{error.message}</p>}
    </div>
  );
}