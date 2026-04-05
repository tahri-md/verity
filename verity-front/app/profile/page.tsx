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

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsed = JSON.parse(userData)
        setProfile(parsed)
      } catch (e) {
        console.error('Failed to parse user data')
      }
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <PrivateLayout>
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </PrivateLayout>
    )
  }

  return (
    <PrivateLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-primary mb-8">Blockchain Account Profile</h1>

        {!profile && (
          <div className="card bg-destructive/10 border border-destructive">
            <p className="text-destructive">No account information found. Please log in again.</p>
          </div>
        )}

        {profile && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="card text-center">
                <div className="w-20 h-20 bg-primary rounded-full mx-auto flex items-center justify-center text-primary-foreground text-3xl font-bold mb-4">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-2xl font-bold text-primary">{profile.name}</h2>
                <p className="text-muted mt-1">{profile.email}</p>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {/* Account Details */}
              <div className="card">
                <h3 className="text-lg font-bold text-primary mb-4">Account Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-muted text-sm">Full Name</p>
                    <p className="text-foreground mt-1">{profile.name}</p>
                  </div>

                  <div>
                    <p className="text-muted text-sm">Email Address</p>
                    <p className="text-foreground mt-1">{profile.email}</p>
                  </div>

                  <div>
                    <p className="text-muted text-sm">Account ID</p>
                    <div className="bg-input p-3 rounded mt-1 break-all font-mono text-xs">
                      {profile.account_id}
                    </div>
                  </div>
                </div>
              </div>

              {/* Blockchain Information */}
              <div className="card border border-accent/50 bg-primary/5">
                <h3 className="text-lg font-bold text-primary mb-4">Blockchain Information</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-muted text-sm">Public Key (Used for signing)</p>
                    <div className="bg-input p-3 rounded mt-1 break-all font-mono text-xs max-h-24 overflow-y-auto">
                      {profile.public_key}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted text-sm">Account Balance</p>
                      <p className="text-foreground text-lg font-bold mt-1">{profile.balance}</p>
                    </div>

                    <div>
                      <p className="text-muted text-sm">Transaction Nonce</p>
                      <p className="text-foreground text-lg font-bold mt-1">{profile.nonce}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border text-xs text-muted">
                    <p>📋 Use your Account ID for transaction operations</p>
                    <p>🔑 Keep your Public Key safe - it identifies your account on the blockchain</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card">
                <h3 className="text-lg font-bold text-primary mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="btn btn-secondary text-sm">Create Transaction</button>
                  <button className="btn btn-secondary text-sm">View Transactions</button>
                  <button className="btn btn-secondary text-sm">Check Balance</button>
                  <button className="btn btn-secondary text-sm">View Audit Log</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PrivateLayout>
  )
}
