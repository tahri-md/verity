'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PrivateLayout from '@/components/PrivateLayout'
import { api } from '@/lib/api'

export default function MerkleVerifyPage() {
  const [blocks, setBlocks] = useState<any[]>([])
  const [selectedBlock, setSelectedBlock] = useState('')
  const [transactions, setTransactions] = useState<any[]>([])
  const [selectedTx, setSelectedTx] = useState('')
  const [result, setResult] = useState<{ valid: boolean } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // advanced mode
  const [advanced, setAdvanced] = useState(false)
  const [manualHash, setManualHash] = useState('')
  const [manualRoot, setManualRoot] = useState('')
  const [manualProof, setManualProof] = useState('')

  useEffect(() => {
    api.get('/blocks').then(r => setBlocks(Array.isArray(r.data) ? r.data.sort((a: any, b: any) => b.block_number - a.block_number) : [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedBlock) { setTransactions([]); setSelectedTx(''); return }
    const block = blocks.find(b => String(b.block_number) === selectedBlock)
    setTransactions(block?.transactions || [])
    setSelectedTx('')
    setResult(null)
  }, [selectedBlock, blocks])

  const verify = async () => {
    setError('')
    setResult(null)
    setLoading(true)
    try {
      if (advanced) {
        const proof = JSON.parse(manualProof)
        const res = await api.post('/api/crypto/verify-merkle', { transactionHash: manualHash, merkleRoot: manualRoot, proof })
        setResult(res.data)
      } else {
        if (!selectedTx) { setError('Select a transaction'); setLoading(false); return }
        const proofRes = await api.get(`/api/v1/transactions/${selectedTx}/proof`)
        const proof = proofRes.data
        const tx = transactions.find(t => t.txn_id === selectedTx)
        const proofNodes = proof.hashes.map((h: string, i: number) => ({ hash: h, position: proof.positions[i] }))
        const res = await api.post('/api/crypto/verify-merkle', {
          transactionHash: tx?.hash,
          merkleRoot: proof.merkle_root,
          proof: proofNodes,
        })
        setResult(res.data)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PrivateLayout>
      <div className="section main-container max-w-2xl">
        <Link href="/dashboard" className="text-xs text-foreground/40 hover:text-foreground/70 transition-colors mb-6 inline-block">
          ← dashboard
        </Link>

        <p className="text-xs uppercase tracking-widest text-foreground/30 font-medium mb-1">Crypto tools</p>
        <h1 className="text-2xl font-bold mb-2">Merkle proof verification</h1>
        <p className="text-sm text-foreground/50 mb-8">Verify that a transaction is included in a block's Merkle tree.</p>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 mb-6">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="card mb-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs uppercase tracking-wide font-medium text-foreground/40">
              {advanced ? 'Manual input' : 'Guided verification'}
            </p>
            <button onClick={() => { setAdvanced(a => !a); setResult(null); setError('') }} className="text-xs" style={{ color: '#7c5cfc' }}>
              {advanced ? 'Use guided mode' : 'Advanced (raw JSON)'}
            </button>
          </div>

          {!advanced ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wide font-medium text-foreground/50 mb-1.5">Block</label>
                <select value={selectedBlock} onChange={e => setSelectedBlock(e.target.value)} className="input-field w-full">
                  <option value="">Select a block…</option>
                  {blocks.map(b => (
                    <option key={b.block_number} value={String(b.block_number)}>
                      Block #{b.block_number} ({b.transactions?.length ?? 0} txns)
                    </option>
                  ))}
                </select>
              </div>

              {selectedBlock && (
                <div>
                  <label className="block text-xs uppercase tracking-wide font-medium text-foreground/50 mb-1.5">Transaction</label>
                  {transactions.length > 0 ? (
                    <select value={selectedTx} onChange={e => { setSelectedTx(e.target.value); setResult(null) }} className="input-field w-full font-mono text-xs">
                      <option value="">Select a transaction…</option>
                      {transactions.map((tx: any) => (
                        <option key={tx.txn_id} value={tx.txn_id}>
                          {tx.txn_id?.slice(0, 20)}… · {tx.amount} VRT
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm text-foreground/40">No transactions in this block</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wide font-medium text-foreground/50 mb-1.5">Transaction hash</label>
                <input value={manualHash} onChange={e => setManualHash(e.target.value)} className="input-field w-full font-mono text-xs" placeholder="64-char hex" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide font-medium text-foreground/50 mb-1.5">Merkle root</label>
                <input value={manualRoot} onChange={e => setManualRoot(e.target.value)} className="input-field w-full font-mono text-xs" placeholder="64-char hex" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide font-medium text-foreground/50 mb-1.5">Proof path (JSON)</label>
                <textarea value={manualProof} onChange={e => setManualProof(e.target.value)} className="input-field w-full font-mono text-xs" rows={4} placeholder='[{"hash":"…","position":"left"}]' />
              </div>
            </div>
          )}
        </div>

        <button
          onClick={verify}
          disabled={loading || (!advanced && !selectedTx) || (advanced && !manualHash)}
          className="w-full py-2.5 rounded-lg font-medium text-sm disabled:opacity-40 mb-6"
          style={{ background: '#7c5cfc', color: '#fff' }}
        >
          {loading ? 'Verifying…' : 'Verify proof'}
        </button>

        {result && (
          <div
            className="rounded-lg px-4 py-4 text-center"
            style={{
              background: result.valid ? 'rgba(51,255,160,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${result.valid ? 'rgba(51,255,160,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}
          >
            <p className="text-lg font-bold" style={{ color: result.valid ? '#33ffa0' : '#ef4444' }}>
              {result.valid ? '✓ Transaction included in block' : '✗ Proof invalid'}
            </p>
            <p className="text-xs text-foreground/50 mt-1">
              {result.valid ? 'The Merkle path from this transaction resolves to the block root.' : 'The computed root does not match the block Merkle root.'}
            </p>
          </div>
        )}
      </div>
    </PrivateLayout>
  )
}