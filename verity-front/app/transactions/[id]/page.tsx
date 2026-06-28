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

function toDate(ts: number): string {
  return new Date(ts < 1e12 ? ts * 1000 : ts).toLocaleString()
}

function shortHash(h: string = '', len = 16) {
  return h.length > len ? h.slice(0, len) + '…' : h
}

function CopyRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="py-3 border-b border-border/40 last:border-0">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs uppercase tracking-wide font-medium text-foreground/40">{label}</p>
        <button
          onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          className="text-xs font-medium transition-colors"
          style={{ color: copied ? '#33ffa0' : '#7c5cfc' }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <p className={`text-sm break-all ${mono ? 'font-mono text-foreground/60' : 'text-foreground/80'}`}>{value || '—'}</p>
    </div>
  )
}

export default function TransactionDetailsPage() {
  const params = useParams()
  const txnID = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : ''
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [verified, setVerified] = useState<boolean | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState('')

  const fetchTransaction = useCallback(async () => {
    try {
      const response = await api.get(`/api/v1/transactions/${encodeURIComponent(txnID)}`)
      setTransaction(response.data)
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.response?.data?.message || 'Failed to load transaction')
    } finally {
      setLoading(false)
    }
  }, [txnID])

  useEffect(() => { fetchTransaction() }, [fetchTransaction])

  const verifyTransaction = async () => {
    if (!transaction) return
    setVerifying(true)
    setVerifyError('')
    setVerified(null)
    try {
      const proofRes = await api.get(`/api/v1/transactions/${transaction.txn_id}/proof`)
      const proof = proofRes.data
      const proofNodes = proof.hashes.map((hash: string, i: number) => ({ hash, position: proof.positions[i] }))
      const verifyRes = await api.post('/api/v1/verify/transaction', { transaction, proof: proofNodes })
      setVerified(Boolean(verifyRes.data?.valid))
    } catch (err: any) {
      setVerifyError(err?.response?.data?.error || 'Verification failed')
      setVerified(false)
    } finally {
      setVerifying(false)
    }
  }

  if (loading) return (
    <PrivateLayout>
      <div className="section main-container flex justify-center">
        <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin mt-12" />
      </div>
    </PrivateLayout>
  )

  if (error || !transaction) return (
    <PrivateLayout>
      <div className="section main-container">
        <div className="card bg-destructive/5 border-destructive/20 mb-4">
          <p className="text-destructive text-sm">{error || 'Transaction not found'}</p>
        </div>
        <Link href="/transactions" className="btn btn-ghost btn-sm">← Back to transactions</Link>
      </div>
    </PrivateLayout>
  )

  return (
    <PrivateLayout>
      <div className="section main-container max-w-4xl">
        <Link href="/transactions" className="text-xs text-foreground/40 hover:text-foreground/70 transition-colors mb-6 inline-block">
          ← transactions
        </Link>

        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-foreground/30 font-medium mb-1">Transaction</p>
            <h1 className="text-2xl font-bold font-mono">{shortHash(transaction.txn_id, 20)}</h1>
          </div>
          <span className={`badge text-xs ${
            transaction.status === 'confirmed' ? 'badge-success' :
            transaction.status === 'pending' ? 'badge-primary' : 'badge-error'
          }`}>
            {transaction.status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main detail */}
          <div className="lg:col-span-2 space-y-4">

            {/* Transfer summary */}
            <div className="card">
              <p className="text-xs uppercase tracking-wide font-medium text-foreground/40 mb-4">Transfer</p>
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground/40 mb-1">From</p>
                  <p className="font-mono text-xs text-foreground/70 break-all">{transaction.from_account}</p>
                </div>
                <span className="text-foreground/30 flex-shrink-0 text-lg">→</span>
                <div className="flex-1 min-w-0 text-right">
                  <p className="text-xs text-foreground/40 mb-1">To</p>
                  <p className="font-mono text-xs text-foreground/70 break-all">{transaction.to_account}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/40 flex items-baseline gap-2">
                <span className="text-3xl font-bold" style={{ color: '#7c5cfc' }}>{transaction.amount}</span>
                <span className="text-sm text-foreground/40">VRT</span>
              </div>
            </div>

            {/* Cryptographic fields */}
            <div className="card">
              <p className="text-xs uppercase tracking-wide font-medium text-foreground/40 mb-2">Cryptographic data</p>
              <CopyRow label="Transaction hash" value={transaction.hash} mono />
              <CopyRow label="Signature" value={transaction.signature} mono />
              <CopyRow label="Public key" value={transaction.public_key} mono />
            </div>

            {/* Metadata */}
            <div className="card">
              <p className="text-xs uppercase tracking-wide font-medium text-foreground/40 mb-2">Metadata</p>
              <CopyRow label="Transaction ID" value={transaction.txn_id} mono />
              <div className="py-3 border-b border-border/40">
                <p className="text-xs uppercase tracking-wide font-medium text-foreground/40 mb-1">Timestamp</p>
                <p className="text-sm text-foreground/80">{toDate(transaction.timestamp)}</p>
              </div>
              <div className="py-3 border-b border-border/40">
                <p className="text-xs uppercase tracking-wide font-medium text-foreground/40 mb-1">Nonce</p>
                <p className="text-sm font-mono text-foreground/80">{transaction.nonce}</p>
              </div>
              {transaction.block_number && (
                <div className="py-3">
                  <p className="text-xs uppercase tracking-wide font-medium text-foreground/40 mb-1">Block</p>
                  <Link href={`/blocks/${transaction.block_number}`} className="text-sm font-mono hover:underline" style={{ color: '#7c5cfc' }}>
                    #{transaction.block_number} →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: verify */}
          <div className="lg:col-span-1">
            <div className="card">
              <p className="text-xs uppercase tracking-wide font-medium text-foreground/40 mb-4">Merkle verification</p>
              <p className="text-xs text-foreground/50 mb-4 leading-relaxed">
                Fetches the Merkle proof from the server and verifies this transaction's inclusion in its block.
              </p>

              <button
                onClick={verifyTransaction}
                disabled={verifying || !transaction.block_number}
                className="w-full py-2.5 rounded-lg font-medium text-sm transition-opacity disabled:opacity-40 mb-4"
                style={{ background: '#7c5cfc', color: '#fff' }}
              >
                {verifying ? 'Verifying…' : 'Verify inclusion'}
              </button>

              {!transaction.block_number && (
                <p className="text-xs text-foreground/40 text-center">Transaction must be in a block to verify</p>
              )}

              {verifyError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 mb-3">
                  <p className="text-xs text-destructive">{verifyError}</p>
                </div>
              )}

              {verified !== null && !verifyError && (
                <div
                  className="rounded-lg px-3 py-3 text-center"
                  style={{
                    background: verified ? 'rgba(51,255,160,0.08)' : 'rgba(239,68,68,0.08)',
                    border: `1px solid ${verified ? 'rgba(51,255,160,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  }}
                >
                  <p className="font-medium text-sm" style={{ color: verified ? '#33ffa0' : '#ef4444' }}>
                    {verified ? '✓ Inclusion verified' : '✗ Verification failed'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PrivateLayout>
  )
}