"use client"

import { Heart, Lock, Calendar, MessageCircle, ImageIcon, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: Lock,
    title: "Completely Private",
    description: "End-to-end encrypted. No ads, no algorithms, no third parties. Just you two.",
  },
  {
    icon: MessageCircle,
    title: "Intimate Messaging",
    description: "Share thoughts, feelings, and daily moments in a space designed for meaningful connection.",
  },
  {
    icon: ImageIcon,
    title: "Shared Memories",
    description: "Create beautiful photo albums and collections that tell your unique story together.",
  },
  {
    icon: Calendar,
    title: "Special Moments",
    description: "Never forget anniversaries, date nights, or important milestones with gentle reminders.",
  },
  {
    icon: Heart,
    title: "Love Notes",
    description: "Leave surprise messages and notes for your partner to discover throughout their day.",
  },
  {
    icon: Sparkles,
    title: "Mood Tracking",
    description: "Check in with each other emotionally and stay connected even when apart.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-balance">
            Everything you need to stay close
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Thoughtfully designed features that help couples nurture their relationship in the digital age.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
