'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PrivateLayout from '@/components/PrivateLayout'
import { api } from '@/lib/api'

async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function generateTxnID(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `txn_${crypto.randomUUID()}`
  }
  return `txn_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export default function CreateTransactionPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    toAccountId: '',
    amount: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [senderAccountID, setSenderAccountID] = useState<string>('')

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsed = JSON.parse(userData)
        setSenderAccountID(parsed?.account_id || '')
      } catch {
        setSenderAccountID('')
      }
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!senderAccountID) {
      setError('No authenticated account found. Please log in again.')
      return
    }

    const amountInt = Number.parseInt(formData.amount, 10)
    if (!Number.isFinite(amountInt) || amountInt <= 0) {
      setError('Amount must be a positive integer')
      return
    }

    setLoading(true)

    try {
      const userData = localStorage.getItem('user')
      const user = userData ? JSON.parse(userData) : null

      const txnID = generateTxnID()
      const timestamp = Date.now()
      const hash = await sha256Hex(`${senderAccountID}${formData.toAccountId}${amountInt}`)

      await api.post('/api/v1/transactions', {
        txn_id: txnID,
        to_account: formData.toAccountId,
        amount: amountInt,
        nonce: (user?.nonce ?? 0) + 1,
        timestamp,
        signature: '',
        public_key: user?.public_key || '',
        status: 'pending',
        hash,
        // Keep message for UI only; backend will ignore unknown fields.
        message: formData.message,
      })

      router.push('/transactions')
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to create transaction')
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
            <div>
              <label className="block text-sm font-medium mb-2">From Account</label>
              <input
                type="text"
                value={senderAccountID || '—'}
                className="input-field w-full"
                disabled
              />
              <p className="text-xs text-muted mt-2">Sender is always your authenticated account.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">To Account</label>
              <input
                type="text"
                name="toAccountId"
                value={formData.toAccountId}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="verity_..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Amount</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="0"
                step="1"
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

            <div className="flex gap-4 pt-6 border-t border-border">
              <button
                type="submit"
                disabled={loading}
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
