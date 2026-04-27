/**
 * App-wide constants — storage keys, UUIDs, BLE config, static data, colors.
 * Import everything from "@/constants" — no need to reach into sub-files.
 *
 * e.g. import { STORAGE_KEYS, BLE_UUIDS, Colors, ASSESSMENT_STEPS } from "@/constants"
 */

export { Colors } from "./colors";

// ─── AsyncStorage Keys ────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  LAST_DEVICE_ID: "sweeto_last_device_id",
  ONBOARDING_COMPLETE: "sweeto_onboarding_complete",
} as const;

// ─── BLE UUIDs ────────────────────────────────────────────────────────────────
// ⚠️ MUST MATCH YOUR ESP32 FIRMWARE EXACTLY
// Verify with nRF Connect app → check the service UUIDs
export const BLE_UUIDS = {
  SERVICE:    "12345678-1234-1234-1234-1234567890ab", // 🔄 replace with real UUID
  IMPEDANCE:  "abcd1234-5678-90ab-cdef-1234567890ab", // 🔄 replace with real UUID
  PHASE_ANGLE:"abcd1234-5678-90ab-cdef-1234567890ac", // 🔄 replace with real UUID
} as const;

// ─── Assessment ───────────────────────────────────────────────────────────────
export const ASSESSMENT_STEPS = [
  { label: "Reading",    detail: "Capturing impedance signal from ESP32" },
  { label: "Measuring",  detail: "Receiving phase angle data" },
  { label: "Analyzing",  detail: "Running AI analysis on device" },
  { label: "Finalizing", detail: "Preparing your result" },
] as const;


