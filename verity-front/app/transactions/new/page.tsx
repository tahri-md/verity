'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PrivateLayout from '@/components/PrivateLayout'
import axios from 'axios'

interface Account {
  id: string
  name: string
}

export default function CreateTransactionPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [formData, setFormData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [signature, setSignature] = useState('')

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:8080/api/accounts', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setAccounts(response.data.data || [])
    } catch (err) {
      setError('Failed to load accounts')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSign = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post('http://localhost:8080/api/crypto/sign-transaction', {
        from: formData.fromAccountId,
        to: formData.toAccountId,
        amount: parseFloat(formData.amount),
        message: formData.message,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSignature(response.data.signature)
    } catch (err: any) {
      setError('Failed to sign transaction')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!signature) {
      setError('Transaction must be signed first')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      await axios.post('http://localhost:8080/api/transactions', {
        from: formData.fromAccountId,
        to: formData.toAccountId,
        amount: parseFloat(formData.amount),
        message: formData.message,
        signature,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      })

      router.push('/transactions')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create transaction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PrivateLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/transactions" className="text-accent hover:underline mb-4 inline-block">
          ← Back to Transactions
        </Link>

        <div className="card border-2">
          <h1 className="text-3xl font-bold text-primary mb-2">Create Transaction</h1>
          <p className="text-muted mb-8">Sign and submit a new blockchain transaction</p>

          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">From Account</label>
                <select
                  name="fromAccountId"
                  value={formData.fromAccountId}
                  onChange={handleChange}
                  className="input-field w-full"
                  required
                >
                  <option value="">Select account...</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">To Account</label>
                <select
                  name="toAccountId"
                  value={formData.toAccountId}
                  onChange={handleChange}
                  className="input-field w-full"
                  required
                >
                  <option value="">Select account...</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Amount</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message (Optional)</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="Add a memo..."
                rows={3}
              />
            </div>

            <div className="border-t border-border pt-6">
              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  onClick={handleSign}
                  disabled={!formData.fromAccountId || !formData.toAccountId || !formData.amount}
                  className="btn btn-secondary flex-1"
                >
                  Sign Transaction
                </button>
              </div>

              {signature && (
                <div className="bg-green-500/10 border border-green-500 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-500 mb-2">Transaction Signed</p>
                  <p className="text-xs font-mono text-accent break-all">{signature}</p>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-6 border-t border-border">
              <button
                type="submit"
                disabled={loading || !signature}
                className="btn btn-primary flex-1"
              >
                {loading ? 'Submitting...' : 'Submit Transaction'}
              </button>
              <Link href="/transactions" className="btn btn-secondary flex-1 text-center">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </PrivateLayout>
  )
}
