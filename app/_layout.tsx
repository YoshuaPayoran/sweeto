import { BleProvider } from "@/context/BleContext";
import { VarietyProvider } from "@/context/VarietyContext";
import { initDatabase } from "@/db";
import { Stack } from "expo-router";
import { ThemeProvider } from "../context/ThemeContext";
import "./globals.css";

initDatabase();   

export default function RootLayout() {
  return (
    <ThemeProvider>
      <BleProvider>
        <VarietyProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </VarietyProvider>
      </BleProvider>
    </ThemeProvider>
  );
}