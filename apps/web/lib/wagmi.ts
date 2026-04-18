import { http, createConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';
import type { EIP1193Provider } from 'viem';

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '';

export const wagmiConfig = createConfig({
  chains: [mainnet],
  connectors: [
    injected(),
    injected({
      target: {
        id: 'okxWallet',
        name: 'OKX Wallet',
        provider: (win) => {
          const w = win as Record<string, unknown> | undefined;
          const provider = w?.okxwallet ?? w?.okexchain;
          return provider as EIP1193Provider | undefined;
        },
      },
    }),
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
