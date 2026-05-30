import type { User } from "./user";

export type RegisterParams = Pick<
  User,
  "email" | "cpf" | "phoneNumber" | "birthDate" | "city"
> & {
  name: string;
  password: string;
  confirmPassword: string;
};

export type RegisterPersonalStep = Pick<
  RegisterParams,
  "name" | "email" | "cpf"
>;
