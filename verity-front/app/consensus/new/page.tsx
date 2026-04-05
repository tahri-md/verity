'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PrivateLayout from '@/components/PrivateLayout'
import { api } from '@/lib/api'

export default function CreateConsensusPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    block_number: '',
    view_number: '0',
    network_health: 'healthy',
    leader: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const bn = Number(formData.block_number)
      const vn = Number(formData.view_number)
      if (!Number.isFinite(bn) || bn <= 0) {
        setError('Enter a valid block number')
        return
      }

      await api.post('/consensus', {
        block_number: bn,
        view_number: Number.isFinite(vn) ? vn : 0,
        network_health: formData.network_health,
        leader: formData.leader,
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/consensus" className="text-accent hover:underline mb-4 inline-block">
          ← Back to Consensus
        </Link>

        <div className="card border-2">
          <h1 className="text-3xl font-bold text-primary mb-2">Create Consensus State</h1>
          <p className="text-muted mb-8">Initialize consensus tracking for a block</p>

          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Block Number</label>
              <input
                type="number"
                name="block_number"
                value={formData.block_number}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="e.g. 1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">View Number</label>
              <input
                type="number"
                name="view_number"
                value={formData.view_number}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Network Health</label>
              <input
                type="text"
                name="network_health"
                value={formData.network_health}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="healthy | degraded | partitioned"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Leader (optional)</label>
              <input
                type="text"
                name="leader"
                value={formData.leader}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="validator_1"
              />
            </div>

            <div className="flex gap-4 pt-6 border-t border-border">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex-1"
              >
                {loading ? 'Creating...' : 'Create State'}
              </button>
              <Link href="/consensus" className="btn btn-secondary flex-1 text-center">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </PrivateLayout>
  )
}
