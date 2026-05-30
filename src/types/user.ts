/** Documento `users/{uid}` no Realtime Database (cadastro completo) */
export type User = {
  username: string;
  email: string;
  cpf: string;
  phoneNumber: string;
  birthDate: string;
  city: string;
  createdAt: string;
};

/** Dados lidos do RTDB (podem estar incompletos) */
export type UserProfile = Partial<User> & {
  /** Campo legado — contas antigas podem ter sido salvas como `name` */
  name?: string;
};

/** Campos editáveis na tela de perfil */
export type UserUpdatePayload = Pick<User, "phoneNumber" | "city"> & {
  name: string;
};
