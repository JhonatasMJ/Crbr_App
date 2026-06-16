import * as yup from "yup";
import { isEmailAlreadyRegistered } from "@/shared/services/checkEmailAvailability";

export const emailFieldSchema = yup
  .string()
  .email("Email inválido")
  .required("Email é obrigatório")
  .test(
    "email-unique",
    "Já existe uma conta cadastrada com este e-mail",
    async (value) => {
      if (!value) return true;
      return !(await isEmailAlreadyRegistered(value));
    },
  );
