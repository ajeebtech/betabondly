"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowRight, Check, Sparkles, Loader2 } from "lucide-react"
import Image from "next/image"
import { db, auth } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp, getCountFromServer, query, doc, getDoc, setDoc } from "firebase/firestore"
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function HeroSection() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const waitlistRef = collection(db, "waitlist")
        const q = query(waitlistRef)
        const snapshot = await getCountFromServer(q)
        setWaitlistCount(snapshot.data().count)
      } catch (err) {
        console.error("Failed to fetch waitlist count", err)
      }
    }
    fetchCount()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address")
      return
    }

    setIsSubmitting(true)
    
    try {
      // Add email to Firestore
      await addDoc(collection(db, "waitlist"), {
        email: email.trim().toLowerCase(),
        createdAt: serverTimestamp(),
        status: "pending"
      })
      
      setEmail("")
      setIsSuccess(true)
      toast.success("You've been added to the waitlist!")
      
      // Reset success state after 5 seconds
      setTimeout(() => {
        setIsSuccess(false)
      }, 5000)
      
    } catch (error) {
      console.error("Error adding to waitlist: ", error)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      console.log('🎉 Google sign-in successful:', user);
      
      // Check if user document exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        // Only create user document if it doesn't exist
        const userDataToCreate = {
          uid: user.uid,
          email: user.email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          displayName: user.displayName || '',
          emailVerified: user.emailVerified,
          photoURL: user.photoURL || null,
        };
        
        await setDoc(userDocRef, userDataToCreate);
        console.log('✅ New user document created');
        toast.success('Welcome to Bondly! 🎉');
      } else {
        // Update existing user document with latest info
        await setDoc(userDocRef, {
          email: user.email,
          displayName: user.displayName || '',
          emailVerified: user.emailVerified,
          photoURL: user.photoURL || null,
          updatedAt: serverTimestamp(),
        }, { merge: true });
        console.log('✅ Existing user document updated');
        toast.success('Welcome back! 👋');
      }
      
      // Redirect based on onboarding progress
      const data = (await getDoc(userDocRef)).data();
      
      if (!data?.datingStartDate) {
        router.push('/auth/date');
      } else if (!data?.inviteCode) {
        router.push('/auth/invite');
      } else if (data?.coupleId) {
        router.push(`/${data.coupleId}`);
      } else {
        router.push('/default-couple');
      }
      
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast.error('Sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <section className="relative pt-8 pb-8 md:pt-12 md:pb-12 overflow-hidden" style={{ scrollMarginTop: '4rem' }}>
      {/* Subtle background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/30 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div className="space-y-4 md:space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Early Access • Be the First</span>
              <ArrowRight className="w-4 h-4 text-primary" />
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-playfair font-bold leading-tight text-balance">
              Your little corner of the internet, <span className="text-pink-600 font-extrabold drop-shadow-lg" style={{textShadow: '0 2px 8px #fff0f6, 0 1px 0 #ff69b4'}}>only for two.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty max-w-xl">
              a private space where you and your partner can document and capture all your moments and bond together.
            </p>

            {/* Waitlist form */}
            <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting || isSuccess}
                  className="flex-1 h-12 bg-white/90 border-2 border-pink-300 text-pink-900 placeholder-pink-400 shadow-md focus:border-pink-500 focus:ring-pink-200"
                  required
                />
                <Button 
                  type="submit"
                  size="lg" 
                  className="h-12 px-8 whitespace-nowrap"
                  disabled={isSubmitting || isSuccess}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : isSuccess ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Joined!
                    </>
                  ) : (
                    <>
                      Join Waitlist
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
              {isSuccess && (
                <p className="text-sm text-green-500">
                  Thank you! We'll be in touch soon.
                </p>
              )}
            </form>

            <p className="text-sm text-muted-foreground">
              Join <span className="font-semibold text-foreground">{waitlistCount ?? 'many'}</span> to-be users already on the waitlist
            </p>

            {/* Quick start actions */}
            <div className="pt-2 max-w-md space-y-2">
              <Button size="lg" className="w-full h-12" asChild>
                <Link href="/sign-up">Get Started</Link>
              </Button>
              <Button
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full h-11 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-gray-900 transition-all duration-200 shadow-sm hover:shadow-md"
                variant="outline"
              >
                {googleLoading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                    <span className="font-medium">Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="font-medium">Continue with Google</span>
                  </div>
                )}
              </Button>
            </div>
          </div>

          {/* Right visual */}
          <div className="relative">
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Browser mockup */}
              <div className="absolute inset-0 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-muted border-b border-border">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 flex items-center gap-2 ml-4">
                    <div className="flex-1 bg-background rounded px-3 py-1 text-xs text-muted-foreground flex items-center gap-1">
                      <Image 
                        src="/images/pinkbonddd.png" 
                        alt="" 
                        width={16} 
                        height={16}
                        className="w-4 h-4"
                      />
                      bondly.fun
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center">
                      <Image 
                        src="/images/pinkbonddd.png" 
                        alt="" 
                        width={120} 
                        height={120}
                        className="w-32 h-32"
                      />
                      <span className="text-8xl font-playfair font-bold text-primary -ml-3">ondly</span>
                    </div>
                    <div className="text-sm text-muted-foreground">Your private space</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="aspect-square bg-accent rounded-lg" />
                    <div className="aspect-square bg-secondary rounded-lg" />
                  </div>

                  <div className="space-y-3">
                    <div className="h-3 bg-muted rounded-full w-3/4" />
                    <div className="h-3 bg-muted rounded-full w-1/2" />
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-card border border-border rounded-xl p-4 shadow-lg animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20" />
                  <div className="space-y-1">
                    <div className="h-2 w-16 bg-muted rounded" />
                    <div className="h-2 w-12 bg-muted rounded" />
                  </div>
                </div>
              </div>

              <div
                className="absolute -bottom-4 -left-4 bg-card border border-border rounded-xl p-4 shadow-lg animate-float"
                style={{ animationDelay: "1s" }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent" />
                  <div className="space-y-1">
                    <div className="h-2 w-20 bg-muted rounded" />
                    <div className="h-2 w-14 bg-muted rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
