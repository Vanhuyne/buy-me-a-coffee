'use client';

import { wagmiAdapter, projectId } from '@/config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { base, baseSepolia, mainnet, sepolia } from '@reown/appkit/networks';
import React, { ReactNode } from 'react';
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi';

const queryClient = new QueryClient();

const metadata = {
  name: 'Web3 Coffee',
  description: 'Support creators with crypto on Base Sepolia',
  url: 'https://web3coffee.com',
  icons: ['https://avatars.githubusercontent.com/u/179229932']
};

// Create AppKit immediately - 'use client' ensures this only runs on client
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [baseSepolia, base, mainnet, sepolia],
  defaultNetwork: baseSepolia,
  metadata: metadata,
  features: {
    analytics: true
  }
});

function ContextProvider({ 
  children, 
  cookies 
}: { 
  children: ReactNode; 
  cookies: string | null;
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies
  );

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default ContextProvider;