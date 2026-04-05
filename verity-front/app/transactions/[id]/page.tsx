'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import PrivateLayout from '@/components/PrivateLayout'
import axios from 'axios'

interface Transaction {
  id: string
  from: string
  to: string
  amount: number
  status: string
  hash: string
  signature: string
  blockNumber?: number
  timestamp: string
  message?: string
}

export default function TransactionDetailsPage() {
  const params = useParams()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [verified, setVerified] = useState<Boolean | null>(null)

  useEffect(() => {
    fetchTransaction()
  }, [params.id])

  const fetchTransaction = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`http://localhost:8080/api/transactions/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTransaction(response.data)
    } catch (err: any) {
      setError('Failed to load transaction')
    } finally {
      setLoading(false)
    }
  }

  const verifySignature = async () => {
    if (!transaction) return

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        'http://localhost:8080/api/crypto/verify-signature',
        {
          signature: transaction.signature,
          transaction: transaction,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setVerified(response.data.valid)
    } catch (err) {
      setVerified(false)
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

  if (error || !transaction) {
    return (
      <PrivateLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
            {error || 'Transaction not found'}
          </div>
          <Link href="/transactions" className="btn btn-primary mt-4">
            Back to Transactions
          </Link>
        </div>
      </PrivateLayout>
    )
  }

  return (
    <PrivateLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/transactions" className="text-accent hover:underline mb-4 inline-block">
          ← Back to Transactions
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card border-2 mb-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-primary">Transaction Details</h1>
                  <p className="text-muted text-sm mt-1">{transaction.id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  transaction.status === 'confirmed' ? 'bg-green-500/10 text-green-500' :
                  transaction.status === 'pending' ? 'bg-primary/10 text-primary' :
                  'bg-destructive/10 text-destructive'
                }`}>
                  {transaction.status}
                </span>
              </div>

              <div className="space-y-6">
                <div className="border-b border-border pb-6">
                  <p className="text-muted text-sm mb-2">Transfer</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-sm text-accent">{transaction.from}</p>
                      <p className="text-xs text-muted mt-1">From</p>
                    </div>
                    <span className="text-2xl font-bold text-primary">→</span>
                    <div className="text-right">
                      <p className="font-mono text-sm text-accent">{transaction.to}</p>
                      <p className="text-xs text-muted mt-1">To</p>
                    </div>
                  </div>
                </div>

                <div className="border-b border-border pb-6">
                  <p className="text-muted text-sm mb-2">Amount</p>
                  <p className="text-4xl font-bold text-primary">${transaction.amount.toFixed(2)}</p>
                </div>

                {transaction.message && (
                  <div className="border-b border-border pb-6">
                    <p className="text-muted text-sm mb-2">Message</p>
                    <p className="text-foreground">{transaction.message}</p>
                  </div>
                )}

                <div className="border-b border-border pb-6">
                  <p className="text-muted text-sm mb-2">Transaction Hash</p>
                  <p className="font-mono text-xs text-accent break-all">{transaction.hash}</p>
                </div>

                <div>
                  <p className="text-muted text-sm mb-2">Timestamp</p>
                  <p>{new Date(transaction.timestamp).toLocaleString()}</p>
                </div>

                {transaction.blockNumber && (
                  <div className="block">
                    <p className="text-muted text-sm mb-2">Block Number</p>
                    <Link
                      href={`/blocks/${transaction.blockNumber}`}
                      className="text-accent hover:underline font-mono"
                    >
                      Block #{transaction.blockNumber}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card mb-6">
              <h3 className="font-bold text-primary mb-4">Signature Verification</h3>
              <button
                onClick={verifySignature}
                className="btn btn-primary w-full mb-4"
              >
                Verify Signature
              </button>

              {verified !== null && (
                <div className={`p-3 rounded-lg text-center ${
                  verified
                    ? 'bg-green-500/10 text-green-500 border border-green-500'
                    : 'bg-destructive/10 text-destructive border border-destructive'
                }`}>
                  <p className="font-medium">
                    {verified ? 'Valid Signature' : 'Invalid Signature'}
                  </p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-xs text-muted mb-2">Signature (Hex)</p>
                <p className="font-mono text-xs text-accent break-all bg-muted/10 p-2 rounded">
                  {transaction.signature}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PrivateLayout>
  )
}
