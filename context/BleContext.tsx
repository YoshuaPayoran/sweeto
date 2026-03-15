import { BLE_UUIDS } from "@/constants/config";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { BleManager, Device, State } from "react-native-ble-plx";

// ─── Permission helper ────────────────────────────────────────────────────────

async function requestBlePermissions(): Promise<boolean> {
  if (Platform.OS !== "android") return true; // iOS handles via Info.plist

  if (Platform.Version >= 31) {
    // Android 12+
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);
    return Object.values(results).every(
      (r) => r === PermissionsAndroid.RESULTS.GRANTED
    );
  } else {
    // Android 11 and below
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type BleContextType = {
  bleState: State;
  connectedDevice: Device | null;
  isConnected: boolean;
  deviceName: string | null;
  isScanning: boolean;
  isConnecting: boolean;
  scannedDevices: Device[];
  startScan: () => void;
  stopScan: () => void;
  connectToDevice: (device: Device) => Promise<void>;
  disconnectDevice: () => Promise<void>;
  readImpedance: () => Promise<number | null>;
  readPhaseAngle: () => Promise<number | null>;
};

const BleContext = createContext<BleContextType>({} as BleContextType);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function BleProvider({ children }: { children: React.ReactNode }) {
  const manager = useRef(new BleManager()).current;

  const [bleState, setBleState]               = useState<State>(State.Unknown);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [isScanning, setIsScanning]           = useState(false);
  const [isConnecting, setIsConnecting]       = useState(false);
  const [scannedDevices, setScannedDevices]   = useState<Device[]>([]);

  const isConnected = !!connectedDevice;
  const deviceName  = connectedDevice?.name ?? null;

  useEffect(() => {
    const sub = manager.onStateChange(setBleState, true);
    return () => {
      sub.remove();
      manager.destroy();
    };
  }, []);

  const stopScan = useCallback(() => {
    manager.stopDeviceScan();
    setIsScanning(false);
  }, []);

  const startScan = useCallback(async () => {
    if (isScanning || bleState !== State.PoweredOn) return;

    const granted = await requestBlePermissions();
    if (!granted) {
      console.warn("BLE permissions not granted");
      return;
    }

    setScannedDevices([]);
    setIsScanning(true);

    // Small delay to let recently disconnected devices start re-advertising
    await new Promise((resolve) => setTimeout(resolve, 500));

    manager.startDeviceScan(
      null,
      { allowDuplicates: false, scanMode: 2 }, // scanMode 2 = SCAN_MODE_LOW_LATENCY
      (error, device) => {
        if (error) {
          console.error("Scan error:", error);
          setIsScanning(false);
          return;
        }
        if (device) {
          setScannedDevices((prev) =>
            prev.find((d) => d.id === device.id) ? prev : [...prev, device]
          );
        }
      }
    );

    setTimeout(stopScan, 10_000);
  }, [isScanning, bleState, stopScan]);

  const connectToDevice = useCallback(async (device: Device) => {
    stopScan();
    setIsConnecting(true);
    try {
      const connected = await manager.connectToDevice(device.id);
      await connected.discoverAllServicesAndCharacteristics();
      setConnectedDevice(connected);

      // Listen for unexpected disconnection
      manager.onDeviceDisconnected(device.id, (error, disconnectedDevice) => {
        console.log("Device disconnected:", disconnectedDevice?.id);
        setConnectedDevice(null);
      });

    } catch (e) {
      console.error("BLE connect error:", e);
    } finally {
      setIsConnecting(false);
    }
  }, [stopScan]);

  const disconnectDevice = useCallback(async () => {
    if (!connectedDevice) return;
    try {
      await manager.cancelDeviceConnection(connectedDevice.id);
    } catch (e) {
      console.error("Disconnect error:", e);
    } finally {
      setConnectedDevice(null);
      // Give device time to start re-advertising before next scan
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }, [connectedDevice]);

  const readCharacteristic = useCallback(async (
    characteristicUUID: string
  ): Promise<number | null> => {
    if (!connectedDevice) return null;
    try {
      const char = await connectedDevice.readCharacteristicForService(
        BLE_UUIDS.SERVICE,
        characteristicUUID
      );
      if (!char.value) return null;
      return Buffer.from(char.value, "base64").readFloatLE(0);
    } catch (e) {
      console.error(`Read error [${characteristicUUID}]:`, e);
      return null;
    }
  }, [connectedDevice]);

  const readImpedance  = useCallback(() => readCharacteristic(BLE_UUIDS.IMPEDANCE),   [readCharacteristic]);
  const readPhaseAngle = useCallback(() => readCharacteristic(BLE_UUIDS.PHASE_ANGLE), [readCharacteristic]);

  return (
    <BleContext.Provider value={{
      bleState,
      connectedDevice,
      isConnected,
      deviceName,
      isScanning,
      isConnecting,
      scannedDevices,
      startScan,
      stopScan,
      connectToDevice,
      disconnectDevice,
      readImpedance,
      readPhaseAngle,
    }}>
      {children}
    </BleContext.Provider>
  );
}

export const useBle = () => useContext(BleContext);