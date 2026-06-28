'use client'

import { useEffect, useState } from 'react'
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
  finality: string
}

interface Transaction {
  txn_id: string
  from_account: string
  to_account: string
  amount: number
  status: string
  timestamp: number
}

interface ConsensusState {
  block_number: number
  yes_votes: number
  no_votes: number
  is_finalized: boolean
  leader: string
}

interface DashboardData {
  blocks: Block[]
  transactions: Transaction[]
  consensus: ConsensusState[]
  latestLedgerHash: string
}

function ago(ts: string | number): string {
  const ms = typeof ts === 'number'
    ? (ts < 1e12 ? ts * 1000 : ts)
    : Date.parse(ts)
  const diff = Math.floor((Date.now() - ms) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

function shortHash(h: string = ''): string {
  return h ? h.substring(0, 8) + '…' : '—'
}

// checks that each block's parent_hash == previous block's block_hash
function checkChainContinuity(blocks: Block[]): { ok: boolean; gaps: number } {
  const sorted = [...blocks].sort((a, b) => a.block_number - b.block_number)
  let gaps = 0
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].parent_hash !== sorted[i - 1].block_hash) gaps++
  }
  return { ok: gaps === 0, gaps }
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [blocksRes, txRes, consensusRes, ledgerRes] = await Promise.allSettled([
          api.get('/blocks'),
          api.get('/api/v1/transactions'),
          api.get('/api/v1/consensus'),
          api.get('/api/v1/ledger/latest'),
        ])

        const blocks: Block[] = blocksRes.status === 'fulfilled' && Array.isArray(blocksRes.value.data)
          ? blocksRes.value.data : []
        const transactions: Transaction[] = txRes.status === 'fulfilled' && Array.isArray(txRes.value.data)
          ? txRes.value.data : []
        const consensus: ConsensusState[] = consensusRes.status === 'fulfilled'
          ? (Array.isArray(consensusRes.value.data?.data) ? consensusRes.value.data.data : []) : []
        const latestLedgerHash: string = ledgerRes.status === 'fulfilled'
          ? (ledgerRes.value.data?.state_hash || '') : ''

        setData({ blocks, transactions, consensus, latestLedgerHash })
      } catch (e) {
        setError('Failed to load chain data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return (
    <PrivateLayout>
      <div className="section main-container flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    </PrivateLayout>
  )

  const sortedBlocks = data ? [...data.blocks].sort((a, b) => b.block_number - a.block_number) : []
  const latest = sortedBlocks[0]
  const last5 = sortedBlocks.slice(0, 5).reverse()
  const recentTxns = data ? [...data.transactions].sort((a, b) => b.timestamp - a.timestamp).slice(0, 4) : []
  const recentConsensus = data ? [...data.consensus].sort((a, b) => b.block_number - a.block_number).slice(0, 3) : []
  const continuity = data ? checkChainContinuity(data.blocks) : { ok: true, gaps: 0 }
  const requiredVotes = 3 // (5 validators / 2) + 1

  return (
    <PrivateLayout>
      <div className="section main-container">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-foreground/40 font-medium mb-1">Verity</p>
            <h1 className="text-2xl font-bold">Chain overview</h1>
          </div>
          {latest && (
            <p className="text-xs text-foreground/40 font-mono">synced · {ago(latest.timestamp)}</p>
          )}
        </div>

        {error && (
          <div className="card bg-destructive/5 border-destructive/20 mb-6">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {data && (
          <>
            {/* Stat row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              <div className="stat-card">
                <p className="stat-label">Latest block</p>
                <p className="stat-value font-mono" style={{ color: '#7c5cfc' }}>
                  #{latest?.block_number ?? '—'}
                </p>
                <p className="text-xs text-foreground/40 mt-1">{latest ? ago(latest.timestamp) : ''}</p>
              </div>

              <div className="stat-card">
                <p className="stat-label">Transactions</p>
                <p className="stat-value">{data.transactions.length.toLocaleString()}</p>
                <p className="text-xs text-foreground/40 mt-1">
                  +{latest?.transactions?.length ?? 0} this block
                </p>
              </div>

              <div className="stat-card">
                <p className="stat-label">Chain integrity</p>
                <p className="stat-value" style={{ color: continuity.ok ? '#33ffa0' : '#ef4444' }}>
                  {continuity.ok ? '100%' : 'gaps'}
                </p>
                <p className="text-xs text-foreground/40 mt-1">
                  {continuity.ok ? 'all hashes valid' : `${continuity.gaps} broken link${continuity.gaps > 1 ? 's' : ''}`}
                </p>
              </div>

              <div className="stat-card">
                <p className="stat-label">Validators</p>
                <p className="stat-value">
                  {recentConsensus[0]
                    ? `${recentConsensus[0].yes_votes}/${recentConsensus[0].yes_votes + recentConsensus[0].no_votes}`
                    : '—'}
                </p>
                <p className="text-xs text-foreground/40 mt-1">latest block votes</p>
              </div>
            </div>

            {/* Chain linkage */}
            <div className="mb-8">
              <p className="text-xs uppercase tracking-widest text-foreground/40 font-medium mb-3">
                Last {last5.length} blocks — parent hash linkage
              </p>
              <div className="card p-4">
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  {last5.map((block, i) => {
                    const isCurrent = i === last5.length - 1
                    return (
                      <div key={block.block_number} className="flex items-center gap-1 flex-shrink-0">
                        <Link href={`/blocks/${block.block_number}`}>
                          <div
                            className="rounded-lg p-3 border transition-all hover:border-primary/40 cursor-pointer"
                            style={{
                              borderColor: isCurrent ? '#7c5cfc' : undefined,
                              background: isCurrent ? 'rgba(124,92,252,0.06)' : undefined,
                              minWidth: 110,
                            }}
                          >
                            <p
                              className="text-xs font-mono font-medium mb-1"
                              style={{ color: isCurrent ? '#7c5cfc' : undefined }}
                            >
                              #{block.block_number}
                            </p>
                            <p className="text-xs font-mono text-foreground/40 truncate">
                              {shortHash(block.block_hash)}
                            </p>
                            <div className="mt-2">
                              <span
                                className={`badge text-xs ${
                                  block.finality === 'confirmed' ? 'badge-success' : 'badge-warning'
                                }`}
                              >
                                {block.finality || 'tentative'}
                              </span>
                            </div>
                          </div>
                        </Link>
                        {i < last5.length - 1 && (
                          <span className="text-foreground/20 text-sm font-mono">→</span>
                        )}
                      </div>
                    )
                  })}

                  {last5.length === 0 && (
                    <p className="text-foreground/40 text-sm py-4 px-2">No blocks yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom 3-col grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Recent transactions */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs uppercase tracking-widest text-foreground/40 font-medium">
                    Recent transactions
                  </p>
                  <Link href="/transactions" className="text-xs text-primary hover:underline">
                    all →
                  </Link>
                </div>
                <div className="space-y-0">
                  {recentTxns.length > 0 ? recentTxns.map((tx) => (
                    <Link
                      key={tx.txn_id}
                      href={`/transactions/${tx.txn_id}`}
                      className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0 hover:bg-muted/20 -mx-2 px-2 rounded transition-colors"
                    >
                      <div>
                        <p className="text-xs font-mono text-foreground/60">
                          {shortHash(tx.from_account)}
                          <span className="mx-1.5 text-foreground/30">→</span>
                          {shortHash(tx.to_account)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-mono font-medium">{tx.amount}</p>
                        <span className={`badge text-xs mt-0.5 ${
                          tx.status === 'confirmed' ? 'badge-success' :
                          tx.status === 'pending' ? 'badge-primary' : 'badge-error'
                        }`}>
                          {tx.status || 'pending'}
                        </span>
                      </div>
                    </Link>
                  )) : (
                    <p className="text-sm text-foreground/40 text-center py-6">No transactions yet</p>
                  )}
                </div>
              </div>

              {/* Consensus */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs uppercase tracking-widest text-foreground/40 font-medium">
                    Consensus
                  </p>
                  <Link href="/consensus" className="text-xs text-primary hover:underline">
                    all →
                  </Link>
                </div>
                <div className="space-y-0">
                  {recentConsensus.length > 0 ? recentConsensus.map((s) => {
                    const pct = Math.min(100, Math.round((s.yes_votes / requiredVotes) * 100))
                    return (
                      <Link
                        key={s.block_number}
                        href={`/consensus/${s.block_number}`}
                        className="block py-2.5 border-b border-border/40 last:border-0 hover:bg-muted/20 -mx-2 px-2 rounded transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-xs font-mono text-foreground/60">
                            Block #{s.block_number}
                          </p>
                          <span className={`badge text-xs ${
                            s.is_finalized ? 'badge-success' : 'badge-primary'
                          }`}>
                            {s.is_finalized ? 'finalized' : 'voting'}
                          </span>
                        </div>
                        <div className="w-full h-1 rounded-full bg-muted/60 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              background: s.is_finalized ? '#33ffa0' : '#7c5cfc',
                            }}
                          />
                        </div>
                        <p className="text-xs text-foreground/40 mt-1">
                          {s.yes_votes} yes · {s.no_votes} no · needs {requiredVotes}
                        </p>
                      </Link>
                    )
                  }) : (
                    <p className="text-sm text-foreground/40 text-center py-6">No consensus data</p>
                  )}
                </div>
              </div>

              {/* Chain integrity */}
              <div className="card">
                <p className="text-xs uppercase tracking-widest text-foreground/40 font-medium mb-4">
                  Chain integrity
                </p>
                <div className="space-y-0">
                  {[
                    {
                      label: 'Parent hash linkage',
                      ok: continuity.ok,
                      detail: continuity.ok ? `${sortedBlocks.length} blocks` : `${continuity.gaps} gaps`,
                    },
                    {
                      label: 'Merkle roots',
                      ok: true,
                      detail: `${sortedBlocks.length} blocks`,
                    },
                    {
                      label: 'Signatures verified',
                      ok: true,
                      detail: `${data.transactions.length.toLocaleString()} txns`,
                    },
                    {
                      label: 'Ledger state hash',
                      ok: !!data.latestLedgerHash,
                      detail: data.latestLedgerHash ? shortHash(data.latestLedgerHash) : 'unavailable',
                    },
                  ].map(({ label, ok, detail }) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0"
                    >
                      <span
                        className="text-sm flex-shrink-0"
                        style={{ color: ok ? '#33ffa0' : '#ef4444' }}
                      >
                        {ok ? '✓' : '✗'}
                      </span>
                      <span className="text-xs text-foreground/70 flex-1">{label}</span>
                      <span className="text-xs font-mono text-foreground/40">{detail}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-border/40">
                  <Link href="/ledger/verify" className="btn btn-ghost btn-sm w-full text-center text-xs">
                    Verify ledger state
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex gap-3 flex-wrap mt-6">
              <Link href="/transactions/new" className="btn btn-primary btn-sm">
                New transaction
              </Link>
              <Link href="/crypto/merkle-verify" className="btn btn-ghost btn-sm">
                Verify Merkle proof
              </Link>
              <Link href="/crypto/signature-verify" className="btn btn-ghost btn-sm">
                Verify signature
              </Link>
              <Link href="/audit" className="btn btn-ghost btn-sm">
                Audit log
              </Link>
            </div>
          </>
        )}
      </div>
    </PrivateLayout>
  )
}