import { TouchableOpacity } from "react-native";
import { Trash } from "lucide-react-native";

export function RightAction() {
  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        className="h-[140] bg-red-500  w-[80] rounded-r-md items-center justify-center"
      >
        <Trash size={30} color="white" />
      </TouchableOpacity>
    </>
  );
}
