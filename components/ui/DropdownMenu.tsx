import { useColors } from "@/hooks/useColors";
import { hp, wp } from "@/hooks/useResponsive";
import { useState } from "react";
import { Dropdown } from "react-native-element-dropdown";

type Option = {
  label: string;
  value: string;
};

type Props = {
  options: Option[];
  placeholder?: string;
  onSelect: (value: string) => void;
  value?: string | null;
};

export default function DropdownMenu({
  options,
  placeholder = "Select an option",
  onSelect,
  value: externalValue,
}: Props) {
  const colors = useColors();
  const [isFocus, setIsFocus] = useState(false);

  const borderColor = isFocus ? colors.primary : colors.borderColor;

  return (
    <Dropdown
      data={options}
      labelField="label"
      valueField="value"
      placeholder={placeholder}
      value={externalValue ?? null} 
      onFocus={() => setIsFocus(true)}
      onBlur={() => setIsFocus(false)}
      onChange={(item) => {
        setIsFocus(false);
        onSelect(item.value);       
      }}
      style={{
        backgroundColor: colors.cardColor,
        borderRadius: wp(3),
        borderWidth: 1,
        borderColor,
        paddingHorizontal: wp(4),
        height: hp(6),
      }}
      placeholderStyle={{
        fontSize: wp(3.5),
        color: colors.inactiveColor,
      }}
      selectedTextStyle={{
        fontSize: wp(3.5),
        color: colors.primaryText,
      }}
      containerStyle={{
        backgroundColor: colors.background,
        borderRadius: wp(3),
        borderColor,
        overflow: "hidden",
      }}
      itemTextStyle={{
        fontSize: wp(3.5),
        color: colors.primaryText,
      }}
      itemContainerStyle={{
        backgroundColor: colors.background,
      }}
      activeColor={colors.isDark ? "#2E2E4D" : "#EEF0FF"}
      showsVerticalScrollIndicator={false}
    />
  );
}