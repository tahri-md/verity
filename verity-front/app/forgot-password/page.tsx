'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Backend does not implement password reset yet.
      setError('Password reset is not implemented yet.')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-[340px]">

        <div className="flex items-center gap-2 mb-12">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M10 2L17 6V14L10 18L3 14V6L10 2Z" stroke="#7c5cfc" strokeWidth="1.5" fill="none" />
            <path d="M10 6L14 8.5V13.5L10 16L6 13.5V8.5L10 6Z" stroke="#33ffa0" strokeWidth="1" fill="none" />
          </svg>
          <span className="font-semibold text-sm tracking-tight">Verity</span>
        </div>

        {submitted ? (
          <div>
            <div className="mb-8">
              <p className="font-mono text-[11px] text-foreground/30 uppercase tracking-widest mb-1">sent</p>
              <h1 className="text-xl font-bold tracking-tight">Check your email</h1>
              <p className="text-sm text-foreground/40 mt-1">Reset link sent to {email}</p>
            </div>
            <Link
              href="/login"
              className="block w-full py-2.5 rounded-md font-medium text-sm text-center"
              style={{ background: '#7c5cfc', color: '#fff' }}
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <p className="font-mono text-[11px] text-foreground/30 uppercase tracking-widest mb-1">account</p>
              <h1 className="text-xl font-bold tracking-tight">Reset password</h1>
              <p className="text-sm text-foreground/40 mt-1">We'll send a link to your email.</p>
            </div>

            {error && (
              <div className="border-l-2 border-destructive pl-3 mb-6">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block font-mono text-[11px] text-foreground/40 uppercase tracking-widest mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field w-full"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-md font-medium text-sm transition-opacity disabled:opacity-40"
                style={{ background: '#7c5cfc', color: '#fff' }}
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>

            <p className="text-sm text-foreground/35 mt-6">
              <Link href="/login" className="text-foreground/50 hover:text-foreground/80 transition-colors">
                ← Back to sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}