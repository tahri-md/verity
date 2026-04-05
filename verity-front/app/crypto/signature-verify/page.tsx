'use client'

import { useState } from 'react'
import Link from 'next/link'
import PrivateLayout from '@/components/PrivateLayout'
import { api } from '@/lib/api'

export default function SignatureVerifyPage() {
  const [formData, setFormData] = useState({
    message: '',
    signature: '',
    publicKey: '',
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
      const response = await api.post('/api/crypto/verify-signature', {
        message: formData.message,
        signature: formData.signature,
        publicKey: formData.publicKey,
      })
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
            <h1 className="text-3xl font-bold text-primary mb-6">Signature Verification</h1>

            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Message or Hash</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="input-field w-full"
                  placeholder="Either a raw message, or a 64-hex sha256 digest"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Signature (Hex)</label>
                <textarea
                  name="signature"
                  value={formData.signature}
                  onChange={handleChange}
                  className="input-field w-full font-mono text-xs"
                  placeholder="0x..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Public Key (Hex)</label>
                <textarea
                  name="publicKey"
                  value={formData.publicKey}
                  onChange={handleChange}
                  className="input-field w-full font-mono text-xs"
                  placeholder="0x..."
                  rows={3}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? 'Verifying...' : 'Verify Signature'}
              </button>
            </form>
          </div>

          <div>
            {result && (
              <div className={`card border-2 ${result.valid ? 'border-green-500' : 'border-destructive'}`}>
                <div className={`text-center ${result.valid ? 'text-green-500' : 'text-destructive'}`}>
                  <h2 className="text-2xl font-bold mb-2">
                    {result.valid ? 'Valid Signature' : 'Invalid Signature'}
                  </h2>
                  <p className="text-sm">{result.message}</p>
                </div>
              </div>
            )}

            {!result && (
              <div className="card">
                <p className="text-muted text-center">
                  Fill in the form and click verify to validate the signature
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PrivateLayout>
  )
}
