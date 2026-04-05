'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Navigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/accounts', label: 'Accounts' },
    { href: '/transactions', label: 'Transactions' },
    { href: '/blocks', label: 'Blocks' },
    { href: '/consensus', label: 'Consensus' },
    { href: '/audit', label: 'Audit Log' },
    { href: '/ledger', label: 'Ledger' },
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <nav className="border-b border-border bg-card sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">V</span>
            </div>
            <span className="font-bold text-lg text-primary">Verity</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted/20'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Crypto Tools Dropdown */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Tools ▼
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-2 z-50">
                  <Link
                    href="/crypto/merkle-verify"
                    className="block px-4 py-2 hover:bg-muted/20 text-sm"
                  >
                    Merkle Verification
                  </Link>
                  <Link
                    href="/crypto/signature-verify"
                    className="block px-4 py-2 hover:bg-muted/20 text-sm"
                  >
                    Signature Verification
                  </Link>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold hover:opacity-80 transition-opacity"
              >
                U
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-2 z-50">
                  <Link href="/profile" className="block px-4 py-2 hover:bg-muted/20 text-sm">
                    Profile
                  </Link>
                  <Link href="/settings" className="block px-4 py-2 hover:bg-muted/20 text-sm">
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-muted/20 text-sm text-destructive"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 hover:bg-muted/20 rounded-lg"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted/20'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-border pt-2 mt-2">
              <Link href="/crypto/merkle-verify" className="block px-4 py-2 text-sm hover:bg-muted/20">
                Merkle Verification
              </Link>
              <Link href="/crypto/signature-verify" className="block px-4 py-2 text-sm hover:bg-muted/20">
                Signature Verification
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
