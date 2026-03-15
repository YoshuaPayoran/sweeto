import Chart from "@/components/ui/Chart";
import DropdownMenu from "@/components/ui/DropdownMenu";
import MeasurementCard from "@/components/ui/MeasurementCard";
import SummaryCard from "@/components/ui/SummaryCard";
import { MONTH_OPTIONS, YEAR_OPTIONS } from "@/constants/config";
import { Measurement } from "@/constants/types";
import { useColors } from "@/hooks/useColors";
import { hp, wp } from "@/hooks/useResponsive";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Placeholder ──────────────────────────────────────────────────────────────
// 🔄 REPLACE with real data from SQLite
const PLACEHOLDER_MEASUREMENTS: Measurement[] = [
  { id: "1", quality: "good", impedanceMagnitude: 120.45, phaseAngle: -23.5,  frequency: 1000, datetime: "2026-03-08T10:30:00.000Z" },
  { id: "2", quality: "poor", impedanceMagnitude: 89.12,  phaseAngle: -45.2,  frequency: 1000, datetime: "2026-03-08T11:15:00.000Z" },
  { id: "3", quality: "good", impedanceMagnitude: 115.80, phaseAngle: -20.1,  frequency: 1000, datetime: "2026-03-07T09:00:00.000Z" },
];

const PLACEHOLDER_STATS = { goodCount: 2, poorCount: 1, total: 3 };
// ─────────────────────────────────────────────────────────────────────────────

export default function Statistics() {
  const colors = useColors();

  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  // 🔄 Swap these with your SQLite query results
  const { goodCount, poorCount, total } = PLACEHOLDER_STATS;
  const measurements = PLACEHOLDER_MEASUREMENTS;

  const goodPercent = total > 0 ? Math.round((goodCount / total) * 100) : 0;
  const poorPercent = total > 0 ? Math.round((poorCount / total) * 100) : 0;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: wp(4), paddingBottom: hp(4) }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontSize: wp(6),
            fontWeight: "bold",
            color: colors.primaryText,
            letterSpacing: wp(0.2),
            marginTop: hp(2),
            marginBottom: hp(2),
          }}
        >
          Statistics
        </Text>

        {/* Month / Year filters */}
        <View className="flex-row" style={{ gap: wp(3), marginBottom: hp(2) }}>
          <View className="flex-1">
            <DropdownMenu
              options={MONTH_OPTIONS as any}
              placeholder="Select month"
              onSelect={(value) => setSelectedMonth(value)}
            />
          </View>
          <View className="flex-1">
            <DropdownMenu
              options={YEAR_OPTIONS as any}
              placeholder="Select year"
              onSelect={(value) => setSelectedYear(value)}
            />
          </View>
        </View>

        {/* Distribution chart */}
        <Chart />

        {/* Summary cards */}
        <View style={{ gap: hp(1.5), marginTop: hp(2) }}>
          <SummaryCard
            imgsrc={require("@/assets/images/goodpotato.png")}
            qualityLabel="Good Quality"
            value={goodPercent}
            accentColor={colors.deviceConnected}
          />
          <SummaryCard
            imgsrc={require("@/assets/images/poorpotato.png")}
            qualityLabel="Poor Quality"
            value={poorPercent}
            accentColor={colors.deviceDisconnected}
          />
        </View>

        {/* Measurement history */}
        <View style={{ marginTop: hp(3) }}>
          <Text
            style={{
              fontSize: wp(3.5),
              color: colors.secondaryText,
              fontWeight: "600",
              textTransform: "uppercase",
            }}
          >
            Measurements
          </Text>
          <View style={{ gap: hp(1.5), marginTop: hp(2) }}>
            {measurements.map((item) => (
              <MeasurementCard key={item.id} item={item} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}