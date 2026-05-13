import { Pressable } from "react-native";
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
    <>
      <Modal
        title="Deletar beneficiário"
        description="Tem certeza que deseja deletar o beneficiário?"
        onConfirm={handleDeleteBeneficiary}
        trigger={
          <Pressable
            className="h-full bg-red-500  w-[80] rounded-r-md items-center justify-center"
          >
            <Trash size={30} color="white" />
          </Pressable>
        }
      />
    </>
  );
}
