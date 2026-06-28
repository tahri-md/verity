'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PrivateLayout from '@/components/PrivateLayout'
import { api } from '@/lib/api'

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function buildMerkleRoot(hashes: string[]): Promise<string> {
  if (!hashes.length) return ''
  let level = [...hashes]
  while (level.length > 1) {
    const next: string[] = []
    for (let i = 0; i < level.length; i += 2) {
      next.push(await sha256Hex(level[i] + (i + 1 < level.length ? level[i + 1] : level[i])))
    }
    level = next
  }
  return level[0]
}

interface Transaction {
  txn_id: string
  hash: string
  from_account: string
  to_account: string
  amount: number
  status?: string
}

export default function CreateBlockPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [parentHash, setParentHash] = useState('')
  const [producer, setProducer] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [latestBlock, setLatestBlock] = useState<{ block_number: number; block_hash: string } | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [txRes, blockRes] = await Promise.allSettled([
          api.get('/api/v1/transactions'),
          api.get('/blocks/latest'),
        ])
        if (txRes.status === 'fulfilled') {
          const all = Array.isArray(txRes.value.data) ? txRes.value.data : []
          setTransactions(all.filter((t: any) => (t.status || 'pending').toLowerCase() !== 'confirmed'))
        }
        if (blockRes.status === 'fulfilled' && blockRes.value.data?.block_number) {
          const lb = blockRes.value.data
          setLatestBlock(lb)
          setParentHash(lb.block_hash || '')
        }
      } catch {}
      finally { setFetching(false) }
    }
    load()
    // pre-fill producer from JWT
    try {
      const raw = localStorage.getItem('user')
      if (raw) setProducer(JSON.parse(raw)?.account_id || '')
    } catch {}
  }, [])

  const toggle = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!selected.length) { setError('Select at least one transaction'); return }
    setLoading(true)
    try {
      const nextBlockNumber = latestBlock ? latestBlock.block_number + 1 : 1
      const selectedTxns = transactions.filter(t => selected.includes(t.txn_id)).map(tx => ({
        ...tx,
        status: 'pending',
      }))
      const hashes = selectedTxns.map(t => t.hash)
      const merkleRoot = await buildMerkleRoot(hashes)
      const blockHash = await sha256Hex(parentHash + merkleRoot)

      await api.post('/blocks', {
        block_number: nextBlockNumber,
        parent_hash: parentHash,
        block_hash: blockHash,
        producer,
        merkle_root: merkleRoot,
        finality: 'tentative',
        transactions: selectedTxns,
      })
      router.push('/blocks')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create block')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PrivateLayout>
      <div className="section main-container max-w-2xl">
        <Link href="/blocks" className="text-xs text-foreground/40 hover:text-foreground/70 transition-colors mb-6 inline-block">
          ← blocks
        </Link>

        <p className="text-xs uppercase tracking-widest text-foreground/30 font-medium mb-1">New block</p>
        <h1 className="text-2xl font-bold mb-8">Propose block</h1>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 mb-6">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {latestBlock && (
          <div className="card mb-6">
            <p className="text-xs uppercase tracking-wide font-medium text-foreground/40 mb-2">Chain tip</p>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-foreground/40">Latest block</p>
                <p className="font-mono text-sm font-medium">#{latestBlock.block_number}</p>
              </div>
              <span className="text-foreground/20">→</span>
              <div>
                <p className="text-xs text-foreground/40">This block will be</p>
                <p className="font-mono text-sm font-medium" style={{ color: '#7c5cfc' }}>#{latestBlock.block_number + 1}</p>
              </div>
            </div>
          </div>
        )}

        {fetching ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wide font-medium text-foreground/50 mb-1.5">
                Parent hash
              </label>
              <input
                type="text"
                value={parentHash}
                onChange={e => setParentHash(e.target.value)}
                className="input-field w-full font-mono text-xs"
                placeholder="auto-filled from chain tip"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide font-medium text-foreground/50 mb-1.5">
                Producer (validator ID)
              </label>
              <input
                type="text"
                value={producer}
                onChange={e => setProducer(e.target.value)}
                className="input-field w-full font-mono text-xs"
                placeholder="your account ID"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs uppercase tracking-wide font-medium text-foreground/50">
                  Pending transactions
                </label>
                <span className="text-xs text-foreground/40">{selected.length} selected</span>
              </div>

              {transactions.length > 0 ? (
                <div className="rounded-lg border border-border/60 divide-y divide-border/40 max-h-72 overflow-y-auto">
                  {transactions.map(tx => (
                    <label
                      key={tx.txn_id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(tx.txn_id)}
                        onChange={() => toggle(tx.txn_id)}
                        className="w-4 h-4 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-xs text-foreground/60 truncate">{tx.hash || '(no hash)'}</p>
                        <p className="text-xs text-foreground/40 mt-0.5">
                          {tx.from_account?.slice(0, 12)}… → {tx.to_account?.slice(0, 12)}… · {tx.amount} VRT
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-border/40 py-8 text-center">
                  <p className="text-sm text-foreground/40">No pending transactions</p>
                  <Link href="/transactions/new" className="text-xs mt-2 inline-block" style={{ color: '#7c5cfc' }}>
                    Create one →
                  </Link>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border/40 flex gap-3">
              <button
                type="submit"
                disabled={loading || !selected.length}
                className="flex-1 py-2.5 rounded-lg font-medium text-sm disabled:opacity-40"
                style={{ background: '#7c5cfc', color: '#fff' }}
              >
                {loading ? 'Proposing…' : `Propose block (${selected.length} txns)`}
              </button>
              <Link href="/blocks" className="btn btn-ghost flex-1 text-center text-sm">Cancel</Link>
            </div>
          </form>
        )}
      </div>
    </PrivateLayout>
  )
}