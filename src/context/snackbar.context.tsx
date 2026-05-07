import { NotifyMessageParams, SnackBarContextType, SnackBarMessageType } from "@/types/snackbar";
import { createContext, ReactNode, useContext, useRef, useState } from "react";

export const SnackBarContext = createContext({} as SnackBarContextType);

export const SnackBarContextProvider = ({ children }: { children: ReactNode }) => { 
  const [message, setMessage] = useState<string | null>(null);
  const [type, setType] = useState<SnackBarMessageType | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Notificação, some depois de 3 segundos */
  const notify = ({message, messageType}:NotifyMessageParams) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setMessage(message);
    setType(messageType);

    timeoutRef.current = setTimeout(() =>{
      setMessage(null);
      setType(null);
    }, 3000)
  }
  return (
    <SnackBarContext.Provider value={{
      message,
      type,
      notify
    }}>
      {children}
    </SnackBarContext.Provider>
  )
}

export const useSnackBarContext = () => {
  const context = useContext(SnackBarContext);
  return context;
}