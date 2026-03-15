import { useColors } from "@/hooks/useColors";
import { hp, wp } from "@/hooks/useResponsive";
import { Text, View } from "react-native";

// ─── Placeholder ──────────────────────────────────────────────────────────────
// 🔄 REPLACE with real data from SQLite / local storage
const PLACEHOLDER_DATA = {
  total: 205,
  good: 60,
  poor: 40,
};
// ─────────────────────────────────────────────────────────────────────────────

export default function TotalScannedCard() {
  const colors = useColors();

  // 🔄 Swap PLACEHOLDER_DATA with your data hook / prop
  const { total, good, poor } = PLACEHOLDER_DATA;

  return (
    <View
      style={{
        padding: wp(5),
        borderRadius: wp(4),
        backgroundColor: colors.cardColor,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
        borderWidth: 1,
        borderColor: colors.primary,
      }}
    >
      {/* Top Row */}
      <View className="flex-row justify-between items-center">
        <View style={{ gap: hp(0.5) }}>
          <Text style={{ fontSize: wp(3), color: colors.secondaryText, fontWeight: "600" }}>
            TOTAL SCANNED
          </Text>
          <Text style={{ fontSize: wp(3), color: colors.primaryText, fontWeight: "600" }}>
            March 2026
          </Text>
        </View>

        <Text style={{ fontSize: wp(8), color: colors.primaryText, fontWeight: "bold" }}>
          {total}
        </Text>
      </View>

      {/* Segmented Progress Bar */}
      <View
        className="flex-row overflow-hidden"
        style={{
          borderRadius: wp(999),
          marginTop: hp(2),
          height: hp(1.2),
          gap: wp(1),
        }}
      >
        <View style={{ flex: good, backgroundColor: colors.deviceConnected }} />
        <View style={{ flex: poor, backgroundColor: colors.deviceDisconnected }} />
      </View>

      {/* Legend */}
      <View
        className="flex-row justify-center"
        style={{ marginTop: hp(1.5), gap: wp(6) }}
      >
        {[
          { label: "Good", color: colors.deviceConnected },
          { label: "Poor", color: colors.deviceDisconnected },
        ].map(({ label, color }) => (
          <View key={label} className="flex-row items-center" style={{ gap: wp(1.5) }}>
            <View
              style={{
                width: wp(2.5),
                height: wp(2.5),
                borderRadius: wp(1.25),
                backgroundColor: color,
              }}
            />
            <Text style={{ fontSize: wp(3), color: colors.secondaryText }}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}