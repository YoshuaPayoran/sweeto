/**
 * Design token constants — raw color values.
 * Import useColors() hook instead of this directly in components.
 */

export const Colors = {
  primary: "#5669EB",
  secondaryText: "#A2A2A7",
  inactiveColor: "#8B8B94",
  deviceConnected: "#22C55E",
  deviceDisconnected: "#EF4444",

  light: {
    background: "#FFFFFF",
    primaryText: "#1E1E2D",
    iconBackground: "#F4F4F4",
    tabBarColor: "#F4F4F4",
    iconColor: "#1E1E2D",
    cardColor: "#F4F4F4",
    borderColor: "#E0E0E0",
    deviceConnectedBackground: "#DCFCE7",
    deviceDisconnectedBackground: "#FEE2E2",
  },

  dark: {
    background: "#161622",
    primaryText: "#FFFFFF",
    iconBackground: "#1E1E2D",
    tabBarColor: "#27273A",
    iconColor: "#FFFFFF",
    cardColor: "#27273A",
    borderColor: "#2E2E3D",
    deviceConnectedBackground: "#18221B",
    deviceDisconnectedBackground: "#2E1A1A",
  },
} as const;