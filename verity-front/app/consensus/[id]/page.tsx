'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import PrivateLayout from '@/components/PrivateLayout'
import axios from 'axios'

interface Proposal {
  id: string
  title: string
  description: string
  status: string
  createdAt: string
  deadline: string
  votes: {
    [key: string]: number
  }
  participants: string[]
}

export default function ConsensusDetailsPage() {
  const params = useParams()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userVote, setUserVote] = useState<string | null>(null)

  useEffect(() => {
    fetchProposal()
  }, [params.id])

  const fetchProposal = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`http://localhost:8080/api/consensus/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setProposal(response.data)
    } catch (err: any) {
      setError('Failed to load proposal')
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (option: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `http://localhost:8080/api/consensus/${params.id}/vote`,
        { option },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setUserVote(option)
      fetchProposal()
    } catch (err: any) {
      setError('Failed to cast vote')
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

  if (error || !proposal) {
    return (
      <PrivateLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
            {error || 'Proposal not found'}
          </div>
          <Link href="/consensus" className="btn btn-primary mt-4">
            Back to Consensus
          </Link>
        </div>
      </PrivateLayout>
    )
  }

  const totalVotes = Object.values(proposal.votes).reduce((a, b) => a + b, 0)

  return (
    <PrivateLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/consensus" className="text-accent hover:underline mb-4 inline-block">
          ← Back to Consensus
        </Link>

        <div className="card border-2 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-primary">{proposal.title}</h1>
              <p className="text-muted mt-2">{proposal.description}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              proposal.status === 'active' ? 'bg-primary/10 text-primary' :
              proposal.status === 'passed' ? 'bg-green-500/10 text-green-500' :
              'bg-destructive/10 text-destructive'
            }`}>
              {proposal.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 py-6 border-y border-border">
            <div>
              <p className="text-muted text-sm">Created</p>
              <p className="text-foreground mt-1">{new Date(proposal.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted text-sm">Deadline</p>
              <p className="text-foreground mt-1">{new Date(proposal.deadline).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-bold text-primary mb-4">Vote Results</h3>
            <div className="space-y-4">
              {Object.entries(proposal.votes).map(([option, count]) => (
                <div key={option}>
                  <div className="flex justify-between mb-2">
                    <p className="font-medium">{option}</p>
                    <p className="text-muted">
                      {count} vote{count !== 1 ? 's' : ''} ({totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0}%)
                    </p>
                  </div>
                  <div className="w-full bg-muted/20 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${totalVotes > 0 ? (count / totalVotes) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {proposal.status === 'active' && !userVote && (
            <div className="card">
              <h3 className="text-lg font-bold text-primary mb-4">Cast Your Vote</h3>
              <div className="space-y-2">
                {Object.keys(proposal.votes).map((option) => (
                  <button
                    key={option}
                    onClick={() => handleVote(option)}
                    className="btn btn-secondary w-full"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {userVote && (
            <div className="card bg-green-500/10 border-green-500">
              <p className="text-green-500 font-medium mb-2">Your Vote</p>
              <p className="text-foreground">You voted for <strong>{userVote}</strong></p>
            </div>
          )}
        </div>
      </div>
    </PrivateLayout>
  )
}
