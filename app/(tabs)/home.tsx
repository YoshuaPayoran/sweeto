import { BluetoothIcon, MoonIcon, SunIcon } from "@/components/icons";
import Button from "@/components/ui/Button";
import TotalScannedCard from "@/components/ui/TotalScannedCard";
import { BLE_UUIDS } from "@/constants/config";
import { useBle } from "@/context/BleContext";
import { useColors } from "@/hooks/useColors";
import { hp, wp } from "@/hooks/useResponsive";
import { Buffer } from "buffer";
import { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const colors = useColors();
  const { connectedDevice } = useBle();
  const [impedance, setImpedance] = useState<number | null>(null);
  const [phase, setPhase] = useState<number | null>(null);

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

  const badgeColor = connectedDevice
    ? colors.deviceConnected
    : colors.deviceDisconnected;

  const badgeBackground = connectedDevice
    ? colors.deviceConnectedBackground
    : colors.deviceDisconnectedBackground;

  const badgeLabel = connectedDevice
    ? "Connected"
    : "Not Connected";

  const startAssessment = async () => {
    if (!connectedDevice) return;

    try {
      // Send "start" command to ESP32
      await connectedDevice.writeCharacteristicWithResponseForService(
        BLE_UUIDS.SERVICE,
        BLE_UUIDS.IMPEDANCE,
        Buffer.from("start").toString("base64")
      );
      console.log("Command sent");

      // Small delay before reading (allow ESP32 to notify)
      setTimeout(async () => {
        // Read impedance
        const impChar = await connectedDevice.readCharacteristicForService(
          BLE_UUIDS.SERVICE,
          BLE_UUIDS.IMPEDANCE
        );
        const impValue = Buffer.from(impChar.value!, "base64").readFloatLE(0);
        setImpedance(impValue);

        // Read phase
        const phaseChar = await connectedDevice.readCharacteristicForService(
          BLE_UUIDS.SERVICE,
          BLE_UUIDS.PHASE_ANGLE
        );
        const phaseValue = Buffer.from(phaseChar.value!, "base64").readFloatLE(0);
        setPhase(phaseValue);

        console.log("BLE data received:", { impedance: impValue, phase: phaseValue });
      }, 500);

    } catch (e) {
      console.error("BLE error:", e);
    }
  };

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

      <View
        className="flex-1"
        style={{ paddingHorizontal: wp(4), paddingBottom: hp(4) }}
      >
        {/* Bluetooth status badge */}
        <View className="flex-row justify-center" style={{ marginTop: hp(3) }}>
          <View
            className="flex-row items-center"
            style={{
              backgroundColor: badgeBackground,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: badgeColor,
              paddingHorizontal: wp(6),
              paddingVertical: hp(1),
              gap: wp(3),
            }}
          >
            <BluetoothIcon color={badgeColor} size={wp(4.5)} />
            <Text style={{ fontSize: wp(3), color: badgeColor, fontWeight: "600" }}>
              {badgeLabel}
            </Text>
          </View>
        </View>

        {/* Sweet potato image */}
        <Image
          source={require("@/assets/images/sweetpotato.png")}
          className="self-center"
          style={{ width: wp(70), height: wp(70), marginTop: hp(2) }}
          resizeMode="contain"
        />

        {/* Start Assessment CTA */}
        <View style={{ marginTop: hp(2) }}>
          <Button label="Start Assessment" onPress={startAssessment} />
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
      </View>
    </SafeAreaView>
  );
}