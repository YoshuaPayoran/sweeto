import { BluetoothIcon } from "@/components/icons";
import { useBle } from "@/context/BleContext";
import { useColors } from "@/hooks/useColors";
import { hp, wp } from "@/hooks/useResponsive";
import { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Device } from "react-native-ble-plx";

type Props = {
  visible: boolean;
  onClose: () => void;
};

function DeviceItem({
  device,
  onConnect,
  isConnecting,
}: {
  device: Device;
  onConnect: (device: Device) => void;
  isConnecting: boolean;
}) {
  const colors = useColors();
  return (
    <TouchableOpacity
      onPress={() => onConnect(device)}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: hp(1.8),
        paddingHorizontal: wp(4),
        gap: wp(3),
        borderBottomWidth: 1,
        borderBottomColor: colors.borderColor,
      }}
    >
      {/* Icon */}
      <View
        style={{
          width: wp(10),
          height: wp(10),
          borderRadius: wp(2.5),
          backgroundColor: colors.primary + "22",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <BluetoothIcon color={colors.primary} size={wp(5)} />
      </View>

      {/* Device info */}
      <View style={{ flex: 1, gap: hp(0.3) }}>
        <Text style={{ fontSize: wp(3.5), fontWeight: "600", color: colors.primaryText }}>
          {device.name ?? "Unknown Device"}
        </Text>
        <Text style={{ fontSize: wp(2.8), color: colors.secondaryText }}>
          {device.id}
        </Text>
      </View>

      {/* Connect button */}
      {isConnecting ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <View
          style={{
            paddingHorizontal: wp(3.5),
            paddingVertical: hp(0.7),
            borderRadius: wp(999),
            backgroundColor: colors.primary,
          }}
        >
          <Text style={{ fontSize: wp(3), fontWeight: "600", color: "#fff" }}>
            Connect
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function DeviceScanModal({ visible, onClose }: Props) {
  const colors = useColors();
  const { isScanning, isConnecting, scannedDevices, startScan, stopScan, connectToDevice } = useBle();

  // Auto-start scan when modal opens, stop when it closes
  useEffect(() => {
    if (visible) {
      // Small delay ensures BLE stack is ready, especially after a disconnect
      const timer = setTimeout(() => startScan(), 300);
      return () => clearTimeout(timer);
    } else {
      stopScan();
    }
  }, [visible]);

  const handleConnect = async (device: Device) => {
    await connectToDevice(device);
    onClose();
  };

  const handleClose = () => {
    stopScan();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      {/* Backdrop */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleClose}
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        {/* Sheet — stop press from bubbling to backdrop */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {}}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: colors.background,
            borderTopLeftRadius: wp(6),
            borderTopRightRadius: wp(6),
            maxHeight: hp(70),
            paddingBottom: hp(4),
          }}
        >
          {/* Handle bar */}
          <View
            style={{
              width: wp(10),
              height: hp(0.5),
              borderRadius: 999,
              backgroundColor: colors.borderColor,
              alignSelf: "center",
              marginTop: hp(1.5),
              marginBottom: hp(2),
            }}
          />

          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: wp(4),
              marginBottom: hp(1),
            }}
          >
            <View style={{ gap: hp(0.3) }}>
              <Text style={{ fontSize: wp(4.5), fontWeight: "bold", color: colors.primaryText }}>
                Select Device
              </Text>
              <Text style={{ fontSize: wp(3), color: colors.secondaryText }}>
                {isScanning
                  ? "Scanning for nearby devices..."
                  : `${scannedDevices.length} device${scannedDevices.length !== 1 ? "s" : ""} found`}
              </Text>
            </View>

            {/* Scan indicator / rescan button */}
            {isScanning ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <TouchableOpacity
                onPress={startScan}
                style={{
                  paddingHorizontal: wp(3.5),
                  paddingVertical: hp(0.7),
                  borderRadius: wp(999),
                  borderWidth: 1,
                  borderColor: colors.primary,
                }}
              >
                <Text style={{ fontSize: wp(3), fontWeight: "600", color: colors.primary }}>
                  Rescan
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: colors.borderColor, marginBottom: hp(0.5) }} />

          {/* Device list */}
          {scannedDevices.length === 0 && !isScanning ? (
            <View style={{ alignItems: "center", paddingVertical: hp(6), gap: hp(1) }}>
              <BluetoothIcon color={colors.secondaryText} size={wp(10)} />
              <Text style={{ fontSize: wp(3.5), color: colors.secondaryText }}>
                No devices found
              </Text>
              <Text style={{ fontSize: wp(3), color: colors.secondaryText, textAlign: "center", paddingHorizontal: wp(8) }}>
                Make sure your device is powered on and nearby
              </Text>
            </View>
          ) : (
            <FlatList
              data={scannedDevices}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <DeviceItem
                  device={item}
                  onConnect={handleConnect}
                  isConnecting={isConnecting}
                />
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: hp(2) }}
            />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}