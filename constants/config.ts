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
  SERVICE:    "12345678-1234-1234-1234-123456789abc", // 🔄 replace with real UUID
  IMPEDANCE:  "12345678-1234-1234-1234-123456789abd", // 🔄 replace with real UUID
  PHASE_ANGLE:"12345678-1234-1234-1234-123456789abe", // 🔄 replace with real UUID
} as const;

// ─── Assessment ───────────────────────────────────────────────────────────────
export const ASSESSMENT_STEPS = [
  { label: "Reading",    detail: "Capturing impedance signal from ESP32" },
  { label: "Measuring",  detail: "Receiving phase angle data" },
  { label: "Analyzing",  detail: "Running AI analysis on device" },
  { label: "Finalizing", detail: "Preparing your result" },
] as const;

// ─── Statistics dropdowns ─────────────────────────────────────────────────────
export const MONTH_OPTIONS = [
  { label: "January",   value: "january"   },
  { label: "February",  value: "february"  },
  { label: "March",     value: "march"     },
  { label: "April",     value: "april"     },
  { label: "May",       value: "may"       },
  { label: "June",      value: "june"      },
  { label: "July",      value: "july"      },
  { label: "August",    value: "august"    },
  { label: "September", value: "september" },
  { label: "October",   value: "october"   },
  { label: "November",  value: "november"  },
  { label: "December",  value: "december"  },
] as const;

export const YEAR_OPTIONS = [
  { label: "2024", value: "2024" },
  { label: "2025", value: "2025" },
  { label: "2026", value: "2026" },
] as const;