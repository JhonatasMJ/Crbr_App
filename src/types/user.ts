/** Documento `users/{uid}` no Realtime Database (cadastro completo) */
export type User = {
  name: string;
  email: string;
  cpf: string;
  phoneNumber: string;
  birthDate: string;
  city: string;
  createdAt: string;
};

/** Dados lidos do RTDB (podem estar incompletos) */
export type UserProfile = Partial<User>;
/** Campos editáveis na tela de perfil */
export type UserUpdatePayload = Pick<User, "name" | "phoneNumber" | "city">;
