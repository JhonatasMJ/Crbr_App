import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Text } from "./ui/text";
import { Button } from "./ui/button";
import { ReactNode } from "react";

interface ModalProps {
  description?: string;
  title?: string;
  trigger?: ReactNode;
  onCancel?: () => void;
  onConfirm?: () => void;
}

export function Modal({
  description,
  title,
  trigger,
  onCancel,
  onConfirm,
}: ModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className=" text-white">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="w-full flex-row items-center gap-2">
          <DialogClose asChild>
            <Button
              className="h-11 flex-1 bg-red-500 active:bg-red-600"
              onPress={onCancel}
            >
              <Text className="text-center text-white font-sans-semibold">
                Cancelar
              </Text>
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button className="h-11 flex-1 bg-primary" onPress={onConfirm}>
              <Text className="text-center text-black font-sans-semibold">
                Confirmar
              </Text>
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
