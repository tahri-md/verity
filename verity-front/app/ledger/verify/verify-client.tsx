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
    if (fromQuery) { setStateHash(fromQuery); return }
    api.get('/api/v1/ledger/latest').then(r => { if (r.data?.state_hash) setStateHash(String(r.data.state_hash)) }).catch(() => {})
  }, [searchParams])

  const verify = async () => {
    setError('')
    setResult(null)
    if (!stateHash.trim()) { setError('Enter a state hash'); return }
    setLoading(true)
    try {
      const res = await api.post('/api/v1/ledger/verify', { state_hash: stateHash.trim() })
      setResult(res.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PrivateLayout>
      <div className="section main-container max-w-2xl">
        <Link href="/ledger" className="text-xs text-foreground/40 hover:text-foreground/70 transition-colors mb-6 inline-block">
          ← ledger
        </Link>

        <p className="text-xs uppercase tracking-widest text-foreground/30 font-medium mb-1">Ledger</p>
        <h1 className="text-2xl font-bold mb-2">Verify ledger state</h1>
        <p className="text-sm text-foreground/50 mb-8">
          Confirm that a state hash matches the current account balance snapshot. The latest state hash is pre-filled.
        </p>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 mb-6">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="card mb-4">
          <label className="block text-xs uppercase tracking-wide font-medium text-foreground/50 mb-1.5">State hash</label>
          <input value={stateHash} onChange={e => setStateHash(e.target.value)} className="input-field w-full font-mono text-xs" placeholder="64-char hex state hash" />
        </div>

        <button onClick={verify} disabled={loading} className="w-full py-2.5 rounded-lg font-medium text-sm disabled:opacity-40 mb-6" style={{ background: '#7c5cfc', color: '#fff' }}>
          {loading ? 'Verifying…' : 'Verify state'}
        </button>

        {result && (
          <div
            className="rounded-lg px-4 py-4"
            style={{
              background: result.is_valid ? 'rgba(51,255,160,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${result.is_valid ? 'rgba(51,255,160,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}
          >
            <p className="text-lg font-bold mb-3" style={{ color: result.is_valid ? '#33ffa0' : '#ef4444' }}>
              {result.is_valid ? '✓ Ledger state valid' : '✗ Ledger state invalid'}
            </p>
            {result.state_hash && (
              <div>
                <p className="text-xs text-foreground/40 mb-1">Verified hash</p>
                <p className="font-mono text-xs text-foreground/60 break-all">{result.state_hash}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </PrivateLayout>
  )
}