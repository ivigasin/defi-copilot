'use client';

import { useWallet } from '@/lib/wallet-context';

export function WalletConnect() {
  const { address, isLoading, error, connectMetaMask, disconnect } = useWallet();

  if (address) {
    return (
      <div className="flex items-center gap-3 px-5 py-2.5 bg-violet-950 border-b border-violet-800">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
          <span className="text-sm text-violet-300">Connected</span>
        </span>
        <code className="text-sm font-mono text-white bg-violet-800/60 px-2 py-0.5 rounded">
          {address.slice(0, 6)}…{address.slice(-4)}
        </code>
        <button
          onClick={disconnect}
          className="ml-auto text-sm text-violet-400 hover:text-rose-400 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 px-5 py-4 bg-violet-950 border-b border-violet-800">
      <button
        onClick={connectMetaMask}
        disabled={isLoading}
        className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-semibold text-sm
          bg-gradient-to-r from-orange-500 to-amber-400 text-white
          hover:from-orange-400 hover:to-amber-300
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_28px_rgba(249,115,22,0.6)]
          transition-all duration-200"
      >
        {/* MetaMask fox icon */}
        <svg width="20" height="20" viewBox="0 0 318.6 318.6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M274.1 35.5l-99.5 73.9L193 98.6z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M44.4 35.5l98.7 74.6-17.5-11.5zM238.3 206.8l-26.5 40.6 56.7 15.6 16.3-55.3zM33.9 207.7L50.1 263l56.7-15.6-26.5-40.6z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M103.6 138.2l-15.8 23.9 56.3 2.5-2-60.5zM214.9 138.2l-39-34.8-1.3 61.2 56.2-2.5zM106.8 247.4l33.8-16.5-29.2-22.8zM177.9 230.9l33.9 16.5-4.7-39.3z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M211.8 247.4l-33.9-16.5 2.7 22.1-.3 9.3zM106.8 247.4l31.5 14.9-.2-9.3 2.5-22.1z" fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M138.8 193.5l-28.2-8.3 19.9-9.1zM179.7 193.5l8.3-17.4 20 9.1z" fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M106.8 247.4l4.8-40.6-31.3.9zM206.9 206.8l4.9 40.6 26.5-39.7zM230.8 162.1l-56.2 2.5 5.2 28.9 8.3-17.4 20 9.1zM110.6 185.2l20-9.1 8.2 17.4 5.3-28.9-56.3-2.5z" fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M87.8 162.1l23.6 46.1-.8-22.9zM207.3 185.2l-1 22.9 23.7-46zM144.1 164.6l-5.3 28.9 6.6 34.1 1.5-44.9zM174.6 164.6l-2.7 18 1.2 45 6.7-34.1z" fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M179.8 193.5l-6.7 34.1 4.8 3.3 29.2-22.8 1-22.9zM110.6 185.2l.8 22.9 29.2 22.8 4.8-3.3-6.6-34.1z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M180.1 262.3l.3-9.3-2.5-2.2h-37.7l-2.3 2.2.2 9.3-31.5-14.9 11 9 22.3 15.5h38.3l22.4-15.5 11-9z" fill="#C0AD9E" stroke="#C0AD9E" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M177.9 230.9l-4.8-3.3h-27.7l-4.8 3.3-2.5 22.1 2.3-2.2h37.7l2.5 2.2z" fill="#161616" stroke="#161616" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M278.3 114.2l8.5-40.8-12.7-37.9-96.2 71.4 37 31.3 52.3 15.3 11.6-13.5-5-3.6 8-7.3-6.2-4.8 8-6.1zM31.8 73.4l8.5 40.8-5.4 4 8 6.1-6.1 4.8 8 7.3-5 3.6 11.5 13.5 52.3-15.3 37-31.3-96.2-71.4z" fill="#763D16" stroke="#763D16" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M267.2 153.5l-52.3-15.3 15.9 23.9-23.7 46 31.2-.4h46.5zM103.6 138.2l-52.3 15.3-17.4 54.2h46.4l31.1.4-23.6-46zM174.6 164.6l3.3-57.7 15.2-41.1h-67.5l15 41.1 3.5 57.7 1.2 18.2.1 44.8h27.7l.2-44.8z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {isLoading ? 'Connecting…' : 'Connect MetaMask'}
      </button>
      {error && (
        <p className="text-sm text-rose-400 text-center max-w-sm">{error}</p>
      )}
    </div>
  );
}
