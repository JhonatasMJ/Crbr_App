import { BottomSheetContextType } from "@/types/bottomSheet";
import { colors } from "@/themes/colors";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";

export const BottomSheetContext = createContext({} as BottomSheetContextType);

export const BottomSheetProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState<ReactNode | null>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["70%", "90%"], []);
  const snapIndexRef = useRef(0);
  const shouldPresentRef = useRef(false);

  const openBottomSheet = useCallback(
    (newContent: ReactNode, snapIndex: number) => {
      snapIndexRef.current = snapIndex;
      shouldPresentRef.current = true;
      setContent(newContent);
    },
    [],
  );

  useEffect(() => {
    if (!content || !shouldPresentRef.current) return;
    shouldPresentRef.current = false;
    bottomSheetRef.current?.present();
    const snapIndex = snapIndexRef.current;
    if (snapIndex > 0) {
      requestAnimationFrame(() => {
        bottomSheetRef.current?.snapToIndex(snapIndex);
      });
    }
  }, [content]);

  const closeBottomSheet = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);

  const handleDismiss = useCallback(() => {
    setContent(null);
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.7}
        pressBehavior="close"
      />
    ),
    [],
  );

  // Context precisa envolver o ModalProvider: o conteúdo do sheet é portaled
  // para dentro do provider e precisa enxergar closeBottomSheet.
  return (
    <BottomSheetContext.Provider
      value={{
        openBottomSheet,
        closeBottomSheet,
      }}
    >
      <BottomSheetModalProvider>
        {children}

        <BottomSheetModal
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          enableDynamicSizing={false}
          enablePanDownToClose
          onDismiss={handleDismiss}
          backdropComponent={renderBackdrop}
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
          android_keyboardInputMode="adjustResize"
          backgroundStyle={{
            backgroundColor: colors.secondary,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
          }}
          handleIndicatorStyle={{
            backgroundColor: "#666",
            width: 40,
          }}
        >
          {content}
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </BottomSheetContext.Provider>
  );
};

export const useBottomSheetContext = () => {
  return useContext(BottomSheetContext);
};
