import { Text, View } from "react-native";
import { InputLabel } from "../InputLabel";
import { useForm } from "react-hook-form";
import { UpdateUserParams } from "@/types/updateUserParams";
import { maskCPF } from "@/shared/utils/masks/cpfMask";
import { PhoneInputLabel } from "../PhoneInputLabel";
import { useAuth } from "@/context/auth.context";

export function UpdateUserForm() {
  const { control } = useForm<UpdateUserParams>({
    defaultValues: {
      name: "",
      phone: "",
      city: "",
      cpf: "",
    },
  });
  const { updateUser } = useAuth();
  return (
    <View className="gap-10">
      <InputLabel
        control={control}
        name="name"
        label="Nome Completo"
        placeholder="Digite seu nome completo"
      />
      <InputLabel
        control={control}
        name="cpf"
        label="CPF"
        maskFunction={maskCPF}
        placeholder="Digite seu CPF"
      />
       <PhoneInputLabel control={control} name="phone" label="Telefone" />
       <InputLabel
        control={control}
        name="city"
        label="Cidade"
        placeholder="Digite sua cidade"
      />
    </View>
  );
}
