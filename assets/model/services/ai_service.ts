import { getVarietyModel, VarietyId } from "@/constants/varieties";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import * as ort from "onnxruntime-react-native";

export type InputData = {
  e1Z: number;
  e1Phase: number;
  e2Z: number;
  e2Phase: number;
  e3Z: number;
  e3Phase: number;
};

export type PredictionResult = {
  label: "GOOD" | "POOR" | "ERROR";
  confidence: number;
  rawOutput: number[];
};

let session: ort.InferenceSession | null = null;
let loadedVariety: VarietyId | null = null;

const LABELS = ["GOOD", "POOR"] as const;

// ─── Round input to 2 decimal places ─────────────────────────────────────────

function roundTo2Decimals(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Number(value.toFixed(2));
}

// ─── Copy model to local filesystem ──────────────────────────────────────────

async function copyModelToLocal(modelModule: number, fileName: string) {
  console.log("[AI:COPY] ▶ Starting copyModelToLocal for:", fileName);

  const asset = Asset.fromModule(modelModule);
  await asset.downloadAsync();

  if (!asset.localUri) {
    throw new Error(`[AI:COPY] Missing localUri for ${fileName}`);
  }

  const destinationUri = `${FileSystem.documentDirectory}${fileName}`;

  const existingFile = await FileSystem.getInfoAsync(destinationUri);

  // ─── OPTIONAL: Delete old model if replacing with a new ONNX file ───
//
// Uncomment this block ONLY if:
// - you updated/retrained the ONNX model
// - you changed the model file contents
// - you want to force-refresh cached models
//
// if (existingFile.exists) {
//   await FileSystem.deleteAsync(destinationUri, {
//     idempotent: true,
//   });
//
//   console.log("[AI:COPY] Old model deleted:", destinationUri);
// }

// Copy model only if it does not exist locally
if (!existingFile.exists) {
  await FileSystem.copyAsync({
    from: asset.localUri,
    to: destinationUri,
  });

  console.log("[AI:COPY] Model copied to local storage:", destinationUri);
} else {
  console.log("[AI:COPY] Using cached local model:", destinationUri);
}

  const copiedFile = await FileSystem.getInfoAsync(destinationUri);

  if (!copiedFile.exists) {
    throw new Error(`[AI:COPY] File not found after copy: ${destinationUri}`);
  }

  return destinationUri;
}

// ─── Load ONNX model ──────────────────────────────────────────────────────────

async function loadModel(variety: VarietyId): Promise<ort.InferenceSession> {
  if (session && loadedVariety === variety) {
    return session;
  }

  try {
    const modelInfo = getVarietyModel(variety);

    const localUri = await copyModelToLocal(
      modelInfo.model,
      modelInfo.fileName
    );

    const modelPath = localUri.startsWith("file://")
      ? localUri.slice(7)
      : localUri;

    session = await ort.InferenceSession.create(modelPath, {
      executionProviders: ["cpu"],
    });

    loadedVariety = variety;

    console.log("[AI:LOAD] Model loaded:", variety);
    console.log("[AI:LOAD] Input names:", session.inputNames);
    console.log("[AI:LOAD] Output names:", session.outputNames);

    return session;
  } catch (error) {
    session = null;
    loadedVariety = null;
    throw error;
  }
}

// ─── Parse model output ───────────────────────────────────────────────────────

function getPredictionFromOutput(
  results: Record<string, ort.Tensor>,
  outputNames: readonly string[]
): {
  label: "GOOD" | "POOR";
  confidence: number;
  rawOutput: number[];
} {
  const probabilityKey = outputNames.find(
    (n) =>
      n.toLowerCase().includes("probability") ||
      n.toLowerCase().includes("probabilities") ||
      n.toLowerCase().includes("prob")
  );

  if (!probabilityKey || !results[probabilityKey]) {
    throw new Error("[AI:PARSE] No probability output found.");
  }

  const rawOutput = Array.from(
    results[probabilityKey].data as Iterable<unknown>
  ).map(Number);

  console.log("[AI:PARSE] Raw output:", rawOutput);

  let goodScore = 0;
  let poorScore = 0;

  // ONNX React Native binary RF output case:
  // rawOutput = [-poorScore, poorScore]
  if (rawOutput.length === 2 && rawOutput[0] < 0 && rawOutput[1] >= 0) {
    poorScore = rawOutput[1];
    goodScore = 1 - poorScore;
  } else {
    // Normal probability case:
    // rawOutput = [GOOD, POOR]
    goodScore = rawOutput[0] ?? 0;
    poorScore = rawOutput[1] ?? 0;
  }

  const label = goodScore >= poorScore ? "GOOD" : "POOR";
  const confidence = Math.max(goodScore, poorScore);

  console.log("[AI:PARSE] Scores:", {
    goodScore,
    poorScore,
    label,
    confidence,
  });

  return {
    label,
    confidence,
    rawOutput,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function predictQuality(
  variety: VarietyId,
  data: InputData
): Promise<PredictionResult> {
  try {
    const currentSession = await loadModel(variety);

    const inputName = currentSession.inputNames[0];
    const outputNames = currentSession.outputNames;

    if (!inputName) {
      throw new Error("[AI:PREDICT] Model has no input name.");
    }

    if (!outputNames || outputNames.length === 0) {
      throw new Error("[AI:PREDICT] Model has no output names.");
    }

    const inputArray = Float32Array.from([
      roundTo2Decimals(data.e1Z),
      roundTo2Decimals(data.e1Phase),
      roundTo2Decimals(data.e2Z),
      roundTo2Decimals(data.e2Phase),
      roundTo2Decimals(data.e3Z),
      roundTo2Decimals(data.e3Phase),
    ]);

    console.log("[AI:PREDICT] Rounded input:", Array.from(inputArray));

    const inputTensor = new ort.Tensor("float32", inputArray, [1, 6]);

    const feeds: Record<string, ort.Tensor> = {
      [inputName]: inputTensor,
    };

    const results = await currentSession.run(feeds);

    const prediction = getPredictionFromOutput(results, outputNames);

    console.log("[AI:PREDICT] Final prediction:", prediction);

    return prediction;
  } catch (error: any) {
    console.error("[AI:PREDICT] Failed:", {
      message: error?.message,
      code: error?.code,
      name: error?.name,
    });

    return {
      label: "ERROR",
      confidence: 0,
      rawOutput: [],
    };
  }
}

export async function predictSweetPotatoQuality(
  variety: VarietyId,
  data: InputData
): Promise<"GOOD" | "POOR" | "ERROR"> {
  const result = await predictQuality(variety, data);
  return result.label;
}

export function resetAiSession() {
  session = null;
  loadedVariety = null;
  console.log("[AI] Session reset");
}