import { cookieStorage, createStorage, http } from 'wagmi';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { base ,mainnet, sepolia } from '@reown/appkit/networks';

// const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;
export const projectId = '5b55a3d7448009f7e09aabab2574b580'


if (!projectId) {
  throw new Error('Project ID is not defined');
}

export const networks = [base ,mainnet, sepolia];

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
});

export const config = wagmiAdapter.wagmiConfig;