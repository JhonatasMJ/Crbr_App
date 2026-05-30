import { Text } from "react-native";
import { InputLabel } from "../InputLabel";
import { useForm } from "react-hook-form";
import type { UserUpdatePayload } from "@/types/user";
import { PhoneInputLabel } from "../PhoneInputLabel";
import { useAuth } from "@/context/auth.context";
import { useEffect } from "react";
import { Button } from "../ui/button";
import { useSnackBarContext } from "@/context/snackbar.context";
import { yupResolver } from "@hookform/resolvers/yup";
import { updateUserSchema } from "@/shared/schemas/updateUser";
import { resolveUserDisplayName } from "@/shared/utils/formatName";
import { KeyboardView } from "../KeyboardView";

export function UpdateUserForm() {
  const { notify } = useSnackBarContext();
  const { user, userProfile, loading, updateUser } = useAuth();
  const { control, reset, handleSubmit } = useForm<UserUpdatePayload>({
    defaultValues: {
      name: "",
      phoneNumber: "",
      city: "",
    },
    resolver: yupResolver(updateUserSchema),
  });

  useEffect(() => {
    if (!user) return;
    reset({
      name: resolveUserDisplayName(userProfile, user.displayName),
      phoneNumber: userProfile?.phoneNumber ?? "",
      city: userProfile?.city ?? "",
    });
  }, [user, userProfile, reset]);

  async function handleUpdateUser(data: UserUpdatePayload) {
    try {
      await updateUser(data);
      notify({
        message: "Usuário atualizado com sucesso",
        messageType: "SUCCESS",
      });
    } catch (error) {
      notify({
        message: "Erro ao atualizar usuário",
        messageType: "ERROR",
      });
    }
  }

  return (
    <KeyboardView className="flex-1" contentContainerClassName="gap-10">
      <InputLabel
        control={control}
        name="name"
        label="Nome Completo"
        placeholder="Digite seu nome completo"
      />

      <PhoneInputLabel control={control} name="phoneNumber" label="Telefone" />
      <InputLabel
        control={control}
        name="city"
        label="Cidade"
        placeholder="Digite sua cidade"
      />
      <Button
        disabled={loading}
        className="bg-primary"
        size="xl"
        onPress={handleSubmit(handleUpdateUser)}
      >
        <Text className="font-sans-bold text-lg">
          {loading ? "Atualizando..." : "Atualizar"}
        </Text>
      </Button>
    </KeyboardView>
  );
}
