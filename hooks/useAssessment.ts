import { ASSESSMENT_STEPS } from "@/constants/config";
import { AssessmentResult, AssessmentStatus } from "@/constants/types";
import { useBle } from "@/context/BleContext";
import { useState } from "react";

export function useAssessment() {
  const { connectedDevice, readImpedance, readPhaseAngle } = useBle();
  const [status, setStatus] = useState<AssessmentStatus>("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const runAssessment = async () => {
    if (!connectedDevice) {
      setStatus("not_connected");
      return;
    }

    setStatus("processing");

    // Step 0: Reading
    setStepIndex(0);
    const impedance = await readImpedance();

    // Step 1: Measuring
    setStepIndex(1);
    const phaseAngle = await readPhaseAngle();

    if (impedance === null || phaseAngle === null) {
      setStatus("error");
      return;
    }

    // Step 2: Analyzing
    setStepIndex(2);
    const quality = impedance > 100 ? "good" : "poor"; // replace with real threshold

    // Step 3: Finalizing
    setStepIndex(3);
    await new Promise((r) => setTimeout(r, 500)); // brief delay for UX

    setResult({ quality, impedanceMagnitude: impedance, phaseAngle });
    setStatus("done");
  };

  return { status, stepIndex, result, runAssessment, steps: ASSESSMENT_STEPS };
}