'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import PrivateLayout from '@/components/PrivateLayout'
import axios from 'axios'

interface Account {
  id: string
  name: string
  balance: number
  status: string
  nonce: number
  publicKey: string
  createdAt: string
}

interface Transaction {
  id: string
  from: string
  to: string
  amount: number
  status: string
  timestamp: string
}

export default function AccountDetailsPage() {
  const params = useParams()
  const [account, setAccount] = useState<Account | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAccount()
  }, [params.id])

  const fetchAccount = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`http://localhost:8080/api/accounts/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setAccount(response.data)

      const txResponse = await axios.get(`http://localhost:8080/api/accounts/${params.id}/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTransactions(txResponse.data.data || [])
    } catch (err: any) {
      setError('Failed to load account')
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

  if (error || !account) {
    return (
      <PrivateLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
            {error || 'Account not found'}
          </div>
          <Link href="/accounts" className="btn btn-primary mt-4">
            Back to Accounts
          </Link>
        </div>
      </PrivateLayout>
    )
  }

  return (
    <PrivateLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/accounts" className="text-accent hover:underline mb-4 inline-block">
          ← Back to Accounts
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="card">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">
                  {account.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-primary">{account.name}</h1>
                  <p className={`text-sm ${account.status === 'active' ? 'text-green-500' : 'text-gray-500'}`}>
                    {account.status}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-t border-border pt-4">
                  <p className="text-muted text-sm">Balance</p>
                  <p className="text-2xl font-bold text-primary mt-1">${account.balance.toFixed(2)}</p>
                </div>

                <div>
                  <p className="text-muted text-sm">Account ID</p>
                  <p className="text-sm font-mono text-accent mt-1 break-all">{account.id}</p>
                </div>

                <div>
                  <p className="text-muted text-sm">Public Key</p>
                  <p className="text-xs font-mono text-accent mt-1 break-all">{account.publicKey}</p>
                </div>

                <div>
                  <p className="text-muted text-sm">Nonce</p>
                  <p className="text-sm font-mono mt-1">{account.nonce}</p>
                </div>

                <div>
                  <p className="text-muted text-sm">Created</p>
                  <p className="text-sm mt-1">{new Date(account.createdAt).toLocaleString()}</p>
                </div>

                <div className="pt-4 border-t border-border">
                  <button className="btn btn-primary w-full mb-2">Transfer Balance</button>
                  <Link href={`/accounts/${account.id}/edit`} className="btn btn-secondary w-full block text-center">
                    Edit Account
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-bold text-primary mb-4">Recent Transactions</h2>
              {transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <Link
                      key={tx.id}
                      href={`/transactions/${tx.id}`}
                      className="flex justify-between items-center p-3 hover:bg-muted/10 border border-border rounded-lg transition-colors"
                    >
                      <div>
                        <p className="font-medium">{tx.from} → {tx.to}</p>
                        <p className="text-xs text-muted">{new Date(tx.timestamp).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${tx.amount.toFixed(2)}</p>
                        <p className={`text-xs ${tx.status === 'confirmed' ? 'text-green-500' : 'text-primary'}`}>
                          {tx.status}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center py-8">No transactions yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </PrivateLayout>
  )
}
