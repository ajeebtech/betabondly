"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
  {
    quote:
      "Finally, a place where we can be ourselves without worrying about likes or comments. It's like our own little world.",
    author: "Sarah & Michael",
    location: "San Francisco, CA",
  },
  {
    quote:
      "The privacy and intimacy of Ondly has brought us closer together. We love having our own space away from social media.",
    author: "Emma & James",
    location: "London, UK",
  },
  {
    quote:
      "It's become our daily ritual to check in and share moments. Ondly feels like a digital love letter we write together.",
    author: "Alex & Jordan",
    location: "Toronto, CA",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-balance">Loved by couples everywhere</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            See what couples are saying about their private space on Ondly.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border/50">
              <CardContent className="p-6 space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground leading-relaxed italic">"{testimonial.quote}"</p>
                <div className="pt-4 border-t border-border">
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
