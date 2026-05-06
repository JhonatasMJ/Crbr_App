export type InvestmentsParams = {
    id?: string;
    amount?: string;
    investmentAmount?: string;
    name: string;
    investmentName?: string;
    startDate: string;
    endDate: string;
    createdTime: string;
    createdAt: string;
    duration: string;
    status: "ativo" | "inativo";
    userId: string;
}