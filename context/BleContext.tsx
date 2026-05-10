import { BLE_UUIDS } from "@/constants/config";
import { bleManager } from "@/services/ble_manager";
import { Buffer } from "buffer";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { Device, State } from "react-native-ble-plx";

async function requestBlePermissions(): Promise<boolean> {
  if (Platform.OS !== "android") return true;

  if (Platform.Version >= 31) {
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);

    return Object.values(results).every(
      (result) => result === PermissionsAndroid.RESULTS.GRANTED
    );
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  );

  return result === PermissionsAndroid.RESULTS.GRANTED;
}

type BleResult = {
  pair: string;
  impedance: number;
  phaseAngle: number;
  magnitude: number;
};

type BleContextType = {
  bleState: State;
  connectedDevice: Device | null;
  isConnected: boolean;
  deviceName: string | null;
  isScanning: boolean;
  isConnecting: boolean;
  scannedDevices: Device[];
  latestResult: BleResult | null;
  startScan: () => Promise<void>;
  stopScan: () => void;
  connectToDevice: (device: Device) => Promise<void>;
  disconnectDevice: () => Promise<void>;
  readResult: () => Promise<BleResult | null>;
  readImpedance: () => Promise<number | null>;
  readPhaseAngle: () => Promise<number | null>;
  requestPermissions: () => Promise<boolean>;
};

const BleContext = createContext<BleContextType>({} as BleContextType);

export function BleProvider({ children }: { children: React.ReactNode }) {
  const manager = bleManager;

  const [bleState, setBleState] = useState<State>(State.Unknown);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [scannedDevices, setScannedDevices] = useState<Device[]>([]);
  const [latestResult, setLatestResult] = useState<BleResult | null>(null);

  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const disconnectSubRef = useRef<any>(null);
  const mountedRef = useRef(true);

  const isConnected = !!connectedDevice;
  const deviceName = connectedDevice?.name ?? null;

  const safeBleErrorLog = (label: string, error: any) => {
    console.warn(label, {
      message: error?.message,
      reason: error?.reason,
      errorCode: error?.errorCode,
      attErrorCode: error?.attErrorCode,
      androidErrorCode: error?.androidErrorCode,
      name: error?.name,
    });
  };

  useEffect(() => {
    mountedRef.current = true;

    const sub = manager.onStateChange((state) => {
      if (mountedRef.current) {
        setBleState(state);
      }
    }, true);

    return () => {
      mountedRef.current = false;

      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
        scanTimeoutRef.current = null;
      }

      try {
        manager.stopDeviceScan();
      } catch {}

      try {
        disconnectSubRef.current?.remove?.();
        disconnectSubRef.current = null;
      } catch {}

      try {
        sub.remove();
      } catch {}

      // IMPORTANT:
      // Huwag i-destroy ang singleton bleManager dito.
      // manager.destroy();
    };
  }, [manager]);

  const stopScan = useCallback(() => {
    try {
      manager.stopDeviceScan();
    } catch (error) {
      safeBleErrorLog("[BLE] stopScan error:", error);
    }

    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }

    if (mountedRef.current) {
      setIsScanning(false);
    }
  }, [manager]);

  const startScan = useCallback(async () => {
    if (isScanning || isConnecting) return;

    try {
      if (bleState !== State.PoweredOn) {
        console.warn("[BLE] Bluetooth is not powered on:", bleState);
        return;
      }

      const granted = await requestBlePermissions();

      if (!granted) {
        console.warn("[BLE] Permissions not granted");
        return;
      }

      try {
        manager.stopDeviceScan();
      } catch {}

      if (mountedRef.current) {
        setScannedDevices([]);
        setIsScanning(true);
      }

      manager.startDeviceScan(
        null,
        { allowDuplicates: false, scanMode: 2 },
        (error, device) => {
          if (error) {
            safeBleErrorLog("[BLE] Scan error:", error);

            if (mountedRef.current) {
              setIsScanning(false);
            }

            return;
          }

          if (!device || !mountedRef.current) return;

          setScannedDevices((prev) => {
            const exists = prev.some((d) => d.id === device.id);
            return exists ? prev : [...prev, device];
          });
        }
      );

      scanTimeoutRef.current = setTimeout(() => {
        stopScan();
      }, 10_000);
    } catch (error) {
      safeBleErrorLog("[BLE] startScan failed:", error);

      if (mountedRef.current) {
        setIsScanning(false);
      }
    }
  }, [isScanning, isConnecting, bleState, manager, stopScan]);

  const connectToDevice = useCallback(
    async (device: Device) => {
      stopScan();

      if (mountedRef.current) {
        setIsConnecting(true);
      }

      try {
        const connected = await manager.connectToDevice(device.id, {
          timeout: 10000,
        });

        const discovered =
          await connected.discoverAllServicesAndCharacteristics();

        if (!mountedRef.current) return;

        setConnectedDevice(discovered);
        setLatestResult(null);

        try {
          disconnectSubRef.current?.remove?.();
        } catch {}

        disconnectSubRef.current = manager.onDeviceDisconnected(
          discovered.id,
          (error) => {
            if (error) {
              safeBleErrorLog("[BLE] Device disconnected with error:", error);
            } else {
              console.log("[BLE] Device disconnected:", discovered.id);
            }

            if (mountedRef.current) {
              setConnectedDevice(null);
              setLatestResult(null);
            }
          }
        );
      } catch (error) {
        safeBleErrorLog("[BLE] connectToDevice error:", error);

        if (mountedRef.current) {
          setConnectedDevice(null);
          setLatestResult(null);
        }
      } finally {
        if (mountedRef.current) {
          setIsConnecting(false);
        }
      }
    },
    [manager, stopScan]
  );

  const disconnectDevice = useCallback(async () => {
    if (!connectedDevice) return;

    try {
      stopScan();

      try {
        disconnectSubRef.current?.remove?.();
        disconnectSubRef.current = null;
      } catch {}

      await manager.cancelDeviceConnection(connectedDevice.id);
    } catch (error) {
      safeBleErrorLog("[BLE] disconnectDevice error:", error);
    } finally {
      if (mountedRef.current) {
        setConnectedDevice(null);
        setLatestResult(null);
        setIsConnecting(false);
      }
    }
  }, [connectedDevice, manager, stopScan]);

  const parseBleResult = useCallback((decoded: string): BleResult | null => {
    try {
      if (!decoded.startsWith("RESULT:")) {
        console.warn("[BLE] Invalid result format:", decoded);
        return null;
      }

      const clean = decoded.replace("RESULT:", "").trim();
      const [pair, impedance, phaseAngle, magnitude] = clean.split(",");

      const parsedResult: BleResult = {
        pair,
        impedance: Number(impedance),
        phaseAngle: Number(phaseAngle),
        magnitude: Number(magnitude),
      };

      if (
        !parsedResult.pair ||
        !Number.isFinite(parsedResult.impedance) ||
        !Number.isFinite(parsedResult.phaseAngle) ||
        !Number.isFinite(parsedResult.magnitude)
      ) {
        console.warn("[BLE] Failed to parse result:", decoded);
        return null;
      }

      return parsedResult;
    } catch (error) {
      safeBleErrorLog("[BLE] parseBleResult error:", error);
      return null;
    }
  }, []);

  const readResult = useCallback(async (): Promise<BleResult | null> => {
    if (!connectedDevice) return null;

    try {
      const char = await connectedDevice.readCharacteristicForService(
        BLE_UUIDS.SERVICE,
        BLE_UUIDS.RESULT
      );

      if (!char.value) return null;

      const decoded = Buffer.from(char.value, "base64")
        .toString("utf-8")
        .trim();

      const result = parseBleResult(decoded);

      if (result && mountedRef.current) {
        setLatestResult(result);
      }

      return result;
    } catch (error) {
      safeBleErrorLog("[BLE] readResult error:", error);
      return null;
    }
  }, [connectedDevice, parseBleResult]);

  const readImpedance = useCallback(async (): Promise<number | null> => {
    const result = await readResult();
    return result?.impedance ?? null;
  }, [readResult]);

  const readPhaseAngle = useCallback(async (): Promise<number | null> => {
    const result = await readResult();
    return result?.phaseAngle ?? null;
  }, [readResult]);

  return (
    <BleContext.Provider
      value={{
        bleState,
        connectedDevice,
        isConnected,
        deviceName,
        isScanning,
        isConnecting,
        scannedDevices,
        latestResult,
        startScan,
        stopScan,
        connectToDevice,
        disconnectDevice,
        readResult,
        readImpedance,
        readPhaseAngle,
        requestPermissions: requestBlePermissions,
      }}
    >
      {children}
    </BleContext.Provider>
  );
}

export const useBle = () => useContext(BleContext);