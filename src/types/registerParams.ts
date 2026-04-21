export type RegisterParams = {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  birthDate: string;
  city: string;
  password: string;
  confirmPassword: string;
};

export type RegisterPersonalStep = Pick<
  RegisterParams,
  "name" | "email" | "cpf"
>;