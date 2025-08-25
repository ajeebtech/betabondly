'use client';

import { BackgroundGradient } from "./ui/background-gradient";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const steps = [
  {
    title: "1. Sign Up & Invite",
    description: "Create your account and invite your partner to join your private space.",
    icon: "👋"
  },
  {
    title: "2. Customize Your Space",
    description: "Personalize your shared space with photos, memories, and special dates.",
    icon: "✨"
  },
  {
    title: "3. Start Connecting",
    description: "Share moments, plan dates, and stay connected in your private corner of the internet.",
    icon: "💌"
  },
  {
    title: "4. Grow Together",
    description: "Document your journey and watch your relationship flourish over time.",
    icon: "🌱"
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4">How It Works</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Create your private space in just a few simple steps
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="h-full"
          >
            <BackgroundGradient className="h-full rounded-2xl p-6 bg-white dark:bg-zinc-900">
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
            </BackgroundGradient>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
