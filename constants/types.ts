/**
 * Shared TypeScript types used across hooks, contexts, and components.
 */

export type AssessmentResult = {
  quality: "good" | "poor";
  impedanceMagnitude: number;
  phaseAngle: number;
};

export type AssessmentStatus =
  | "idle"
  | "not_connected"
  | "processing"
  | "done"
  | "error";

export type Measurement = {
  id: string;
  quality: "good" | "poor";
  impedanceMagnitude: number;
  phaseAngle: number;
  frequency: number;
  datetime: string;
};