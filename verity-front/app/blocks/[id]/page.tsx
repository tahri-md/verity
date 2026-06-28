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

function HashRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-3 border-b border-border/20 last:border-0">
      <p className="font-mono text-[10px] text-foreground/30 uppercase tracking-widest mb-1">{label}</p>
      <p className="font-mono text-xs text-foreground/55 break-all">{value}</p>
    </div>
  )
}

export default function BlockDetailsPage() {
  const params = useParams()
  const [block, setBlock] = useState<Block | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [validation, setValidation] = useState<{ is_valid: boolean; error?: string } | null>(null)
  const [validating, setValidating] = useState(false)

  const fetchBlock = useCallback(async () => {
    try {
      const response = await api.get(`/blocks/${params.id}`)
      setBlock(response.data)
    } catch {
      setError('Failed to load block')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => { fetchBlock() }, [fetchBlock])

  const validateBlock = async () => {
    if (!block) return
    setValidating(true)
    setValidation(null)
    try {
      const res = await api.post(`/blocks/${block.block_number}/validate`)
      setValidation({ is_valid: Boolean(res.data?.is_valid) })
    } catch (err: any) {
      const serverErr = err?.response?.data?.error
      setValidation({ is_valid: false, error: serverErr ? String(serverErr) : 'Validation failed' })
    } finally {
      setValidating(false)
    }
  }

  if (loading) {
    return (
      <PrivateLayout>
        <div className="section main-container py-20 flex flex-col items-center gap-3">
          <div className="w-5 h-5 border border-border border-t-[#7c5cfc] rounded-full animate-spin" />
          <p className="font-mono text-[11px] text-foreground/30 uppercase tracking-widest">fetching</p>
        </div>
      </PrivateLayout>
    )
  }

  if (error || !block) {
    return (
      <PrivateLayout>
        <div className="section main-container">
          <div className="border-l-2 border-destructive pl-3 mb-6">
            <p className="text-sm text-destructive">{error || 'Block not found'}</p>
          </div>
          <Link
            href="/blocks"
            className="font-mono text-[11px] text-foreground/40 uppercase tracking-widest hover:text-foreground/70 transition-colors"
          >
            ← blocks
          </Link>
        </div>
      </PrivateLayout>
    )
  }

  return (
    <PrivateLayout>
      <div className="section main-container">

        <Link
          href="/blocks"
          className="font-mono text-[11px] text-foreground/30 uppercase tracking-widest hover:text-foreground/60 transition-colors mb-8 inline-block"
        >
          ← blocks
        </Link>

        <div className="mb-8">
          <p className="font-mono text-[11px] text-foreground/30 uppercase tracking-widest mb-1">block</p>
          <h1 className="text-xl font-bold tracking-tight">#{block.block_number}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main — hashes + transactions */}
          <div className="lg:col-span-2 space-y-6">

            {/* Hashes */}
            <div className="border border-border/30 rounded-md px-4 py-2">
              <HashRow label="Block hash"  value={block.block_hash} />
              <HashRow label="Parent hash" value={block.parent_hash} />
              <HashRow label="Merkle root" value={block.merkle_root} />
              <div className="py-3">
                <p className="font-mono text-[10px] text-foreground/30 uppercase tracking-widest mb-1">Timestamp</p>
                <p className="font-mono text-xs text-foreground/55">
                  {new Date(block.timestamp).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Transactions */}
            <div>
              <p className="font-mono text-[11px] text-foreground/30 uppercase tracking-widest mb-3">
                Transactions · {block.transactions.length}
              </p>
              {block.transactions.length > 0 ? (
                <div className="space-y-px">
                  {block.transactions.map((tx: any) => (
                    <Link
                      key={tx.txn_id}
                      href={`/transactions/${tx.txn_id}`}
                      className="flex items-center justify-between px-4 py-3 border border-border/30 rounded-md hover:border-[#7c5cfc44] hover:bg-muted/20 transition-all group"
                    >
                      <div className="min-w-0">
                        <p className="font-mono text-xs text-foreground/55 truncate">
                          {tx.from_account?.substring(0, 20)}…
                        </p>
                        <p className="font-mono text-[10px] text-foreground/25 mt-0.5">
                          {new Date(
                            (tx.timestamp ?? Date.now()) < 1e12 ? tx.timestamp * 1000 : tx.timestamp
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="font-mono text-sm font-semibold">{tx.amount}</p>
                        <p
                          className="font-mono text-[10px] uppercase tracking-widest"
                          style={{ color: '#33ffa0' }}
                        >
                          {tx.status || 'confirmed'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="font-mono text-[11px] text-foreground/25 uppercase tracking-widest py-8 text-center">
                  no transactions
                </p>
              )}
            </div>
          </div>

          {/* Sidebar — meta + validate */}
          <div className="lg:col-span-1">
            <div className="border border-border/30 rounded-md px-4 py-4 space-y-4">
              <p className="font-mono text-[10px] text-foreground/30 uppercase tracking-widest">Info</p>

              <div className="flex justify-between items-center">
                <span className="font-mono text-[11px] text-foreground/40 uppercase tracking-widest">Number</span>
                <span className="font-mono text-sm font-semibold">{block.block_number}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-mono text-[11px] text-foreground/40 uppercase tracking-widest">Txns</span>
                <span className="font-mono text-sm font-semibold">{block.transactions.length}</span>
              </div>
              {block.finality && (
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[11px] text-foreground/40 uppercase tracking-widest">Finality</span>
                  <span className="font-mono text-[11px]" style={{ color: '#33ffa0' }}>{block.finality}</span>
                </div>
              )}

              <div className="pt-3 border-t border-border/20">
                <button
                  onClick={validateBlock}
                  disabled={validating}
                  className="w-full py-2.5 rounded-md font-medium text-sm transition-opacity disabled:opacity-40"
                  style={{ background: '#7c5cfc', color: '#fff' }}
                >
                  {validating ? 'Validating…' : 'Validate block'}
                </button>

                {validation && (
                  <div className="mt-3 border-l-2 pl-3" style={{
                    borderColor: validation.is_valid ? '#33ffa0' : '#ff5f57'
                  }}>
                    <p
                      className="font-mono text-[11px] uppercase tracking-widest"
                      style={{ color: validation.is_valid ? '#33ffa0' : '#ff5f57' }}
                    >
                      {validation.is_valid ? 'valid' : 'invalid'}
                    </p>
                    {validation.error && (
                      <p className="font-mono text-[10px] text-foreground/40 mt-1">{validation.error}</p>
                    )}
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