import {
  DEFAULT_VARIETY,
  getVarietyById,
  isValidVarietyId,
  Variety,
  VARIETY_STORAGE_KEY,
  VarietyId,
} from "@/constants/varieties";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type VarietyContextType = {
  selectedVariety: Variety;
  selectedVarietyId: VarietyId;
  setVariety: (id: VarietyId) => Promise<void>;
  isLoadingVariety: boolean;
};

const defaultVariety = getVarietyById(DEFAULT_VARIETY);

const VarietyContext = createContext<VarietyContextType>({
  selectedVariety: defaultVariety,
  selectedVarietyId: DEFAULT_VARIETY,
  setVariety: async () => {},
  isLoadingVariety: true,
});

export function VarietyProvider({ children }: { children: React.ReactNode }) {
  const [selectedId, setSelectedId] = useState<VarietyId>(DEFAULT_VARIETY);
  const [isLoadingVariety, setIsLoadingVariety] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSelectedVariety() {
      try {
        const stored = await AsyncStorage.getItem(VARIETY_STORAGE_KEY);

        if (mounted && isValidVarietyId(stored)) {
          setSelectedId(stored);
        }
      } catch (error) {
        console.warn("VarietyContext: failed to load variety", error);
      } finally {
        if (mounted) {
          setIsLoadingVariety(false);
        }
      }
    }

    loadSelectedVariety();

    return () => {
      mounted = false;
    };
  }, []);

  const setVariety = useCallback(async (id: VarietyId) => {
    setSelectedId(id);

    try {
      await AsyncStorage.setItem(VARIETY_STORAGE_KEY, id);
      console.log("[VarietyContext] Saved selected variety:", id);
    } catch (error) {
      console.warn("VarietyContext: failed to save variety", error);
    }
  }, []);

  const selectedVariety = useMemo(() => {
    return getVarietyById(selectedId);
  }, [selectedId]);

  return (
    <VarietyContext.Provider
      value={{
        selectedVariety,
        selectedVarietyId: selectedId,
        setVariety,
        isLoadingVariety,
      }}
    >
      {children}
    </VarietyContext.Provider>
  );
}

export const useVariety = () => useContext(VarietyContext);