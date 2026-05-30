// The 5-4-3-2-1 grounding technique — anchors attention in the senses, which
// helps when things feel unreal (derealization/depersonalization).

export interface GroundingStep {
  count: number;
  sense: string;
  prompt: string;
}

export const GROUNDING_STEPS: GroundingStep[] = [
  { count: 5, sense: "see", prompt: "Look around and name 5 things you can see." },
  { count: 4, sense: "feel", prompt: "Notice 4 things you can feel or touch." },
  { count: 3, sense: "hear", prompt: "Listen for 3 things you can hear." },
  { count: 2, sense: "smell", prompt: "Find 2 things you can smell." },
  { count: 1, sense: "taste", prompt: "Notice 1 thing you can taste." },
];
