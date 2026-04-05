'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Send, Boxes, ClipboardList, Scale, Database, Menu, X, Settings } from 'lucide-react'

const navItems = [
  { label: 'Dashboard',    href: '/dashboard',    icon: LayoutDashboard },
  { label: 'Transactions', href: '/transactions', icon: Send },
  { label: 'Blocks',       href: '/blocks',       icon: Boxes },
  { label: 'Audit',        href: '/audit',        icon: ClipboardList },
  { label: 'Consensus',    href: '/consensus',    icon: Scale },
  { label: 'Ledger',       href: '/ledger',       icon: Database },
  { label: 'Settings',     href: '/settings',     icon: Settings }
]

export default function SidebarNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="fixed left-5 top-5 z-50">
        {/* Toggle */}
        <button
          onClick={() => setOpen(prev => !prev)}
          aria-label="Toggle navigation"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/50 bg-background shadow-sm hover:bg-muted transition-colors"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Menu */}
        {open && (
          <nav className="absolute left-0 top-12 w-48 rounded-xl border border-border/50 bg-background shadow-lg p-1.5">
            <p className="px-2.5 pt-1.5 pb-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Menu
            </p>
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${
                    active
                      ? 'bg-muted text-foreground font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon size={15} />
                  <span>{label}</span>
                  {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-foreground" />}
                </Link>
              )
            })}
          </nav>
        )}
      </div>
    </>
  )
}