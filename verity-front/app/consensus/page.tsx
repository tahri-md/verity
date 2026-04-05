'use client'

import { useEffect, useState } from 'react'
import PrivateLayout from '@/components/PrivateLayout'
import axios from 'axios'

interface ConsensusState {
  id: string
  currentLeader: string
  votingStatus: string
  participantCount: number
  proposalId?: string
  timestamp: string
}

export default function ConsensusPage() {
  const [consensusState, setConsensusState] = useState<ConsensusState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchConsensusState()
  }, [])

  const fetchConsensusState = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/consensus')
      const dataList = response.data?.data || []
      const latestData = dataList[0] || response.data
      const state = {
        id: latestData.id || 'N/A',
        currentLeader: latestData.current_leader || 'None',
        votingStatus: latestData.voting_status || 'Idle',
        participantCount: latestData.participant_count || 0,
        proposalId: latestData.proposal_id || undefined,
        timestamp: latestData.timestamp || new Date().toISOString(),
      }
      setConsensusState(state)
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
        <h1 className="text-3xl font-bold text-primary mb-8">Consensus</h1>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {consensusState && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <p className="text-muted text-sm mb-2">Current Leader</p>
              <p className="text-xl font-bold text-primary font-mono break-all">
                {consensusState.currentLeader.substring(0, 20)}...
              </p>
            </div>

            <div className="card">
              <p className="text-muted text-sm mb-2">Voting Status</p>
              <p className="text-xl font-bold text-primary">{consensusState.votingStatus}</p>
            </div>

            <div className="card">
              <p className="text-muted text-sm mb-2">Participants</p>
              <p className="text-xl font-bold text-primary">{consensusState.participantCount}</p>
            </div>
          </div>
        )}

        <div className="card">
          <h2 className="text-xl font-bold text-primary mb-4">Active Proposals</h2>
          <p className="text-muted text-center py-8">No active proposals at this time</p>
        </div>
      </div>
    </PrivateLayout>
  )
}
