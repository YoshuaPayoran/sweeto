import { BluetoothIcon } from "@/components/icons";
import { STORAGE_KEYS } from "@/constants/config";
import { useBle } from "@/context/BleContext";
import { useColors } from "@/hooks/useColors";
import { hp, wp } from "@/hooks/useResponsive";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Animated,
  Image,
  Linking,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function enableBluetooth() {
  if (Platform.OS === "android") {
    Linking.sendIntent("android.bluetooth.adapter.action.REQUEST_ENABLE").catch(() => {});
  } else {
    Linking.openURL("App-Prefs:Bluetooth").catch(() => {});
  }
}

async function completeOnboarding() {
  await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, "true");
  router.replace("/(tabs)/home" as any);
}

export default function Onboarding() {
  const colors = useColors();
  const { requestPermissions } = useBle();

  const [showPermModal, setShowPermModal] = useState(false);

  const permScale   = useRef(new Animated.Value(0.85)).current;
  const permOpacity = useRef(new Animated.Value(0)).current;

  const animateIn = () => {
    Animated.parallel([
      Animated.spring(permScale,   { toValue: 1,    friction: 6, tension: 100, useNativeDriver: true }),
      Animated.timing(permOpacity, { toValue: 1,    duration: 250,             useNativeDriver: true }),
    ]).start();
  };

  const animateOut = (callback: () => void) => {
    Animated.parallel([
      Animated.timing(permScale,   { toValue: 0.85, duration: 180, useNativeDriver: true }),
      Animated.timing(permOpacity, { toValue: 0,    duration: 180, useNativeDriver: true }),
    ]).start(() => {
      permScale.setValue(0.85);
      permOpacity.setValue(0);
      callback();
    });
  };

  const handleGetStarted = () => {
    setShowPermModal(true);
    animateIn();
  };

  const handleAllow = () => {
    animateOut(async () => {
      setShowPermModal(false);
      await requestPermissions();
      enableBluetooth();
      await completeOnboarding();
    });
  };

  const handleDontAllow = () => {
    animateOut(async () => {
      setShowPermModal(false);
      await completeOnboarding();
    });
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      edges={["top", "bottom"]}
    >
      {/* ── Main content ── */}
      <View
        className="flex-1 items-center justify-between"
        style={{ paddingHorizontal: wp(6), paddingTop: hp(6), paddingBottom: hp(5) }}
      >
        {/* Badge + App name */}
        <View className="items-center" style={{ gap: hp(1.5) }}>
          <View
            className="items-center justify-center"
            style={{
              backgroundColor: colors.primary + "18",
              borderRadius: wp(3),
              borderWidth: 1,
              borderColor: colors.primary + "40",
              paddingHorizontal: wp(4),
              paddingVertical: hp(0.8),
            }}
          >
            <Text style={{
              fontSize: wp(3),
              fontWeight: "700",
              color: colors.primary,
              letterSpacing: wp(0.3),
              textTransform: "uppercase",
            }}>
              AI • Bioimpedance • System
            </Text>
          </View>
          <Text style={{
            fontSize: wp(9),
            fontWeight: "900",
            color: colors.primaryText,
            letterSpacing: -wp(0.3),
            textAlign: "center",
          }}>
            Sweeto
          </Text>
        </View>

        {/* Sweet potato image */}
        <View className="flex-1 items-center justify-center">
          <View
            className="absolute"
            style={{
              width: wp(72),
              height: wp(72),
              borderRadius: wp(36),
              backgroundColor: colors.primary + "12",
            }}
          />
          <Image
            source={require("@/assets/images/sweetpotato.png")}
            style={{ width: wp(68), height: wp(68) }}
            resizeMode="contain"
          />
        </View>

        {/* Headline + GET STARTED */}
        <View className="items-center" style={{ gap: hp(4), width: "100%" }}>
          <View className="items-center" style={{ gap: hp(1), paddingHorizontal: wp(2) }}>
            <Text style={{
              fontSize: wp(5.8),
              fontWeight: "800",
              color: colors.primaryText,
              textAlign: "center",
              lineHeight: wp(7.5),
              letterSpacing: -wp(0.1),
            }}>
              Assess Sweet Potato Quality
            </Text>
            <Text style={{
              fontSize: wp(3.8),
              color: colors.secondaryText,
              textAlign: "center",
              lineHeight: wp(5.5),
            }}>
              Non-invasively using{" "}
              <Text style={{ color: colors.primary, fontWeight: "600" }}>
                AI-powered Bioimpedance
              </Text>
              {" "}Instrumentation System
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleGetStarted}
            activeOpacity={0.85}
            className="items-center justify-center"
            style={{
              width: "100%",
              paddingVertical: hp(2.2),
              borderRadius: wp(999),
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.35,
              shadowRadius: 16,
              elevation: 6,
            }}
          >
            <Text style={{
              fontSize: wp(4.2),
              fontWeight: "800",
              color: "#FFFFFF",
              letterSpacing: wp(0.2),
            }}>
              GET STARTED
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Permission modal ── */}
      <Modal
        transparent
        visible={showPermModal}
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => {}}
      >
        <View
          className="flex-1 items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
        >
          <Animated.View style={{
            transform: [{ scale: permScale }],
            opacity: permOpacity,
            width: wp(82),
            backgroundColor: colors.cardColor,
            borderRadius: wp(5),
            borderWidth: 1,
            borderColor: colors.borderColor,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.2,
            shadowRadius: 24,
            elevation: 10,
          }}>
            {/* Accent bar */}
            <View style={{ height: hp(0.5), backgroundColor: colors.primary }} />

            <View style={{ padding: wp(6), gap: hp(2.5) }}>
              {/* Icon */}
              <View className="items-center">
                <View
                  className="items-center justify-center"
                  style={{
                    width: wp(16),
                    height: wp(16),
                    borderRadius: wp(8),
                    backgroundColor: colors.primary + "18",
                    borderWidth: 1.5,
                    borderColor: colors.primary + "40",
                  }}
                >
                  <BluetoothIcon color={colors.primary} size={wp(7)} />
                </View>
              </View>

              {/* Text */}
              <View className="items-center" style={{ gap: hp(0.8) }}>
                <Text style={{
                  fontSize: wp(4.5),
                  fontWeight: "800",
                  color: colors.primaryText,
                  textAlign: "center",
                  letterSpacing: -wp(0.1),
                }}>
                  Enable Bluetooth
                </Text>
                <Text style={{
                  fontSize: wp(3.4),
                  color: colors.secondaryText,
                  textAlign: "center",
                  lineHeight: hp(2.6),
                }}>
                  Sweeto needs Bluetooth to connect to your{" "}
                  <Text style={{ color: colors.primaryText, fontWeight: "600" }}>
                    ESP32 device
                  </Text>
                  {" "}for bioimpedance measurements.
                </Text>
              </View>

              <View style={{ height: 1, backgroundColor: colors.borderColor }} />

              {/* Buttons */}
              <View style={{ gap: hp(1.2) }}>
                <TouchableOpacity
                  onPress={handleAllow}
                  activeOpacity={0.85}
                  className="items-center justify-center"
                  style={{
                    paddingVertical: hp(1.8),
                    borderRadius: wp(999),
                    backgroundColor: colors.primary,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  <Text style={{ fontSize: wp(3.8), fontWeight: "700", color: "#FFFFFF" }}>
                    Allow
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleDontAllow}
                  activeOpacity={0.8}
                  className="items-center justify-center"
                  style={{
                    paddingVertical: hp(1.8),
                    borderRadius: wp(999),
                    borderWidth: 1,
                    borderColor: colors.borderColor,
                  }}
                >
                  <Text style={{ fontSize: wp(3.8), fontWeight: "600", color: colors.secondaryText }}>
                    Don't Allow
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}