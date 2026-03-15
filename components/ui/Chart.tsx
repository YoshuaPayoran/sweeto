import { useColors } from "@/hooks/useColors";
import { hp, wp } from "@/hooks/useResponsive";
import { Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

// ─── Placeholder ──────────────────────────────────────────────────────────────
// 🔄 REPLACE with real data from SQLite / local storage
const PLACEHOLDER_DATA = {
  good: 60,
  poor: 40,
  total: 205,
};
// ─────────────────────────────────────────────────────────────────────────────

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View className="items-start" style={{ gap: hp(0.5) }}>
      <View className="flex-row items-center" style={{ gap: wp(1.5) }}>
        <View
          style={{
            width: wp(2.5),
            height: wp(2.5),
            borderRadius: wp(1.25),
            backgroundColor: color,
          }}
        />
        <Text style={{ fontSize: wp(3), color, fontWeight: "600" }}>{label}</Text>
      </View>
      <Text style={{ fontSize: wp(2.8), color, marginLeft: wp(4) }}>Quality</Text>
    </View>
  );
}

export default function Chart() {
  const colors = useColors();

  // 🔄 Swap with your data hook / prop
  const data = PLACEHOLDER_DATA;

  const chartData = [
    { value: data.good, color: colors.deviceConnected,    text: `${data.good}%` },
    { value: data.poor, color: colors.deviceDisconnected, text: `${data.poor}%` },
  ];

  return (
    <View
      className="overflow-hidden"
      style={{
        backgroundColor: colors.cardColor,
        borderRadius: wp(5),
        paddingVertical: wp(5),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
        borderWidth: 1,
        borderColor: colors.borderColor,
      }}
    >
      <Text
        style={{
          fontSize: wp(4),
          color: colors.primaryText,
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        Distribution Overview
      </Text>

      <View className="items-center">
        <PieChart
          donut
          data={chartData}
          radius={wp(22)}
          innerRadius={wp(10)}
          innerCircleColor={colors.cardColor}
          strokeColor={colors.cardColor}
          strokeWidth={5}
          showText
          textColor={colors.primaryText}
          textSize={wp(3.2)}
          fontWeight="bold"
          labelsPosition="outward"
          showValuesAsLabels
          extraRadius={wp(6)}
        />
      </View>

      <View className="flex-row justify-around">
        <LegendItem color={colors.deviceConnected}    label="Good" />
        <LegendItem color={colors.deviceDisconnected} label="Poor" />
      </View>
    </View>
  );
}