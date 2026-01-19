import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors';

// const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;
const projectId = '5b55a3d7448009f7e09aabab2574b580'


export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    // injected(),
    walletConnect({ projectId }),
    metaMask(),
    // safe(),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});