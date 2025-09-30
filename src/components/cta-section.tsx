"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  const [email, setEmail] = useState("")

  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-balance">
            Ready to create your private corner?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground text-pretty">
            Join thousands of couples building something beautiful together. Get early access when we launch.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-12 bg-card"
            />
            <Button size="lg" className="h-12 px-8 whitespace-nowrap">
              Get Early Access
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">No credit card required • Launch in early 2025</p>
        </div>
      </div>
    </section>
  )
}
