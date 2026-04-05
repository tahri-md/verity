'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PrivateLayout from '@/components/PrivateLayout'
import axios from 'axios'

interface Transaction {
  id: string
  hash: string
  from: string
  to: string
  amount: number
}

export default function CreateBlockPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingTx, setFetchingTx] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPendingTransactions()
  }, [])

  const fetchPendingTransactions = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:8080/api/transactions?status=pending', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTransactions(response.data.data || [])
    } catch (err) {
      setError('Failed to load transactions')
    } finally {
      setFetchingTx(false)
    }
  }

  const handleSelectTransaction = (txId: string) => {
    setSelectedTransactions((prev) =>
      prev.includes(txId) ? prev.filter((id) => id !== txId) : [...prev, txId]
    )
  }

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (selectedTransactions.length === 0) {
      setError('Select at least one transaction')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      await axios.post(
        'http://localhost:8080/api/blocks',
        {
          transactionIds: selectedTransactions,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      router.push('/blocks')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create block')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PrivateLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/blocks" className="text-accent hover:underline mb-4 inline-block">
          ← Back to Blocks
        </Link>

        <div className="card border-2">
          <h1 className="text-3xl font-bold text-primary mb-2">Create New Block</h1>
          <p className="text-muted mb-8">Select pending transactions to include in the block</p>

          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {fetchingTx ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <form onSubmit={handleCreateBlock} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-4">
                  Pending Transactions ({selectedTransactions.length} selected)
                </label>

                {transactions.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto border border-border rounded-lg p-4">
                    {transactions.map((tx) => (
                      <label
                        key={tx.id}
                        className="flex items-start gap-3 p-3 hover:bg-muted/10 rounded-lg cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTransactions.includes(tx.id)}
                          onChange={() => handleSelectTransaction(tx.id)}
                          className="mt-1 w-4 h-4"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-sm text-accent break-all">{tx.hash.substring(0, 32)}...</p>
                          <p className="text-xs text-muted mt-1">
                            {tx.from.substring(0, 16)}... → {tx.to.substring(0, 16)}... | ${tx.amount.toFixed(2)}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-center py-8">No pending transactions</p>
                )}
              </div>

              <div className="flex gap-4 pt-6 border-t border-border">
                <button
                  type="submit"
                  disabled={loading || selectedTransactions.length === 0}
                  className="btn btn-primary flex-1"
                >
                  {loading ? 'Creating Block...' : `Create Block (${selectedTransactions.length} txns)`}
                </button>
                <Link href="/blocks" className="btn btn-secondary flex-1 text-center">
                  Cancel
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </PrivateLayout>
  )
}
