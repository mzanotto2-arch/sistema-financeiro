export interface Comissao {
  id?: number;
  cliente_id?: number;
  parcela: string;
  valor: number;
  vencimento?: string;
  status: string;
  data_pagamento?: string;
  forma_pagamento?: string;
  observacoes?: string;
}