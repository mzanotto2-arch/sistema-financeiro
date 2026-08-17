export interface Parcela {
  id?: number;

  cliente_id?: number;

  proposta: number;

  parcela: string;

  valor: number;

  vencimento: string;

  status: string;

  data_pagamento?: string;

  forma_pagamento?: string;

  observacoes: string;
}