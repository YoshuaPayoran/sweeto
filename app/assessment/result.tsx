import {
  DEFAULT_VARIETY,
  getVarietyById,
  isValidVarietyId,
  VarietyId,
} from "@/constants/varieties";
import { insertMeasurement } from "@/db";
import { useColors } from "@/hooks/useColors";
import { hp, wp } from "@/hooks/useResponsive";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Easing, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Polyline } from "react-native-svg";

const CIRCLE_SIZE = wp(40);
const STROKE = 7;
const RADIUS = (CIRCLE_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ResultCircle({
  quality,
  accentColor,
}: {
  quality: "good" | "poor";
  accentColor: string;
}) {
  const drawAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacAnim = useRef(new Animated.Value(0)).current;
  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(drawAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const strokeDashoffset = drawAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });

  return (
    <View
      style={{
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} style={{ position: "absolute" }}>
        <Circle
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={RADIUS}
          stroke={accentColor + "22"}
          strokeWidth={STROKE}
          fill="none"
        />
      </Svg>

      <Svg
        width={CIRCLE_SIZE}
        height={CIRCLE_SIZE}
        style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}
      >
        <AnimatedCircle
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={RADIUS}
          stroke={accentColor}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={`${CIRCUMFERENCE}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>

      <Animated.View
        style={{
          opacity: opacAnim,
          transform: [{ scale: scaleAnim }],
          width: CIRCLE_SIZE * 0.55,
          height: CIRCLE_SIZE * 0.55,
          borderRadius: CIRCLE_SIZE,
          backgroundColor: accentColor + "18",
          alignItems: "center",
          justifyContent: "center",
          gap: hp(0.5),
        }}
      >
        <Svg width={wp(7)} height={wp(7)} viewBox="0 0 24 24">
          {quality === "good" ? (
            <Polyline
              points="4,12 9,17 20,7"
              stroke={accentColor}
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <>
              <Polyline
                points="6,6 18,18"
                stroke={accentColor}
                strokeWidth={2.5}
                fill="none"
                strokeLinecap="round"
              />
              <Polyline
                points="18,6 6,18"
                stroke={accentColor}
                strokeWidth={2.5}
                fill="none"
                strokeLinecap="round"
              />
            </>
          )}
        </Svg>

        <Text style={{ fontSize: wp(3.5), fontWeight: "700", color: accentColor }}>
          {quality === "good" ? "Good" : "Poor"}
        </Text>
      </Animated.View>
    </View>
  );
}

function ElectrodeColumn({
  label,
  impedance,
  phaseAngle,
  showDivider,
}: {
  label: string;
  impedance: number;
  phaseAngle: number;
  showDivider: boolean;
}) {
  const colors = useColors();

  return (
    <View style={{ flexDirection: "row", flex: 1 }}>
      <View style={{ flex: 1, alignItems: "center" }}>
        <Text
          style={{
            fontSize: wp(2.5),
            fontWeight: "600",
            color: colors.secondaryText,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: hp(0.8),
          }}
        >
          {label}
        </Text>

        <View
          style={{
            borderTopWidth: 0.5,
            borderTopColor: colors.borderColor,
            paddingTop: hp(0.8),
            width: "100%",
            alignItems: "center",
            marginBottom: hp(0.8),
          }}
        >
          <Text style={{ fontSize: wp(3.2), fontWeight: "600", color: colors.primaryText }}>
            {impedance.toFixed(2)}
            <Text style={{ fontSize: wp(2.5), color: colors.secondaryText }}>Ω</Text>
          </Text>

          <Text style={{ fontSize: wp(2.5), color: colors.secondaryText, marginTop: hp(0.2) }}>
            Impedance
          </Text>
        </View>

        <View
          style={{
            borderTopWidth: 0.5,
            borderTopColor: colors.borderColor,
            paddingTop: hp(0.8),
            width: "100%",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: wp(3.2), fontWeight: "600", color: colors.primaryText }}>
            {phaseAngle.toFixed(2)}
            <Text style={{ fontSize: wp(2.5), color: colors.secondaryText }}>°</Text>
          </Text>

          <Text style={{ fontSize: wp(2.5), color: colors.secondaryText, marginTop: hp(0.2) }}>
            Phase angle
          </Text>
        </View>
      </View>

      {showDivider && (
        <View
          style={{
            width: 0.5,
            backgroundColor: colors.borderColor,
            marginHorizontal: wp(1),
          }}
        />
      )}
    </View>
  );
}

export default function Result() {
  const colors = useColors();

  const params = useLocalSearchParams<{
    variety?: string;
    quality?: string;
    impedance_1?: string;
    phase_angle_1?: string;
    impedance_2?: string;
    phase_angle_2?: string;
    impedance_3?: string;
    phase_angle_3?: string;
    frequency?: string;
    remarks?: string;
  }>();

  const routeVariety = params.variety;
  const variety: VarietyId = isValidVarietyId(routeVariety)
    ? routeVariety
    : DEFAULT_VARIETY;

  const varietyInfo = getVarietyById(variety);

  const quality = params.quality === "good" ? "good" : "poor";

  const impedance_1 = Number.parseFloat(params.impedance_1 ?? "0");
  const phase_angle_1 = Number.parseFloat(params.phase_angle_1 ?? "0");
  const impedance_2 = Number.parseFloat(params.impedance_2 ?? "0");
  const phase_angle_2 = Number.parseFloat(params.phase_angle_2 ?? "0");
  const impedance_3 = Number.parseFloat(params.impedance_3 ?? "0");
  const phase_angle_3 = Number.parseFloat(params.phase_angle_3 ?? "0");
  const frequency = Number.parseFloat(params.frequency ?? "50");
  const remarks = params.remarks ?? "";

  const accentColor = quality === "good" ? colors.deviceConnected : colors.deviceDisconnected;
  const qualityLabel = quality === "good" ? "Good Quality" : "Poor Quality";

  const datetimeRef = useRef(new Date().toISOString());
  const datetime = datetimeRef.current;

  const contentAnim = useRef(new Animated.Value(0)).current;
  const hasSavedRef = useRef(false);

  useEffect(() => {
    if (!hasSavedRef.current) {
      hasSavedRef.current = true;

      try {
        insertMeasurement({
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
          remarks,
        });

        console.log("✅ Measurement saved to database:", {
          variety,
          quality,
        });
      } catch (error) {
        console.error("❌ Failed to save measurement:", error);
      }
    }

    Animated.timing(contentAnim, {
      toValue: 1,
      duration: 500,
      delay: 900,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, []);

  const formattedDate = new Date(datetime).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });

  const formattedTime = new Date(datetime).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <SafeAreaView
      className="flex-1 items-center"
      style={{ backgroundColor: colors.background }}
      edges={["top", "bottom"]}
    >
      <View
        style={{
          width: "100%",
          alignItems: "center",
          marginTop: hp(2),
          marginBottom: hp(1.5),
          gap: hp(0.6),
          paddingHorizontal: wp(6),
        }}
      >
        <Text
          style={{
            fontSize: wp(5.5),
            fontWeight: "bold",
            color: colors.primaryText,
          }}
        >
          Result
        </Text>

        <Text
          style={{
            fontSize: wp(2.8),
            color: colors.secondaryText,
            fontWeight: "600",
            letterSpacing: 1,
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          Bioimpedance Measurement Analysis
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: wp(1.5),
            backgroundColor: varietyInfo.color + "18",
            borderRadius: wp(2),
            borderWidth: 0.5,
            borderColor: varietyInfo.color + "55",
            paddingHorizontal: wp(3),
            paddingVertical: hp(0.5),
            marginTop: hp(0.5),
          }}
        >
          <View
            style={{
              width: wp(1.8),
              height: wp(1.8),
              borderRadius: wp(2),
              backgroundColor: varietyInfo.color,
            }}
          />

          <Text
            style={{
              fontSize: wp(3),
              fontWeight: "700",
              color: varietyInfo.color,
            }}
          >
            {varietyInfo.label} Variety
          </Text>
        </View>

        <Text style={{ fontSize: wp(2.8), color: colors.secondaryText }}>
          {formattedDate}, {formattedTime}
        </Text>
      </View>

      <View
        className="flex-1 items-center justify-center"
        style={{ width: "100%", paddingHorizontal: wp(6) }}
      >
        <ResultCircle quality={quality} accentColor={accentColor} />

        <Animated.View
          className="items-center"
          style={{
            opacity: contentAnim,
            transform: [
              {
                translateY: contentAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [16, 0],
                }),
              },
            ],
            marginTop: hp(3),
            gap: hp(0.8),
          }}
        >
          <Text style={{ fontSize: wp(6), fontWeight: "bold", color: colors.primaryText }}>
            {qualityLabel}
          </Text>

          <Text
            style={{
              fontSize: wp(3.5),
              color: colors.secondaryText,
              textAlign: "center",
              paddingHorizontal: wp(4),
              lineHeight: wp(5.5),
            }}
          >
            {remarks}
          </Text>
        </Animated.View>

        <Animated.View
          style={{
            opacity: contentAnim,
            width: "100%",
            marginTop: hp(2.5),
            backgroundColor: colors.cardColor,
            borderRadius: wp(4),
            borderWidth: 0.5,
            borderColor: colors.borderColor,
            overflow: "hidden",
          }}
        >
          <View style={{ height: hp(0.5), backgroundColor: accentColor }} />

          <View style={{ padding: wp(3) }}>
            <Text
              style={{
                fontSize: wp(2.8),
                fontWeight: "600",
                color: colors.secondaryText,
                textTransform: "uppercase",
                letterSpacing: 0.6,
                marginBottom: hp(1.2),
              }}
            >
              Electrode readings
            </Text>

            <View
              style={{
                flexDirection: "row",
                backgroundColor: colors.background,
                borderRadius: wp(3),
                borderWidth: 0.5,
                borderColor: colors.borderColor,
                padding: wp(3),
              }}
            >
              <ElectrodeColumn
                label="Electrode 1"
                impedance={impedance_1}
                phaseAngle={phase_angle_1}
                showDivider={true}
              />

              <ElectrodeColumn
                label="Electrode 2"
                impedance={impedance_2}
                phaseAngle={phase_angle_2}
                showDivider={true}
              />

              <ElectrodeColumn
                label="Electrode 3"
                impedance={impedance_3}
                phaseAngle={phase_angle_3}
                showDivider={false}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: colors.background,
                borderRadius: wp(3),
                borderWidth: 0.5,
                borderColor: colors.borderColor,
                paddingHorizontal: wp(4),
                paddingVertical: hp(1),
                marginTop: hp(1),
              }}
            >
              <Text
                style={{
                  fontSize: wp(2.8),
                  color: colors.secondaryText,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Frequency
              </Text>

              <Text style={{ fontSize: wp(3.5), fontWeight: "600", color: colors.primaryText }}>
                {frequency}
                <Text style={{ fontSize: wp(2.8), color: colors.secondaryText }}> kHz</Text>
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={{
            opacity: contentAnim,
            width: "100%",
            marginTop: hp(3),
            gap: hp(1.5),
          }}
        >
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/statistics" as any)}
            activeOpacity={0.85}
            style={{
              width: "100%",
              paddingVertical: hp(2),
              borderRadius: wp(999),
              backgroundColor: colors.primary,
              alignItems: "center",
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <Text style={{ fontSize: wp(4), fontWeight: "700", color: "#fff" }}>
              View Statistics
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/home" as any)}
            activeOpacity={0.8}
            style={{
              width: "100%",
              paddingVertical: hp(2),
              borderRadius: wp(999),
              borderWidth: 1,
              borderColor: colors.borderColor,
              alignItems: "center",
              backgroundColor: colors.cardColor,
            }}
          >
            <Text style={{ fontSize: wp(4), fontWeight: "600", color: colors.secondaryText }}>
              Go Back
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}