import { HomeIcon, SettingsIcon, StatisticsIcon } from "@/components/icons";
import { useColors } from "@/hooks/useColors";
import { hp } from "@/hooks/useResponsive";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inactiveColor,
        tabBarStyle: {
          backgroundColor: colors.tabBarColor,
          paddingTop: hp(1.5),
          height: hp(9.5) + insets.bottom,
          paddingBottom: insets.bottom,
          borderTopWidth: 0,
          borderTopColor: "transparent",
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: hp(1.4),
          fontWeight: "600",
          marginTop: hp(0.3),
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: "Statistics",
          tabBarIcon: ({ color, size }) => <StatisticsIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <SettingsIcon color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}