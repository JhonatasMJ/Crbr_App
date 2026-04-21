import * as yup from "yup";

export const registerContactSchema = yup.object ({
    phone: yup.string().required("Telefone é obrigatório"),
    birthDate: yup.string().required("Data de nascimento é obrigatória"),
    city: yup.string().required("Cidade é obrigatória"),
})