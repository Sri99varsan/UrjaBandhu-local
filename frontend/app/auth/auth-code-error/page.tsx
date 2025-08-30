'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            There was an error during the authentication process. This could be due to:
          </p>
          <ul className="mt-4 text-sm text-gray-600 text-left space-y-2">
            <li>• The authentication code has expired</li>
            <li>• The authentication was cancelled</li>
            <li>• Network connectivity issues</li>
          </ul>
        </div>
        <div className="mt-8 space-y-4">
          <Button asChild className="w-full">
            <Link href="/auth">
              Try Again
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
