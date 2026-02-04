"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Eye,
  Heart,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CompareResult } from "@/types";

interface MetricBarProps {
  label: string;
  value: number;
  color: string;
  icon: React.ElementType;
}

function MetricBar({ label, value, color, icon: Icon }: MetricBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
          <Icon className={cn("w-4 h-4", color)} aria-hidden="true" />
          {label}
        </span>
        <span className="font-medium text-[var(--text-primary)]">{(value * 100).toFixed(0)}%</span>
      </div>
      <div
        className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(value * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${(value * 100).toFixed(0)}%`}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={cn("h-full rounded-full", color.replace("text-", "bg-"))}
        />
      </div>
    </div>
  );
}

interface ConstitutionComparisonCardProps {
  name: string;
  data: {
    total_rounds: number;
    converged: boolean;
    improvement_score: number;
    principles_triggered: string[];
    principles_triggered_count: number;
    scores?: {
      safety_score: number;
      helpfulness_score: number;
      honesty_score: number;
    };
  };
  isWinner?: boolean;
}

function ConstitutionComparisonCard({
  name,
  data,
  isWinner,
}: ConstitutionComparisonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-5 rounded-xl border shadow-[var(--shadow-sm)]",
        isWinner
          ? "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10"
          : "border-[var(--border-default)] bg-[var(--bg-elevated)]"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-[var(--text-primary)]">{name}</h4>
        {isWinner && (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
            <CheckCircle className="w-3 h-3" aria-hidden="true" />
            Best
          </span>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="text-center p-2 bg-[var(--bg-secondary)] rounded-lg">
          <div className="text-lg font-bold text-[var(--text-primary)]">{data.total_rounds}</div>
          <div className="text-xs text-[var(--text-tertiary)]">Rounds</div>
        </div>
        <div className="text-center p-2 bg-[var(--bg-secondary)] rounded-lg">
          <div className="text-lg font-bold text-[var(--text-primary)]">{data.principles_triggered_count}</div>
          <div className="text-xs text-[var(--text-tertiary)]">Triggered</div>
        </div>
        <div className="text-center p-2 bg-[var(--bg-secondary)] rounded-lg">
          <div className="text-lg font-bold">
            <span className={cn(
              "inline-flex items-center px-1.5 py-0.5 rounded text-sm",
              data.converged
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
            )}>
              {data.converged ? "Yes" : "No"}
            </span>
          </div>
          <div className="text-xs text-[var(--text-tertiary)]">Converged</div>
        </div>
      </div>

      {/* Score bars */}
      {data.scores && (
        <div className="space-y-3">
          <MetricBar
            label="Safety"
            value={data.scores.safety_score}
            color="text-[var(--category-safety)]"
            icon={Shield}
          />
          <MetricBar
            label="Helpfulness"
            value={data.scores.helpfulness_score}
            color="text-[var(--category-helpfulness)]"
            icon={Heart}
          />
          <MetricBar
            label="Honesty"
            value={data.scores.honesty_score}
            color="text-[var(--category-honesty)]"
            icon={Eye}
          />
        </div>
      )}

      {/* Triggered principles */}
      {data.principles_triggered.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--border-default)]">
          <div className="text-xs font-medium text-[var(--text-tertiary)] mb-2">
            Triggered Principles
          </div>
          <div className="flex flex-wrap gap-1">
            {data.principles_triggered.map((p) => (
              <span
                key={p}
                className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

interface ComparisonChartProps {
  result: CompareResult | null;
  isLoading?: boolean;
}

export function ComparisonChart({ result, isLoading }: ComparisonChartProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-[var(--text-primary)] border-t-transparent rounded-full"
          aria-hidden="true"
        />
        <p className="text-[var(--text-tertiary)]" role="status">Comparing constitutions...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center h-64 text-[var(--text-tertiary)]">
        <p>Select constitutions and run a comparison</p>
      </div>
    );
  }

  const { comparison_metrics, results } = result;
  const { summary, constitutions } = comparison_metrics;

  // Determine the "winner" (fewest principles triggered, fastest convergence)
  const winnerName = summary.fewest_principles_triggered || summary.fastest_convergence;

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[var(--bg-secondary)] rounded-lg shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-[var(--text-tertiary)]" aria-hidden="true" />
            <span className="text-sm text-[var(--text-tertiary)]">Avg Rounds</span>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">{summary.avg_rounds.toFixed(1)}</div>
        </div>
        <div className="p-4 bg-[var(--bg-secondary)] rounded-lg shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-[var(--text-tertiary)]" aria-hidden="true" />
            <span className="text-sm text-[var(--text-tertiary)]">Avg Improvement</span>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">
            {(summary.avg_improvement_score * 100).toFixed(0)}%
          </div>
        </div>
        <div className="p-4 bg-[var(--bg-secondary)] rounded-lg shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-[var(--text-tertiary)]" aria-hidden="true" />
            <span className="text-sm text-[var(--text-tertiary)]">Fastest</span>
          </div>
          <div className="text-lg font-bold truncate text-[var(--text-primary)]">
            {summary.fastest_convergence || "N/A"}
          </div>
        </div>
        <div className="p-4 bg-[var(--bg-secondary)] rounded-lg shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-[var(--text-tertiary)]" aria-hidden="true" />
            <span className="text-sm text-[var(--text-tertiary)]">Most Strict</span>
          </div>
          <div className="text-lg font-bold truncate text-[var(--text-primary)]">
            {summary.most_principles_triggered || "N/A"}
          </div>
        </div>
      </div>

      {/* Constitution cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(constitutions).map(([id, data]) => (
          <ConstitutionComparisonCard
            key={id}
            name={data.name}
            data={data}
            isWinner={data.name === winnerName}
          />
        ))}
      </div>

      {/* Prompt */}
      <div className="p-4 bg-[var(--bg-secondary)] rounded-lg shadow-[var(--shadow-sm)]">
        <div className="text-sm font-medium text-[var(--text-tertiary)] mb-2">Test Prompt</div>
        <p className="text-[var(--text-secondary)]">{result.prompt}</p>
      </div>

      {/* Side-by-side outputs */}
      <div>
        <h4 className="font-medium mb-3 text-[var(--text-primary)]">Final Outputs Comparison</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((r) => (
            <div
              key={r.constitution_id}
              className="p-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg shadow-[var(--shadow-sm)]"
            >
              <div className="text-sm font-medium text-[var(--text-tertiary)] mb-2">
                {r.constitution_name}
              </div>
              <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
                {r.final}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
