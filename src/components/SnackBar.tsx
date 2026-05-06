import { useSnackBarContext } from "@/context/snackbar.context";
import { Text, View } from "react-native";

export function SnackBar() {
  const { message, type } = useSnackBarContext();

/* Se não tiver erro não retorna a snackbar */
  if (!message || !type) {
    return <></>
  }

  const borderColor = type === "SUCCESS" ? "border-primary" : "border-red-500";

  return (
    <View
      className={`bg-[#111] absolute bottom-10 self-center z-50 h-[50px] w-[90%] justify-center p-2 border-l-4 animate-fade-in ${borderColor}`}
    >
      <Text className="text-white text-base font-bold text-center">{message}</Text>
    </View>
  )
}