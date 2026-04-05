'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [accountData, setAccountData] = useState<any>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required')
      return false
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Invalid email address')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) return

    setLoading(true)

    try {
      const response = await axios.post('http://localhost:8080/api/auth/signup', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })

      // Store account data for display
      setAccountData(response.data)
      setSuccess(true)
      
      // Redirect after showing account details
      setTimeout(() => {
        router.push('/login')
      }, 5000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card border-2">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-primary mb-2">Create Account</h1>
            <p className="text-muted">Join Verity Blockchain Platform</p>
          </div>

          {success && accountData && (
            <div className="bg-primary/10 border border-primary rounded-lg p-4 mb-6 space-y-3 text-sm">
              <div className="text-green-500 font-semibold">Account Created Successfully!</div>
              
              <div className="space-y-2 text-foreground">
                <div>
                  <div className="font-medium text-muted mb-1">Account ID:</div>
                  <div className="bg-input p-2 rounded break-all font-mono text-xs">
                    {accountData.account_id}
                  </div>
                </div>
                
                <div>
                  <div className="font-medium text-muted mb-1">Public Key:</div>
                  <div className="bg-input p-2 rounded break-all font-mono text-xs max-h-20 overflow-y-auto">
                    {accountData.public_key}
                  </div>
                </div>
                
                <div>
                  <div className="font-medium text-muted mb-1">Starting Balance:</div>
                  <div className="bg-input p-2 rounded font-mono">{accountData.balance}</div>
                </div>
              </div>
              
              <div className="pt-2 text-muted text-xs border-t border-border">
                Save your Account ID and Public Key - you'll need them for blockchain operations. 
                Redirecting to login in 5 seconds...
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="••••••••"
                required
              />
              <p className="text-xs text-muted mt-1">At least 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="btn btn-primary w-full"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted mb-2">Already have an account?</p>
            <Link href="/login" className="text-accent font-medium hover:underline">
              Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
