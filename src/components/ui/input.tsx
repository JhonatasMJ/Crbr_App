import { cn } from "@/lib/utils";
import {
  Platform,
  TextInput,
  type TextInputProps,
} from "react-native";
import { useState } from "react";

type InputProps = TextInputProps & {
  maskFunction?: (value: string) => string;
  onChangeRawText?: (value: string) => void;
};

function Input({
  className,
  maskFunction,
  onChangeRawText,
  onChangeText,
  value: propValue,
  ...props
}: InputProps) {
  const [internalValue, setInternalValue] = useState("");

  const value = propValue ?? internalValue;

  function handleChange(text: string) {
    if (maskFunction) {
      const raw = text.replace(/\D/g, "");
      const formatted = maskFunction(raw);

      setInternalValue(formatted);

      onChangeText?.(formatted);
      onChangeRawText?.(raw);
    } else {
      setInternalValue(text);
      onChangeText?.(text);
    }
  }

  return (
    <TextInput
      value={value}
      className={cn(
        "border-b-2 border-input text-foreground flex h-11 w-full min-w-0 flex-row items-center rounded-xs py-2 text-base leading-5 shadow-sm shadow-black/5 sm:h-9",
        props.editable === false &&
          cn(
            "opacity-50",
            Platform.select({
              web: "disabled:pointer-events-none disabled:cursor-not-allowed",
            })
          ),
        Platform.select({
          web: cn(
            "placeholder:text-white selection:bg-primary selection:text-primary-foreground outline-none transition-[color,box-shadow] md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
          ),
          native: "placeholder:text-white",
        }),
        className
      )}
      onChangeText={handleChange}
      {...props}
    />
  );
}

export { Input };
