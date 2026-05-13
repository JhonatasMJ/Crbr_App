import { Pressable, View } from "react-native";
import { Trash } from "lucide-react-native";
import { Modal } from "./Modal";
import { useBeneficiary } from "@/context/beneficiary.context";

type RightActionBeneficiaryProps = {
  beneficiaryId: string;
};

export function RightActionBeneficiary({ beneficiaryId }: RightActionBeneficiaryProps) {
  const { deleteBeneficiary } = useBeneficiary();

  function handleDeleteBeneficiary() {
    if (!beneficiaryId) return;
    deleteBeneficiary(beneficiaryId);
  }
  return (
    <View style={{ width: 80, height: "100%" }}>
      <Modal
        title="Deletar beneficiário"
        description="Tem certeza que deseja deletar o beneficiário?"
        onConfirm={handleDeleteBeneficiary}
        trigger={
          <Pressable className="h-full w-full items-center justify-center rounded-r-md bg-red-500">
            <Trash size={30} color="white" />
          </Pressable>
        }
      />
    </View>
  );
}
