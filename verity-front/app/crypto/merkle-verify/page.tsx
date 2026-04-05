'use client'

import { useState } from 'react'
import Link from 'next/link'
import PrivateLayout from '@/components/PrivateLayout'
import axios from 'axios'

export default function MerkleVerifyPage() {
  const [formData, setFormData] = useState({
    transactionHash: '',
    merkleRoot: '',
    proofPath: '',
  })
  const [result, setResult] = useState<{ valid: boolean; message: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        'http://localhost:8080/api/crypto/verify-merkle',
        {
          transactionHash: formData.transactionHash,
          merkleRoot: formData.merkleRoot,
          proofPath: JSON.parse(formData.proofPath),
        },
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
        <Link href="/dashboard" className="text-accent hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card border-2">
            <h1 className="text-3xl font-bold text-primary mb-6">Merkle Proof Verification</h1>

            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Transaction Hash</label>
                <input
                  type="text"
                  name="transactionHash"
                  value={formData.transactionHash}
                  onChange={handleChange}
                  className="input-field w-full font-mono text-xs"
                  placeholder="0x..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Merkle Root</label>
                <input
                  type="text"
                  name="merkleRoot"
                  value={formData.merkleRoot}
                  onChange={handleChange}
                  className="input-field w-full font-mono text-xs"
                  placeholder="0x..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Proof Path (JSON)</label>
                <textarea
                  name="proofPath"
                  value={formData.proofPath}
                  onChange={handleChange}
                  className="input-field w-full font-mono text-xs"
                  placeholder='["0x...", "0x..."]'
                  rows={4}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? 'Verifying...' : 'Verify Merkle Proof'}
              </button>
            </form>
          </div>

          <div>
            {result && (
              <div className={`card border-2 ${result.valid ? 'border-green-500' : 'border-destructive'}`}>
                <div className={`text-center ${result.valid ? 'text-green-500' : 'text-destructive'}`}>
                  <h2 className="text-2xl font-bold mb-2">
                    {result.valid ? 'Valid Proof' : 'Invalid Proof'}
                  </h2>
                  <p className="text-sm">{result.message}</p>
                </div>
              </div>
            )}

            {!result && (
              <div className="card">
                <p className="text-muted text-center">
                  Fill in the form and click verify to check the merkle proof
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PrivateLayout>
  )
}
