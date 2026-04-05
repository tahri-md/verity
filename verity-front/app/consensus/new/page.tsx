'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PrivateLayout from '@/components/PrivateLayout'
import axios from 'axios'

export default function CreateConsensusPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    options: ['Yes', 'No'],
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
      const token = localStorage.getItem('token')
      await axios.post(
        'http://localhost:8080/api/consensus',
        {
          title: formData.title,
          description: formData.description,
          options: formData.options,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      router.push('/consensus')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create proposal')
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
          <h1 className="text-3xl font-bold text-primary mb-2">Create New Proposal</h1>
          <p className="text-muted mb-8">Submit a proposal for consensus voting</p>

          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Proposal Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="E.g., Increase block size limit"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="Provide details about your proposal..."
                rows={4}
                required
              />
            </div>

            <div className="flex gap-4 pt-6 border-t border-border">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex-1"
              >
                {loading ? 'Creating...' : 'Create Proposal'}
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
