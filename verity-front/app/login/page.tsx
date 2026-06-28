'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await api.post('/api/auth/login', { email, password })
      if (response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('account_id', response.data.user.account_id)
        localStorage.setItem('user', JSON.stringify({
          account_id: response.data.user.account_id,
          email: response.data.user.email,
          name: response.data.user.name,
          public_key: response.data.user.public_key,
          balance: response.data.user.balance,
          nonce: response.data.user.nonce,
        }))
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">

      <div className="hidden lg:flex flex-col justify-between w-72 flex-shrink-0 p-10 border-r bg-primary/10 border-border/30 relative overflow-hidden">
        <div className="relative">
          <div className="flex items-center gap-2">
            <img src='verity_icon.png' className='w-20'/>
            <span className="font-semibold text-xl tracking-tight">Verity</span>
          </div>
        </div>

        <div className="relative space-y-6">
          <p className="font-mono text-[11px] text-foreground/30 leading-none uppercase tracking-widest">
            node / consensus
          </p>
          <p className="text-[22px] font-bold leading-snug tracking-tight text-foreground/80">
            Every block is<br />cryptographically<br />accountable.
          </p>
          <p className="text-xs text-foreground/35 leading-relaxed max-w-[180px]">
            Merkle-verified. ECDSA-signed. Validator-voted. No trust required.
          </p>
        </div>

        <p className="relative font-mono text-[10px] text-foreground/20">v1.0.0</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[340px]">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M10 2L17 6V14L10 18L3 14V6L10 2Z" stroke="#7c5cfc" strokeWidth="1.5" fill="none" />
              <path d="M10 6L14 8.5V13.5L10 16L6 13.5V8.5L10 6Z" stroke="#33ffa0" strokeWidth="1" fill="none" />
            </svg>
            <span className="font-semibold text-sm tracking-tight">Verity</span>
          </div>

          <div className="mb-8">
            <h1 className="text-xl font-bold tracking-tight mb-1">Sign in</h1>
            <p className="text-sm text-foreground/40">Back to your node.</p>
          </div>

          {error && (
            <div className="border-l-2 border-destructive pl-3 mb-6">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-[11px] font-mono text-foreground/40 mb-1.5 uppercase tracking-widest">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="input-field w-full"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-[11px] font-mono text-foreground/40 uppercase tracking-widest">
                  Password
                </label>
                <Link href="/forgot-password" className="text-[11px] text-foreground/30 hover:text-foreground/60 transition-colors">
                  Reset
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input-field w-full"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-md font-medium text-sm transition-opacity disabled:opacity-40 disabled:cursor-not-allowed mt-1"
              style={{ background: '#7c5cfc', color: '#fff' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-sm text-foreground/35 mt-6">
            New here?{' '}
            <Link href="/signup" className="text-foreground/60 font-medium hover:text-foreground transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}