import { Colors } from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";

/**
 * Returns the full set of theme-aware color tokens plus theme controls.
 * Use this hook in all components instead of importing Colors directly.
 */
export function useColors() {
  const { isDark, toggleTheme } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  return {
    // Theme-aware tokens
    background: theme.background,
    primaryText: theme.primaryText,
    iconBackground: theme.iconBackground,
    tabBarColor: theme.tabBarColor,
    iconColor: theme.iconColor,
    cardColor: theme.cardColor,
    borderColor: theme.borderColor,
    deviceConnectedBackground: theme.deviceConnectedBackground,
    deviceDisconnectedBackground: theme.deviceDisconnectedBackground,

    // Static tokens
    primary: Colors.primary,
    secondaryText: Colors.secondaryText,
    inactiveColor: Colors.inactiveColor,
    deviceConnected: Colors.deviceConnected,
    deviceDisconnected: Colors.deviceDisconnected,

    // Theme controls
    isDark,
    toggleTheme,
  };
}