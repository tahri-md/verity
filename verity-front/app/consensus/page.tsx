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

  useEffect(() => {
    fetchConsensusState()
  }, [])

  const fetchConsensusState = async () => {
    try {
      const response = await api.get('/api/v1/consensus')
      const list = response.data?.data
      setStates(Array.isArray(list) ? list : [])
    } catch (err: any) {
      setError('Failed to load consensus state')
    } finally {
      setLoading(false)
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

  return (
    <PrivateLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Consensus</h1>
            <p className="text-muted">Consensus state per block</p>
          </div>
          <Link href="/consensus/new" className="btn btn-primary">Create State</Link>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-primary">Block</th>
                <th className="text-left py-3 px-4 font-semibold text-primary">Leader</th>
                <th className="text-left py-3 px-4 font-semibold text-primary">Votes</th>
                <th className="text-left py-3 px-4 font-semibold text-primary">Finalized</th>
                <th className="text-right py-3 px-4 font-semibold text-primary">Action</th>
              </tr>
            </thead>
            <tbody>
              {states.map((s) => (
                <tr key={s.block_number} className="border-b border-border hover:bg-muted/5">
                  <td className="py-3 px-4 font-mono">#{s.block_number}</td>
                  <td className="py-3 px-4 font-mono text-sm text-accent break-all">{s.leader || '—'}</td>
                  <td className="py-3 px-4 text-sm">yes: {s.yes_votes} / no: {s.no_votes}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${s.is_finalized ? 'bg-green-500/10 text-green-500' : 'bg-primary/10 text-primary'}`}>
                      {s.is_finalized ? 'finalized' : 'open'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link href={`/consensus/${s.block_number}`} className="text-accent hover:underline text-sm">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {states.length === 0 && (
            <div className="text-muted text-center py-8">No consensus states found</div>
          )}
        </div>
      </div>
    </PrivateLayout>
  )
}
