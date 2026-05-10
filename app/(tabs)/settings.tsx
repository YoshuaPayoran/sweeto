import { BluetoothIcon, ChevronIcon, MoonIcon, SettingsIcon } from "@/components/icons";
import DeviceScanModal from "@/components/ui/DeviceScanModal";
import { VARIETIES, Variety } from "@/constants/varieties";
import { useBle } from "@/context/BleContext";
import { useVariety } from "@/context/VarietyContext";
import { useColors } from "@/hooks/useColors";
import { hp, wp } from "@/hooks/useResponsive";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { State } from "react-native-ble-plx";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Local sub-components ─────────────────────────────────────────────────────

function SectionLabel({ title, marginTop = false }: { title: string; marginTop?: boolean }) {
  const colors = useColors();
  return (
    <Text
      style={{
        fontSize: wp(3.2),
        fontWeight: "600",
        color: colors.secondaryText,
        marginBottom: hp(1),
        marginTop: marginTop ? hp(3) : 0,
        marginLeft: wp(1),
        textTransform: "uppercase",
        letterSpacing: wp(0.2),
      }}
    >
      {title}
    </Text>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View
      className="overflow-hidden"
      style={{
        backgroundColor: colors.cardColor,
        borderRadius: wp(4),
        borderWidth: 1,
        borderColor: colors.borderColor,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {children}
    </View>
  );
}

function SettingRow({
  icon,
  iconBg,
  title,
  subtitle,
  right,
  onPress,
  showBorder = true,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  showBorder?: boolean;
}) {
  const colors = useColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      className="flex-row items-center"
      style={{
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.8),
        gap: wp(3),
        borderBottomWidth: showBorder ? 1 : 0,
        borderBottomColor: colors.borderColor,
      }}
    >
      <View
        className="items-center justify-center"
        style={{
          width: wp(9),
          height: wp(9),
          borderRadius: wp(2.5),
          backgroundColor: iconBg,
        }}
      >
        {icon}
      </View>

      <View className="flex-1" style={{ gap: hp(0.3) }}>
        <Text style={{ fontSize: wp(3.5), fontWeight: "600", color: colors.primaryText }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{ fontSize: wp(3), color: colors.secondaryText }}>{subtitle}</Text>
        )}
      </View>

      {right}
    </TouchableOpacity>
  );
}

// ─── Variety Selector ─────────────────────────────────────────────────────────

function VarietySelector() {
  const colors = useColors();
  const { selectedVariety, setVariety, isLoadingVariety } = useVariety();

  if (isLoadingVariety) {
    return (
      <View style={{ 
        padding: wp(4), 
        alignItems: "center",
        backgroundColor: colors.cardColor,
        borderRadius: wp(4),
      }}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  return (
    <Section>
      {VARIETIES.map((variety: Variety, index: number) => {
        const isSelected = selectedVariety.id === variety.id;
        // ... rest ng code mo, same
        const isLast = index === VARIETIES.length - 1;

        return (
          <TouchableOpacity
            key={variety.id}
            onPress={() => setVariety(variety.id)}
            activeOpacity={0.7}
            className="flex-row items-center"
            style={{
              paddingHorizontal: wp(4),
              paddingVertical: hp(1.8),
              gap: wp(3),
              borderBottomWidth: isLast ? 0 : 1,
              borderBottomColor: colors.borderColor,
            }}
          >
            {/* Color dot icon */}
            <View
              className="items-center justify-center"
              style={{
                width: wp(9),
                height: wp(9),
                borderRadius: wp(2.5),
                backgroundColor: variety.color + "22",
              }}
            >
              <View
                style={{
                  width: wp(4),
                  height: wp(4),
                  borderRadius: wp(2),
                  backgroundColor: variety.color,
                }}
              />
            </View>

            {/* Label + description */}
            <View className="flex-1" style={{ gap: hp(0.3) }}>
              <Text
                style={{
                  fontSize: wp(3.5),
                  fontWeight: "600",
                  color: isSelected ? variety.color : colors.primaryText,
                }}
              >
                {variety.label}
              </Text>
              <Text style={{ fontSize: wp(3), color: colors.secondaryText }}>
                {variety.description}
              </Text>
            </View>

            {/* Checkmark if selected */}
            {isSelected ? (
              <View
                style={{
                  width: wp(5.5),
                  height: wp(5.5),
                  borderRadius: wp(3),
                  backgroundColor: variety.color,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#fff", fontSize: wp(3), fontWeight: "bold" }}>✓</Text>
              </View>
            ) : (
              <View
                style={{
                  width: wp(5.5),
                  height: wp(5.5),
                  borderRadius: wp(3),
                  borderWidth: 1.5,
                  borderColor: colors.borderColor,
                }}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </Section>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function Settings() {
  const colors = useColors();
  const {
    isConnected,
    isScanning,
    isConnecting,
    deviceName,
    disconnectDevice,
    bleState,
  } = useBle();
  const [scanModalVisible, setScanModalVisible] = useState(false);

  const bleStatusColor = isConnected
    ? colors.deviceConnected
    : isConnecting || isScanning
    ? "#F59E0B"
    : colors.deviceDisconnected;

  const bleStatusText = isConnected
    ? "Connected"
    : isConnecting
    ? "Connecting..."
    : isScanning
    ? "Scanning..."
    : "Disconnected";

  const bleSubtitle = isConnected
    ? `Device: ${deviceName ?? "Unknown Device"}`
    : isConnecting || isScanning
    ? "Please wait..."
    : bleState !== State.PoweredOn
    ? "Turn on your Bluetooth"
    : "Tap to connect your device";

  const deviceStatusColor = isConnected
    ? colors.deviceConnected
    : colors.deviceDisconnected;

  const deviceStatusLabel = isConnected ? "Active" : "Inactive";

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
            marginTop: hp(2),
            marginBottom: hp(3),
            letterSpacing: wp(0.2),
          }}
        >
          Settings
        </Text>

        {/* Header card */}
        <View
          className="flex-row items-center"
          style={{
            backgroundColor: colors.primary,
            borderRadius: wp(4),
            padding: wp(5),
            gap: wp(4),
            marginBottom: hp(3),
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <View
            className="items-center justify-center"
            style={{
              width: wp(14),
              height: wp(14),
              borderRadius: wp(7),
              backgroundColor: "rgba(255,255,255,0.2)",
            }}
          >
            <SettingsIcon color="#fff" size={wp(5.5)} />
          </View>
          <View>
            <Text style={{ fontSize: wp(4.5), fontWeight: "bold", color: "#fff" }}>
              Settings
            </Text>
            <Text
              style={{ fontSize: wp(3), color: "rgba(255,255,255,0.75)", marginTop: hp(0.3) }}
            >
              Customize your app experience
            </Text>
          </View>
        </View>

        {/* System Information */}
        <SectionLabel title="System Information" />
        <Section>
          <SettingRow
            icon={
              <View
                style={{
                  width: wp(2),
                  height: wp(2),
                  borderRadius: wp(1),
                  backgroundColor: deviceStatusColor,
                }}
              />
            }
            iconBg={colors.deviceConnected + "22"}
            title="Device Status"
            right={
              <Text style={{ fontSize: wp(3.2), fontWeight: "600", color: deviceStatusColor }}>
                {deviceStatusLabel}
              </Text>
            }
          />
          <SettingRow
            icon={
              <Text style={{ fontSize: wp(3), fontWeight: "bold", color: colors.primary }}>v</Text>
            }
            iconBg={colors.primary + "22"}
            title="App Version"
            showBorder={false}
            right={
              <Text style={{ fontSize: wp(3.2), color: colors.secondaryText }}>1.0.0</Text>
            }
          />
        </Section>

        {/* Sweet Potato Variety */}
        <SectionLabel title="Sweet Potato Variety" marginTop />

        <VarietySelector />

        {/* Preferences */}
        <SectionLabel title="Preferences" marginTop />
        <Section>
          <SettingRow
            icon={<MoonIcon color="#fff" size={18} />}
            iconBg={colors.primary}
            title="Theme"
            subtitle={colors.isDark ? "Dark Mode" : "Light Mode"}
            showBorder={false}
            right={
              <Switch
                value={colors.isDark}
                onValueChange={colors.toggleTheme}
                trackColor={{ false: colors.secondaryText, true: colors.primary }}
                thumbColor="#fff"
              />
            }
          />
        </Section>

        {/* Device — BLE */}
        <SectionLabel title="Device" marginTop />
        <Section>
          <SettingRow
            icon={<BluetoothIcon color="#fff" size={18} />}
            iconBg={bleStatusColor}
            title="Bluetooth"
            subtitle={bleSubtitle}
            showBorder={isConnected}
            onPress={
              !isConnected && !isScanning && !isConnecting && bleState === State.PoweredOn
                ? () => setScanModalVisible(true)
                : undefined
            }
            right={
              isScanning || isConnecting ? (
                <ActivityIndicator size="small" color={bleStatusColor} />
              ) : isConnected ? (
                <View className="flex-row items-center" style={{ gap: wp(2) }}>
                  <View
                    style={{
                      width: wp(2),
                      height: wp(2),
                      borderRadius: wp(1),
                      backgroundColor: colors.deviceConnected,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: wp(3.2),
                      fontWeight: "600",
                      color: colors.deviceConnected,
                    }}
                  >
                    {bleStatusText}
                  </Text>
                </View>
              ) : (
                <ChevronIcon color={colors.secondaryText} size={wp(4)} />
              )
            }
          />

          {isConnected && (
            <SettingRow
              icon={
                <View
                  style={{
                    width: wp(2),
                    height: wp(2),
                    borderRadius: wp(1),
                    backgroundColor: colors.deviceDisconnected,
                  }}
                />
              }
              iconBg={colors.deviceDisconnected + "22"}
              title="Disconnect"
              subtitle="Remove device connection"
              showBorder={false}
              onPress={disconnectDevice}
              right={<ChevronIcon color={colors.secondaryText} size={wp(4)} />}
            />
          )}
        </Section>

        {/* Footer */}
        <View className="items-center" style={{ marginTop: hp(4) }}>
          <Text style={{ fontSize: wp(3), color: colors.secondaryText }}>
            Sweet Potato AI Detection System
          </Text>
          <Text style={{ fontSize: wp(2.8), color: colors.secondaryText, marginTop: hp(0.5) }}>
            © 2025 All rights reserved
          </Text>
        </View>
      </ScrollView>

      <DeviceScanModal
        visible={scanModalVisible}
        onClose={() => setScanModalVisible(false)}
      />
    </SafeAreaView>
  );
}