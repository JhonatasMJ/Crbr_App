/** Nó `users/{uid}/beneficiary/{id}` no Realtime Database */
export type Beneficiary = {
  id: string;
  cpf: string;
  name: string;
  percentage: number;
};

/** Dados persistidos (sem a chave do nó) */
export type BeneficiaryPayload = Omit<Beneficiary, "id">;
