'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PrivateLayout from '@/components/PrivateLayout'
import axios from 'axios'

interface DashboardData {
  totalBalance: number
  totalTransactions: number
  totalBlocks: number
  accountStatus: string
  recentTransactions: any[]
  recentBlocks: any[]
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const accountData = localStorage.getItem('user')
        const accountInfo = accountData ? JSON.parse(accountData) : null
        
        // Fetch transactions count
        const txResponse = await axios.get('http://localhost:8080/api/v1/transactions')
        const transactions = Array.isArray(txResponse.data) ? txResponse.data : []
        
        // Fetch blocks
        const blocksResponse = await axios.get('http://localhost:8080/blocks')
        const blocks = Array.isArray(blocksResponse.data) ? blocksResponse.data : []
        
        setData({
          totalBalance: accountInfo?.balance || 0,
          totalTransactions: transactions.length,
          totalBlocks: blocks.length,
          accountStatus: 'Active',
          recentTransactions: transactions.slice(0, 5),
          recentBlocks: blocks.slice(0, 5),
        })
      } catch (err: any) {
        setError('Failed to load dashboard data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <PrivateLayout>
      <div className="section main-container">
        {/* Header */}
        <div className="mb-12">
          <h1 className="section-title">Dashboard</h1>
          <p className="section-subtitle">
            Monitor your blockchain verification system and track real-time activity.
          </p>
        </div>

        {error && (
          <div className="card bg-destructive/5 border border-destructive/20 mb-6">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-3 border-border border-t-primary rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-foreground/60 text-sm">Loading dashboard...</p>
          </div>
        ) : data ? (
          <>
            {/* Summary Cards */}
            <div className="mb-12">
              <div className="card-grid">
                <div className="stat-card">
                  <p className="stat-label">Total Balance</p>
                  <p className="stat-value">${data.totalBalance.toFixed(2)}</p>
                </div>

                <div className="stat-card">
                  <p className="stat-label">Transactions</p>
                  <p className="stat-value">{data.totalTransactions}</p>
                </div>

                <div className="stat-card">
                  <p className="stat-label">Blocks</p>
                  <p className="stat-value">{data.totalBlocks}</p>
                </div>

                <div className="stat-card">
                  <p className="stat-label">System Status</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    <span className="font-medium text-sm">{data.accountStatus}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-12">
              <h2 className="section-title">Quick Actions</h2>
              <div className="flex gap-3 flex-wrap">
                <Link href="/transactions/new" className="btn btn-primary">
                  Create Transaction
                </Link>
                <Link href="/accounts/new" className="btn btn-secondary">
                  New Account
                </Link>
                <Link href="/blocks/new" className="btn btn-ghost">
                  Create Block
                </Link>
                <Link href="/audit" className="btn btn-ghost">
                  Audit Log
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="section-title">Recent Activity</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="font-semibold mb-4">Latest Transactions</h3>
                  <div className="space-y-2">
                    {data.recentTransactions && data.recentTransactions.length > 0 ? (
                      data.recentTransactions.map((tx: any) => (
                        <Link
                          key={tx.id}
                          href={`/transactions/${tx.id}`}
                          className="flex items-center justify-between p-3 rounded-md hover:bg-muted/40 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-sm font-mono">
                              <code className="hash-badge">{tx.from_account?.substring(0, 8) || 'unknown'}...</code>
                              <span className="text-foreground/40">→</span>
                              <code className="hash-badge">{tx.to_account?.substring(0, 8) || 'unknown'}...</code>
                            </div>
                            <p className="text-xs text-foreground/50 mt-1">{new Date(tx.timestamp).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">{tx.amount}</p>
                            <span className={`badge text-xs mt-1 ${
                              tx.status === 'confirmed' ? 'badge-success' :
                              tx.status === 'pending' ? 'badge-primary' :
                              'badge-error'
                            }`}>
                              {tx.status || 'pending'}
                            </span>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="text-foreground/50 text-center py-6 text-sm">No recent transactions</p>
                    )}
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-semibold mb-4">Latest Blocks</h3>
                  <div className="space-y-2">
                    {data.recentBlocks && data.recentBlocks.length > 0 ? (
                      data.recentBlocks.map((block: any) => (
                        <Link
                          key={block.id}
                          href={`/blocks/${block.id}`}
                          className="flex items-center justify-between p-3 rounded-md hover:bg-muted/40 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 font-semibold text-sm">
                              <span>Block #{block.number || 'N/A'}</span>
                            </div>
                            <p className="text-xs text-foreground/50 mt-1">{new Date(block.timestamp).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <code className="hash-badge text-xs">{block.hash?.substring(0, 8) || 'N/A'}...</code>
                            <p className="text-xs text-foreground/50 mt-1">{block.txCount || 0} txns</p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="text-foreground/50 text-center py-6 text-sm">No recent blocks</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </PrivateLayout>
  )
}
