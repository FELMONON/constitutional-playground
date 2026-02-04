/**
 * API client for the Constitutional AI Playground backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Principle {
  id: string;
  name: string;
  description: string;
  category: "safety" | "honesty" | "helpfulness" | "ethics" | "custom";
  critique_prompt: string;
  revision_prompt: string;
  weight: number;
  enabled: boolean;
  examples: Array<{ bad?: string; good?: string }>;
}

export interface Constitution {
  id: string;
  name: string;
  description: string;
  principles: Principle[];
  version: string;
  author: string;
  created_at?: string;
  updated_at?: string;
  tags: string[];
  is_public: boolean;
  metadata: Record<string, unknown>;
}

export interface PrincipleCritique {
  principle_id: string;
  principle_name: string;
  triggered: boolean;
  critique_text: string;
  severity: number;
  suggestions: string[];
}

export interface CritiqueRound {
  round_number: number;
  input_response: string;
  critiques: PrincipleCritique[];
  revised_response: string;
  principles_triggered: string[];
  confidence: number;
  diff_summary: string;
}

export interface CritiqueResult {
  original: string;
  final: string;
  prompt: string;
  rounds: CritiqueRound[];
  total_rounds: number;
  constitution_id: string;
  constitution_name: string;
  converged: boolean;
  total_principles_triggered: string[];
  improvement_score: number;
}

export interface CompareResult {
  prompt: string;
  results: CritiqueResult[];
  comparison_metrics: {
    constitution_count: number;
    constitutions: Record<
      string,
      {
        name: string;
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
      }
    >;
    summary: {
      avg_rounds: number;
      avg_improvement_score: number;
      most_principles_triggered: string | null;
      fewest_principles_triggered: string | null;
      fastest_convergence: string | null;
    };
    principle_activation_frequency: Record<string, number>;
  };
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  return response.json();
}

// Constitution endpoints
export async function listConstitutions(): Promise<{
  constitutions: Constitution[];
  total: number;
}> {
  return fetchAPI("/api/constitutions/");
}

export async function getConstitution(id: string): Promise<{
  constitution: Constitution;
}> {
  return fetchAPI(`/api/constitutions/${id}`);
}

export async function createConstitution(data: {
  name: string;
  description: string;
  principles: Principle[];
  author?: string;
  tags?: string[];
}): Promise<{ constitution: Constitution }> {
  return fetchAPI("/api/constitutions/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function forkConstitution(
  id: string,
  newName: string
): Promise<{ constitution: Constitution }> {
  return fetchAPI(`/api/constitutions/${id}/fork?new_name=${encodeURIComponent(newName)}`, {
    method: "POST",
  });
}

// Critique endpoints
export async function runCritique(data: {
  prompt: string;
  response: string;
  constitution: Constitution;
  max_rounds?: number;
  model?: string;
}): Promise<CritiqueResult> {
  return fetchAPI("/api/critique/", {
    method: "POST",
    body: JSON.stringify({
      prompt: data.prompt,
      response: data.response,
      constitution: data.constitution,
      max_rounds: data.max_rounds || 3,
      model: data.model || "claude-sonnet-4-20250514",
    }),
  });
}

export async function runFullPipeline(data: {
  prompt: string;
  constitution: Constitution;
  max_rounds?: number;
  model?: string;
}): Promise<CritiqueResult> {
  return fetchAPI("/api/critique/full-pipeline", {
    method: "POST",
    body: JSON.stringify({
      prompt: data.prompt,
      constitution: data.constitution,
      max_rounds: data.max_rounds || 3,
      model: data.model || "claude-sonnet-4-20250514",
    }),
  });
}

// Compare endpoints
export async function compareConstitutions(data: {
  prompt: string;
  constitutions: Constitution[];
  max_rounds?: number;
  model?: string;
}): Promise<CompareResult> {
  return fetchAPI("/api/compare/", {
    method: "POST",
    body: JSON.stringify({
      prompt: data.prompt,
      constitutions: data.constitutions,
      max_rounds: data.max_rounds || 3,
      model: data.model || "claude-sonnet-4-20250514",
    }),
  });
}

// Health check
export async function checkHealth(): Promise<{
  status: string;
  version: string;
  timestamp: string;
}> {
  return fetchAPI("/health");
}

// Get available models
export async function getAvailableModels(): Promise<{
  models: Array<{
    id: string;
    name: string;
    description: string;
    recommended: boolean;
  }>;
  default: string;
}> {
  return fetchAPI("/api/models");
}

// Streaming event types
export interface StreamEvent {
  type:
    | "generating"
    | "generated"
    | "critiquing"
    | "critiqued"
    | "revising"
    | "revised"
    | "complete"
    | "error";
  message: string;
  round?: number;
  response?: string;
  revised_response?: string;
  critiques?: PrincipleCritique[];
  principles_triggered?: string[];
  result?: CritiqueResult;
  error?: string;
}

// Streaming full pipeline
export async function runFullPipelineStreaming(
  data: {
    prompt: string;
    constitution: Constitution;
    max_rounds?: number;
    model?: string;
  },
  onEvent: (event: StreamEvent) => void
): Promise<void> {
  const url = `${API_BASE_URL}/api/critique/full-pipeline/stream`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.prompt,
      constitution: data.constitution,
      max_rounds: data.max_rounds || 3,
      model: data.model || "claude-sonnet-4-20250514",
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const event = JSON.parse(line.slice(6)) as StreamEvent;
          onEvent(event);
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }
}
