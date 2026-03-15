import { BleProvider } from "@/context/BleContext";
import { Stack } from "expo-router";
import { ThemeProvider } from "../context/ThemeContext";
import "./globals.css";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <BleProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </BleProvider>
    </ThemeProvider>
  );
}