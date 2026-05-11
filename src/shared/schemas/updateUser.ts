import * as yup from "yup";
import { isCompletePhone } from "../utils/phoneCountries";


export const updateUserSchema = yup.object({
  name: yup.string().required("Nome é obrigatório"),
  phoneNumber: yup
    .string()
    .required("Telefone é obrigatório")
    .test(
      "phone-complete",
      "Telefone inválido ou incompleto",
      (val) => isCompletePhone(val),
    ),
  city: yup.string().required("Cidade é obrigatória"),
});