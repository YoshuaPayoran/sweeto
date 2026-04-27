export type MeasurementRow = {
  id: number;
  datetime: string;
  quality: "good" | "poor";
  impedance: number;
  phase_angle: number;
  frequency: number;
  remarks: string | null;
  synced: number;
};

export type NewMeasurement = {
  datetime: string;
  quality: "good" | "poor";
  impedance: number;
  phase_angle: number;
  frequency: number;
  remarks?: string;
};