import { ReactNode } from "react";

export interface BottomSheetContextType {
  openBottomSheet: (content: ReactNode, index: number) => void;
  closeBottomSheet: () => void;
}
