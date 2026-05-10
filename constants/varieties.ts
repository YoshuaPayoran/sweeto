/**
 * Sweet potato variety definitions
 * ONNX model assets for each variety
 */

export type VarietyId = "yellow" | "purple" | "orange";

export type Variety = {
  id: VarietyId;
  label: string;
  description: string;
  color: string;
  fileName: string;
  model: number;
};

export const VARIETIES: Variety[] = [
  {
    id: "yellow",
    label: "Yellow",
    description: "Yellow-fleshed sweet potato variety",
    color: "#F59E0B",
    fileName: "yellow_rf_model_v2.onnx",
    model: require("../assets/model/ai_model/yellow_rf_model_v2.onnx"),
  },
  {
    id: "purple",
    label: "Purple",
    description: "Purple-fleshed sweet potato variety",
    color: "#8B5CF6",
    fileName: "purple_rf_model_v2.onnx",
    model: require("../assets/model/ai_model/purple_rf_model_v2.onnx"),
  },
  {
    id: "orange",
    label: "Orange",
    description: "Orange-fleshed sweet potato variety",
    color: "#F97316",
    fileName: "orange_rf_model_v2.onnx",
    model: require("../assets/model/ai_model/orange_rf_model_v2.onnx"),
  },
];

export const DEFAULT_VARIETY: VarietyId = "yellow";

export const VARIETY_STORAGE_KEY = "selected_variety";

export function isValidVarietyId(id: unknown): id is VarietyId {
  return (
    typeof id === "string" &&
    VARIETIES.some((variety) => variety.id === id)
  );
}

export function getVarietyById(id: VarietyId): Variety {
  const variety = VARIETIES.find((v) => v.id === id);

  if (!variety) {
    throw new Error(`Variety "${id}" not found.`);
  }

  return variety;
}

export function getVarietyModel(id: VarietyId): Variety {
  return getVarietyById(id);
}

export function getVarietyColor(id: VarietyId): string {
  return getVarietyById(id).color;
}

export function getVarietyLabel(id: VarietyId): string {
  return getVarietyById(id).label;
}