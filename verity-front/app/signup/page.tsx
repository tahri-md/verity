'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

interface AccountData {
  account_id: string
  public_key: string
  balance: string
}

const FIELDS = [
  { label: 'Name', name: 'name', type: 'text', placeholder: 'Jane Doe' },
  { label: 'Email', name: 'email', type: 'email', placeholder: 'you@example.com' },
  { label: 'Password', name: 'password', type: 'password', placeholder: '••••••••', hint: 'At least 8 characters' },
  { label: 'Confirm password', name: 'confirmPassword', type: 'password', placeholder: '••••••••' },
]

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[11px] font-mono text-foreground/40 uppercase tracking-widest">{label}</p>
        <button
          onClick={copy}
          className="text-[11px] font-mono transition-colors"
          style={{ color: copied ? '#33ffa0' : '#7c5cfc' }}
        >
          {copied ? 'copied' : 'copy'}
        </button>
      </div>
      <div className="border border-border/40 bg-muted/30 px-3 py-2.5 rounded-md font-mono text-xs text-foreground/50 break-all">
        {value}
      </div>
    </div>
  )
}

const VerityLogo = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M10 2L17 6V14L10 18L3 14V6L10 2Z" stroke="#7c5cfc" strokeWidth="1.5" fill="none" />
    <path d="M10 6L14 8.5V13.5L10 16L6 13.5V8.5L10 6Z" stroke="#33ffa0" strokeWidth="1" fill="none" />
  </svg>
)

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [accountData, setAccountData] = useState<AccountData | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validate = (): boolean => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required'); return false
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters'); return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match'); return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Invalid email address'); return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    setLoading(true)
    try {
      const response = await api.post('/api/auth/signup', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })
      setAccountData(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  if (accountData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="w-full max-w-[400px]">

          <div className="flex items-center gap-2 mb-12">
            <VerityLogo />
            <span className="font-semibold text-sm tracking-tight">Verity</span>
          </div>

          <div className="mb-6">
            <span
              className="inline-block font-mono text-xs px-2 py-0.5 rounded mb-5"
              style={{ background: 'rgba(51,255,160,0.1)', color: '#33ffa0' }}
            >
              account provisioned
            </span>
            <h1 className="text-xl font-bold tracking-tight mb-1">You're on the chain.</h1>
            <p className="text-sm text-foreground/40">
              Copy your public key now — it won't appear here again.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <CopyField label="Account ID" value={accountData.account_id} />
            <CopyField label="Public key" value={accountData.public_key} />
            <CopyField label="Starting balance" value={accountData.balance} />
          </div>

          <button
            onClick={() => router.push('/login')}
            className="w-full py-2.5 rounded-md font-medium text-sm"
            style={{ background: '#7c5cfc', color: '#fff' }}
          >
            Sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">

      <div className="hidden lg:flex flex-col justify-between w-72 flex-shrink-0 bg-primary/10 p-10 border-r border-border/30 relative overflow-hidden">

        <div className="relative">
          <div className="flex items-center gap-2">
            <img src='verity_icon.png' className='w-20' />
            <span className="font-semibold text-xl tracking-tight">Verity</span>
          </div>
        </div>

        <div className="relative space-y-6">
          <p className="font-mono text-[11px] text-foreground/30 leading-none uppercase tracking-widest">
            node / consensus
          </p>
          <p className="text-[22px] font-bold leading-snug tracking-tight text-foreground/80">
            Every block is<br />cryptographically<br />accountable.
          </p>
          <p className="text-xs text-foreground/35 leading-relaxed max-w-[180px]">
            Merkle-verified. ECDSA-signed. Validator-voted. No trust required.
          </p>
        </div>

        <p className="relative font-mono text-[10px] text-foreground/20">v1.0.0</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[340px]">

          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <VerityLogo />
            <span className="font-semibold text-sm tracking-tight">Verity</span>
          </div>

          <div className="mb-8">
            <h1 className="text-xl font-bold tracking-tight mb-1">Create account</h1>
            <p className="text-sm text-foreground/40">A keypair will be generated for you.</p>
          </div>

          {error && (
            <div className="border-l-2 border-destructive pl-3 mb-6">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {FIELDS.map(({ label, name, type, placeholder, hint }) => (
              <div key={name}>
                <label
                  htmlFor={name}
                  className="block text-[11px] font-mono text-foreground/40 uppercase tracking-widest mb-1.5"
                >
                  {label}
                </label>
                <input
                  id={name}
                  type={type}
                  name={name}
                  value={formData[name as keyof FormData]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  required
                  className="input-field w-full"
                />
                {hint && <p className="text-[11px] font-mono text-foreground/30 mt-1">{hint}</p>}
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-md font-medium text-sm transition-opacity mt-1 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#7c5cfc', color: '#fff' }}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-sm text-foreground/35 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-foreground/60 font-medium hover:text-foreground transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}