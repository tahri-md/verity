'use client'

import { useState } from 'react'
import Link from 'next/link'
import PrivateLayout from '@/components/PrivateLayout'
import axios from 'axios'

export default function LedgerVerifyPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleVerify = async () => {
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        'http://localhost:8080/api/ledger/verify',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setResult(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed')
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

          <button
            onClick={handleVerify}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Verifying...' : 'Start Verification'}
          </button>
        </div>

        {result && (
          <div className={`card border-2 ${result.valid ? 'border-green-500' : 'border-destructive'}`}>
            <h2 className="text-2xl font-bold mb-6">
              <span className={result.valid ? 'text-green-500' : 'text-destructive'}>
                {result.valid ? 'Valid Ledger' : 'Invalid Ledger'}
              </span>
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-muted text-sm mb-2">Current State Hash</p>
                <p className="font-mono text-xs text-accent break-all bg-muted/10 p-3 rounded">
                  {result.currentHash}
                </p>
              </div>

              {result.previousHash && (
                <div>
                  <p className="text-muted text-sm mb-2">Previous State Hash</p>
                  <p className="font-mono text-xs text-accent break-all bg-muted/10 p-3 rounded">
                    {result.previousHash}
                  </p>
                </div>
              )}

              {result.message && (
                <div className="border-t border-border pt-4">
                  <p className="text-muted text-sm mb-2">Message</p>
                  <p>{result.message}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PrivateLayout>
  )
}
