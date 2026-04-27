import { useBle } from "@/context/BleContext";
import { useColors } from "@/hooks/useColors";
import { hp, wp } from "@/hooks/useResponsive";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

// ─── Stage definitions ────────────────────────────────────────────────────────
const STAGES = [
  { label: "Applying Signal",    detail: "Generating AC signal through electrodes" },
  { label: "Reading Impedance",  detail: "Measuring voltage response from AD5933"  },
  { label: "Calculating Phase",  detail: "Computing phase angle from real/imaginary" },
  { label: "AI Analyzing",       detail: "Running AI model on measurement data"    },
] as const;

// ─── Circular progress ring ───────────────────────────────────────────────────
const RING_SIZE   = wp(55);
const STROKE      = 8;
const RADIUS      = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function CircularProgress({ percent, color }: { percent: number; color: string }) {
  const animPercent = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animPercent, {
      toValue: percent,
      duration: 600,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [percent]);

  const strokeDashoffset = animPercent.interpolate({
    inputRange:  [0, 100],
    outputRange: [CIRCUMFERENCE, 0],
  });

  return (
    <View style={{ width: RING_SIZE, height: RING_SIZE, alignItems: "center", justifyContent: "center" }}>
      <Svg width={RING_SIZE} height={RING_SIZE} style={{ position: "absolute" }}>
        {/* Background ring */}
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          stroke={color + "22"}
          strokeWidth={STROKE}
          fill="none"
        />
      </Svg>

      {/* Animated foreground ring */}
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

// Animated circle component for SVG stroke dash
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── Bouncing dots ────────────────────────────────────────────────────────────
function BouncingDots({ color }: { color: string }) {
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0,  duration: 300, useNativeDriver: true }),
          Animated.delay(450),
        ])
      )
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, []);

  return (
    <View style={{ flexDirection: "row", gap: wp(2), alignItems: "center", marginTop: hp(1) }}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={{
            width: wp(2), height: wp(2),
            borderRadius: wp(1),
            backgroundColor: color,
            transform: [{ translateY: dot }],
          }}
        />
      ))}
    </View>
  );
}

// ─── Step indicators at bottom ────────────────────────────────────────────────
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

// ─── Main processing screen ───────────────────────────────────────────────────
export default function Processing() {
  const colors = useColors();
  const { readImpedance, readPhaseAngle, connectedDevice } = useBle();

  const [stageIndex, setStageIndex]   = useState(0);
  const [percent,    setPercent]       = useState(0);
  const [error,      setError]         = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Animate stage label transition
  const animateStageChange = (newIndex: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setStageIndex(newIndex);
  };

  useEffect(() => {
    runAssessment();
  }, []);

  const runAssessment = async () => {
    try {
      if (!connectedDevice) {
        setError("No device connected");
        return;
      }

      // ── Stage 0: Applying Signal ──
      animateStageChange(0);
      setPercent(10);

      // Subscribe to BLE notifications from ESP32 status characteristic
      // ESP32 sends stage updates as UTF-8 strings e.g. "stage:1", "stage:2"
      // 🔄 Replace BLE_UUIDS.STATUS with your actual status characteristic UUID
      // connectedDevice.monitorCharacteristicForService(
      //   BLE_UUIDS.SERVICE,
      //   BLE_UUIDS.STATUS,
      //   (error, char) => {
      //     if (char?.value) {
      //       const msg = Buffer.from(char.value, "base64").toString("utf-8");
      //       if (msg === "stage:1") { animateStageChange(1); setPercent(40); }
      //       if (msg === "stage:2") { animateStageChange(2); setPercent(65); }
      //       if (msg === "stage:3") { animateStageChange(3); setPercent(85); }
      //     }
      //   }
      // );

      // ── Simulated stage progression (replace with real BLE notifications) ──
      await delay(1200);
      animateStageChange(1);
      setPercent(35);

      // ── Stage 1: Read impedance from ESP32 ──
      const impedance = await readImpedance();
      await delay(800);
      animateStageChange(2);
      setPercent(65);

      // ── Stage 2: Read phase angle from ESP32 ──
      const phaseAngle = await readPhaseAngle();
      await delay(800);

      if (impedance === null || phaseAngle === null) {
        setError("Failed to read data from device");
        return;
      }

      // ── Stage 3: AI analyzing ──
      animateStageChange(3);
      setPercent(85);

      // 🔄 Replace this with your actual TensorFlow Lite model inference
      // Example:
      // const model = await loadTFLiteModel();
      // const result = await model.predict([[impedance, phaseAngle]]);
      // const quality = result[0] > 0.5 ? "good" : "poor";

      // Placeholder threshold — replace with TFLite output
      await delay(1000);
      const quality: "good" | "poor" = impedance > 100 ? "good" : "poor";
      const frequency = 1000; // 🔄 Replace with actual frequency from ESP32

      setPercent(100);
      await delay(500);

      // ── Navigate to result screen with data ──
      router.replace({
        pathname: "/assessment/result" as any,
        params: {
          quality,
          impedance:  String(impedance),
          phaseAngle: String(phaseAngle),
          frequency:  String(frequency),
        },
      });

    } catch (e) {
      console.error("Assessment error:", e);
      setError("An error occurred during assessment");
    }
  };

  const stage = STAGES[stageIndex];

  return (
    <SafeAreaView
      className="flex-1 items-center"
      style={{ backgroundColor: colors.background }}
      edges={["top", "bottom"]}
    >
      {/* Title */}
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

      {/* Circular progress */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <CircularProgress percent={percent} color={colors.primary} />

          {/* Percent + dots centered inside ring */}
          <View
            style={{
              position: "absolute",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: wp(10),
                fontWeight: "bold",
                color: colors.primaryText,
                letterSpacing: -1,
              }}
            >
              {percent}
              <Text style={{ fontSize: wp(4), fontWeight: "400", color: colors.secondaryText }}>
                %
              </Text>
            </Text>
            <BouncingDots color={colors.primary} />
          </View>
        </View>

        {/* Stage label */}
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
            {error ?? stage.label}
          </Text>
          {!error && (
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
          )}
        </Animated.View>

        {/* Step indicators */}
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

// Helper
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}