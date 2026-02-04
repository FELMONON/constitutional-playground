"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  ChevronLeft,
  GitCompare,
  Plus,
  X,
  Loader2,
  AlertCircle,
  Beaker,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ComparisonChart } from "@/components/ComparisonChart";
import type { Constitution, CompareResult } from "@/types";
import { listConstitutions, compareConstitutions } from "@/lib/api";

// Default constitutions for demo/offline mode
const defaultConstitutions: Constitution[] = [
  {
    id: "anthropic-default-v1",
    name: "Anthropic Default",
    description: "Balanced constitution based on Anthropic's CAI principles",
    principles: [
      {
        id: "harm_avoidance",
        name: "Harm Avoidance",
        description: "Avoid content that could cause harm",
        category: "safety",
        critique_prompt: "Does this response encourage or enable harm?",
        revision_prompt: "Remove harmful content while remaining helpful",
        weight: 1.0,
        enabled: true,
        examples: [],
      },
    ],
    version: "1.0.0",
    author: "Anthropic",
    tags: ["default"],
    is_public: true,
    metadata: {},
  },
  {
    id: "strict-safety-v1",
    name: "Strict Safety",
    description: "Maximum safety, may reduce helpfulness",
    principles: [
      {
        id: "absolute_harm_prevention",
        name: "Absolute Harm Prevention",
        description: "Never provide potentially harmful information",
        category: "safety",
        critique_prompt: "Could any part be used to cause harm?",
        revision_prompt: "Remove ALL potentially harmful information",
        weight: 1.0,
        enabled: true,
        examples: [],
      },
    ],
    version: "1.0.0",
    author: "Playground",
    tags: ["strict"],
    is_public: true,
    metadata: {},
  },
  {
    id: "creative-mode-v1",
    name: "Creative Freedom",
    description: "Optimized for creative writing",
    principles: [
      {
        id: "creative_expression",
        name: "Creative Expression",
        description: "Allow creative freedom in fiction",
        category: "helpfulness",
        critique_prompt: "Is this unnecessarily restricting creativity?",
        revision_prompt: "Engage more fully with creative requests",
        weight: 0.9,
        enabled: true,
        examples: [],
      },
    ],
    version: "1.0.0",
    author: "Playground",
    tags: ["creative"],
    is_public: true,
    metadata: {},
  },
];

const examplePrompts = [
  "How do I pick a lock?",
  "Write a story about a heist",
  "Explain how nuclear reactors work",
  "Help me write a persuasive essay",
  "What are the side effects of aspirin?",
];

export default function LabPage() {
  const [constitutions, setConstitutions] = useState<Constitution[]>(defaultConstitutions);
  const [selectedConstitutions, setSelectedConstitutions] = useState<Constitution[]>([]);
  const [prompt, setPrompt] = useState("");
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [maxRounds, setMaxRounds] = useState(3);

  // Load constitutions from API
  useEffect(() => {
    async function loadConstitutions() {
      try {
        const response = await listConstitutions();
        if (response.constitutions.length > 0) {
          setConstitutions(response.constitutions);
        }
      } catch (err) {
        console.log("Using default constitutions (API unavailable)");
      }
    }
    loadConstitutions();
  }, []);

  const toggleConstitution = useCallback((constitution: Constitution) => {
    setSelectedConstitutions((prev) => {
      const isSelected = prev.some((c) => c.id === constitution.id);
      if (isSelected) {
        return prev.filter((c) => c.id !== constitution.id);
      }
      if (prev.length >= 5) {
        return prev; // Max 5 constitutions
      }
      return [...prev, constitution];
    });
  }, []);

  const handleCompare = useCallback(async () => {
    if (selectedConstitutions.length < 2) {
      setError("Please select at least 2 constitutions to compare");
      return;
    }
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await compareConstitutions({
        prompt: prompt.trim(),
        constitutions: selectedConstitutions,
        max_rounds: maxRounds,
      });
      setCompareResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Comparison failed");
    } finally {
      setIsLoading(false);
    }
  }, [selectedConstitutions, prompt, maxRounds]);

  const canCompare = selectedConstitutions.length >= 2 && prompt.trim();

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--bg-elevated)] border-b border-[var(--border-default)]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <div className="h-6 w-px bg-[var(--border-default)]" />
            <h1 className="text-lg font-semibold flex items-center gap-2 text-[var(--text-primary)]">
              <Beaker className="w-5 h-5 text-green-500" />
              Constitution Lab
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor="max-rounds" className="sr-only">Maximum rounds</label>
            <select
              id="max-rounds"
              value={maxRounds}
              onChange={(e) => setMaxRounds(Number(e.target.value))}
              className="px-3 py-2 border border-[var(--border-default)] rounded-md text-sm bg-[var(--bg-elevated)]"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} round{n > 1 && "s"}
                </option>
              ))}
            </select>
            <button
              onClick={handleCompare}
              disabled={isLoading || !canCompare}
              className={cn(
                "flex items-center gap-2 h-10 px-4 rounded-lg font-medium transition-colors",
                canCompare
                  ? "bg-[var(--text-primary)] hover:bg-[#333] dark:hover:bg-[#e5e5e5] text-[var(--text-inverse)]"
                  : "bg-[var(--border-default)] text-[var(--text-tertiary)] cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <GitCompare className="w-4 h-4" />
              )}
              Compare
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3"
            role="alert"
          >
            <AlertCircle className="w-5 h-5 text-red-500" aria-hidden="true" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700 p-1"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel - Selection */}
          <div className="space-y-6">
            {/* Prompt input */}
            <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)] p-4 shadow-[var(--shadow-sm)]">
              <label htmlFor="test-prompt" className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Test Prompt</label>
              <textarea
                id="test-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter a prompt to test..."
                rows={3}
                className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg bg-[var(--bg-elevated)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] resize-none text-sm focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:border-transparent"
              />

              {/* Example prompts */}
              <div className="mt-3">
                <div className="text-xs font-medium text-[var(--text-tertiary)] mb-2">
                  Example prompts
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {examplePrompts.map((example) => (
                    <button
                      key={example}
                      onClick={() => setPrompt(example)}
                      className="px-3 py-1.5 text-xs bg-[var(--bg-secondary)] hover:bg-[var(--border-default)] rounded transition-colors min-h-[32px]"
                    >
                      {example.slice(0, 25)}...
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Constitution selector */}
            <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)] p-4 shadow-[var(--shadow-sm)]">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-[var(--text-primary)]">
                  Select Constitutions ({selectedConstitutions.length}/5)
                </label>
              </div>

              <div className="space-y-2" role="group" aria-label="Available constitutions">
                {constitutions.map((constitution) => {
                  const isSelected = selectedConstitutions.some(
                    (c) => c.id === constitution.id
                  );
                  return (
                    <button
                      key={constitution.id}
                      onClick={() => toggleConstitution(constitution)}
                      aria-pressed={isSelected}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border transition-colors",
                        isSelected
                          ? "border-[var(--border-focus)] bg-[var(--bg-secondary)]"
                          : "border-[var(--border-default)] hover:border-[var(--text-tertiary)]"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm text-[var(--text-primary)]">
                          {constitution.name}
                        </div>
                        {isSelected ? (
                          <X className="w-4 h-4 text-[var(--text-primary)]" aria-hidden="true" />
                        ) : (
                          <Plus className="w-4 h-4 text-[var(--text-tertiary)]" aria-hidden="true" />
                        )}
                      </div>
                      <div className="text-xs text-[var(--text-tertiary)] mt-1 truncate">
                        {constitution.description}
                      </div>
                      <div className="flex gap-1 mt-2">
                        {constitution.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 text-xs bg-[var(--bg-secondary)] rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right panel - Results */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)] p-6 min-h-[600px] shadow-[var(--shadow-sm)]">
              <ComparisonChart result={compareResult} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
