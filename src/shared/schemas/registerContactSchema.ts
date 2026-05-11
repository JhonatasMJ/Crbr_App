import * as yup from "yup";
import { isCompletePhone } from "@/shared/utils/phoneCountries";

export const registerContactSchema = yup.object ({
    phoneNumber: yup
      .string()
      .required("Telefone é obrigatório")
      .test(
        "phone-complete",
        "Telefone inválido ou incompleto",
        (val) => isCompletePhone(val),
      ),
    birthDate: yup.string().required("Data de nascimento é obrigatória"),
    city: yup.string().required("Cidade é obrigatória"),
})