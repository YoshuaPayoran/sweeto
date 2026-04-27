import { useColors } from "@/hooks/useColors";
import { hp, wp } from "@/hooks/useResponsive";
import { Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

type Props = {
  good: number;
  poor: number;
  total: number;
};

function LegendItem({ color, label }: { color: string; label: string }) {
  const colors = useColors();
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

export default function Chart({ good, poor, total }: Props) {
  const colors = useColors();

  const chartData = total === 0
    ? [{ value: 1, color: colors.borderColor }]   // ← remove text from here
    : [
        { value: good, color: colors.deviceConnected,    text: `${Math.round((good / total) * 100)}%` },
        { value: poor, color: colors.deviceDisconnected, text: `${Math.round((poor / total) * 100)}%` },
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

      {/* Pie chart with centered "No data" label when empty */}
      <View className="items-center">
        <PieChart
          donut
          data={chartData}
          radius={wp(22)}
          innerRadius={wp(10)}
          innerCircleColor={colors.cardColor}
          strokeColor={colors.cardColor}
          strokeWidth={5}
          showText={total > 0}
          textColor={colors.primaryText}
          textSize={wp(3.2)}
          fontWeight="bold"
          labelsPosition="outward"
          showValuesAsLabels
          extraRadius={wp(6)}
          centerLabelComponent={() =>      
            total === 0 ? (
              <Text
                style={{
                  fontSize: wp(3),
                  color: colors.secondaryText,
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                No data
              </Text>
            ) : null
          }
        />
      </View>

      <View className="flex-row justify-around">
        <LegendItem color={colors.deviceConnected}    label="Good" />
        <LegendItem color={colors.deviceDisconnected} label="Poor" />
      </View>
    </View>
  );
}