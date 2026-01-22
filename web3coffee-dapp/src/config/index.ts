import { cookieStorage, createStorage, http } from 'wagmi';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { base, baseSepolia, mainnet, sepolia } from '@reown/appkit/networks';

// Get project ID from environment variables
const projectIdEnv = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectIdEnv) {
  throw new Error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not defined in .env.local');
}

export const projectId: string = projectIdEnv;

export const networks = [baseSepolia, base, mainnet, sepolia];

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
});

export const config = wagmiAdapter.wagmiConfig;