import { useColors } from "@/hooks/useColors";
import { hp, wp } from "@/hooks/useResponsive";
import { Image, ImageSourcePropType, Text, View } from "react-native";

type Props = {
  imgsrc: ImageSourcePropType;
  qualityLabel: string;
  value: number;
  accentColor?: string;
};

export default function SummaryCard({
  imgsrc,
  qualityLabel,
  value,
  accentColor = "#5669EB",
}: Props) {
  const colors = useColors();

  return (
    <View
      className="flex-row items-center"
      style={{
        padding: wp(3.5),
        gap: wp(3),
        borderRadius: wp(4),
        backgroundColor: colors.cardColor,
        borderWidth: 1,
        borderColor: colors.borderColor,
        shadowColor: accentColor,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* Icon circle */}
      <View
        className="items-center justify-center"
        style={{
          width: wp(12),
          height: wp(12),
          borderRadius: wp(6),
          backgroundColor: accentColor + "22",
          borderWidth: 1.5,
          borderColor: accentColor + "55",
        }}
      >
        <Image
          source={imgsrc}
          style={{ width: wp(7), height: wp(7) }}
          resizeMode="contain"
        />
      </View>

      {/* Text info */}
      <View className="flex-1" style={{ gap: hp(0.3) }}>
        <Text style={{ fontSize: wp(3), color: colors.secondaryText }}>
          {qualityLabel}
        </Text>
        <Text style={{ fontSize: wp(5), color: colors.primaryText, fontWeight: "bold" }}>
          {value}
        </Text>
      </View>

      {/* Accent bar */}
      <View
        style={{
          width: wp(1),
          height: "60%",
          borderRadius: wp(1),
          backgroundColor: accentColor,
        }}
      />
    </View>
  );
}