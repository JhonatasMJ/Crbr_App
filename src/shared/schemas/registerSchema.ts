import * as yup from "yup";
import { cpfFieldSchema } from "@/shared/schemas/cpfSchema";
import { emailFieldSchema } from "@/shared/schemas/emailSchema";

export const registerSchema = yup.object({
  name: yup.string().required("Nome é obrigatório"),
  email: emailFieldSchema,
  cpf: cpfFieldSchema,
});