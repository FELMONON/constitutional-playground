"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Shield,
  Eye,
  Heart,
  Scale,
  Sparkles,
  Save,
  Download,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Constitution, Principle, PrincipleCategory } from "@/types";

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

interface PrincipleCardProps {
  principle: Principle;
  onUpdate: (updated: Principle) => void;
  onDelete: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function PrincipleCard({
  principle,
  onUpdate,
  onDelete,
  isExpanded,
  onToggleExpand,
}: PrincipleCardProps) {
  const config = categoryConfig[principle.category];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "border rounded-lg overflow-hidden",
        principle.enabled ? "border-[var(--border-default)]" : "border-[var(--bg-secondary)] opacity-60"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center gap-3 p-3 cursor-pointer hover:bg-[var(--bg-secondary)]/50",
          config.bgColor
        )}
        onClick={onToggleExpand}
      >
        <GripVertical className="w-4 h-4 text-[var(--text-tertiary)] cursor-grab" aria-hidden="true" />
        <Icon className={cn("w-5 h-5", config.color)} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate text-[var(--text-primary)]">{principle.name}</h4>
          <p className="text-xs text-[var(--text-tertiary)] truncate">{principle.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              role="switch"
              aria-checked={principle.enabled}
              aria-label={`${principle.enabled ? 'Disable' : 'Enable'} ${principle.name}`}
              checked={principle.enabled}
              onChange={(e) => {
                e.stopPropagation();
                onUpdate({ ...principle, enabled: e.target.checked });
              }}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-[var(--border-default)] peer-focus-visible:outline-2 peer-focus-visible:outline-[var(--border-focus)] peer-focus-visible:outline-offset-2 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-[var(--border-default)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--text-primary)]"></div>
          </label>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" aria-hidden="true" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)]" aria-hidden="true" />
          )}
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4 bg-[var(--bg-elevated)] border-t border-[var(--border-default)]">
              {/* Name */}
              <div>
                <label htmlFor={`principle-name-${principle.id}`} className="block text-xs font-medium text-[var(--text-tertiary)] mb-1">
                  Principle Name
                </label>
                <input
                  id={`principle-name-${principle.id}`}
                  type="text"
                  value={principle.name}
                  onChange={(e) => onUpdate({ ...principle, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[var(--border-default)] rounded-md bg-[var(--bg-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor={`principle-desc-${principle.id}`} className="block text-xs font-medium text-[var(--text-tertiary)] mb-1">
                  Description
                </label>
                <textarea
                  id={`principle-desc-${principle.id}`}
                  value={principle.description}
                  onChange={(e) => onUpdate({ ...principle, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-[var(--border-default)] rounded-md bg-[var(--bg-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:border-transparent"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor={`principle-category-${principle.id}`} className="block text-xs font-medium text-[var(--text-tertiary)] mb-1">
                  Category
                </label>
                <select
                  id={`principle-category-${principle.id}`}
                  value={principle.category}
                  onChange={(e) =>
                    onUpdate({ ...principle, category: e.target.value as PrincipleCategory })
                  }
                  className="w-full px-3 py-2 text-sm border border-[var(--border-default)] rounded-md bg-[var(--bg-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:border-transparent"
                >
                  <option value="safety">Safety</option>
                  <option value="honesty">Honesty</option>
                  <option value="helpfulness">Helpfulness</option>
                  <option value="ethics">Ethics</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {/* Weight */}
              <div>
                <label htmlFor={`principle-weight-${principle.id}`} className="block text-xs font-medium text-[var(--text-tertiary)] mb-1">
                  Weight: {principle.weight.toFixed(1)}
                </label>
                <input
                  id={`principle-weight-${principle.id}`}
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={principle.weight}
                  onChange={(e) =>
                    onUpdate({ ...principle, weight: parseFloat(e.target.value) })
                  }
                  className="w-full"
                  aria-valuemin={0}
                  aria-valuemax={1}
                  aria-valuenow={principle.weight}
                />
              </div>

              {/* Critique Prompt */}
              <div>
                <label htmlFor={`principle-critique-${principle.id}`} className="block text-xs font-medium text-[var(--text-tertiary)] mb-1">
                  Critique Prompt
                </label>
                <textarea
                  id={`principle-critique-${principle.id}`}
                  value={principle.critique_prompt}
                  onChange={(e) =>
                    onUpdate({ ...principle, critique_prompt: e.target.value })
                  }
                  rows={2}
                  placeholder="The question the AI asks itself when critiquing..."
                  className="w-full px-3 py-2 text-sm border border-[var(--border-default)] rounded-md bg-[var(--bg-elevated)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:border-transparent"
                />
              </div>

              {/* Revision Prompt */}
              <div>
                <label htmlFor={`principle-revision-${principle.id}`} className="block text-xs font-medium text-[var(--text-tertiary)] mb-1">
                  Revision Prompt
                </label>
                <textarea
                  id={`principle-revision-${principle.id}`}
                  value={principle.revision_prompt}
                  onChange={(e) =>
                    onUpdate({ ...principle, revision_prompt: e.target.value })
                  }
                  rows={2}
                  placeholder="Instructions for how to revise if this principle is violated..."
                  className="w-full px-3 py-2 text-sm border border-[var(--border-default)] rounded-md bg-[var(--bg-elevated)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:border-transparent"
                />
              </div>

              {/* Delete button */}
              <div className="pt-2 border-t border-[var(--border-default)]">
                <button
                  onClick={onDelete}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                  Delete Principle
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface ConstitutionEditorProps {
  constitution: Constitution | null;
  onChange: (constitution: Constitution) => void;
  onSave?: (constitution: Constitution) => void;
}

export function ConstitutionEditor({
  constitution,
  onChange,
  onSave,
}: ConstitutionEditorProps) {
  const [expandedPrinciple, setExpandedPrinciple] = useState<string | null>(null);

  const handlePrincipleUpdate = useCallback(
    (index: number, updated: Principle) => {
      if (!constitution) return;
      const newPrinciples = [...constitution.principles];
      newPrinciples[index] = updated;
      onChange({ ...constitution, principles: newPrinciples });
    },
    [constitution, onChange]
  );

  const handlePrincipleDelete = useCallback(
    (index: number) => {
      if (!constitution) return;
      const newPrinciples = constitution.principles.filter((_, i) => i !== index);
      onChange({ ...constitution, principles: newPrinciples });
    },
    [constitution, onChange]
  );

  const handleAddPrinciple = useCallback(() => {
    if (!constitution) return;
    const newPrinciple: Principle = {
      id: `custom-${Date.now()}`,
      name: "New Principle",
      description: "Describe what this principle enforces",
      category: "custom",
      critique_prompt: "Does this response violate this principle?",
      revision_prompt: "Revise to comply with this principle.",
      weight: 1.0,
      enabled: true,
      examples: [],
    };
    onChange({
      ...constitution,
      principles: [...constitution.principles, newPrinciple],
    });
    setExpandedPrinciple(newPrinciple.id);
  }, [constitution, onChange]);

  const handleExport = useCallback(() => {
    if (!constitution) return;
    const blob = new Blob([JSON.stringify(constitution, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${constitution.name.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [constitution]);

  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const imported = JSON.parse(text) as Constitution;
        onChange(imported);
      } catch {
        alert("Invalid constitution file");
      }
    };
    input.click();
  }, [onChange]);

  if (!constitution) {
    return (
      <div className="flex items-center justify-center h-64 text-[var(--text-tertiary)]">
        <p>Select or create a constitution to edit</p>
      </div>
    );
  }

  const principlesByCategory = constitution.principles.reduce(
    (acc, principle) => {
      if (!acc[principle.category]) {
        acc[principle.category] = [];
      }
      acc[principle.category].push(principle);
      return acc;
    },
    {} as Record<PrincipleCategory, Principle[]>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <label htmlFor="constitution-name" className="sr-only">Constitution name</label>
          <input
            id="constitution-name"
            type="text"
            value={constitution.name}
            onChange={(e) => onChange({ ...constitution, name: e.target.value })}
            className="text-xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 w-full text-[var(--text-primary)]"
            placeholder="Constitution Name"
          />
          <label htmlFor="constitution-desc" className="sr-only">Constitution description</label>
          <textarea
            id="constitution-desc"
            value={constitution.description}
            onChange={(e) => onChange({ ...constitution, description: e.target.value })}
            placeholder="Describe what this constitution is for..."
            className="mt-1 text-sm text-[var(--text-secondary)] bg-transparent border-none focus:outline-none focus:ring-0 w-full resize-none"
            rows={2}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleImport}
            className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-md"
            aria-label="Import constitution"
          >
            <Upload className="w-5 h-5" aria-hidden="true" />
          </button>
          <button
            onClick={handleExport}
            className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-md"
            aria-label="Export constitution"
          >
            <Download className="w-5 h-5" aria-hidden="true" />
          </button>
          {onSave && (
            <button
              onClick={() => onSave(constitution)}
              className="flex items-center gap-2 h-10 px-4 bg-[var(--text-primary)] text-[var(--text-inverse)] rounded-md hover:bg-[#333] dark:hover:bg-[#e5e5e5]"
            >
              <Save className="w-4 h-4" aria-hidden="true" />
              Save
            </button>
          )}
        </div>
      </div>

      {/* Principles by category */}
      <div className="space-y-6">
        {(Object.keys(categoryConfig) as PrincipleCategory[]).map((category) => {
          const principles = principlesByCategory[category] || [];
          const config = categoryConfig[category];
          const Icon = config.icon;

          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className={cn("w-5 h-5", config.color)} aria-hidden="true" />
                <h3 className="font-medium capitalize text-[var(--text-primary)]">{category}</h3>
                <span className="text-xs text-[var(--text-tertiary)]">({principles.length})</span>
              </div>

              <div className="space-y-2">
                <AnimatePresence>
                  {principles.map((principle) => {
                    const index = constitution.principles.findIndex(
                      (p) => p.id === principle.id
                    );
                    return (
                      <PrincipleCard
                        key={principle.id}
                        principle={principle}
                        onUpdate={(updated) => handlePrincipleUpdate(index, updated)}
                        onDelete={() => handlePrincipleDelete(index)}
                        isExpanded={expandedPrinciple === principle.id}
                        onToggleExpand={() =>
                          setExpandedPrinciple(
                            expandedPrinciple === principle.id ? null : principle.id
                          )
                        }
                      />
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add principle button */}
      <button
        onClick={handleAddPrinciple}
        className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-[var(--border-default)] rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:border-[var(--text-tertiary)] transition-colors"
      >
        <Plus className="w-5 h-5" aria-hidden="true" />
        Add Principle
      </button>
    </div>
  );
}
