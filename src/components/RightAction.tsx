import { Pressable } from "react-native";
import { Trash } from "lucide-react-native";
import { Modal } from "./Modal";
import { useInvestments } from "@/context/investments.context";

type RightActionProps = {
  investmentId: string;
};

export function RightAction({ investmentId }: RightActionProps) {
  const { deleteInvestment } = useInvestments();

  function handleDeleteInvestment() {
    if (!investmentId) return;
    deleteInvestment(investmentId);
  }
  return (
    <>
      <Modal
        title="Deletar investimento"
        description="Tem certeza que deseja deletar o investimento?"
        onConfirm={handleDeleteInvestment}
        trigger={
          <Pressable
            className="h-[140] bg-red-500  w-[80] rounded-r-md items-center justify-center"
          >
            <Trash size={30} color="white" />
          </Pressable>
        }
      />
    </>
  );
}
