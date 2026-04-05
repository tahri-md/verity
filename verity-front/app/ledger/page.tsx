'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PrivateLayout from '@/components/PrivateLayout'
import axios from 'axios'

interface LedgerStats {
  totalAccounts: number
  totalTransactions: number
  totalBlocks: number
  totalBalance: number
  stateHash: string
}

export default function LedgerPage() {
  const [stats, setStats] = useState<LedgerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchLedgerState()
  }, [])

  const fetchLedgerState = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/ledger/states')
      const dataList = response.data?.data || []
      const latestData = dataList[0] || response.data
      const stats = {
        totalAccounts: latestData.total_accounts || 0,
        totalTransactions: latestData.total_transactions || 0,
        totalBlocks: latestData.total_blocks || 0,
        totalBalance: latestData.total_balance || 0,
        stateHash: latestData.state_hash || 'N/A',
      }
      setStats(stats)
    } catch (err: any) {
      setError('Failed to load ledger state')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <PrivateLayout>
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </PrivateLayout>
    )
  }

  return (
    <PrivateLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Ledger State</h1>
            <p className="text-muted">Current blockchain ledger state</p>
          </div>
          <Link href="/ledger/verify" className="btn btn-primary">
            Verify Ledger
          </Link>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="card">
                <p className="text-muted text-sm">Total Accounts</p>
                <p className="text-3xl font-bold text-primary mt-2">{stats.totalAccounts}</p>
              </div>

              <div className="card">
                <p className="text-muted text-sm">Total Transactions</p>
                <p className="text-3xl font-bold text-primary mt-2">{stats.totalTransactions}</p>
              </div>

              <div className="card">
                <p className="text-muted text-sm">Total Blocks</p>
                <p className="text-3xl font-bold text-primary mt-2">{stats.totalBlocks}</p>
              </div>

              <div className="card">
                <p className="text-muted text-sm">Total Balance</p>
                <p className="text-3xl font-bold text-primary mt-2">${stats.totalBalance.toFixed(2)}</p>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-bold text-primary mb-4">State Hash</h2>
              <p className="font-mono text-xs text-accent break-all bg-muted/10 p-4 rounded">
                {stats.stateHash}
              </p>
              <button className="btn btn-secondary w-full mt-4">
                Verify State Hash
              </button>
            </div>
          </>
        )}
      </div>
    </PrivateLayout>
  )
}
