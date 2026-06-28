'use client'

import { useState, useEffect } from 'react'
import PrivateLayout from '@/components/PrivateLayout'

interface UserProfile {
  account_id: string
  name: string
  email: string
  public_key: string
  balance: number
  nonce: number
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="py-3 border-b border-border/40 last:border-0">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs uppercase tracking-wide font-medium text-foreground/40">{label}</p>
        <button
          onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          className="text-xs font-medium transition-colors"
          style={{ color: copied ? '#33ffa0' : '#7c5cfc' }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <p className="font-mono text-xs text-foreground/60 break-all">{value || '—'}</p>
    </div>
  )
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user')
      if (raw) setProfile(JSON.parse(raw))
    } catch {}
    const saved = localStorage.getItem('theme') || 'dark'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  const changeTheme = (t: string) => {
    setTheme(t)
    document.documentElement.setAttribute('data-theme', t)
    localStorage.setItem('theme', t)
  }

  return (
    <PrivateLayout>
      <div className="section main-container max-w-2xl">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-foreground/30 font-medium mb-1">Account</p>
          <h1 className="text-2xl font-bold">{profile?.name || 'Profile'}</h1>
          <p className="text-sm text-foreground/50">{profile?.email}</p>
        </div>

        {!profile ? (
          <div className="card bg-destructive/5 border-destructive/20">
            <p className="text-destructive text-sm">No account data. Please log in again.</p>
          </div>
        ) : (
          <div className="space-y-4">

            {/* Balances */}
            <div className="grid grid-cols-2 gap-3">
              <div className="stat-card">
                <p className="stat-label">Balance</p>
                <p className="stat-value" style={{ color: '#7c5cfc' }}>{profile.balance}</p>
                <p className="text-xs text-foreground/40 mt-1">VRT</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Nonce</p>
                <p className="stat-value">{profile.nonce}</p>
                <p className="text-xs text-foreground/40 mt-1">next tx sequence</p>
              </div>
            </div>

            {/* Chain identity */}
            <div className="card">
              <p className="text-xs uppercase tracking-wide font-medium text-foreground/40 mb-2">Chain identity</p>
              <CopyField label="Account ID" value={profile.account_id} />
              <CopyField label="Public key (ECDSA P-256)" value={profile.public_key} />
            </div>

            {/* Theme */}
            <div className="card">
              <p className="text-xs uppercase tracking-wide font-medium text-foreground/40 mb-4">Appearance</p>
              <div className="flex gap-2">
                {['light', 'dark'].map(t => (
                  <button
                    key={t}
                    onClick={() => changeTheme(t)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all border ${
                      theme === t ? 'border-primary text-foreground' : 'border-border/40 text-foreground/40 hover:border-border'
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </PrivateLayout>
  )
}