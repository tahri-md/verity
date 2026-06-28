'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Send,
  Boxes,
  ClipboardList,
  Scale,
  Database,
  Settings,
  ShieldCheck,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Transactions', href: '/transactions', icon: Send },
  { label: 'Blocks', href: '/blocks', icon: Boxes },
  { label: 'Consensus', href: '/consensus', icon: Scale },
  { label: 'Ledger', href: '/ledger', icon: Database },
  { label: 'Audit', href: '/audit', icon: ClipboardList },
  { label: 'Settings', href: '/settings', icon: Settings },
]

const cryptoItems = [
  { label: 'Merkle verify', href: '/crypto/merkle-verify', icon: ShieldCheck },
  { label: 'Signature verify', href: '/crypto/signature-verify', icon: ShieldCheck },
]

export default function SidebarNav() {
  const pathname = usePathname()

  return (
    <aside
      className="fixed left-0 top-0 h-screen z-40 flex flex-col border-r border-border/50 bg-background"
      style={{ width: 200 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border/40">
        <img src='verity_icon.png' className='w-10' />
        <span className="font-semibold text-lg tracking-wide">Verity</span>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-2 mb-2 text-[10px] uppercase tracking-widest text-foreground/30 font-medium">
          Chain
        </p>
        <ul className="space-y-0.5 mb-5">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${active
                    ? 'bg-muted text-foreground font-medium'
                    : 'text-foreground/50 hover:bg-muted/60 hover:text-foreground'
                    }`}
                >
                  <Icon
                    size={15}
                    style={{ color: active ? '#7c5cfc' : undefined }}
                    strokeWidth={active ? 2 : 1.5}
                  />
                  <span>{label}</span>
                  {active && (
                    <span
                      className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: '#7c5cfc' }}
                    />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>

        <p className="px-2 mb-2 text-[10px] uppercase tracking-widest text-foreground/30 font-medium">
          Crypto
        </p>
        <ul className="space-y-0.5">
          {cryptoItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${active
                    ? 'bg-muted text-foreground font-medium'
                    : 'text-foreground/50 hover:bg-muted/60 hover:text-foreground'
                    }`}
                >
                  <Icon
                    size={15}
                    style={{ color: active ? '#33ffa0' : undefined }}
                    strokeWidth={active ? 2 : 1.5}
                  />
                  <span>{label}</span>
                  {active && (
                    <span
                      className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: '#33ffa0' }}
                    />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border/40">
        <p className="text-[10px] text-foreground/25 font-mono">verity v1.0</p>
      </div>
    </aside>
  )
}