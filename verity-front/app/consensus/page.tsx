'use client'

import { useEffect, useState } from 'react'
import PrivateLayout from '@/components/PrivateLayout'
import Link from 'next/link'
import { api } from '@/lib/api'

interface ConsensusState {
  block_number: number
  view_number: number
  leader: string
  yes_votes: number
  no_votes: number
  is_finalized: boolean
  network_health: string
  created_at: string
  updated_at: string
}

export default function ConsensusPage() {
  const [states, setStates] = useState<ConsensusState[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { fetchConsensusState() }, [])

  const fetchConsensusState = async () => {
    try {
      const response = await api.get('/api/v1/consensus')
      const list = response.data?.data
      setStates(Array.isArray(list) ? list : [])
    } catch {
      setError('Failed to load consensus state')
    } finally {
      setLoading(false)
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

  return (
    <PrivateLayout>
      <div className="section main-container">

        <div className="flex justify-between items-start md:items-center md:flex-row flex-col gap-4 mb-8">
          <div>
            <p className="font-mono text-[11px] text-foreground/30 uppercase tracking-widest mb-1">validator</p>
            <h1 className="text-xl font-bold tracking-tight">Consensus</h1>
          </div>
          <Link
            href="/consensus/new"
            className="px-4 py-2 rounded-md text-sm font-medium"
            style={{ background: '#7c5cfc', color: '#fff' }}
          >
            Create state
          </Link>
        </div>

        {error && (
          <div className="border-l-2 border-destructive pl-3 mb-6">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {states.length > 0 ? (
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {['Block', 'Leader', 'Votes', 'Status', ''].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[10px] font-mono uppercase tracking-widest text-foreground/30 pb-3 pt-1 pr-4 border-b border-border/40"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {states.map((s) => (
                  <tr key={s.block_number} className="border-b border-border/20 last:border-0">
                    <td className="py-3 pr-4">
                      <span className="font-mono text-xs" style={{ color: '#7c5cfc' }}>#{s.block_number}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="font-mono text-xs text-foreground/45 break-all">
                        {s.leader ? `${s.leader.substring(0, 14)}…` : '—'}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="font-mono text-xs text-foreground/50">
                        <span style={{ color: '#33ffa0' }}>{s.yes_votes}</span>
                        <span className="text-foreground/25 mx-1">/</span>
                        <span style={{ color: '#ff5f57' }}>{s.no_votes}</span>
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className="font-mono text-[11px] uppercase tracking-widest"
                        style={{ color: s.is_finalized ? '#33ffa0' : '#7c5cfc' }}
                      >
                        {s.is_finalized ? 'finalized' : 'open'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/consensus/${s.block_number}`}
                        className="font-mono text-[11px] uppercase tracking-widest text-foreground/30 hover:text-foreground/60 transition-colors"
                      >
                        view →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="font-mono text-[11px] text-foreground/30 uppercase tracking-widest">no consensus states</p>
          </div>
        )}
      </div>
    </PrivateLayout>
  )
}