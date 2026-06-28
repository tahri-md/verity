'use client'

import { useState } from 'react'
import Link from 'next/link'
import PrivateLayout from '@/components/PrivateLayout'
import { api } from '@/lib/api'

export default function SignatureVerifyPage() {
  const [message, setMessage] = useState('')
  const [signature, setSignature] = useState('')
  const [publicKey, setPublicKey] = useState('')
  const [result, setResult] = useState<{ valid: boolean } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const res = await api.post('/api/crypto/verify-signature', { message, signature, publicKey })
      setResult(res.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PrivateLayout>
      <div className="section main-container max-w-2xl">
        <Link href="/dashboard" className="text-xs text-foreground/40 hover:text-foreground/70 transition-colors mb-6 inline-block">
          ← dashboard
        </Link>

        <p className="text-xs uppercase tracking-widest text-foreground/30 font-medium mb-1">Crypto tools</p>
        <h1 className="text-2xl font-bold mb-2">Signature verification</h1>
        <p className="text-sm text-foreground/50 mb-8">Verify an ECDSA P-256 signature against a message hash and public key.</p>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 mb-6">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleVerify} className="card space-y-4 mb-4">
          <div>
            <label className="block text-xs uppercase tracking-wide font-medium text-foreground/50 mb-1.5">Message or hash (hex)</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} className="input-field w-full font-mono text-xs" rows={2} placeholder="Raw message or 64-char SHA-256 hex digest" required />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide font-medium text-foreground/50 mb-1.5">Signature (hex)</label>
            <textarea value={signature} onChange={e => setSignature(e.target.value)} className="input-field w-full font-mono text-xs" rows={3} placeholder="128-char hex (r || s)" required />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide font-medium text-foreground/50 mb-1.5">Public key (hex)</label>
            <textarea value={publicKey} onChange={e => setPublicKey(e.target.value)} className="input-field w-full font-mono text-xs" rows={3} placeholder="Uncompressed P-256 key (130 hex chars)" required />
          </div>
          <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg font-medium text-sm disabled:opacity-40" style={{ background: '#7c5cfc', color: '#fff' }}>
            {loading ? 'Verifying…' : 'Verify signature'}
          </button>
        </form>

        {result && (
          <div
            className="rounded-lg px-4 py-4 text-center"
            style={{
              background: result.valid ? 'rgba(51,255,160,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${result.valid ? 'rgba(51,255,160,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}
          >
            <p className="text-lg font-bold" style={{ color: result.valid ? '#33ffa0' : '#ef4444' }}>
              {result.valid ? '✓ Valid signature' : '✗ Invalid signature'}
            </p>
            <p className="text-xs text-foreground/50 mt-1">
              {result.valid ? 'The signature matches the public key for this message.' : 'Signature does not match this public key and message.'}
            </p>
          </div>
        )}
      </div>
    </PrivateLayout>
  )
}