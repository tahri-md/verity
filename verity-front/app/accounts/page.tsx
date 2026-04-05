'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PrivateLayout from '@/components/PrivateLayout'
import axios from 'axios'

interface Account {
  id: string
  name: string
  balance: number
  status: string
  nonce: number
  createdAt: string
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchAccounts()
  }, [page, searchTerm])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:8080/api/accounts', {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: searchTerm, page },
      })
      setAccounts(response.data.data || [])
    } catch (err: any) {
      setError('Failed to load accounts')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:8080/api/accounts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchAccounts()
    } catch (err: any) {
      setError('Failed to delete account')
    }
  }

  return (
    <PrivateLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Accounts</h1>
            <p className="text-muted">Manage blockchain accounts</p>
          </div>
          <Link href="/accounts/new" className="btn btn-primary">
            + Create Account
          </Link>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="card mb-6">
          <input
            type="text"
            placeholder="Search accounts..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPage(1)
            }}
            className="input-field w-full"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : accounts.length > 0 ? (
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-primary">Account</th>
                  <th className="text-left py-3 px-4 font-semibold text-primary">Balance</th>
                  <th className="text-left py-3 px-4 font-semibold text-primary">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-primary">Nonce</th>
                  <th className="text-left py-3 px-4 font-semibold text-primary">Created</th>
                  <th className="text-right py-3 px-4 font-semibold text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id} className="border-b border-border hover:bg-muted/5">
                    <td className="py-3 px-4">
                      <Link href={`/accounts/${account.id}`} className="text-accent hover:underline">
                        {account.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4">${account.balance.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        account.status === 'active'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-gray-500/10 text-gray-500'
                      }`}>
                        {account.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{account.nonce}</td>
                    <td className="py-3 px-4 text-sm text-muted">
                      {new Date(account.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/accounts/${account.id}`} className="text-accent hover:underline text-sm">
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(account.id)}
                        className="ml-3 text-destructive hover:underline text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-muted mb-4">No accounts found</p>
            <Link href="/accounts/new" className="btn btn-primary">
              Create your first account
            </Link>
          </div>
        )}
      </div>
    </PrivateLayout>
  )
}
