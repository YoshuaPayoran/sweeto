import { BleProvider } from "@/context/BleContext";
import { initDatabase } from "@/db";
import { Stack } from "expo-router";
import { ThemeProvider } from "../context/ThemeContext";
import "./globals.css";

initDatabase();   

export default function RootLayout() {
  return (
    <ThemeProvider>
      <BleProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </BleProvider>
    </ThemeProvider>
  );
}