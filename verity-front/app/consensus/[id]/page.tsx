'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import PrivateLayout from '@/components/PrivateLayout'
import { api } from '@/lib/api'

interface ConsensusState {
  block_number: number
  view_number: number
  leader: string
  yes_votes: number
  no_votes: number
  is_finalized: boolean
  network_health: string
}

const REQUIRED_VOTES = 3

export default function ConsensusDetailsPage() {
  const params = useParams()
  const [state, setState] = useState<ConsensusState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [validatorID, setValidatorID] = useState('')
  const [validatorsList, setValidatorsList] = useState('')
  const [actionMsg, setActionMsg] = useState('')
  const [actionErr, setActionErr] = useState('')

  const fetch = useCallback(async () => {
    try {
      const r = await api.get(`/consensus/${params.id}`)
      setState(r.data)
    } catch {
      setError('Failed to load consensus state')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => { fetch() }, [fetch])

  // pre-fill validator from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user')
      if (raw) setValidatorID(JSON.parse(raw)?.account_id || '')
    } catch {}
  }, [])

  const act = async (fn: () => Promise<string>) => {
    setActionErr('')
    setActionMsg('')
    try {
      const msg = await fn()
      setActionMsg(msg)
      fetch()
    } catch (err: any) {
      setActionErr(err?.response?.data?.error || 'Action failed')
    }
  }

  const vote = (v: 'yes' | 'no') => act(async () => {
    if (!validatorID.trim()) throw new Error('Enter a validator ID')
    await api.post(`/consensus/${params.id}/vote`, { validator_id: validatorID.trim(), vote: v })
    return `Vote "${v}" registered`
  })

  const electLeader = () => act(async () => {
    const validators = validatorsList.split(',').map(v => v.trim()).filter(Boolean)
    if (!validators.length) throw new Error('Enter at least one validator')
    const res = await api.post(`/consensus/${params.id}/elect-leader`, { validators })
    return `Leader elected: ${res.data?.leader || ''}`
  })

  const finalize = () => act(async () => {
    await api.post(`/consensus/${params.id}/finalize`)
    return 'Block finalized'
  })

  if (loading) return (
    <PrivateLayout>
      <div className="section main-container flex justify-center">
        <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin mt-12" />
      </div>
    </PrivateLayout>
  )

  if (error || !state) return (
    <PrivateLayout>
      <div className="section main-container">
        <div className="card bg-destructive/5 border-destructive/20 mb-4">
          <p className="text-destructive text-sm">{error || 'Not found'}</p>
        </div>
        <Link href="/consensus" className="btn btn-ghost btn-sm">← Back</Link>
      </div>
    </PrivateLayout>
  )

  const pct = Math.min(100, Math.round((state.yes_votes / REQUIRED_VOTES) * 100))
  const total = state.yes_votes + state.no_votes

  return (
    <PrivateLayout>
      <div className="section main-container max-w-3xl">
        <Link href="/consensus" className="text-xs text-foreground/40 hover:text-foreground/70 transition-colors mb-6 inline-block">
          ← consensus
        </Link>

        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-foreground/30 font-medium mb-1">Consensus</p>
            <h1 className="text-2xl font-bold">Block #{state.block_number}</h1>
          </div>
          <span className={`badge ${state.is_finalized ? 'badge-success' : 'badge-primary'}`}>
            {state.is_finalized ? 'finalized' : 'voting open'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Vote status */}
          <div className="card">
            <p className="text-xs uppercase tracking-wide font-medium text-foreground/40 mb-4">Vote progress</p>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold font-mono">{state.yes_votes}</span>
              <span className="text-foreground/40 text-sm">/ {REQUIRED_VOTES} needed</span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted/60 overflow-hidden mb-3">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: state.is_finalized ? '#33ffa0' : '#7c5cfc' }}
              />
            </div>
            <div className="flex justify-between text-xs text-foreground/40">
              <span>{state.yes_votes} yes · {state.no_votes} no</span>
              <span>{total} total votes</span>
            </div>

            {state.leader && (
              <div className="mt-4 pt-4 border-t border-border/40">
                <p className="text-xs text-foreground/40 mb-1">Elected leader</p>
                <p className="font-mono text-xs text-foreground/70 break-all">{state.leader}</p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between">
              <p className="text-xs text-foreground/40">Network health</p>
              <span className={`badge text-xs ${state.network_health === 'healthy' ? 'badge-success' : 'badge-warning'}`}>
                {state.network_health || 'healthy'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="card">
            <p className="text-xs uppercase tracking-wide font-medium text-foreground/40 mb-4">Actions</p>

            {actionMsg && (
              <div className="rounded-lg px-3 py-2.5 mb-4" style={{ background: 'rgba(51,255,160,0.08)', border: '1px solid rgba(51,255,160,0.25)' }}>
                <p className="text-xs" style={{ color: '#33ffa0' }}>{actionMsg}</p>
              </div>
            )}
            {actionErr && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 mb-4">
                <p className="text-xs text-destructive">{actionErr}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wide font-medium text-foreground/50 mb-1.5">
                  Your validator ID
                </label>
                <input
                  value={validatorID}
                  onChange={e => setValidatorID(e.target.value)}
                  className="input-field w-full font-mono text-xs"
                  placeholder="auto-filled from account"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => vote('yes')}
                  disabled={state.is_finalized}
                  className="flex-1 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-40"
                  style={{ borderColor: '#33ffa0', color: '#33ffa0' }}
                >
                  Vote yes
                </button>
                <button
                  onClick={() => vote('no')}
                  disabled={state.is_finalized}
                  className="flex-1 py-2 rounded-lg text-sm font-medium border border-destructive/50 text-destructive transition-colors disabled:opacity-40"
                >
                  Vote no
                </button>
              </div>

              <div className="pt-4 border-t border-border/40 space-y-3">
                <div>
                  <label className="block text-xs uppercase tracking-wide font-medium text-foreground/50 mb-1.5">
                    Validators (comma-separated)
                  </label>
                  <input
                    value={validatorsList}
                    onChange={e => setValidatorsList(e.target.value)}
                    className="input-field w-full font-mono text-xs"
                    placeholder="validator_1, validator_2, …"
                  />
                </div>
                <button onClick={electLeader} disabled={state.is_finalized} className="btn btn-ghost btn-sm w-full disabled:opacity-40">
                  Elect leader
                </button>
              </div>

              <div className="pt-4 border-t border-border/40">
                <button
                  onClick={finalize}
                  disabled={state.is_finalized}
                  className="w-full py-2.5 rounded-lg font-medium text-sm disabled:opacity-40"
                  style={{ background: '#7c5cfc', color: '#fff' }}
                >
                  {state.is_finalized ? 'Already finalized' : 'Finalize block'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PrivateLayout>
  )
}