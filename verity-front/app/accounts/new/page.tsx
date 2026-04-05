'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PrivateLayout from '@/components/PrivateLayout'
import axios from 'axios'

export default function CreateAccountPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    initialBalance: '',
    status: 'active',
  })
  const [keys, setKeys] = useState({ publicKey: '', privateKey: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showKeys, setShowKeys] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const generateKeys = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post('http://localhost:8080/api/crypto/generate-keys', {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setKeys(response.data)
      setShowKeys(true)
    } catch (err: any) {
      setError('Failed to generate keys')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      await axios.post('http://localhost:8080/api/accounts', {
        name: formData.name,
        balance: parseFloat(formData.initialBalance),
        status: formData.status,
        publicKey: keys.publicKey,
        privateKey: keys.privateKey,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      })

      router.push('/accounts')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PrivateLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/accounts" className="text-accent hover:underline mb-4 inline-block">
          ← Back to Accounts
        </Link>

        <div className="card border-2">
          <h1 className="text-3xl font-bold text-primary mb-2">Create New Account</h1>
          <p className="text-muted mb-8">Set up a new blockchain account</p>

          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Account Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="E.g., My Business Account"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Initial Balance</label>
              <input
                type="number"
                name="initialBalance"
                value={formData.initialBalance}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input-field w-full"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="border-t border-border pt-6">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium">Cryptographic Keys</label>
                <button
                  type="button"
                  onClick={generateKeys}
                  className="text-accent hover:underline text-sm"
                >
                  Generate New Keys
                </button>
              </div>

              {showKeys && (
                <div className="space-y-4 bg-muted/10 p-4 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-primary mb-2">Public Key (Safe to share)</p>
                    <input
                      type="text"
                      value={keys.publicKey}
                      readOnly
                      className="input-field w-full font-mono text-xs bg-muted/20"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-destructive mb-2">🔒 Private Key (Keep secret!)</p>
                    <input
                      type="text"
                      value={keys.privateKey}
                      readOnly
                      className="input-field w-full font-mono text-xs bg-muted/20"
                    />
                    <p className="text-xs text-muted mt-2">Store this securely. You won't see it again!</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-6 border-t border-border">
              <button
                type="submit"
                disabled={loading || !keys.publicKey}
                className="btn btn-primary flex-1"
              >
                {loading ? 'Creating...' : 'Create Account'}
              </button>
              <Link href="/accounts" className="btn btn-secondary flex-1 text-center">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </PrivateLayout>
  )
}
