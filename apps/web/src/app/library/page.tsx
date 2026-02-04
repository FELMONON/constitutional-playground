"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Library,
  Search,
  Download,
  GitFork,
  Star,
  Shield,
  Eye,
  Heart,
  Scale,
  Sparkles,
  Filter,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Constitution, PrincipleCategory } from "@/types";
import { listConstitutions, forkConstitution } from "@/lib/api";

const categoryConfig: Record<
  PrincipleCategory,
  { icon: React.ElementType; color: string; bgColor: string }
> = {
  safety: { icon: Shield, color: "text-[var(--category-safety)]", bgColor: "bg-red-500/10" },
  honesty: { icon: Eye, color: "text-[var(--category-honesty)]", bgColor: "bg-blue-500/10" },
  helpfulness: { icon: Heart, color: "text-[var(--category-helpfulness)]", bgColor: "bg-green-500/10" },
  ethics: { icon: Scale, color: "text-[var(--category-ethics)]", bgColor: "bg-purple-500/10" },
  custom: { icon: Sparkles, color: "text-amber-500", bgColor: "bg-amber-500/10" },
};

// Default constitutions for demo/offline mode
const defaultConstitutions: Constitution[] = [
  {
    id: "anthropic-default-v1",
    name: "Anthropic Default Constitution",
    description:
      "A balanced constitution based on Anthropic's published Constitutional AI principles, emphasizing safety, honesty, and helpfulness.",
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
      {
        id: "fairness",
        name: "Fairness",
        description: "Avoid bias and stereotypes",
        category: "ethics",
        critique_prompt: "Does this contain unfair bias?",
        revision_prompt: "Remove biased language and present balanced perspectives",
        weight: 0.8,
        enabled: true,
        examples: [],
      },
    ],
    version: "1.0.0",
    author: "Anthropic (adapted)",
    tags: ["default", "balanced", "anthropic"],
    is_public: true,
    metadata: { downloads: 1250 },
  },
  {
    id: "strict-safety-v1",
    name: "Strict Safety Constitution",
    description:
      "A highly conservative constitution that prioritizes safety above all else. Best for high-stakes applications.",
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
      {
        id: "no_dual_use",
        name: "No Dual-Use Information",
        description: "Avoid info with both legitimate and harmful applications",
        category: "safety",
        critique_prompt: "Could this be misused for serious harm?",
        revision_prompt: "Remove dual-use technical details",
        weight: 1.0,
        enabled: true,
        examples: [],
      },
    ],
    version: "1.0.0",
    author: "Constitutional Playground",
    tags: ["strict", "safety-first", "conservative"],
    is_public: true,
    metadata: { downloads: 843 },
  },
  {
    id: "creative-mode-v1",
    name: "Creative Freedom Constitution",
    description:
      "Optimized for creative writing, storytelling, and artistic expression while maintaining core safety.",
    principles: [
      {
        id: "core_safety",
        name: "Core Safety",
        description: "Maintain absolute prohibitions on real-world harm",
        category: "safety",
        critique_prompt: "Does this cross absolute safety lines?",
        revision_prompt: "Remove content crossing safety boundaries",
        weight: 1.0,
        enabled: true,
        examples: [],
      },
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
      {
        id: "character_voice",
        name: "Character Voice Authenticity",
        description: "Maintain authentic character voices in fiction",
        category: "helpfulness",
        critique_prompt: "Are character voices authentic?",
        revision_prompt: "Write characters authentically",
        weight: 0.8,
        enabled: true,
        examples: [],
      },
    ],
    version: "1.0.0",
    author: "Constitutional Playground",
    tags: ["creative", "writing", "fiction", "permissive"],
    is_public: true,
    metadata: { downloads: 672 },
  },
  {
    id: "customer-service-v1",
    name: "Customer Service Constitution",
    description:
      "Optimized for customer service applications. Emphasizes professionalism, empathy, and helpfulness.",
    principles: [
      {
        id: "professional_tone",
        name: "Professional Tone",
        description: "Maintain professional, courteous tone always",
        category: "helpfulness",
        critique_prompt: "Is this maintaining a professional tone?",
        revision_prompt: "Adjust to be more professional and courteous",
        weight: 0.9,
        enabled: true,
        examples: [],
      },
      {
        id: "empathy_first",
        name: "Empathy First",
        description: "Acknowledge feelings before solutions",
        category: "helpfulness",
        critique_prompt: "Does this show appropriate empathy?",
        revision_prompt: "Add empathetic acknowledgment",
        weight: 0.8,
        enabled: true,
        examples: [],
      },
      {
        id: "solution_oriented",
        name: "Solution-Oriented",
        description: "Focus on what CAN be done",
        category: "helpfulness",
        critique_prompt: "Is this focused on solutions?",
        revision_prompt: "Reframe to focus on what can be done",
        weight: 0.8,
        enabled: true,
        examples: [],
      },
    ],
    version: "1.0.0",
    author: "Constitutional Playground",
    tags: ["customer-service", "support", "business", "professional"],
    is_public: true,
    metadata: { downloads: 521 },
  },
];

interface ConstitutionCardProps {
  constitution: Constitution;
  onFork: (constitution: Constitution) => void;
}

function ConstitutionCard({ constitution, onFork }: ConstitutionCardProps) {
  const principleCategories = constitution.principles.reduce(
    (acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(constitution, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${constitution.name.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)] overflow-hidden hover:shadow-[var(--shadow-md)] transition-shadow"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg text-[var(--text-primary)]">{constitution.name}</h3>
            <p className="text-sm text-[var(--text-tertiary)]">by {constitution.author}</p>
          </div>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-4 h-4 fill-current" aria-hidden="true" />
            <span className="text-sm font-medium">
              {(constitution.metadata?.downloads as number) || 0}
            </span>
          </div>
        </div>

        <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">
          {constitution.description}
        </p>

        {/* Principle category breakdown */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(principleCategories).map(([category, count]) => {
            const config = categoryConfig[category as PrincipleCategory];
            if (!config) return null;
            const Icon = config.icon;
            return (
              <div
                key={category}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs",
                  config.bgColor
                )}
              >
                <Icon className={cn("w-3 h-3", config.color)} aria-hidden="true" />
                <span className={config.color}>
                  {count} {category}
                </span>
              </div>
            );
          })}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {constitution.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-[var(--bg-secondary)] text-[var(--text-tertiary)] rounded text-xs"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-[var(--border-default)]">
          <Link
            href={`/playground?constitution=${constitution.id}`}
            className="flex items-center gap-1.5 h-10 px-4 bg-[var(--text-primary)] hover:bg-[#333] dark:hover:bg-[#e5e5e5] text-[var(--text-inverse)] rounded-lg text-sm font-medium transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            Try it
          </Link>
          <button
            onClick={() => onFork(constitution)}
            aria-label={`Fork ${constitution.name}`}
            className="flex items-center gap-1.5 h-10 px-4 border border-[var(--border-default)] hover:border-[var(--text-tertiary)] rounded-lg text-sm font-medium transition-colors"
          >
            <GitFork className="w-3.5 h-3.5" aria-hidden="true" />
            Fork
          </button>
          <button
            onClick={handleExport}
            aria-label={`Export ${constitution.name}`}
            className="flex items-center gap-1.5 h-10 px-4 border border-[var(--border-default)] hover:border-[var(--text-tertiary)] rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            Export
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function LibraryPage() {
  const [constitutions, setConstitutions] =
    useState<Constitution[]>(defaultConstitutions);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      } finally {
        setIsLoading(false);
      }
    }
    loadConstitutions();
  }, []);

  // Get all unique tags
  const allTags = Array.from(
    new Set(constitutions.flatMap((c) => c.tags))
  ).sort();

  // Filter constitutions
  const filteredConstitutions = constitutions.filter((c) => {
    const matchesSearch =
      searchQuery === "" ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => c.tags.includes(tag));

    return matchesSearch && matchesTags;
  });

  const handleFork = async (constitution: Constitution) => {
    const newName = prompt("Enter a name for your forked constitution:", `My ${constitution.name}`);
    if (!newName) return;

    try {
      await forkConstitution(constitution.id, newName);
      alert("Constitution forked! Check your playground.");
    } catch {
      // For demo mode, just show success
      alert("Constitution forked! (Demo mode)");
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

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
              <Library className="w-5 h-5 text-amber-500" />
              Constitution Library
            </h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search and filters */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search constitutions..."
              aria-label="Search constitutions"
              className="w-full pl-10 pr-4 py-3 border border-[var(--border-default)] rounded-lg bg-[var(--bg-elevated)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:border-transparent"
            />
          </div>

          {/* Tags filter */}
          <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Filter by tags">
            <Filter className="w-4 h-4 text-[var(--text-tertiary)]" aria-hidden="true" />
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                aria-pressed={selectedTags.includes(tag)}
                className={cn(
                  "px-3 py-1 rounded-full text-sm transition-colors",
                  selectedTags.includes(tag)
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                    : "bg-[var(--bg-secondary)] text-[var(--text-tertiary)] hover:bg-[var(--border-default)]"
                )}
              >
                {tag}
              </button>
            ))}
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 text-sm text-[var(--text-tertiary)]">
          {filteredConstitutions.length} constitution
          {filteredConstitutions.length !== 1 && "s"} found
        </div>

        {/* Constitution grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 bg-[var(--bg-secondary)] rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConstitutions.map((constitution) => (
              <ConstitutionCard
                key={constitution.id}
                constitution={constitution}
                onFork={handleFork}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredConstitutions.length === 0 && (
          <div className="text-center py-12">
            <Library className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
              No constitutions found
            </h3>
            <p className="text-[var(--text-tertiary)]">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
