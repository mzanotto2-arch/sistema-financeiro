export interface Receita {
  id?: number;
  cliente: string;
  descricao: string;
  valor: number;
  vencimento: string;
  status: string;
  recebido: boolean;
}