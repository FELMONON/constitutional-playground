"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Diff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CritiqueResult, CritiqueRound, PrincipleCritique } from "@/types";

interface DiffViewProps {
  original: string;
  revised: string;
}

function DiffView({ original, revised }: DiffViewProps) {
  // Simple word-level diff visualization
  const originalWords = original.split(/(\s+)/);
  const revisedWords = revised.split(/(\s+)/);

  const originalSet = new Set(originalWords.map((w) => w.toLowerCase()));
  const revisedSet = new Set(revisedWords.map((w) => w.toLowerCase()));

  return (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-tertiary)]">
          <span className="w-3 h-3 bg-red-200 dark:bg-red-900/50 rounded" aria-hidden="true" />
          <span>Before</span>
        </div>
        <div className="p-3 bg-[var(--bg-secondary)] rounded-md font-mono text-xs leading-relaxed text-[var(--text-primary)]">
          {originalWords.map((word, i) => (
            <span
              key={i}
              className={cn(
                !revisedSet.has(word.toLowerCase()) &&
                  word.trim() &&
                  "bg-red-200 dark:bg-red-900/50"
              )}
            >
              {word}
            </span>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-tertiary)]">
          <span className="w-3 h-3 bg-green-200 dark:bg-green-900/50 rounded" aria-hidden="true" />
          <span>After</span>
        </div>
        <div className="p-3 bg-[var(--bg-secondary)] rounded-md font-mono text-xs leading-relaxed text-[var(--text-primary)]">
          {revisedWords.map((word, i) => (
            <span
              key={i}
              className={cn(
                !originalSet.has(word.toLowerCase()) &&
                  word.trim() &&
                  "bg-green-200 dark:bg-green-900/50"
              )}
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

interface CritiqueCardProps {
  critique: PrincipleCritique;
}

function CritiqueCard({ critique }: CritiqueCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={cn(
        "border rounded-lg overflow-hidden",
        critique.triggered
          ? "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10"
          : "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10"
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/50 dark:hover:bg-white/5"
      >
        {critique.triggered ? (
          <>
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" aria-hidden="true" />
            <span className="sr-only">Warning:</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" aria-hidden="true" />
            <span className="sr-only">Passed:</span>
          </>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-[var(--text-primary)]">{critique.principle_name}</div>
          {critique.triggered && (
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-[var(--text-tertiary)]">
                Severity:
              </span>
              <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-full">
                {(critique.severity * 100).toFixed(0)}%
              </span>
            </div>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" aria-hidden="true" />
        ) : (
          <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)]" aria-hidden="true" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 border-t border-[var(--border-default)] text-sm space-y-3">
              <div>
                <div className="text-xs font-medium text-[var(--text-tertiary)] mb-1">
                  Critique
                </div>
                <p className="text-[var(--text-secondary)]">
                  {critique.critique_text}
                </p>
              </div>
              {critique.suggestions.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-[var(--text-tertiary)] mb-1">
                    Suggestions
                  </div>
                  <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-1">
                    {critique.suggestions.map((suggestion, i) => (
                      <li key={i}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface RoundVisualizerProps {
  round: CritiqueRound;
  isLast: boolean;
}

function RoundVisualizer({ round, isLast }: RoundVisualizerProps) {
  const [showDiff, setShowDiff] = useState(false);
  const triggeredCount = round.critiques.filter((c) => c.triggered).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative"
    >
      {/* Timeline connector */}
      {!isLast && (
        <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-[var(--border-default)]" />
      )}

      <div className="flex gap-4">
        {/* Round indicator */}
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-default)] flex items-center justify-center">
          <span className="text-lg font-bold text-[var(--text-primary)]">
            {round.round_number + 1}
          </span>
        </div>

        {/* Round content */}
        <div className="flex-1 pb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-medium text-[var(--text-primary)]">Round {round.round_number + 1}</h4>
              <p className="text-sm text-[var(--text-tertiary)]">
                {triggeredCount > 0 ? (
                  <span className="inline-flex items-center gap-1">
                    <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-full">
                      {triggeredCount} triggered
                    </span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                      All satisfied
                    </span>
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--text-tertiary)]">
                Confidence: {(round.confidence * 100).toFixed(0)}%
              </span>
              <button
                onClick={() => setShowDiff(!showDiff)}
                aria-label="Show diff view"
                aria-pressed={showDiff}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  showDiff
                    ? "bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                )}
              >
                <Diff className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Critiques */}
          <div className="space-y-2 mb-4">
            {round.critiques.map((critique, i) => (
              <CritiqueCard key={i} critique={critique} />
            ))}
          </div>

          {/* Diff view */}
          <AnimatePresence>
            {showDiff && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-[var(--bg-secondary)] rounded-lg mb-4">
                  <div className="text-xs font-medium text-[var(--text-tertiary)] mb-3">
                    Changes Made
                  </div>
                  <DiffView
                    original={round.input_response}
                    revised={round.revised_response}
                  />
                  {round.diff_summary && (
                    <p className="mt-3 text-xs text-[var(--text-tertiary)] italic">
                      {round.diff_summary}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

interface CritiqueVisualizerProps {
  result: CritiqueResult | null;
  isLoading?: boolean;
}

export function CritiqueVisualizer({ result, isLoading }: CritiqueVisualizerProps) {
  const [activeTab, setActiveTab] = useState<"rounds" | "summary" | "comparison">(
    "rounds"
  );

  // Keyboard navigation for tabs
  const handleTabKeyDown = useCallback((e: React.KeyboardEvent, currentTab: string) => {
    const tabs = ["rounds", "summary", "comparison"];
    const currentIndex = tabs.indexOf(currentTab);

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const newIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
      setActiveTab(tabs[newIndex] as typeof activeTab);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      const newIndex = currentIndex === tabs.length - 1 ? 0 : currentIndex + 1;
      setActiveTab(tabs[newIndex] as typeof activeTab);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-[var(--text-primary)] border-t-transparent rounded-full"
          aria-hidden="true"
        />
        <p className="text-[var(--text-tertiary)]" role="status">Running constitutional critique...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center h-64 text-[var(--text-tertiary)]">
        <p>Run a critique to see the visualization</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Critique Results</h3>
          <p className="text-sm text-[var(--text-tertiary)]">
            {result.constitution_name} • {result.total_rounds} round
            {result.total_rounds !== 1 && "s"} •{" "}
            <span className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-xs",
              result.converged
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
            )}>
              {result.converged ? "Converged" : "Max rounds reached"}
            </span>
          </p>
        </div>
        <div
          className="flex items-center gap-1 bg-[var(--bg-secondary)] rounded-lg p-1"
          role="tablist"
          aria-label="Result views"
        >
          <button
            role="tab"
            id="tab-rounds"
            aria-selected={activeTab === "rounds"}
            aria-controls="panel-rounds"
            tabIndex={activeTab === "rounds" ? 0 : -1}
            onClick={() => setActiveTab("rounds")}
            onKeyDown={(e) => handleTabKeyDown(e, "rounds")}
            className={cn(
              "px-3 py-1.5 text-sm rounded-md transition-colors",
              activeTab === "rounds"
                ? "bg-[var(--bg-elevated)] shadow-[var(--shadow-sm)] text-[var(--text-primary)]"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            )}
          >
            Rounds
          </button>
          <button
            role="tab"
            id="tab-summary"
            aria-selected={activeTab === "summary"}
            aria-controls="panel-summary"
            tabIndex={activeTab === "summary" ? 0 : -1}
            onClick={() => setActiveTab("summary")}
            onKeyDown={(e) => handleTabKeyDown(e, "summary")}
            className={cn(
              "px-3 py-1.5 text-sm rounded-md transition-colors",
              activeTab === "summary"
                ? "bg-[var(--bg-elevated)] shadow-[var(--shadow-sm)] text-[var(--text-primary)]"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            )}
          >
            Summary
          </button>
          <button
            role="tab"
            id="tab-comparison"
            aria-selected={activeTab === "comparison"}
            aria-controls="panel-comparison"
            tabIndex={activeTab === "comparison" ? 0 : -1}
            onClick={() => setActiveTab("comparison")}
            onKeyDown={(e) => handleTabKeyDown(e, "comparison")}
            className={cn(
              "px-3 py-1.5 text-sm rounded-md transition-colors",
              activeTab === "comparison"
                ? "bg-[var(--bg-elevated)] shadow-[var(--shadow-sm)] text-[var(--text-primary)]"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            )}
          >
            Before/After
          </button>
        </div>
      </div>

      {/* Tabs content */}
      <AnimatePresence mode="wait">
        {activeTab === "rounds" && (
          <motion.div
            key="rounds"
            id="panel-rounds"
            role="tabpanel"
            aria-labelledby="tab-rounds"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="space-y-0">
              {result.rounds.map((round, i) => (
                <RoundVisualizer
                  key={round.round_number}
                  round={round}
                  isLast={i === result.rounds.length - 1}
                />
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "summary" && (
          <motion.div
            key="summary"
            id="panel-summary"
            role="tabpanel"
            aria-labelledby="tab-summary"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-[var(--bg-secondary)] rounded-lg">
                <div className="text-2xl font-bold text-[var(--text-primary)]">{result.total_rounds}</div>
                <div className="text-sm text-[var(--text-tertiary)]">Rounds</div>
              </div>
              <div className="p-4 bg-[var(--bg-secondary)] rounded-lg">
                <div className="text-2xl font-bold text-[var(--text-primary)]">
                  {result.total_principles_triggered.length}
                </div>
                <div className="text-sm text-[var(--text-tertiary)]">Principles Triggered</div>
              </div>
              <div className="p-4 bg-[var(--bg-secondary)] rounded-lg">
                <div className="text-2xl font-bold text-[var(--text-primary)]">
                  {(result.improvement_score * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-[var(--text-tertiary)]">Improvement</div>
              </div>
              <div className="p-4 bg-[var(--bg-secondary)] rounded-lg">
                <div className="text-2xl font-bold text-[var(--text-primary)]">
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-sm",
                    result.converged
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                      : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                  )}>
                    {result.converged ? "Yes" : "No"}
                  </span>
                </div>
                <div className="text-sm text-[var(--text-tertiary)]">Converged</div>
              </div>
            </div>

            {/* Triggered principles */}
            {result.total_principles_triggered.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 text-[var(--text-primary)]">Principles Triggered</h4>
                <div className="flex flex-wrap gap-2">
                  {result.total_principles_triggered.map((principle) => (
                    <span
                      key={principle}
                      className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm"
                    >
                      {principle}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "comparison" && (
          <motion.div
            key="comparison"
            id="panel-comparison"
            role="tabpanel"
            aria-labelledby="tab-comparison"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center gap-4 text-sm text-[var(--text-tertiary)]">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-red-200 dark:bg-red-900/50" aria-hidden="true" /> Removed
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-green-200 dark:bg-green-900/50" aria-hidden="true" /> Added
              </span>
            </div>
            <DiffView original={result.original} revised={result.final} />

            {/* Length comparison */}
            <div className="flex items-center justify-center gap-4 mt-4 text-sm">
              <div className="text-center">
                <div className="text-[var(--text-tertiary)]">Original</div>
                <div className="font-medium text-[var(--text-primary)]">{result.original.length} chars</div>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--text-tertiary)]" aria-hidden="true" />
              <div className="text-center">
                <div className="text-[var(--text-tertiary)]">Final</div>
                <div className="font-medium text-[var(--text-primary)]">{result.final.length} chars</div>
              </div>
              <div className="text-center">
                <div className="text-[var(--text-tertiary)]">Change</div>
                <div
                  className={cn(
                    "font-medium",
                    result.final.length > result.original.length
                      ? "text-green-600"
                      : result.final.length < result.original.length
                        ? "text-red-600"
                        : "text-[var(--text-tertiary)]"
                  )}
                >
                  {result.final.length > result.original.length && "+"}
                  {result.final.length - result.original.length}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
