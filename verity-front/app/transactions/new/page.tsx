'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PrivateLayout from '@/components/PrivateLayout'
import { api } from '@/lib/api'

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function CreateTransactionPage() {
  const router = useRouter()
  const [toAccount, setToAccount] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user')
      if (raw) setUser(JSON.parse(raw))
    } catch {}
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!user?.account_id) { setError('No authenticated account. Please log in again.'); return }
    const amountInt = Number.parseInt(amount, 10)
    if (!Number.isFinite(amountInt) || amountInt <= 0) { setError('Amount must be a positive integer'); return }
    setLoading(true)
    try {
      const timestamp = Date.now()
      const nonce = (user?.nonce ?? 0) + 1
      const hash = await sha256Hex(`${user.account_id}${toAccount}${amountInt}${nonce}${timestamp}`)
      await api.post('/api/v1/transactions', {
        to_account: toAccount,
        amount: amountInt,
        nonce,
        timestamp,
        signature: '',
        public_key: user?.public_key || '',
        hash,
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
      <div className="section main-container max-w-lg">
        <Link href="/transactions" className="text-xs text-foreground/40 hover:text-foreground/70 transition-colors mb-6 inline-block">
          ← transactions
        </Link>

        <p className="text-xs uppercase tracking-widest text-foreground/30 font-medium mb-1">New transaction</p>
        <h1 className="text-2xl font-bold mb-8">Send VRT</h1>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 mb-6">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="card mb-4">
          <p className="text-xs uppercase tracking-wide font-medium text-foreground/40 mb-1">From</p>
          <p className="font-mono text-xs text-foreground/60 break-all">{user?.account_id || '—'}</p>
          <p className="text-xs text-foreground/30 mt-1">Balance: {user?.balance ?? '—'} VRT · Nonce: {user?.nonce ?? '—'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wide font-medium text-foreground/50 mb-1.5">
              Recipient account ID
            </label>
            <input
              type="text"
              value={toAccount}
              onChange={e => setToAccount(e.target.value)}
              className="input-field w-full font-mono"
              placeholder="verity_…"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide font-medium text-foreground/50 mb-1.5">
              Amount (VRT)
            </label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="input-field w-full"
              placeholder="0"
              min="1"
              step="1"
              required
            />
          </div>

          <div className="pt-4 border-t border-border/40">
            <p className="text-xs text-foreground/40 mb-4 leading-relaxed">
              The transaction hash is computed from your account, recipient, amount, nonce, and timestamp before submission. The server re-validates the hash on receipt.
            </p>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-lg font-medium text-sm disabled:opacity-40"
                style={{ background: '#7c5cfc', color: '#fff' }}
              >
                {loading ? 'Submitting…' : 'Submit transaction'}
              </button>
              <Link href="/transactions" className="btn btn-ghost flex-1 text-center text-sm">
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    </PrivateLayout>
  )
}