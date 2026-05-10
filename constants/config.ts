/**
 * App-wide constants — storage keys, UUIDs, BLE config, static data, colors.
 * Import everything from "@/constants" — no need to reach into sub-files.
 */

export { Colors } from "./colors";

// ─── AsyncStorage Keys ────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  LAST_DEVICE_ID: "sweeto_last_device_id",
  ONBOARDING_COMPLETE: "sweeto_onboarding_complete",
} as const;

// ─── BLE UUIDs ────────────────────────────────────────────────────────────────
export const BLE_UUIDS = {
  SERVICE: "12345678-1234-1234-1234-1234567890ab",
  COMMAND: "12345678-1234-1234-1234-1234567890ac",
  STATUS: "12345678-1234-1234-1234-1234567890ad",
  RESULT: "12345678-1234-1234-1234-1234567890ae",
} as const;

// ─── Assessment Steps ─────────────────────────────────────────────────────────

export const ASSESSMENT_STEPS = [
  {
    key: "ASSESSMENT_STARTED",
    label: "Assessment Started",
    detail: "Preparing bioimpedance assessment",
    percent: 10,
  },
  {
    key: "APPLYING_SIGNAL",
    label: "Applying AC Signal",
    detail: "Sending 50 kHz AC signal to the sweet potato",
    percent: 25,
  },
  {
    key: "READING_RAW_DATA",
    label: "Reading Raw Data",
    detail: "Collecting real and imaginary values from AD5933",
    percent: 45,
  },
  {
    key: "COMPUTING_IMPEDANCE_PHASE",
    label: "Computing Data",
    detail: "Calculating impedance and phase angle",
    percent: 65,
  },
  {
    key: "AI_ANALYZING_DATA",
    label: "AI Analyzing Data",
    detail: "Classifying sweet potato quality",
    percent: 85,
  },
  {
    key: "FINALIZING_DATA",
    label: "Finalizing Result",
    detail: "Preparing quality label and description",
    percent: 95,
  },
] as const;