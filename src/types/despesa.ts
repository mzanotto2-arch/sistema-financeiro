export interface Despesa {
  id?: number;

  descricao: string;
  fornecedor: string;
  valor: number;
  vencimento: string;

  status: string;
  pago: boolean;

  categoria?: string;
  tipo?: string;
  recorrencia?: string;

  link_boleto?: string;

  // Compatibilidade com a estrutura anterior
  boleto_path?: string;
  comprovante_path?: string;

  observacoes?: string;
}

export interface DespesaLancamento {
  id?: number;

  despesa_id: number;

  numero: number;
  referencia?: string;

  valor: number;
  vencimento: string;

  status: string;
  pago: boolean;

  data_pagamento?: string;
  forma_pagamento?: string;

  link_boleto?: string;

  arquivo_boleto?: string;

  boleto_path?: string;

  comprovante?: string;

  comprovante_path?: string;

  observacoes?: string;
}