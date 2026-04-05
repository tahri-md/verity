'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PrivateLayout from '@/components/PrivateLayout'
import { api } from '@/lib/api'

interface LedgerState {
  state_hash: string
  block_number: number
  root_hash: string
  timestamp: string
  is_valid: boolean
}

export default function LedgerPage() {
  const [state, setState] = useState<LedgerState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchLedgerState()
  }, [])

  const fetchLedgerState = async () => {
    try {
      const response = await api.get('/api/v1/ledger/latest')
      setState(response.data)
    } catch (err: any) {
      setError('Failed to load ledger state')
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
            <h1 className="text-3xl font-bold text-primary">Ledger State</h1>
            <p className="text-muted">Current blockchain ledger state</p>
          </div>
          <Link href="/ledger/verify" className="btn btn-primary">
            Verify Ledger
          </Link>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {state && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="card">
                <p className="text-muted text-sm">Block Number</p>
                <p className="text-3xl font-bold text-primary mt-2">{state.block_number}</p>
              </div>

              <div className="card">
                <p className="text-muted text-sm">Validity</p>
                <p className="text-3xl font-bold text-primary mt-2">{state.is_valid ? 'Valid' : 'Invalid'}</p>
              </div>

              <div className="card">
                <p className="text-muted text-sm">Root Hash</p>
                <p className="text-sm font-mono text-accent break-all mt-2">{state.root_hash || 'N/A'}</p>
              </div>

              <div className="card">
                <p className="text-muted text-sm">Timestamp</p>
                <p className="text-sm mt-2">{new Date(state.timestamp).toLocaleString()}</p>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-bold text-primary mb-4">State Hash</h2>
              <p className="font-mono text-xs text-accent break-all bg-muted/10 p-4 rounded">
                {state.state_hash}
              </p>
              <Link href={`/ledger/verify?state_hash=${encodeURIComponent(state.state_hash)}`} className="btn btn-secondary w-full mt-4 text-center">
                Verify This State
              </Link>
            </div>
          </>
        )}
      </div>
    </PrivateLayout>
  )
}
