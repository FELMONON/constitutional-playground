"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Beaker,
  GitCompare,
  Library,
  ArrowRight,
  Shield,
  Eye,
  Heart,
  Sparkles,
  Github,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: BookOpen,
    title: "Constitution Editor",
    description:
      "Build custom AI constitutions with visual principle builders, templates, and import/export support.",
    href: "/playground",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Beaker,
    title: "Self-Critique Visualizer",
    description:
      "Watch the AI critique and revise in real-time with diff views, round tracking, and convergence graphs.",
    href: "/playground",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: GitCompare,
    title: "Constitution Lab",
    description:
      "A/B test different constitutions on the same prompt with metrics and heat maps.",
    href: "/lab",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    icon: Library,
    title: "Community Library",
    description:
      "Browse, share, and fork community constitutions for different use cases.",
    href: "/library",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
];

const principleCategories = [
  { icon: Shield, name: "Safety", color: "text-red-500" },
  { icon: Eye, name: "Honesty", color: "text-blue-500" },
  { icon: Heart, name: "Helpfulness", color: "text-green-500" },
  { icon: Sparkles, name: "Custom", color: "text-purple-500" },
];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background gradient - warm cream tones */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#faf8f5] via-[var(--bg-primary)] to-[#f5f3f0] dark:from-gray-900 dark:via-gray-900 dark:to-gray-800" />

        {/* Animated circles */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-40 -right-40 w-80 h-80 bg-amber-100/30 dark:bg-blue-500/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -100, 0],
              y: [0, 50, 0],
            }}
            transition={{ duration: 25, repeat: Infinity }}
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-100/30 dark:bg-purple-500/10 rounded-full blur-3xl"
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-28 sm:py-36">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-sm font-medium mb-6 border border-[var(--border-default)]">
              <Sparkles className="w-4 h-4" />
              Explore Constitutional AI
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-[var(--text-primary)]">
              Constitutional AI
              <br />
              Playground
            </h1>

            <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10">
              An interactive platform for experimenting with Constitutional AI
              principles. Define custom AI constitutions, visualize the
              self-critique process, and compare different approaches.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/playground"
                className="flex items-center gap-2 h-12 px-6 bg-[var(--text-primary)] hover:bg-[#333] dark:hover:bg-[#e5e5e5] text-[var(--text-inverse)] rounded-lg font-medium transition-colors"
              >
                Start Building
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/library"
                className="flex items-center gap-2 h-12 px-6 border border-[var(--border-default)] hover:border-[var(--text-tertiary)] rounded-lg font-medium transition-colors"
              >
                Browse Constitutions
              </Link>
            </div>
          </motion.div>

          {/* Principle categories preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-16 flex items-center justify-center gap-4 flex-wrap"
          >
            {principleCategories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-elevated)] rounded-full shadow-[var(--shadow-sm)] border border-[var(--border-default)]"
              >
                <cat.icon className={cn("w-5 h-5", cat.color)} />
                <span className="font-medium text-[var(--text-primary)]">{cat.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 bg-[var(--bg-elevated)]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4 text-[var(--text-primary)]">Explore the Platform</h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
              Everything you need to understand and experiment with
              Constitutional AI
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={feature.href}
                  className="block p-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] hover:shadow-[var(--shadow-md)] transition-shadow group"
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                      feature.bgColor
                    )}
                  >
                    <feature.icon className={cn("w-6 h-6", feature.color)} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 flex items-center gap-2 text-[var(--text-primary)]">
                    {feature.title}
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="text-[var(--text-secondary)]">
                    {feature.description}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4 text-[var(--text-primary)]">How Constitutional AI Works</h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
              Constitutional AI is Anthropic&apos;s approach to training AI systems
              that are helpful, harmless, and honest through self-critique.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: 1,
                title: "Generate",
                description: "AI generates an initial response to a prompt",
              },
              {
                step: 2,
                title: "Critique",
                description:
                  "AI critiques its response against constitutional principles",
              },
              {
                step: 3,
                title: "Revise",
                description: "AI revises the response based on the critique",
              },
              {
                step: 4,
                title: "Repeat",
                description: "Process repeats until the response aligns with the constitution",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-[var(--border-default)] -translate-x-1/2 z-0" />
                )}
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center mx-auto mb-4 shadow-[var(--shadow-sm)]">
                    <span className="text-2xl font-bold text-[var(--text-primary)]">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-[var(--text-primary)]">{item.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-[var(--text-primary)]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4 text-[var(--text-inverse)]">
              Start Experimenting Today
            </h2>
            <p className="text-[var(--text-inverse)]/70 mb-8 max-w-2xl mx-auto">
              Build your own AI constitution, test it against various prompts,
              and see how different principles affect AI behavior.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/playground"
                className="flex items-center gap-2 h-12 px-6 bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-lg font-medium hover:bg-[var(--bg-secondary)] transition-colors"
              >
                Open Playground
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://www.anthropic.com/research/constitutional-ai-harmlessness-from-ai-feedback"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 h-12 px-6 border border-[var(--text-inverse)]/30 text-[var(--text-inverse)] rounded-lg font-medium hover:bg-[var(--text-inverse)]/10 transition-colors"
              >
                Read the Paper
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[var(--border-default)] bg-[var(--bg-primary)]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-[var(--text-tertiary)]">
            Constitutional AI Playground - An educational tool for AI safety research
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              aria-label="View on GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://www.anthropic.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            >
              Based on Anthropic Research
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
