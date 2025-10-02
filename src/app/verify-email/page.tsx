"use client"

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { auth } from '@/lib/firebase'
import { sendEmailVerification } from 'firebase/auth'
import { toast } from 'sonner'

export default function VerifyEmailPage() {
  const params = useSearchParams()
  const email = params.get('email') || ''
  const [loading, setLoading] = useState(false)

  const handleResend = async () => {
    const user = auth.currentUser
    if (!user) {
      toast.error('Please sign in again to resend verification')
      return
    }
    setLoading(true)
    try {
      await sendEmailVerification(user)
      toast.success('Verification email resent')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to resend')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md border border-muted/40 bg-background/80 backdrop-blur">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-semibold">Check your email</CardTitle>
          <CardDescription>
            We sent a verification link to {email || 'your email'}. Open it to activate your account. If you don&apos;t see it, check your spam folder.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" onClick={handleResend} disabled={loading}>
            {loading ? 'Resending…' : 'Resend verification email'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}


