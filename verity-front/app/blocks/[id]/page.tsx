'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import PrivateLayout from '@/components/PrivateLayout'
import { api } from '@/lib/api'

interface Block {
  block_number: number
  block_hash: string
  parent_hash: string
  merkle_root: string
  timestamp: string
  transactions: any[]
  finality?: string
}

export default function BlockDetailsPage() {
  const params = useParams()
  const [block, setBlock] = useState<Block | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [validation, setValidation] = useState<{ is_valid: boolean; error?: string } | null>(null)

  const fetchBlock = useCallback(async () => {
    try {
      const response = await api.get(`/blocks/${params.id}`)
      setBlock(response.data)
    } catch (err: any) {
      setError('Failed to load block')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchBlock()
  }, [fetchBlock])

  const validateBlock = async () => {
    if (!block) return
    try {
      setValidation(null)
      const res = await api.post(`/blocks/${block.block_number}/validate`)
      setValidation({ is_valid: Boolean(res.data?.is_valid) })
    } catch (err: any) {
      const serverErr = err?.response?.data?.error
      setValidation({ is_valid: false, error: serverErr ? String(serverErr) : 'Validation failed' })
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

  if (error || !block) {
    return (
      <PrivateLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
            {error || 'Block not found'}
          </div>
          <Link href="/blocks" className="btn btn-primary mt-4">
            Back to Blocks
          </Link>
        </div>
      </PrivateLayout>
    )
  }

  return (
    <PrivateLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/blocks" className="text-accent hover:underline mb-4 inline-block">
          ← Back to Blocks
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card border-2 mb-6">
              <h1 className="text-3xl font-bold text-primary mb-6">Block #{block.block_number}</h1>

              <div className="space-y-6">
                <div className="border-b border-border pb-6">
                  <p className="text-muted text-sm mb-2">Block Hash</p>
                  <p className="font-mono text-xs text-accent break-all">{block.block_hash}</p>
                </div>

                <div className="border-b border-border pb-6">
                  <p className="text-muted text-sm mb-2">Merkle Root</p>
                  <p className="font-mono text-xs text-accent break-all">{block.merkle_root}</p>
                </div>

                <div>
                  <p className="text-muted text-sm mb-2">Timestamp</p>
                  <p>{new Date(block.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold text-primary mb-4">Transactions ({block.transactions.length})</h3>
              {block.transactions.length > 0 ? (
                <div className="space-y-3">
                  {block.transactions.map((tx: any) => (
                    <Link
                      key={tx.txn_id}
                      href={`/transactions/${tx.txn_id}`}
                      className="flex justify-between items-center p-3 hover:bg-muted/10 border border-border rounded-lg transition-colors"
                    >
                      <div>
                        <p className="font-medium font-mono text-sm">{tx.from_account?.substring(0, 16)}...</p>
                        <p className="text-xs text-muted">{new Date((tx.timestamp ?? Date.now()) < 1e12 ? tx.timestamp * 1000 : tx.timestamp).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{tx.amount}</p>
                        <p className="text-xs text-green-500">{tx.status || 'confirmed'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center py-8">No transactions in this block</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="font-bold text-primary mb-4">Block Info</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted">Block Number</span>
                  <span className="font-bold">{block.block_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Transactions</span>
                  <span className="font-bold">{block.transactions.length}</span>
                </div>
                <button onClick={validateBlock} className="btn btn-primary w-full mt-6">
                  Validate Block
                </button>

                {validation && (
                  <div className={`p-3 rounded-lg text-center mt-4 ${
                    validation.is_valid
                      ? 'bg-green-500/10 text-green-500 border border-green-500'
                      : 'bg-destructive/10 text-destructive border border-destructive'
                  }`}>
                    <p className="font-medium">
                      {validation.is_valid ? 'Block is valid' : 'Block is invalid'}
                    </p>
                    {validation.error && <p className="text-xs mt-2">{validation.error}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PrivateLayout>
  )
}
