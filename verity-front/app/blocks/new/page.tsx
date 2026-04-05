'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PrivateLayout from '@/components/PrivateLayout'
import { api } from '@/lib/api'

interface Transaction {
  txn_id: string
  hash: string
  from_account: string
  to_account: string
  amount: number
  status?: string
  timestamp?: number
  nonce?: number
  signature?: string
  public_key?: string
  block_number?: number
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function buildMerkleRoot(hashes: string[]): Promise<string> {
  if (hashes.length === 0) return ''
  let level = [...hashes]
  while (level.length > 1) {
    const next: string[] = []
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i]
      const right = i + 1 < level.length ? level[i + 1] : level[i]
      next.push(await sha256Hex(left + right))
    }
    level = next
  }
  return level[0]
}

export default function CreateBlockPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [blockNumber, setBlockNumber] = useState('')
  const [parentHash, setParentHash] = useState('')
  const [producer, setProducer] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingTx, setFetchingTx] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPendingTransactions()
  }, [])

  const fetchPendingTransactions = async () => {
    try {
      const response = await api.get('/api/v1/transactions')
      const all = Array.isArray(response.data) ? response.data : []

      // Backend does not provide a dedicated "pending" endpoint; treat empty status as pending.
      const pending = all.filter((t: any) => (t.status || 'pending').toLowerCase() !== 'confirmed')
      setTransactions(pending)
    } catch (err) {
      setError('Failed to load transactions')
    } finally {
      setFetchingTx(false)
    }
  }

  const handleSelectTransaction = (txId: string) => {
    setSelectedTransactions((prev) =>
      prev.includes(txId) ? prev.filter((id) => id !== txId) : [...prev, txId]
    )
  }

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (selectedTransactions.length === 0) {
      setError('Select at least one transaction')
      return
    }

    setLoading(true)

    try {
      const bn = Number(blockNumber)
      if (!Number.isFinite(bn) || bn <= 0) {
        setError('Enter a valid block number')
        return
      }

      const selected = transactions.filter((t) => selectedTransactions.includes(t.txn_id))
      const normalizedTxs: any[] = []
      for (const tx of selected) {
        const hash = tx.hash || (await sha256Hex(`${tx.from_account}${tx.to_account}${tx.amount}`))
        normalizedTxs.push({
          ...tx,
          hash,
          status: tx.status || 'pending',
        })
      }

      const hashes = normalizedTxs.map((t) => t.hash)
      const merkleRoot = await buildMerkleRoot(hashes)
      const blockHash = await sha256Hex(`${parentHash}${merkleRoot}`)

      await api.post('/blocks', {
        block_number: bn,
        parent_hash: parentHash,
        block_hash: blockHash,
        producer: producer,
        merkle_root: merkleRoot,
        finality: 'tentative',
        transactions: normalizedTxs,
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/blocks" className="text-accent hover:underline mb-4 inline-block">
          ← Back to Blocks
        </Link>

        <div className="card border-2">
          <h1 className="text-3xl font-bold text-primary mb-2">Create New Block</h1>
          <p className="text-muted mb-8">Select pending transactions to include in the block</p>

          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {fetchingTx ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <form onSubmit={handleCreateBlock} className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Block Number</label>
                  <input
                    type="number"
                    value={blockNumber}
                    onChange={(e) => setBlockNumber(e.target.value)}
                    className="w-full p-3 rounded-lg bg-muted/10 border border-border focus:border-primary focus:outline-none"
                    placeholder="e.g. 1"
                    min={1}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Parent Hash</label>
                  <input
                    type="text"
                    value={parentHash}
                    onChange={(e) => setParentHash(e.target.value)}
                    className="w-full p-3 rounded-lg bg-muted/10 border border-border focus:border-primary focus:outline-none font-mono text-sm"
                    placeholder="(optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Producer</label>
                  <input
                    type="text"
                    value={producer}
                    onChange={(e) => setProducer(e.target.value)}
                    className="w-full p-3 rounded-lg bg-muted/10 border border-border focus:border-primary focus:outline-none"
                    placeholder="validator id / node name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-4">
                  Pending Transactions ({selectedTransactions.length} selected)
                </label>

                {transactions.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto border border-border rounded-lg p-4">
                    {transactions.map((tx) => (
                      <label
                        key={tx.txn_id}
                        className="flex items-start gap-3 p-3 hover:bg-muted/10 rounded-lg cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTransactions.includes(tx.txn_id)}
                          onChange={() => handleSelectTransaction(tx.txn_id)}
                          className="mt-1 w-4 h-4"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-sm text-accent break-all">
                            {tx.hash ? `${tx.hash.substring(0, 32)}...` : '(no hash)'}
                          </p>
                          <p className="text-xs text-muted mt-1">
                            {tx.from_account?.substring(0, 16)}... → {tx.to_account?.substring(0, 16)}... | {tx.amount}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-center py-8">No pending transactions</p>
                )}
              </div>

              <div className="flex gap-4 pt-6 border-t border-border">
                <button
                  type="submit"
                  disabled={loading || selectedTransactions.length === 0}
                  className="btn btn-primary flex-1"
                >
                  {loading ? 'Creating Block...' : `Create Block (${selectedTransactions.length} txns)`}
                </button>
                <Link href="/blocks" className="btn btn-secondary flex-1 text-center">
                  Cancel
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </PrivateLayout>
  )
}
