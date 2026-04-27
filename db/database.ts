import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("sweeto.db");

export function initDatabase() {

  db.execSync(`
    CREATE TABLE IF NOT EXISTS measurements (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      datetime    TEXT    NOT NULL,
      quality     TEXT    NOT NULL,
      impedance   REAL    NOT NULL,
      phase_angle REAL    NOT NULL,
      frequency   REAL    NOT NULL,
      remarks     TEXT,
      synced      INTEGER DEFAULT 0
    );
  `);

  seedSampleData();
}

function seedSampleData() {
  const existing = db.getFirstSync<{ count: number }>(
    `SELECT COUNT(*) as count FROM measurements;`
  );

  // If data already exists, skip seeding
  if (existing && existing.count > 0) return;

  const sampleData = [
    // April 2026 - current month
    { datetime: "2026-04-01T08:30:00.000Z", quality: "good", impedance: 120.45, phase_angle: -23.5, frequency: 1000 },
    { datetime: "2026-04-02T09:15:00.000Z", quality: "poor", impedance: 89.12,  phase_angle: -45.2, frequency: 1000 },
    { datetime: "2026-04-03T10:00:00.000Z", quality: "good", impedance: 115.80, phase_angle: -20.1, frequency: 1000 },
    { datetime: "2026-04-05T11:30:00.000Z", quality: "good", impedance: 130.20, phase_angle: -18.7, frequency: 1000 },
    { datetime: "2026-04-07T14:00:00.000Z", quality: "poor", impedance: 75.60,  phase_angle: -50.3, frequency: 1000 },

    // March 2026
    { datetime: "2026-03-10T08:00:00.000Z", quality: "good", impedance: 118.90, phase_angle: -22.0, frequency: 1000 },
    { datetime: "2026-03-15T09:30:00.000Z", quality: "poor", impedance: 92.30,  phase_angle: -42.5, frequency: 1000 },
    { datetime: "2026-03-20T10:45:00.000Z", quality: "good", impedance: 125.10, phase_angle: -19.8, frequency: 1000 },

    // February 2026
    { datetime: "2026-02-05T08:00:00.000Z", quality: "good", impedance: 122.30, phase_angle: -21.5, frequency: 1000 },
    { datetime: "2026-02-14T13:00:00.000Z", quality: "poor", impedance: 85.40,  phase_angle: -48.1, frequency: 1000 },

    // 2025 data
    { datetime: "2025-12-25T10:00:00.000Z", quality: "good", impedance: 119.50, phase_angle: -20.5, frequency: 1000 },
    { datetime: "2025-11-15T09:00:00.000Z", quality: "poor", impedance: 88.70,  phase_angle: -44.3, frequency: 1000 },
    { datetime: "2025-10-08T11:00:00.000Z", quality: "good", impedance: 127.80, phase_angle: -17.9, frequency: 1000 },
  ];

  for (const row of sampleData) {
    db.runSync(
      `INSERT INTO measurements
        (datetime, quality, impedance, phase_angle, frequency)
        VALUES (?, ?, ?, ?, ?);`,
      [row.datetime, row.quality, row.impedance, row.phase_angle, row.frequency]
    );
  }

  console.log("✅ Sample data seeded successfully");
}