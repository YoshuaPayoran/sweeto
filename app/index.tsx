import { STORAGE_KEYS } from "@/constants/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

export default function Index() {
  const [target, setTarget] = useState<"onboarding" | "home" | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE).then((value) => {
      setTarget(value === "true" ? "home" : "onboarding");
    });
  }, []);

  if (target === null) return <View style={{ flex: 1 }} />;
  if (target === "onboarding") return <Redirect href={"/onboarding" as any} />;
  return <Redirect href="/(tabs)/home" />;
}