import { Text } from "@/components/ui/text";
import { View } from "react-native";
import { Input } from "@/components/ui/input";
import { ComponentProps } from "react";

export function InputLabel({ label, ...rest }: { label: string } & ComponentProps<typeof Input>) { 
  return (
    <View>
      <Text className="text-primary font-sans-semibold text-xl mb-2">{label}</Text>
      <Input   {...rest}/>
    </View>

  )
}