import { MoonIcon, SunIcon } from "@/components/icons";
import Button from "@/components/ui/Button";
import TotalScannedCard from "@/components/ui/TotalScannedCard";
import { useColors } from "@/hooks/useColors";
import { hp, wp } from "@/hooks/useResponsive";
import { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const colors = useColors();
  const [now, setNow] = useState(new Date());

  // Live clock — updates every second
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const themeIconColor = colors.isDark ? "#FACC15" : "#1E1E2D";

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={["top"]}>
      {/* Header */}
      <View
        className="flex-row justify-between items-center"
        style={{ paddingHorizontal: wp(4), paddingVertical: hp(1.5) }}
      >
        <View style={{ gap: hp(0.2) }}>
          <Text style={{ fontSize: wp(3), color: colors.secondaryText, fontWeight: "600" }}>
            TODAY IS
          </Text>
          <Text style={{ fontSize: wp(3.5), color: colors.primaryText, fontWeight: "bold" }}>
            {formattedDate}
          </Text>
          <Text style={{ fontSize: wp(3.5), color: colors.primaryText, fontWeight: "bold" }}>
            {formattedTime}
          </Text>
        </View>

        <TouchableOpacity
          onPress={colors.toggleTheme}
          style={{
            padding: wp(2.5),
            borderRadius: 999,
            backgroundColor: colors.iconBackground,
          }}
        >
          {colors.isDark
            ? <SunIcon color={themeIconColor} size={wp(5)} />
            : <MoonIcon color={themeIconColor} size={wp(5)} />
          }
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: wp(4), paddingBottom: hp(4) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Sweet potato image */}
        <Image
          source={require("@/assets/images/sweetpotato.png")}
          className="self-center"
          style={{ width: wp(70), height: wp(70), marginTop: hp(4) }}
          resizeMode="contain"
        />

        {/* Start Assessment CTA */}
        <View style={{ marginTop: hp(2) }}>
          <Button label="Start Assessment" onPress={() => {}} />
        </View>

        {/* This month section */}
        <View style={{ marginTop: hp(3) }}>
          <Text
            style={{
              fontSize: wp(3.5),
              color: colors.secondaryText,
              fontWeight: "600",
              textTransform: "uppercase",
            }}
          >
            This month
          </Text>
        </View>

        <View style={{ marginTop: hp(2) }}>
          <TotalScannedCard />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}