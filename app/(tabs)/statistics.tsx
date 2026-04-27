import Chart from "@/components/ui/Chart";
import DropdownMenu from "@/components/ui/DropdownMenu";
import MeasurementCard from "@/components/ui/MeasurementCard";
import SummaryCard from "@/components/ui/SummaryCard";
import { getAvailableMonths, getAvailableYears, getMeasurementsByMonthYear, getMeasurementStats } from "@/db";
import { useColors } from "@/hooks/useColors";
import { hp, wp } from "@/hooks/useResponsive";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const currentYear  = String(new Date().getFullYear());
const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");

export default function Statistics() {
  const colors = useColors();

  const [selectedYear,  setSelectedYear]  = useState<string>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);

  // Dynamically loaded dropdown options from SQLite
  const yearOptions  = getAvailableYears();
  const monthOptions = getAvailableMonths(selectedYear);

  // Fetch measurements and stats based on selected month and year
  const measurements = getMeasurementsByMonthYear(
    parseInt(selectedMonth),
    parseInt(selectedYear)
  );

  const { good, poor, total } = getMeasurementStats(
    parseInt(selectedMonth),
    parseInt(selectedYear)
  );

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
              options={monthOptions}
              placeholder="Select month"
              value={selectedMonth}
              onSelect={(value) => setSelectedMonth(value)}
            />
          </View>
          <View className="flex-1">
            <DropdownMenu
              options={yearOptions}
              placeholder="Select year"
              value={selectedYear}
              onSelect={(value) => {
                setSelectedYear(value);
                // Reset to January when switching to a different year
                setSelectedMonth("01");
              }}
            />
          </View>
        </View>

        {/* Distribution chart — passes live data */}
        <Chart good={good} poor={poor} total={total} />

        {/* Summary cards — live percentages */}
        <View style={{ gap: hp(1.5), marginTop: hp(2) }}>
          <SummaryCard
            imgsrc={require("@/assets/images/goodpotato.png")}
            qualityLabel="Good Quality"
            value={good}
            accentColor={colors.deviceConnected}
          />
          <SummaryCard
            imgsrc={require("@/assets/images/poorpotato.png")}
            qualityLabel="Poor Quality"
            value={poor}
            accentColor={colors.deviceDisconnected}
          />
        </View>

        {/* Measurement history — filtered by selected month and year */}
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

          {measurements.length === 0 ? (
            <View
              className="items-center"
              style={{ paddingVertical: hp(4), gap: hp(1) }}
            >
              <Text style={{ fontSize: wp(3.5), color: colors.secondaryText }}>
                No measurements found
              </Text>
              <Text
                style={{
                  fontSize: wp(3),
                  color: colors.secondaryText,
                  textAlign: "center",
                  paddingHorizontal: wp(8),
                }}
              >
                No data recorded for the selected month and year
              </Text>
            </View>
          ) : (
            // Fixed height scrollable container — shows ~3 cards then scrolls
            <ScrollView
              style={{ maxHeight: hp(55), marginTop: hp(2) }}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled                   // ← required for scroll inside scroll
              contentContainerStyle={{ gap: hp(1.5), paddingBottom: hp(0.5) }}
            >
              {measurements.map((item) => (
                <MeasurementCard
                  key={item.id}
                  item={{
                    id: String(item.id),
                    quality: item.quality,
                    impedanceMagnitude: item.impedance,
                    phaseAngle: item.phase_angle,
                    frequency: item.frequency,
                    datetime: item.datetime,
                  }}
                />
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}