import * as yup from "yup";

export const registerPasswordSchema = yup.object({
  password: yup
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .required("Senha é obrigatória"),
  confirmPassword: yup
    .string()
    .required("Confirme a senha")
    .oneOf([yup.ref("password")], "Senhas não conferem"),
});
