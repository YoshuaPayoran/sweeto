export type AssessmentResult = {
  quality: "good" | "poor";
  electrodes: {
    impedance: number;
    phaseAngle: number;
  }[];
  frequency: number;
};

export type AssessmentStatus =
  | "idle"
  | "not_connected"
  | "processing"
  | "done"
  | "error";

export type Measurement = {
  id: string;

  variety: "yellow" | "purple" | "orange";

  quality: "good" | "poor";

  datetime: string;

  frequency: number;

  remarks: string;

  electrodes: {
    impedance: number;
    phaseAngle: number;
  }[];
};