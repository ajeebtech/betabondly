"use client"

import { UserPlus, Heart, Sparkles } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    title: "Create Your Space",
    description: "Sign up and invite your partner to join your private corner of the internet.",
  },
  {
    icon: Heart,
    title: "Share & Connect",
    description: "Start sharing moments, messages, and memories in your beautifully designed space.",
  },
  {
    icon: Sparkles,
    title: "Grow Together",
    description: "Build a digital archive of your relationship that grows more meaningful over time.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 md:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-balance">
            Simple to start, beautiful to use
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Get started in minutes and create a space that's uniquely yours.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-border" />
              )}

              <div className="relative text-center space-y-4">
                <div className="w-24 h-24 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center relative">
                  <step.icon className="w-10 h-10 text-primary" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
