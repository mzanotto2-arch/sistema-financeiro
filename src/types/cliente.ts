export interface Cliente {
  id?: number;

  proposta: number;

  instituicao: string;

  responsavel: string;

  telefone: string;

  email: string;

  contrato: string;

  valor_parcela: number;

  quantidade_parcelas: number;

  parcela_atual: string;

  dia_vencimento: number;

  inicio_vigencia: string;

  fim_vigencia: string;

  grupo_whatsapp: string;

  pasta_documentos: string;

  consultor: string;

  observacoes: string;
}