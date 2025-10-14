"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Check, Sparkles, Loader2 } from "lucide-react"
import Image from "next/image"
import { db } from "@/lib/firebase"
import { collection, getCountFromServer, query } from "firebase/firestore"
import { toast } from "sonner"
import { GoogleSignInButton } from "@/components/GoogleSignInButton"

export function HeroSection() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null)

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
      // Add email via API endpoint (handles deduplication)
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setEmail("")
        setIsSuccess(true)
        toast.success(result.message)
        
        // Refresh the count
        const waitlistRef = collection(db, "waitlist")
        const q = query(waitlistRef)
        const snapshot = await getCountFromServer(q)
        setWaitlistCount(snapshot.data().count)
        
        // Reset success state after 5 seconds
        setTimeout(() => {
          setIsSuccess(false)
        }, 5000)
      } else {
        // Handle different error cases
        if (result.alreadyExists) {
          // Email already exists - show info message instead of error
          toast.info(result.message)
          setEmail("") // Clear the email field
        } else {
          // Other errors - show error message
          throw new Error(result.error || 'Failed to add to waitlist')
        }
      }
      
    } catch (error) {
      console.error("Error adding to waitlist: ", error)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="relative pt-6 pb-6 md:pt-10 md:pb-10 overflow-hidden" style={{ scrollMarginTop: '4rem' }}>
      {/* Subtle background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/30 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Left content */}
          <div className="space-y-4 md:space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Early Access • Be the First</span>
              <ArrowRight className="w-4 h-4 text-primary" />
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-playfair font-bold leading-tight text-balance">
              your little corner of the internet, <span className="text-pink-600 font-extrabold drop-shadow-lg" style={{textShadow: '0 2px 8px #fff0f6, 0 1px 0 #ff69b4'}}>only for two.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty max-w-xl">
              where you and your partner can document and capture all your moments and bond together.
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
            <div className="pt-2 max-w-md">
              <GoogleSignInButton className="w-full h-12" />
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
                        src="/images/bondly-logo.png" 
                        alt="" 
                        width={32} 
                        height={32}
                        className="w-8 h-8"
                      />
                      bondly.fun
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                  <div className="text-center space-y-8">
                    <div className="flex items-center justify-center">
                      <Image 
                        src="/images/bondly-logo.png" 
                        alt="Bondly Logo" 
                        width={480} 
                        height={480}
                        className="w-[28rem] h-[28rem] mt-12"
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">Your private space</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 -mt-4">
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
