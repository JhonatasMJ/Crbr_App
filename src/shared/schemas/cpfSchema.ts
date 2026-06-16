import * as yup from "yup";
import { yupValidator } from "cpf-cnpj-validator/yup";
import { isCpfAlreadyRegistered } from "@/shared/services/checkCpfAvailability";

yupValidator(yup);

export const cpfFieldSchema = yup
  .string()
  .required("CPF é obrigatório")
  .cpf("CPF inválido")
  .test(
    "cpf-unique",
    "Já existe uma conta cadastrada com este CPF",
    async (value) => {
      if (!value) return true;
      return !(await isCpfAlreadyRegistered(value));
    },
  );
