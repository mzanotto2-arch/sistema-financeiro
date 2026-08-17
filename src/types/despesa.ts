export interface Despesa {
  id?: number;

  descricao: string;

  fornecedor: string;

  valor: number;

  vencimento: string;

  status: string;

  pago: boolean;
}