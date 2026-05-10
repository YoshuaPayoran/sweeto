import { ChevronIcon } from "@/components/icons";
import { Measurement } from "@/constants/types";
import { getVarietyById, VarietyId } from "@/constants/varieties";
import { useColors } from "@/hooks/useColors";
import { hp, wp } from "@/hooks/useResponsive";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = { item: Measurement };

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
          <Text
            style={{
              fontSize: wp(3.2),
              fontWeight: "600",
              color: colors.primaryText,
            }}
          >
            {impedance.toFixed(2)}
            <Text
              style={{
                fontSize: wp(2.5),
                color: colors.secondaryText,
              }}
            >
              Ω
            </Text>
          </Text>

          <Text
            style={{
              fontSize: wp(2.5),
              color: colors.secondaryText,
              marginTop: hp(0.2),
            }}
          >
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
          <Text
            style={{
              fontSize: wp(3.2),
              fontWeight: "600",
              color: colors.primaryText,
            }}
          >
            {phaseAngle.toFixed(2)}
            <Text
              style={{
                fontSize: wp(2.5),
                color: colors.secondaryText,
              }}
            >
              °
            </Text>
          </Text>

          <Text
            style={{
              fontSize: wp(2.5),
              color: colors.secondaryText,
              marginTop: hp(0.2),
            }}
          >
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

export default function MeasurementCard({ item }: Props) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);

  const isGood = item.quality === "good";

  const accentColor = isGood
    ? colors.deviceConnected
    : colors.deviceDisconnected;

  const badgeBg = isGood
    ? colors.deviceConnectedBackground
    : colors.deviceDisconnectedBackground;

  const varietyId = item.variety as VarietyId;

  const variety = getVarietyById(varietyId);

  const formattedDate = new Date(
    item.datetime
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = new Date(
    item.datetime
  ).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const electrodes = item.electrodes ?? [];

  return (
    <TouchableOpacity
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.85}
      style={{
        backgroundColor: colors.cardColor,
        borderRadius: wp(4),
        borderWidth: 0.5,
        borderColor: colors.borderColor,
        overflow: "hidden",

        shadowColor: accentColor,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,

        elevation: 3,
      }}
    >
      <View
        style={{
          height: hp(0.5),
          backgroundColor: accentColor,
        }}
      />

      <View style={{ padding: wp(4) }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: wp(3),
          }}
        >
          <View style={{ flex: 1 }}>

            {/* QUALITY BADGE */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: wp(1.5),
                backgroundColor: badgeBg,
                borderRadius: wp(2),
                borderWidth: 0.5,
                borderColor: accentColor,
                paddingHorizontal: wp(2.5),
                paddingVertical: hp(0.4),
                alignSelf: "flex-start",
                marginBottom: hp(0.6),
              }}
            >
              <View
                style={{
                  width: wp(1.5),
                  height: wp(1.5),
                  borderRadius: wp(1),
                  backgroundColor: accentColor,
                }}
              />

              <Text
                style={{
                  fontSize: wp(3),
                  fontWeight: "600",
                  color: accentColor,
                }}
              >
                {isGood ? "Good quality" : "Poor quality"}
              </Text>
            </View>

            {/* VARIETY BADGE */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: wp(1.5),
                backgroundColor: variety.color + "18",
                borderRadius: wp(2),
                borderWidth: 0.5,
                borderColor: variety.color + "66",
                paddingHorizontal: wp(2.5),
                paddingVertical: hp(0.4),
                alignSelf: "flex-start",
                marginBottom: hp(0.8),
              }}
            >
              <View
                style={{
                  width: wp(1.5),
                  height: wp(1.5),
                  borderRadius: wp(1),
                  backgroundColor: variety.color,
                }}
              />

              <Text
                style={{
                  fontSize: wp(3),
                  fontWeight: "600",
                  color: variety.color,
                }}
              >
                {variety.label}
              </Text>
            </View>

            {/* REMARKS */}
            <Text
              style={{
                fontSize: wp(3),
                color: colors.secondaryText,
                lineHeight: wp(4.5),
              }}
              numberOfLines={1}
            >
              {item.remarks}
            </Text>
          </View>

          {/* RIGHT SIDE */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: wp(2),
              flexShrink: 0,
            }}
          >
            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  fontSize: wp(3),
                  fontWeight: "600",
                  color: colors.primaryText,
                }}
              >
                {formattedDate}
              </Text>

              <Text
                style={{
                  fontSize: wp(2.8),
                  color: colors.secondaryText,
                  marginTop: hp(0.2),
                }}
              >
                {formattedTime}
              </Text>
            </View>

            <View
              style={{
                transform: [
                  {
                    rotate: expanded ? "90deg" : "0deg",
                  },
                ],
              }}
            >
              <ChevronIcon
                color={colors.secondaryText}
                size={wp(4)}
              />
            </View>
          </View>
        </View>

        {/* EXPANDED */}
        {expanded && (
          <View
            style={{
              borderTopWidth: 0.5,
              borderTopColor: colors.borderColor,
              marginTop: hp(1.5),
              paddingTop: hp(1.5),
            }}
          >
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
              {electrodes.map((e, i) => (
                <ElectrodeColumn
                  key={i}
                  label={`Electrode ${i + 1}`}
                  impedance={e.impedance}
                  phaseAngle={e.phaseAngle}
                  showDivider={
                    i < electrodes.length - 1
                  }
                />
              ))}
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

              <Text
                style={{
                  fontSize: wp(3.5),
                  fontWeight: "600",
                  color: colors.primaryText,
                }}
              >
                {item.frequency}

                <Text
                  style={{
                    fontSize: wp(2.8),
                    color: colors.secondaryText,
                  }}
                >
                  {" "}
                  kHz
                </Text>
              </Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}