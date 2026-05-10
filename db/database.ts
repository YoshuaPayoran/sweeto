import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("sweeto.db");

export function initDatabase() {

  // CREATE NEW TABLE
  db.execSync(`
    CREATE TABLE IF NOT EXISTS measurements (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      datetime      TEXT    NOT NULL,
      variety       TEXT    NOT NULL,
      quality       TEXT    NOT NULL,
      frequency     REAL    NOT NULL,
      impedance_1   REAL    NOT NULL,
      phase_angle_1 REAL    NOT NULL,
      impedance_2   REAL    NOT NULL,
      phase_angle_2 REAL    NOT NULL,
      impedance_3   REAL    NOT NULL,
      phase_angle_3 REAL    NOT NULL,
      remarks       TEXT,
      synced        INTEGER DEFAULT 0
    );
  `);

  console.log("✓ Fresh measurements table created");
}