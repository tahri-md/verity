'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PrivateLayout from '@/components/PrivateLayout'
import { api } from '@/lib/api'

interface Transaction {
  txn_id: string
  from_account: string
  to_account: string
  amount: number
  status?: string
  timestamp: number
}

function toDate(ts: number): Date {
  return new Date(ts < 1e12 ? ts * 1000 : ts)
}

const FILTERS = ['all', 'Pending', 'Confirmed', 'Failed'] as const

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => { fetchTransactions() }, [filter])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/v1/transactions')
      setTransactions(Array.isArray(response.data) ? response.data : [])
    } catch {
      setError('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = filter === 'all'
    ? transactions
    : transactions.filter(tx => (tx.status || 'pending').toLowerCase() === filter.toLowerCase())

  const statusStyle = (status?: string) => {
    if (status === 'confirmed') return { color: '#33ffa0' }
    if (status === 'failed')    return { color: '#ff5f57' }
    return { color: '#7c5cfc' }
  }

  return (
    <PrivateLayout>
      <div className="section main-container">

        <div className="flex justify-between items-start md:items-center md:flex-row flex-col gap-4 mb-8">
          <div>
            <p className="font-mono text-[11px] text-foreground/30 uppercase tracking-widest mb-1">ledger</p>
            <h1 className="text-xl font-bold tracking-tight">Transactions</h1>
          </div>
          <Link
            href="/transactions/new"
            className="px-4 py-2 rounded-md text-sm font-medium"
            style={{ background: '#7c5cfc', color: '#fff' }}
          >
            New transaction
          </Link>
        </div>

        {error && (
          <div className="border-l-2 border-destructive pl-3 mb-6">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Filter strip */}
        <div className="flex gap-1.5 flex-wrap mb-6">
          {FILTERS.map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className="px-3 py-1 rounded text-[11px] font-mono uppercase tracking-widest transition-all"
              style={
                filter === status
                  ? { background: '#7c5cfc22', color: '#7c5cfc', border: '1px solid #7c5cfc55' }
                  : { background: 'transparent', color: 'var(--foreground)', opacity: 0.35, border: '1px solid transparent' }
              }
            >
              {status}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <div className="w-5 h-5 border border-border border-t-[#7c5cfc] rounded-full animate-spin" />
            <p className="font-mono text-[11px] text-foreground/30 uppercase tracking-widest">fetching</p>
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="card overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  {['From', 'To', 'Amount', 'Status', 'Date', ''].map((h) => (
                    <th
                      key={h}
                      className="text-[10px] font-mono uppercase tracking-widest text-foreground/30 text-left pb-3 pt-1 border-b border-border/40"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx.txn_id} className="border-b border-border/20 last:border-0">
                    <td className="py-3 pr-4">
                      <code className="font-mono text-xs text-foreground/50">
                        {tx.from_account?.substring(0, 10)}…
                      </code>
                    </td>
                    <td className="py-3 pr-4">
                      <code className="font-mono text-xs text-foreground/50">
                        {tx.to_account?.substring(0, 10)}…
                      </code>
                    </td>
                    <td className="py-3 pr-4 font-mono text-sm font-semibold">{tx.amount}</td>
                    <td className="py-3 pr-4">
                      <span
                        className="font-mono text-[11px] uppercase tracking-widest"
                        style={statusStyle(tx.status)}
                      >
                        {tx.status || 'pending'}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-foreground/35">
                      {toDate(tx.timestamp).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/transactions/${tx.txn_id}`}
                        className="font-mono text-[11px] uppercase tracking-widest text-foreground/40 hover:text-foreground/70 transition-colors"
                      >
                        view →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="font-mono text-[11px] text-foreground/30 uppercase tracking-widest mb-6">
              no {filter !== 'all' ? filter.toLowerCase() + ' ' : ''}transactions
            </p>
            <Link
              href="/transactions/new"
              className="px-4 py-2 rounded-md text-sm font-medium"
              style={{ background: '#7c5cfc', color: '#fff' }}
            >
              Create one
            </Link>
          </div>
        )}
      </div>
    </PrivateLayout>
  )
}