"use client"

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { simpleEmailAuth } from '@/lib/simpleEmailAuth'
import { GoogleSignInButton } from '@/components/GoogleSignInButton'
import { auth } from '@/lib/firebase'
import { sendEmailVerification } from 'firebase/auth'
import { toast } from 'sonner'

function getPasswordScore(pw: string) {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const score = useMemo(() => getPasswordScore(password), [password])
  const scoreLabel = useMemo(() => {
    if (!password) return ''
    if (score <= 2) return 'Weak'
    if (score === 3) return 'Medium'
    return 'Strong'
  }, [score, password])

  const canSubmit = name.trim() && email.trim() && password.length >= 8

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || loading) return
    setLoading(true)
    try {
      const user = await simpleEmailAuth.signUp(email, password, name)
      if (user) {
        await sendEmailVerification(user)
        toast.success('Verification email sent. Please check your inbox and spam folder.')
        // Require verification before using the app: sign out and redirect
        await simpleEmailAuth.signOut()
        router.push(`/verify-email?email=${encodeURIComponent(email)}`)
      }
    } catch (err: any) {
      toast.error(err?.message || 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md border border-muted/40 bg-background/80 backdrop-blur">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-semibold tracking-tight">Create your account</CardTitle>
          <CardDescription>We&apos;ll send a verification email</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" required className="h-11" />
              {password && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Strength: {scoreLabel}</span>
                  <div className="flex gap-1">
                    {[0,1,2,3,4].map((i) => (
                      <span key={i} className={`h-1.5 w-8 rounded ${i < score ? 'bg-emerald-500' : 'bg-muted'}`} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Button type="submit" className="w-full h-11" disabled={!canSubmit || loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <GoogleSignInButton className="w-full h-11" />
        </CardContent>
      </Card>
    </div>
  )
}


