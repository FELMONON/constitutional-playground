import type {
  Principle,
  Constitution,
  PrincipleCritique,
  CritiqueRound,
  CritiqueResult,
  CompareResult,
} from "@/lib/api";

export type {
  Principle,
  Constitution,
  PrincipleCritique,
  CritiqueRound,
  CritiqueResult,
  CompareResult,
};

export type PrincipleCategory = "safety" | "honesty" | "helpfulness" | "ethics" | "custom";

export interface EditorState {
  constitution: Constitution | null;
  isDirty: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface CritiqueState {
  isRunning: boolean;
  result: CritiqueResult | null;
  error: string | null;
  currentRound: number;
}

export interface CompareState {
  isRunning: boolean;
  result: CompareResult | null;
  error: string | null;
  selectedConstitutions: Constitution[];
}
