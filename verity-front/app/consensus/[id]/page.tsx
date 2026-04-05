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
  created_at: string
  updated_at: string
}

export default function ConsensusDetailsPage() {
  const params = useParams()
  const [state, setState] = useState<ConsensusState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [validatorID, setValidatorID] = useState('')
  const [validatorsList, setValidatorsList] = useState('')
  const [actionMsg, setActionMsg] = useState('')

  const fetchProposal = useCallback(async () => {
    try {
      const response = await api.get(`/consensus/${params.id}`)
      setState(response.data)
    } catch (err: any) {
      setError('Failed to load consensus state')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchProposal()
  }, [fetchProposal])

  const handleVote = async (vote: 'yes' | 'no') => {
    try {
      setError('')
      setActionMsg('')

      if (!validatorID.trim()) {
        setError('Enter a validator id')
        return
      }

      await api.post(`/consensus/${params.id}/vote`, {
        validator_id: validatorID.trim(),
        vote,
      })

      setActionMsg('Vote registered')
      fetchProposal()
    } catch (err: any) {
      setError('Failed to cast vote')
    }
  }

  const electLeader = async () => {
    try {
      setError('')
      setActionMsg('')

      const validators = validatorsList
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)

      if (validators.length === 0) {
        setError('Enter at least one validator id')
        return
      }

      const res = await api.post(`/consensus/${params.id}/elect-leader`, { validators })
      setActionMsg(`Leader elected: ${res.data?.leader || ''}`)
      fetchProposal()
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to elect leader')
    }
  }

  const finalize = async () => {
    try {
      setError('')
      setActionMsg('')
      await api.post(`/consensus/${params.id}/finalize`)
      setActionMsg('Block finalized')
      fetchProposal()
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to finalize')
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

  if (error || !state) {
    return (
      <PrivateLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
            {error || 'Consensus state not found'}
          </div>
          <Link href="/consensus" className="btn btn-primary mt-4">
            Back to Consensus
          </Link>
        </div>
      </PrivateLayout>
    )
  }

  return (
    <PrivateLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/consensus" className="text-accent hover:underline mb-4 inline-block">
          ← Back to Consensus
        </Link>

        <div className="card border-2 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-primary">Consensus State</h1>
              <p className="text-muted mt-2">Block #{state.block_number}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              state.is_finalized ? 'bg-green-500/10 text-green-500' : 'bg-primary/10 text-primary'
            }`}>
              {state.is_finalized ? 'finalized' : 'open'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 py-6 border-y border-border">
            <div>
              <p className="text-muted text-sm">Leader</p>
              <p className="text-foreground mt-1 font-mono break-all">{state.leader || '—'}</p>
            </div>
            <div>
              <p className="text-muted text-sm">Network Health</p>
              <p className="text-foreground mt-1">{state.network_health || 'healthy'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-bold text-primary mb-4">Votes</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted">Yes</span>
                <span className="font-bold">{state.yes_votes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">No</span>
                <span className="font-bold">{state.no_votes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">View</span>
                <span className="font-mono">{state.view_number}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold text-primary mb-4">Actions</h3>

            {actionMsg && (
              <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg mb-4 text-sm">
                {actionMsg}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Validator ID</label>
                <input
                  value={validatorID}
                  onChange={(e) => setValidatorID(e.target.value)}
                  className="input-field w-full"
                  placeholder="validator_1"
                />
              </div>

              <div className="flex gap-2">
                <button onClick={() => handleVote('yes')} className="btn btn-secondary flex-1">Vote Yes</button>
                <button onClick={() => handleVote('no')} className="btn btn-secondary flex-1">Vote No</button>
              </div>

              <div className="pt-4 border-t border-border">
                <label className="block text-sm font-medium mb-2">Validators (comma-separated)</label>
                <input
                  value={validatorsList}
                  onChange={(e) => setValidatorsList(e.target.value)}
                  className="input-field w-full"
                  placeholder="validator_1, validator_2"
                />
                <button onClick={electLeader} className="btn btn-secondary w-full mt-3">Elect Leader</button>
              </div>

              <div className="pt-4 border-t border-border">
                <button onClick={finalize} className="btn btn-primary w-full" disabled={state.is_finalized}>
                  {state.is_finalized ? 'Finalized' : 'Finalize Block'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PrivateLayout>
  )
}
