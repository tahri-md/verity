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
      const response = await api.post('/api/auth/login', {
        email,
        password,
      })

      if (response.data.token && response.data.user) {
        // Store full user data including blockchain account details
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card border-2">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-primary mb-2">Verity</h1>
            <p className="text-muted">Blockchain Verification System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full"
                placeholder="••••••••"
                required
              />
            </div>

            <Link href="/forgot-password" className="text-sm text-accent hover:underline">
              Forgot password?
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted mb-2">Don't have an account?</p>
            <Link href="/signup" className="text-accent font-medium hover:underline">
              Sign up here
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
