'use client'

import Link from 'next/link'
import PrivateLayout from '@/components/PrivateLayout'

export default function RootPage() {
  return (
    <PrivateLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">Welcome to Verity</h1>
          <p className="text-lg text-muted mb-8">Blockchain Verification System</p>
          <Link href="/dashboard" className="btn btn-primary inline-block">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </PrivateLayout>
  )
}
