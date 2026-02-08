import { TouchableOpacity, View } from "react-native";
import { InputLabel } from "./InputLabel";
import { Eye, EyeOff } from "lucide-react-native";
import { ComponentProps, useState } from "react";

export function InputPassword({...rest }: { label: string } & ComponentProps<typeof InputLabel> ) { 
const [passwordView, setPasswordView] = useState(false);
  return (
     <View>
          <InputLabel
            label={rest.label}
            placeholder={rest.placeholder}
            className="relative"
            secureTextEntry={passwordView ? false : true}
          />
          <TouchableOpacity
            className="absolute right-4 bottom-4"
            onPress={() => setPasswordView(passwordView ? false : true)}
          >
            {passwordView ? (
              <Eye color="#444" size={18} />
            ) : (
              <EyeOff color="#444" size={18} />
            )}
          </TouchableOpacity>
        </View>
  )
}