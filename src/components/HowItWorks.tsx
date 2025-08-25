'use client';

import { motion } from "framer-motion";

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
    <section id="how-it-works" className="py-16" style={{ backgroundColor: 'hsl(54.5, 91.7%, 95.3%)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">How It Works</h2>
          <p className="mt-4 text-xl text-gray-600">
            Create your private space in just a few simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative rounded-2xl p-[2px] bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 group shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="bg-white p-8 h-full rounded-xl transition-all duration-300 hover:bg-pink-50">
                <div className="text-5xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
