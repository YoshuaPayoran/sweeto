import { predictSweetPotatoQuality } from "@/assets/model/services/ai_service";
import { BLE_UUIDS } from "@/constants/config";
import {
  DEFAULT_VARIETY,
  isValidVarietyId,
  VARIETY_STORAGE_KEY,
  VarietyId,
} from "@/constants/varieties";
import { useBle } from "@/context/BleContext";
import { useVariety } from "@/context/VarietyContext";
import { useColors } from "@/hooks/useColors";
import { hp, wp } from "@/hooks/useResponsive";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Animated, Easing, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

const STAGES = [
  { label: "Initializing AD5933", detail: "Starting bioimpedance sensor" },
  { label: "Measuring", detail: "Applying signal and reading electrodes" },
  { label: "AI Analyzing", detail: "Classifying sweet potato quality" },
  { label: "Finalizing", detail: "Preparing assessment result" },
] as const;

const ELECTRODE_LABEL: Record<string, string> = {
  R1: "Electrode 1",
  R2: "Electrode 2",
  R3: "Electrode 3",
};

const RING_SIZE = wp(55);
const STROKE = 8;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type QualityParam = "good" | "poor";

type MeasurementData = {
  e1Z: number;
  e1Phase: number;
  e2Z: number;
  e2Phase: number;
  e3Z: number;
  e3Phase: number;
};

async function getLatestSelectedVariety(
  fallback: VarietyId
): Promise<VarietyId> {
  try {
    const stored = await AsyncStorage.getItem(VARIETY_STORAGE_KEY);

    if (isValidVarietyId(stored)) {
      return stored;
    }

    return fallback;
  } catch (error) {
    console.warn("[Processing] Failed to read stored variety:", error);
    return fallback;
  }
}

function CircularProgress({
  percent,
  color,
}: {
  percent: number;
  color: string;
}) {
  const animPercent = useRef(new Animated.Value(0)).current;
  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  useEffect(() => {
    Animated.timing(animPercent, {
      toValue: percent,
      duration: 600,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [percent, animPercent]);

  const strokeDashoffset = animPercent.interpolate({
    inputRange: [0, 100],
    outputRange: [CIRCUMFERENCE, 0],
  });

  return (
    <View
      style={{
        width: RING_SIZE,
        height: RING_SIZE,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={RING_SIZE} height={RING_SIZE} style={{ position: "absolute" }}>
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          stroke={color + "22"}
          strokeWidth={STROKE}
          fill="none"
        />
      </Svg>

      <Animated.View style={{ position: "absolute" }}>
        <Svg
          width={RING_SIZE}
          height={RING_SIZE}
          style={{ transform: [{ rotate: "-90deg" }] }}
        >
          <AnimatedCircle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            stroke={color}
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={`${CIRCUMFERENCE}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

function BouncingDots({ color }: { color: string }) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const dots = [dot1, dot2, dot3];

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, {
            toValue: -6,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(450),
        ])
      )
    );

    animations.forEach((animation) => animation.start());

    return () => {
      animations.forEach((animation) => animation.stop());
    };
  }, [dot1, dot2, dot3]);

  return (
    <View
      style={{
        flexDirection: "row",
        gap: wp(2),
        alignItems: "center",
        marginTop: hp(1),
      }}
    >
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={{
            width: wp(2),
            height: wp(2),
            borderRadius: wp(1),
            backgroundColor: color,
            transform: [{ translateY: dot }],
          }}
        />
      ))}
    </View>
  );
}

function StepIndicators({
  total,
  current,
  color,
}: {
  total: number;
  current: number;
  color: string;
}) {
  return (
    <View style={{ flexDirection: "row", gap: wp(2), alignItems: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            height: hp(0.5),
            width: i === current ? wp(8) : wp(4),
            borderRadius: 999,
            backgroundColor: i <= current ? color : color + "33",
          }}
        />
      ))}
    </View>
  );
}

export default function Processing() {
  const colors = useColors();
  const { connectedDevice } = useBle();
  const { selectedVarietyId, isLoadingVariety } = useVariety();

  const [stageIndex, setStageIndex] = useState(0);
  const [percent, setPercent] = useState(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const subscriptionRef = useRef<any>(null);
  const hasCompletedRef = useRef(false);
  const isAbortedRef = useRef(false);

  const resultDataRef = useRef<MeasurementData>({
    e1Z: 0,
    e1Phase: 0,
    e2Z: 0,
    e2Phase: 0,
    e3Z: 0,
    e3Phase: 0,
  });

  const animateStageChange = (newIndex: number, newPercent: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setStageIndex(newIndex);
    setPercent(newPercent);
  };

  const cleanupSubscriptions = () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
  };

  const abortAssessment = (reason: string) => {
    if (isAbortedRef.current) return;

    isAbortedRef.current = true;
    cleanupSubscriptions();

    Alert.alert(
      "Assessment Aborted",
      reason,
      [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)/home" as any),
        },
      ],
      { cancelable: false }
    );
  };

  const abortUnstableContact = (electrodeCode: string) => {
    if (isAbortedRef.current) return;

    isAbortedRef.current = true;
    cleanupSubscriptions();

    const label = ELECTRODE_LABEL[electrodeCode] ?? electrodeCode;

    Alert.alert(
      "No Stable Contact",
      `${label} detected unstable contact. Please make sure the electrode is firmly attached to the sweet potato surface.`,
      [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)/home" as any),
        },
      ],
      { cancelable: false }
    );
  };

  useEffect(() => {
    if (!isLoadingVariety) {
      runAssessment();
    }

    return () => {
      cleanupSubscriptions();
    };
  }, [isLoadingVariety]);

  const waitForAllResults = (): Promise<void> => {
    return new Promise((resolve) => {
      const MAX_WAIT_MS = 3000;
      const POLL_INTERVAL_MS = 100;
      let elapsed = 0;

      const check = setInterval(() => {
        const { e1Z, e2Z, e3Z } = resultDataRef.current;

        elapsed += POLL_INTERVAL_MS;

        const allReceived = e1Z > 0 && e2Z > 0 && e3Z > 0;
        const timedOut = elapsed >= MAX_WAIT_MS;

        if (allReceived || timedOut) {
          clearInterval(check);

          if (timedOut && !allReceived) {
            console.warn(
              "[Processing] waitForAllResults timed out:",
              resultDataRef.current
            );
          }

          resolve();
        }
      }, POLL_INTERVAL_MS);
    });
  };

  const runAssessment = async () => {
    try {
      if (!connectedDevice) {
        abortAssessment("No device connected. Please connect to ESP32 first.");
        return;
      }

      hasCompletedRef.current = false;
      isAbortedRef.current = false;

      resultDataRef.current = {
        e1Z: 0,
        e1Phase: 0,
        e2Z: 0,
        e2Phase: 0,
        e3Z: 0,
        e3Phase: 0,
      };

      subscriptionRef.current = connectedDevice.monitorCharacteristicForService(
        BLE_UUIDS.SERVICE,
        BLE_UUIDS.STATUS,
        async (error, characteristic) => {
          if (error) {
            if (String(error.message).includes("Operation was cancelled")) return;

            console.error("[Processing] BLE monitoring error:", error);
            abortAssessment("Lost connection to ESP32 during assessment.");
            return;
          }

          if (!characteristic?.value) return;

          const message = Buffer.from(characteristic.value, "base64")
            .toString("utf-8")
            .trim();

          console.log("[Processing] ESP32 message:", message);

          if (
            message.startsWith("R1:") ||
            message.startsWith("R2:") ||
            message.startsWith("R3:")
          ) {
            const channelCode = message.substring(0, 2);
            const data = message.substring(3).split(",");

            const impedance = Number.parseFloat(data[0]);
            const phase = Number.parseFloat(data[1]);

            if (!Number.isFinite(impedance) || !Number.isFinite(phase)) {
              console.warn(`[Processing] Non-finite value for ${channelCode}:`, {
                impedance,
                phase,
              });
              return;
            }

            if (channelCode === "R1") {
              resultDataRef.current.e1Z = impedance;
              resultDataRef.current.e1Phase = phase;
            }

            if (channelCode === "R2") {
              resultDataRef.current.e2Z = impedance;
              resultDataRef.current.e2Phase = phase;
            }

            if (channelCode === "R3") {
              resultDataRef.current.e3Z = impedance;
              resultDataRef.current.e3Phase = phase;
            }

            return;
          }

          if (message.startsWith("UNSTABLE_CONTACT:")) {
            const electrodeCode = message.split(":")[1]?.trim();
            abortUnstableContact(electrodeCode);
            return;
          }

          if (message === "START_RECEIVED") {
            animateStageChange(0, 5);
            return;
          }

          if (message === "ASSESSMENT_STARTED") {
            animateStageChange(0, 15);
            return;
          }

          if (message.startsWith("CHANNEL:")) {
            animateStageChange(1, 45);
            return;
          }

          if (message === "FINAL_RESULTS") {
            animateStageChange(2, 75);
            return;
          }

          if (message.startsWith("ERROR:")) {
            abortAssessment(message.replace("ERROR:", "").trim());
            return;
          }

          if (message === "ASSESSMENT_COMPLETE") {
            if (hasCompletedRef.current) return;

            hasCompletedRef.current = true;

            await waitForAllResults();
            cleanupSubscriptions();
            await delay(1000);
            await goToResultScreen();
          }
        }
      );

      await connectedDevice.writeCharacteristicWithResponseForService(
        BLE_UUIDS.SERVICE,
        BLE_UUIDS.COMMAND,
        Buffer.from("START").toString("base64")
      );
    } catch (error) {
      console.error("[Processing] Assessment error:", error);
      abortAssessment("An unexpected error occurred. Please try again.");
    }
  };

  const goToResultScreen = async () => {
    const { e1Z, e1Phase, e2Z, e2Phase, e3Z, e3Phase } =
      resultDataRef.current;

    const isValidReading = (impedance: number, phase: number) => {
      return (
        Number.isFinite(impedance) &&
        impedance > 0 &&
        Number.isFinite(phase) &&
        phase >= -180 &&
        phase <= 180
      );
    };

    if (
      !isValidReading(e1Z, e1Phase) ||
      !isValidReading(e2Z, e2Phase) ||
      !isValidReading(e3Z, e3Phase)
    ) {
      abortAssessment("Invalid or incomplete measurement data received from ESP32.");
      return;
    }

    try {
      animateStageChange(2, 85);

      const currentVariety = await getLatestSelectedVariety(
        selectedVarietyId ?? DEFAULT_VARIETY
      );

      console.log("[Processing] Variety used for AI/database:", currentVariety);

      const aiResult = await predictSweetPotatoQuality(currentVariety, {
        e1Z,
        e1Phase,
        e2Z,
        e2Phase,
        e3Z,
        e3Phase,
      });

      console.log("[Processing] AI result:", aiResult);

      if (aiResult === "ERROR") {
        abortAssessment("AI model failed to analyze the measurement data.");
        return;
      }

      const quality: QualityParam = aiResult === "GOOD" ? "good" : "poor";

      animateStageChange(3, 100);

      const remarks =
        quality === "good"
          ? "Fresh and suitable for consumption"
          : "Shows signs of deterioration";

      await delay(500);

      router.replace({
        pathname: "/assessment/result" as any,
        params: {
          variety: currentVariety,
          quality,
          impedance_1: String(e1Z),
          phase_angle_1: String(e1Phase),
          impedance_2: String(e2Z),
          phase_angle_2: String(e2Phase),
          impedance_3: String(e3Z),
          phase_angle_3: String(e3Phase),
          frequency: "50",
          remarks,
        },
      });
    } catch (error) {
      console.error("[Processing] AI prediction error:", error);
      abortAssessment("AI model failed to analyze the measurement data.");
    }
  };

  const stage = STAGES[stageIndex];

  return (
    <SafeAreaView
      className="flex-1 items-center"
      style={{ backgroundColor: colors.background }}
      edges={["top", "bottom"]}
    >
      <Text
        style={{
          fontSize: wp(5.5),
          fontWeight: "bold",
          color: colors.primaryText,
          marginTop: hp(3),
        }}
      >
        Processing
      </Text>

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <CircularProgress percent={percent} color={colors.primary} />

          <View style={{ position: "absolute", alignItems: "center" }}>
            <Text
              style={{
                fontSize: wp(10),
                fontWeight: "bold",
                color: colors.primaryText,
                letterSpacing: -1,
              }}
            >
              {percent}
              <Text
                style={{
                  fontSize: wp(4),
                  fontWeight: "400",
                  color: colors.secondaryText,
                }}
              >
                %
              </Text>
            </Text>

            <BouncingDots color={colors.primary} />
          </View>
        </View>

        <Animated.View
          style={{
            opacity: fadeAnim,
            alignItems: "center",
            marginTop: hp(4),
            gap: hp(0.8),
          }}
        >
          <Text
            style={{
              fontSize: wp(5),
              fontWeight: "bold",
              color: colors.primaryText,
            }}
          >
            {stage.label}
          </Text>

          <Text
            style={{
              fontSize: wp(3.5),
              color: colors.secondaryText,
              textAlign: "center",
              paddingHorizontal: wp(8),
            }}
          >
            {stage.detail}
          </Text>
        </Animated.View>

        <View style={{ marginTop: hp(4) }}>
          <StepIndicators
            total={STAGES.length}
            current={stageIndex}
            color={colors.primary}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}