'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import PrivateLayout from '@/components/PrivateLayout'
import { api } from '@/lib/api'

interface Transaction {
  txn_id: string
  from_account: string
  to_account: string
  amount: number
  status: string
  hash: string
  signature: string
  public_key: string
  block_number?: number
  nonce: number
  timestamp: number
}

interface MerkleProofResponse {
  transaction_id: string
  block_number: number
  hashes: string[]
  positions: string[]
  merkle_root: string
}

function toDate(ts: number): Date {
  return new Date(ts < 1e12 ? ts * 1000 : ts)
}

export default function TransactionDetailsPage() {
  const params = useParams()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [verified, setVerified] = useState<boolean | null>(null)
  const [verifyError, setVerifyError] = useState('')

  const fetchTransaction = useCallback(async () => {
    try {
      const response = await api.get(`/api/v1/transactions/${params.id}`)
      setTransaction(response.data)
    } catch (err: any) {
      setError('Failed to load transaction')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchTransaction()
  }, [fetchTransaction])

  const verifyTransaction = async () => {
    if (!transaction) return

    try {
      setVerifyError('')

      const proofRes = await api.get<MerkleProofResponse>(`/api/v1/transactions/${transaction.txn_id}/proof`)
      const proof = proofRes.data

      if (!Array.isArray(proof.hashes) || !Array.isArray(proof.positions) || proof.hashes.length !== proof.positions.length) {
        setVerifyError('Invalid proof format from server')
        setVerified(false)
        return
      }

      const proofNodes = proof.hashes.map((hash, i) => ({
        hash,
        position: proof.positions[i],
      }))

      const verifyRes = await api.post('/api/v1/verify/transaction', {
        transaction,
        proof: proofNodes,
      })

      setVerified(Boolean(verifyRes.data?.valid))
    } catch (err: any) {
      const serverErr = err?.response?.data?.error
      if (serverErr) setVerifyError(String(serverErr))
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
                  <p className="text-muted text-sm mt-1">{transaction.txn_id}</p>
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
                      <p className="font-mono text-sm text-accent">{transaction.from_account}</p>
                      <p className="text-xs text-muted mt-1">From</p>
                    </div>
                    <span className="text-2xl font-bold text-primary">→</span>
                    <div className="text-right">
                      <p className="font-mono text-sm text-accent">{transaction.to_account}</p>
                      <p className="text-xs text-muted mt-1">To</p>
                    </div>
                  </div>
                </div>

                <div className="border-b border-border pb-6">
                  <p className="text-muted text-sm mb-2">Amount</p>
                  <p className="text-4xl font-bold text-primary">${transaction.amount.toFixed(2)}</p>
                </div>

                <div className="border-b border-border pb-6">
                  <p className="text-muted text-sm mb-2">Transaction Hash</p>
                  <p className="font-mono text-xs text-accent break-all">{transaction.hash}</p>
                </div>

                <div>
                  <p className="text-muted text-sm mb-2">Timestamp</p>
                  <p>{toDate(transaction.timestamp).toLocaleString()}</p>
                </div>

                {transaction.block_number && (
                  <div className="block">
                    <p className="text-muted text-sm mb-2">Block Number</p>
                    <Link
                      href={`/blocks/${transaction.block_number}`}
                      className="text-accent hover:underline font-mono"
                    >
                      Block #{transaction.block_number}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card mb-6">
              <h3 className="font-bold text-primary mb-4">External Verification</h3>
              <button
                onClick={verifyTransaction}
                className="btn btn-primary w-full mb-4"
              >
                Verify Transaction
              </button>

              {verifyError && (
                <div className="p-3 rounded-lg text-center bg-destructive/10 text-destructive border border-destructive mb-4">
                  <p className="text-sm">{verifyError}</p>
                </div>
              )}

              {verified !== null && (
                <div className={`p-3 rounded-lg text-center ${
                  verified
                    ? 'bg-green-500/10 text-green-500 border border-green-500'
                    : 'bg-destructive/10 text-destructive border border-destructive'
                }`}>
                  <p className="font-medium">
                    {verified ? 'Valid Transaction' : 'Invalid Transaction'}
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
