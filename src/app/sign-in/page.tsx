"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GoogleSignInButton } from '@/components/GoogleSignInButton'
import { auth } from '@/lib/firebase'
import { 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification
} from 'firebase/auth'
import { toast } from 'sonner'
export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setShowPassword(true)
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    
    setLoading(true)
    setError("")
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      if (!user.emailVerified) {
        await signOut(auth)
        setError("Please verify your email before signing in. Check your inbox for the verification link.")
        // Resend verification email
        await sendEmailVerification(user, {
          url: `${window.location.origin}/verify-email?email=${encodeURIComponent(email)}`
        })
        toast.info('Verification email resent. Please check your inbox.')
        return
      }
      
      // If we get here, the user is verified and signed in
      router.push('/dashboard')
      
    } catch (err: any) {
      console.error('Sign in error:', err)
      setError("Invalid email or password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md border border-muted/40 bg-background/80 backdrop-blur">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-semibold tracking-tight">Sign in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={showPassword ? handleSignIn : handleEmailContinue} className="space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                required
                disabled={loading || showPassword}
              />
            </div>
            
            {showPassword && (
              <div className="space-y-2 text-left">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                  required
                  disabled={loading}
                />
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setShowPassword(false)}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    Change email
                  </button>
                </div>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full h-11 font-medium"
              disabled={loading}
            >
              {loading ? 'Signing in...' : (showPassword ? 'Sign In' : 'Continue')}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <GoogleSignInButton className="w-full h-11" />

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/sign-up" className="underline underline-offset-4 hover:text-foreground">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}


