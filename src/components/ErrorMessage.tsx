import { PropsWithChildren } from "react";
import { Text, View } from "react-native";

export function ErrorMessage({children}:  PropsWithChildren ) { 
    return (
        <View className="flex-row items-center gap-2">
            <Text className="text-red-500 mt-2">{children}</Text>
        </View>
    )
}