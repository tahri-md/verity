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

  useEffect(() => { fetchLedgerState() }, [])

  const fetchLedgerState = async () => {
    try {
      const response = await api.get('/api/v1/ledger/latest')
      setState(response.data)
    } catch {
      setError('Failed to load ledger state')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <PrivateLayout>
        <div className="section main-container py-20 flex flex-col items-center gap-3">
          <div className="w-5 h-5 border border-border border-t-[#7c5cfc] rounded-full animate-spin" />
          <p className="font-mono text-[11px] text-foreground/30 uppercase tracking-widest">fetching</p>
        </div>
      </PrivateLayout>
    )
  }

  return (
    <PrivateLayout>
      <div className="section main-container">

        <div className="flex justify-between items-start md:items-center md:flex-row flex-col gap-4 mb-8">
          <div>
            <p className="font-mono text-[11px] text-foreground/30 uppercase tracking-widest mb-1">state</p>
            <h1 className="text-xl font-bold tracking-tight">Ledger</h1>
          </div>
          <Link
            href="/ledger/verify"
            className="px-4 py-2 rounded-md text-sm font-medium"
            style={{ background: '#7c5cfc', color: '#fff' }}
          >
            Verify ledger
          </Link>
        </div>

        {error && (
          <div className="border-l-2 border-destructive pl-3 mb-6">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {state && (
          <div className="space-y-4">

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px border border-border/30 rounded-md overflow-hidden">
              {[
                { label: 'Block',     value: `#${state.block_number}`, mono: true },
                { label: 'Validity',  value: state.is_valid ? 'valid' : 'invalid', color: state.is_valid ? '#33ffa0' : '#ff5f57' },
                { label: 'Timestamp', value: new Date(state.timestamp).toLocaleDateString() },
                { label: 'Time',      value: new Date(state.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
              ].map(({ label, value, mono, color }) => (
                <div key={label} className="bg-muted/10 px-4 py-4">
                  <p className="font-mono text-[10px] text-foreground/30 uppercase tracking-widest mb-1.5">{label}</p>
                  <p
                    className={`font-mono text-sm font-semibold ${mono ? '' : ''}`}
                    style={color ? { color } : undefined}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Hashes */}
            <div className="border border-border/30 rounded-md px-4 py-2">
              {[
                { label: 'Root hash',   value: state.root_hash || 'N/A' },
                { label: 'State hash',  value: state.state_hash },
              ].map(({ label, value }) => (
                <div key={label} className="py-3 border-b border-border/20 last:border-0">
                  <p className="font-mono text-[10px] text-foreground/30 uppercase tracking-widest mb-1">{label}</p>
                  <p className="font-mono text-xs text-foreground/55 break-all">{value}</p>
                </div>
              ))}
            </div>

            <Link
              href={`/ledger/verify?state_hash=${encodeURIComponent(state.state_hash)}`}
              className="block w-full py-2.5 rounded-md text-sm font-medium text-center border border-border/40 text-foreground/50 hover:text-foreground/80 hover:border-border/60 transition-colors"
            >
              Verify this state
            </Link>
          </div>
        )}
      </div>
    </PrivateLayout>
  )
}