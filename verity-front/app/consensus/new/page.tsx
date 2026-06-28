'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PrivateLayout from '@/components/PrivateLayout'
import { api } from '@/lib/api'

export default function CreateConsensusPage() {
  const router = useRouter()
  const [blockNumber, setBlockNumber] = useState('')
  const [viewNumber, setViewNumber] = useState('0')
  const [networkHealth, setNetworkHealth] = useState('healthy')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const bn = Number(blockNumber)
    if (!Number.isFinite(bn) || bn <= 0) { setError('Enter a valid block number'); return }
    setLoading(true)
    try {
      await api.post('/consensus', {
        block_number: bn,
        view_number: Number(viewNumber) || 0,
        network_health: networkHealth,
      })
      router.push('/consensus')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create consensus state')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PrivateLayout>
      <div className="section main-container max-w-md">
        <Link href="/consensus" className="text-xs text-foreground/40 hover:text-foreground/70 transition-colors mb-6 inline-block">
          ← consensus
        </Link>

        <p className="text-xs uppercase tracking-widest text-foreground/30 font-medium mb-1">New consensus state</p>
        <h1 className="text-2xl font-bold mb-8">Initialize voting</h1>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 mb-6">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wide font-medium text-foreground/50 mb-1.5">Block number</label>
            <input type="number" value={blockNumber} onChange={e => setBlockNumber(e.target.value)} className="input-field w-full" placeholder="e.g. 1" min="1" required />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide font-medium text-foreground/50 mb-1.5">View number</label>
            <input type="number" value={viewNumber} onChange={e => setViewNumber(e.target.value)} className="input-field w-full" placeholder="0" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide font-medium text-foreground/50 mb-1.5">Network health</label>
            <select value={networkHealth} onChange={e => setNetworkHealth(e.target.value)} className="input-field w-full">
              <option value="healthy">Healthy</option>
              <option value="degraded">Degraded</option>
              <option value="partitioned">Partitioned</option>
            </select>
          </div>
          <div className="pt-4 border-t border-border/40 flex gap-3">
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-lg font-medium text-sm disabled:opacity-40" style={{ background: '#7c5cfc', color: '#fff' }}>
              {loading ? 'Creating…' : 'Create state'}
            </button>
            <Link href="/consensus" className="btn btn-ghost flex-1 text-center text-sm">Cancel</Link>
          </div>
        </form>
      </div>
    </PrivateLayout>
  )
}