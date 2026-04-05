'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PrivateLayout from '@/components/PrivateLayout'
import axios from 'axios'

interface Transaction {
  id?: string
  from_account?: string
  from?: string
  to_account?: string
  to?: string
  amount: number
  status?: string
  timestamp: number | string
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchTransactions()
  }, [filter])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://localhost:8080/api/v1/transactions')
      const allTransactions = Array.isArray(response.data) ? response.data : []
      setTransactions(allTransactions)
    } catch (err: any) {
      setError('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const getFilteredTransactions = () => {
    if (filter === 'all') return transactions
    const filterLower = filter.toLowerCase()
    return transactions.filter(tx => {
      const status = (tx.status || 'pending').toLowerCase()
      return status === filterLower
    })
  }

  const filteredTransactions = getFilteredTransactions()

  return (
    <PrivateLayout>
      <div className="section main-container">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 md:items-center md:flex-row flex-col gap-4">
          <div>
            <h1 className="section-title">Transactions</h1>
            <p className="section-subtitle">Manage and track all blockchain transactions.</p>
          </div>
          <Link href="/transactions/new" className="btn btn-primary">
            New Transaction
          </Link>
        </div>

        {error && (
          <div className="card bg-destructive/5 border border-destructive/20 mb-6">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        <div className="card mb-6">
          <div className="flex gap-2 flex-wrap">
            {['all', 'Pending', 'Confirmed', 'Failed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  filter === status
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-foreground hover:bg-muted/70'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-3 border-border border-t-primary rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-foreground/60 text-sm">Loading transactions...</p>
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="card overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>From</th>
                  <th>To</th>
                  <th className="text-right">Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id || Math.random()}>
                    <td>
                      <code className="hash-badge">
                        {tx.from_account?.substring(0, 10) || tx.from?.substring(0, 8)}...
                      </code>
                    </td>
                    <td>
                      <code className="hash-badge">
                        {tx.to_account?.substring(0, 10) || tx.to?.substring(0, 8)}...
                      </code>
                    </td>
                    <td className="text-right font-semibold text-sm">{tx.amount}</td>
                    <td>
                      <span className={`badge ${
                        tx.status === 'confirmed' ? 'badge-success' :
                        tx.status === 'pending' ? 'badge-primary' :
                        'badge-error'
                      }`}>
                        {tx.status || 'pending'}
                      </span>
                    </td>
                    <td className="text-sm text-foreground/60">
                      {new Date(tx.timestamp || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="text-right">
                      <Link href={`/transactions/${tx.id}`} className="text-primary hover:text-primary/80 font-medium text-sm">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-foreground/60 mb-6 text-sm">No {filter !== 'all' ? filter.toLowerCase() : ''} transactions found</p>
            <Link href="/transactions/new" className="btn btn-primary">
              Create Transaction
            </Link>
          </div>
        )}
      </div>
    </PrivateLayout>
  )
}
