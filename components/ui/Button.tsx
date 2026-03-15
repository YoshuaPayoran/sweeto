import { useColors } from "@/hooks/useColors";
import { hp, wp } from "@/hooks/useResponsive";
import { Text, TouchableOpacity } from "react-native";

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
};

export default function Button({
  label,
  onPress,
  disabled = false,
  variant = "primary",
}: Props) {
  const colors = useColors();
  const isPrimary = variant === "primary";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      className="items-center justify-center"
      style={{
        paddingVertical: hp(2),
        marginHorizontal: wp(3),
        borderRadius: wp(999),
        backgroundColor: isPrimary ? colors.primary : colors.cardColor,
        borderWidth: isPrimary ? 0 : 1,
        borderColor: isPrimary ? "transparent" : colors.borderColor,
        shadowColor: isPrimary ? colors.primary : "transparent",
        shadowOffset: { width: 0, height: isPrimary ? 8 : 0 },
        shadowOpacity: isPrimary ? 0.3 : 0,
        shadowRadius: isPrimary ? 16 : 0,
        elevation: isPrimary ? 2 : 0,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Text
        style={{
          fontSize: wp(4),
          fontWeight: "700",
          color: isPrimary ? "#FFFFFF" : colors.secondaryText,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}