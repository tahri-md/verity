'use client'

import { useState } from 'react'
import Link from 'next/link'
import axios from 'axios'

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
      await axios.post('http://localhost:8080/api/auth/forgot-password', {
        email,
      })
      setSubmitted(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card border-2">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-primary mb-2">Reset Password</h1>
            <p className="text-muted">We'll send you a link to reset your password</p>
          </div>

          {submitted ? (
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg text-center">
                <p className="font-medium">Check your email</p>
                <p className="text-sm mt-1">We've sent a password reset link to {email}</p>
              </div>
              <Link href="/login" className="btn btn-primary w-full text-center">
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field w-full"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <Link href="/login" className="block text-center text-sm text-accent hover:underline">
                Back to Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
