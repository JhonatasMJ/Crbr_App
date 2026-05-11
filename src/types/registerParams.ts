import type { User } from "./user";

export type RegisterParams = Pick<
  User,
  "name" | "email" | "cpf" | "phoneNumber" | "birthDate" | "city"
> & {
  password: string;
  confirmPassword: string;
};

export type RegisterPersonalStep = Pick<
  RegisterParams,
  "name" | "email" | "cpf"
>;
