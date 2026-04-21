import * as yup from "yup";
import { registerContactSchema } from "@/shared/schemas/registerContactSchema";
import { registerPasswordSchema } from "@/shared/schemas/registerPasswordSchema";
import { registerSchema } from "@/shared/schemas/registerSchema";


export const registerFullSchema = registerSchema
  .concat(registerContactSchema)
  .concat(registerPasswordSchema);
