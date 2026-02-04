"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  ChevronLeft,
  Settings,
  BookOpen,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConstitutionEditor } from "@/components/ConstitutionEditor";
import { CritiqueVisualizer } from "@/components/CritiqueVisualizer";
import type { Constitution, CritiqueResult } from "@/types";
import { listConstitutions, runFullPipeline, runCritique } from "@/lib/api";

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
      {
        id: "truthfulness",
        name: "Truthfulness",
        description: "Only make claims believed to be true",
        category: "honesty",
        critique_prompt: "Does this contain false or misleading claims?",
        revision_prompt: "Correct false claims and add uncertainty where needed",
        weight: 0.9,
        enabled: true,
        examples: [],
      },
      {
        id: "task_completion",
        name: "Task Completion",
        description: "Actually address the user's request",
        category: "helpfulness",
        critique_prompt: "Does this actually help with what was asked?",
        revision_prompt: "Make the response more directly helpful",
        weight: 0.8,
        enabled: true,
        examples: [],
      },
    ],
    version: "1.0.0",
    author: "Anthropic (adapted)",
    tags: ["default", "balanced"],
    is_public: true,
    metadata: {},
  },
];

export default function PlaygroundPage() {
  const [constitutions, setConstitutions] = useState<Constitution[]>(defaultConstitutions);
  const [selectedConstitution, setSelectedConstitution] = useState<Constitution | null>(
    defaultConstitutions[0]
  );
  const [prompt, setPrompt] = useState("");
  const [customResponse, setCustomResponse] = useState("");
  const [useCustomResponse, setUseCustomResponse] = useState(false);
  const [critiqueResult, setCritiqueResult] = useState<CritiqueResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<"editor" | "results">("editor");
  const [maxRounds, setMaxRounds] = useState(3);
  const [showSettings, setShowSettings] = useState(false);

  // Load constitutions from API
  useEffect(() => {
    async function loadConstitutions() {
      try {
        const response = await listConstitutions();
        if (response.constitutions.length > 0) {
          setConstitutions(response.constitutions);
          setSelectedConstitution(response.constitutions[0]);
        }
      } catch (err) {
        console.log("Using default constitutions (API unavailable)");
      }
    }
    loadConstitutions();
  }, []);

  const handleRunCritique = useCallback(async () => {
    if (!selectedConstitution || !prompt.trim()) {
      setError("Please enter a prompt and select a constitution");
      return;
    }

    setIsLoading(true);
    setError(null);
    setActivePanel("results");

    try {
      let result: CritiqueResult;

      if (useCustomResponse && customResponse.trim()) {
        // Run critique on custom response
        result = await runCritique({
          prompt: prompt.trim(),
          response: customResponse.trim(),
          constitution: selectedConstitution,
          max_rounds: maxRounds,
        });
      } else {
        // Run full pipeline (generate + critique)
        result = await runFullPipeline({
          prompt: prompt.trim(),
          constitution: selectedConstitution,
          max_rounds: maxRounds,
        });
      }

      setCritiqueResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run critique");
    } finally {
      setIsLoading(false);
    }
  }, [selectedConstitution, prompt, customResponse, useCustomResponse, maxRounds]);

  const handleConstitutionChange = useCallback((updated: Constitution) => {
    setSelectedConstitution(updated);
  }, []);

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
              <Sparkles className="w-5 h-5 text-blue-500" />
              Playground
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              aria-label="Toggle settings"
              aria-expanded={showSettings}
              className={cn(
                "p-2 rounded-lg transition-colors",
                showSettings
                  ? "bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                  : "text-[var(--text-tertiary)] hover:bg-[var(--bg-secondary)]"
              )}
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={handleRunCritique}
              disabled={isLoading || !prompt.trim()}
              className="flex items-center gap-2 h-10 px-4 bg-[var(--text-primary)] hover:bg-[#333] dark:hover:bg-[#e5e5e5] disabled:bg-[var(--border-default)] disabled:text-[var(--text-tertiary)] text-[var(--text-inverse)] rounded-lg font-medium transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Run Critique
            </button>
          </div>
        </div>

        {/* Settings panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-[var(--border-default)]"
            >
              <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center gap-6">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1">
                    Max Rounds
                  </label>
                  <select
                    value={maxRounds}
                    onChange={(e) => setMaxRounds(Number(e.target.value))}
                    className="px-3 py-1.5 border border-[var(--border-default)] rounded-md text-sm bg-[var(--bg-elevated)]"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} round{n > 1 && "s"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      role="switch"
                      aria-checked={useCustomResponse}
                      checked={useCustomResponse}
                      onChange={(e) => setUseCustomResponse(e.target.checked)}
                      className="rounded border-[var(--border-default)] text-[var(--text-primary)]"
                    />
                    <span className="text-sm text-[var(--text-secondary)]">Use custom response</span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
          </motion.div>
        )}

        {/* Prompt input */}
        <div className="mb-6">
          <label htmlFor="test-prompt" className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Test Prompt</label>
          <textarea
            id="test-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a prompt to test with your constitution..."
            rows={3}
            className="w-full px-4 py-3 border border-[var(--border-default)] rounded-lg bg-[var(--bg-elevated)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:border-transparent"
          />
        </div>

        {/* Custom response input */}
        <AnimatePresence>
          {useCustomResponse && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 overflow-hidden"
            >
              <label htmlFor="custom-response" className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
                Custom Response to Critique
              </label>
              <textarea
                id="custom-response"
                value={customResponse}
                onChange={(e) => setCustomResponse(e.target.value)}
                placeholder="Enter a response to critique (instead of generating one)..."
                rows={4}
                className="w-full px-4 py-3 border border-[var(--border-default)] rounded-lg bg-[var(--bg-elevated)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:border-transparent"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Constitution selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Constitution</label>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Select a constitution">
            {constitutions.map((constitution) => (
              <button
                key={constitution.id}
                role="radio"
                aria-checked={selectedConstitution?.id === constitution.id}
                onClick={() => setSelectedConstitution(constitution)}
                className={cn(
                  "px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                  selectedConstitution?.id === constitution.id
                    ? "border-[var(--border-focus)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                    : "border-[var(--border-default)] hover:border-[var(--text-tertiary)]"
                )}
              >
                {constitution.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex items-center gap-1 mb-6 bg-[var(--bg-secondary)] rounded-lg p-1 w-fit"
          role="tablist"
          aria-label="Playground views"
        >
          <button
            role="tab"
            aria-selected={activePanel === "editor"}
            aria-controls="panel-editor"
            id="tab-editor"
            onClick={() => setActivePanel("editor")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
              activePanel === "editor"
                ? "bg-[var(--bg-elevated)] shadow-[var(--shadow-sm)] text-[var(--text-primary)]"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            )}
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            Constitution Editor
          </button>
          <button
            role="tab"
            aria-selected={activePanel === "results"}
            aria-controls="panel-results"
            id="tab-results"
            onClick={() => setActivePanel("results")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
              activePanel === "results"
                ? "bg-[var(--bg-elevated)] shadow-[var(--shadow-sm)] text-[var(--text-primary)]"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            )}
          >
            <Play className="w-4 h-4" aria-hidden="true" />
            Results
            {critiqueResult && (
              <span className="px-2 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs rounded-full">
                Ready
              </span>
            )}
          </button>
        </div>

        {/* Panel content */}
        <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)] p-6 shadow-[var(--shadow-sm)]">
          <AnimatePresence mode="wait">
            {activePanel === "editor" ? (
              <motion.div
                key="editor"
                id="panel-editor"
                role="tabpanel"
                aria-labelledby="tab-editor"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <ConstitutionEditor
                  constitution={selectedConstitution}
                  onChange={handleConstitutionChange}
                />
              </motion.div>
            ) : (
              <motion.div
                key="results"
                id="panel-results"
                role="tabpanel"
                aria-labelledby="tab-results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <CritiqueVisualizer result={critiqueResult} isLoading={isLoading} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
