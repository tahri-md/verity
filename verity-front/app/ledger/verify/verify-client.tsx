'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import PrivateLayout from '@/components/PrivateLayout'
import { api } from '@/lib/api'

export default function LedgerVerifyClient() {
  const searchParams = useSearchParams()
  const [stateHash, setStateHash] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fromQuery = searchParams.get('state_hash')
    if (fromQuery) {
      setStateHash(fromQuery)
      return
    }

    ;(async () => {
      try {
        const latest = await api.get('/api/v1/ledger/latest')
        if (latest.data?.state_hash) setStateHash(String(latest.data.state_hash))
      } catch {
        // ignore
      }
    })()
  }, [searchParams])

  const handleVerify = async () => {
    setError('')
    setLoading(true)

    try {
      if (!stateHash.trim()) {
        setError('Enter a state hash')
        return
      }

      const response = await api.post('/api/v1/ledger/verify', {
        state_hash: stateHash.trim(),
      })
      setResult(response.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PrivateLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/ledger" className="text-accent hover:underline mb-4 inline-block">
          ← Back to Ledger
        </Link>

        <div className="card border-2 mb-6">
          <h1 className="text-3xl font-bold text-primary mb-6">Verify Ledger State</h1>

          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <p className="text-muted mb-6">
            Verify the integrity of the blockchain ledger state by checking the state hash and comparing it with previous states.
          </p>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">State Hash</label>
            <input
              value={stateHash}
              onChange={(e) => setStateHash(e.target.value)}
              className="input-field w-full font-mono text-xs"
              placeholder="state_hash"
            />
          </div>

          <button onClick={handleVerify} disabled={loading} className="btn btn-primary">
            {loading ? 'Verifying...' : 'Start Verification'}
          </button>
        </div>

        {result && (
          <div className={`card border-2 ${result.is_valid ? 'border-green-500' : 'border-destructive'}`}>
            <h2 className="text-2xl font-bold mb-6">
              <span className={result.is_valid ? 'text-green-500' : 'text-destructive'}>
                {result.is_valid ? 'Valid Ledger' : 'Invalid Ledger'}
              </span>
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-muted text-sm mb-2">Current State Hash</p>
                <p className="font-mono text-xs text-accent break-all bg-muted/10 p-3 rounded">
                  {result.state_hash}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </PrivateLayout>
  )
}
