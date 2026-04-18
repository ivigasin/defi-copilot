import { http, createConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '';

export const wagmiConfig = createConfig({
  chains: [mainnet],
  connectors: [
    injected(),
    ...(walletConnectProjectId
      ? [walletConnect({ projectId: walletConnectProjectId })]
      : []),
    coinbaseWallet({ appName: 'DeFi Portfolio Copilot' }),
  ],
  transports: {
    [mainnet.id]: http(),
  },
  ssr: true,
});
