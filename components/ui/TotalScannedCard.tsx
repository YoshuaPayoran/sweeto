import { getMeasurementStats } from "@/db";
import { useColors } from "@/hooks/useColors";
import { hp, wp } from "@/hooks/useResponsive";
import { Text, View } from "react-native";

export default function TotalScannedCard() {
  const colors = useColors();

  // Fetch current month's stats from SQLite
  const now   = new Date();
  const month = now.getMonth() + 1;
  const year  = now.getFullYear();
  const { good, poor, total } = getMeasurementStats(month, year);

  // Current month label e.g. "April 2026"
  const monthLabel = now.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

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
          {/* Dynamic current month label */}
          <Text style={{ fontSize: wp(3), color: colors.primaryText, fontWeight: "600" }}>
            {monthLabel}
          </Text>
        </View>

        {/* Dynamic total count */}
        <Text style={{ fontSize: wp(8), color: colors.primaryText, fontWeight: "bold" }}>
          {total}
        </Text>
      </View>

      {/* Segmented Progress Bar — falls back gracefully when total is 0 */}
      <View
        className="flex-row overflow-hidden"
        style={{
          borderRadius: wp(999),
          marginTop: hp(2),
          height: hp(1.2),
          gap: wp(1),
        }}
      >
        {total === 0 ? (
          // Empty state bar when no data
          <View style={{ flex: 1, backgroundColor: colors.borderColor }} />
        ) : (
          <>
            <View style={{ flex: good, backgroundColor: colors.deviceConnected }} />
            <View style={{ flex: poor, backgroundColor: colors.deviceDisconnected }} />
          </>
        )}
      </View>

      {/* Legend with live counts */}
      <View
        className="flex-row justify-center"
        style={{ marginTop: hp(1.5), gap: wp(6) }}
      >
        {[
          { label: "Good", color: colors.deviceConnected, count: good },
          { label: "Poor", color: colors.deviceDisconnected, count: poor },
        ].map(({ label, color, count }) => (
          <View key={label} className="flex-row items-center" style={{ gap: wp(1.5) }}>
            <View
              style={{
                width: wp(2.5),
                height: wp(2.5),
                borderRadius: wp(1.25),
                backgroundColor: color,
              }}
            />
            <Text style={{ fontSize: wp(3), color: colors.secondaryText }}>
              {label} ({count})
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}