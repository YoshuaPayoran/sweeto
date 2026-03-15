import { Measurement } from "@/constants/types";
import { useColors } from "@/hooks/useColors";
import { hp, wp } from "@/hooks/useResponsive";
import { Text, View } from "react-native";

type Props = { item: Measurement };

function MetricItem({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  const colors = useColors();
  return (
    <View className="items-center" style={{ gap: hp(0.3) }}>
      <Text style={{ fontSize: wp(3.8), fontWeight: "700", color: colors.primaryText }}>
        {value}
        <Text style={{ fontSize: wp(2.8), fontWeight: "400", color: colors.secondaryText }}>
          {" "}{unit}
        </Text>
      </Text>
      <Text style={{ fontSize: wp(2.6), color: colors.secondaryText }}>{label}</Text>
    </View>
  );
}

export default function MeasurementCard({ item }: Props) {
  const colors = useColors();

  const isGood = item.quality === "good";
  const accentColor = isGood ? colors.deviceConnected : colors.deviceDisconnected;

  const formattedDate = new Date(item.datetime).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = new Date(item.datetime).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View
      className="overflow-hidden"
      style={{
        backgroundColor: colors.cardColor,
        borderRadius: wp(1),
        borderWidth: 1,
        borderColor: colors.borderColor,
        shadowColor: accentColor,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* Accent top bar */}
      <View style={{ height: hp(0.5), backgroundColor: accentColor }} />

      <View style={{ padding: wp(4), gap: hp(1.5) }}>
        {/* Header Row */}
        <View className="flex-row justify-between items-center">
          {/* Quality Badge */}
          <View
            className="flex-row items-center"
            style={{
              gap: wp(1.5),
              backgroundColor: accentColor + "22",
              borderRadius: wp(2),
              borderWidth: 1,
              borderColor: accentColor + "55",
              paddingHorizontal: wp(3),
              paddingVertical: hp(0.5),
            }}
          >
            <View
              style={{
                width: wp(2),
                height: wp(2),
                borderRadius: wp(1),
                backgroundColor: accentColor,
              }}
            />
            <Text style={{ fontSize: wp(3.2), fontWeight: "700", color: accentColor }}>
              {isGood ? "Good" : "Poor"}
            </Text>
          </View>

          {/* DateTime */}
          <View className="items-end" style={{ gap: hp(0.2) }}>
            <Text style={{ fontSize: wp(3), fontWeight: "600", color: colors.primaryText }}>
              {formattedDate}
            </Text>
            <Text style={{ fontSize: wp(2.8), color: colors.secondaryText }}>
              {formattedTime}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: colors.borderColor }} />

        {/* Metrics Row */}
        <View className="flex-row justify-between items-center">
          <MetricItem label="Impedance" value={item.impedanceMagnitude} unit="Ω" />
          <View style={{ width: 1, height: hp(5), backgroundColor: colors.borderColor }} />
          <MetricItem label="Phase Angle" value={item.phaseAngle} unit="°" />
          <View style={{ width: 1, height: hp(5), backgroundColor: colors.borderColor }} />
          <MetricItem label="Frequency" value={item.frequency} unit="Hz" />
        </View>
      </View>
    </View>
  );
}