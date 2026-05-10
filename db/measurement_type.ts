export type MeasurementRow = {
  id: number;
  datetime: string;
  variety: "yellow" | "purple" | "orange";
  quality: "good" | "poor";
  frequency: number;
  impedance_1: number;
  phase_angle_1: number;
  impedance_2: number;
  phase_angle_2: number;
  impedance_3: number;
  phase_angle_3: number;
  remarks: string | null;
  synced: number;
};

export type NewMeasurement = {
  datetime: string;
  variety: "yellow" | "purple" | "orange";
  quality: "good" | "poor";
  frequency: number;
  impedance_1: number;
  phase_angle_1: number;
  impedance_2: number;
  phase_angle_2: number;
  impedance_3: number;
  phase_angle_3: number;
  remarks: string;
};