
import { db } from "./database";
import { MeasurementRow, NewMeasurement } from "./measurement_type";

// INSERT DATA FUNCTION 
export function insertMeasurement (data: NewMeasurement) : number {
  const result = db.runSync(
    `
      INSERT INTO measurements(
        datetime,
        quality,
        impedance,
        phase_angle,
        frequency,
        remarks
      )VALUES (?, ?, ?, ?, ?, ?);
    `,
    [
      data.datetime,
      data.quality,
      data.impedance,
      data.phase_angle,
      data.frequency,
      data.remarks ?? null,
    ]
  );

  return result.lastInsertRowId
}

export function getMeasurementsByMonthYear(
  month: number,
  year: number,
): MeasurementRow[] {
  return db.getAllSync<MeasurementRow>(
    `
      SELECT * FROM measurements
      WHERE strftime('%m', datetime) = ?
      AND strftime('%Y', datetime) = ?
      ORDER BY datetime DESC;
    `,
    [String(month).padStart(2, "0"), String(year)]
  )
}

export function getAvailableYears(): { label: string; value: string }[] {
  const rows = db.getAllSync<{ year: string }>(
    `
      SELECT DISTINCT strftime('%Y', datetime) as year 
      FROM measurements 
      ORDER BY year DESC;
    `
  );

  const currentYear = String(new Date().getFullYear());

  const years = rows.map((r) => r.year);
  if (!years.includes(currentYear)) {
    years.unshift(currentYear);
  }

  return years.map((y) => ({ label: y, value: y }));
}

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

  if (year === currentYear) {
    return MONTHS.slice(0, currentMonth);
  }

  return MONTHS;
}

export function getMeasurementStats(
  month: number | null,
  year: number | null
): { good: number; poor: number; total: number } {
  let rows: { quality: string; count: number }[];

  if (month !== null && year !== null) {
    rows = db.getAllSync<{ quality: string; count: number }>(
      `
        SELECT quality, COUNT(*) as count FROM measurements
        WHERE strftime('%m', datetime) = ?
        AND strftime('%Y', datetime) = ?
        GROUP BY quality;
      `,
      [String(month).padStart(2, "0"), String(year)]
    );
  } else {
    rows = db.getAllSync<{ quality: string; count: number }>(
      `
        SELECT quality, COUNT(*) as count FROM measurements
        GROUP BY quality;
      `
    );
  }

  const good  = rows.find((r) => r.quality === "good")?.count  ?? 0;
  const poor  = rows.find((r) => r.quality === "poor")?.count  ?? 0;
  return { good, poor, total: good + poor };
}

//Use in homescreen for total scanned card
export function getCurrentMonthMeasurements(): MeasurementRow[] {
  const now   = new Date();
  const month = now.getMonth() + 1;
  const year  = now.getFullYear();
  return getMeasurementsByMonthYear(month, year);
}