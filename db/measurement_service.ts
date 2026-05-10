import { db } from "./database";
import { MeasurementRow, NewMeasurement } from "./measurement_type";

// INSERT a new measurement record into the database
export function insertMeasurement(data: NewMeasurement): number {
  const result = db.runSync(
    `INSERT INTO measurements(
      datetime,
      variety,
      quality,
      frequency,
      impedance_1,
      phase_angle_1,
      impedance_2,
      phase_angle_2,
      impedance_3,
      phase_angle_3,
      remarks
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      data.datetime,
      data.variety,
      data.quality,
      data.frequency,
      data.impedance_1,
      data.phase_angle_1,
      data.impedance_2,
      data.phase_angle_2,
      data.impedance_3,
      data.phase_angle_3,
      data.remarks,
    ]
  );

  return Number(result.lastInsertRowId);
}

// FETCH measurements filtered by month and year
// Used in Statistics screen measurement list
export function getMeasurementsByMonthYear(
  month: number,
  year: number,
): MeasurementRow[] {
  return db.getAllSync<MeasurementRow>(
    `SELECT * FROM measurements
     WHERE strftime('%m', datetime) = ?
     AND strftime('%Y', datetime) = ?
     ORDER BY datetime DESC;`,
    [String(month).padStart(2, "0"), String(year)]
  );
}

// FETCH all distinct years that have data + current year
// Used in Statistics screen year dropdown
export function getAvailableYears(): { label: string; value: string }[] {
  const rows = db.getAllSync<{ year: string }>(
    `SELECT DISTINCT strftime('%Y', datetime) as year
     FROM measurements
     ORDER BY year DESC;`
  );

  const currentYear = String(new Date().getFullYear());
  const years = rows.map((r) => r.year);

  // Always include current year even if no data yet
  if (!years.includes(currentYear)) {
    years.unshift(currentYear);
  }

  return years.map((y) => ({ label: y, value: y }));
}

// FETCH available months for a given year
// If current year, only show months up to today
// Used in Statistics screen month dropdown
export function getAvailableMonths(
  year: string
): { label: string; value: string }[] {
  const MONTHS = [
    { label: "January",   value: "01" },
    { label: "February",  value: "02" },
    { label: "March",     value: "03" },
    { label: "April",     value: "04" },
    { label: "May",       value: "05" },
    { label: "June",      value: "06" },
    { label: "July",      value: "07" },
    { label: "August",    value: "08" },
    { label: "September", value: "09" },
    { label: "October",   value: "10" },
    { label: "November",  value: "11" },
    { label: "December",  value: "12" },
  ];

  const currentYear  = String(new Date().getFullYear());
  const currentMonth = new Date().getMonth() + 1;

  // For current year, only show months up to now
  if (year === currentYear) {
    return MONTHS.slice(0, currentMonth);
  }

  // For past years, show all 12 months
  return MONTHS;
}

// FETCH good/poor/total counts for a given month and year
// Used in Statistics screen summary cards and chart
export function getMeasurementStats(
  month: number | null,
  year: number | null
): { good: number; poor: number; total: number } {
  let rows: { quality: string; count: number }[];

  if (month !== null && year !== null) {
    rows = db.getAllSync<{ quality: string; count: number }>(
      `SELECT quality, COUNT(*) as count FROM measurements
       WHERE strftime('%m', datetime) = ?
       AND strftime('%Y', datetime) = ?
       GROUP BY quality;`,
      [String(month).padStart(2, "0"), String(year)]
    );
  } else {
    rows = db.getAllSync<{ quality: string; count: number }>(
      `SELECT quality, COUNT(*) as count FROM measurements
       GROUP BY quality;`
    );
  }

  const good = rows.find((r) => r.quality === "good")?.count ?? 0;
  const poor = rows.find((r) => r.quality === "poor")?.count ?? 0;
  return { good, poor, total: good + poor };
}

// FETCH measurements for the current calendar month
// Used in Home screen TotalScannedCard
export function getCurrentMonthMeasurements(): MeasurementRow[] {
  const now   = new Date();
  const month = now.getMonth() + 1;
  const year  = now.getFullYear();
  return getMeasurementsByMonthYear(month, year);
}