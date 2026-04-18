'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/positions', label: 'Positions' },
  { href: '/recommendations', label: 'Recommendations' },
  { href: '/alerts', label: 'Alerts' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <Link href="/dashboard" className="mr-6 text-lg font-bold tracking-tight">
        DeFi Copilot
      </Link>
      {NAV_ITEMS.map(({ href, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
