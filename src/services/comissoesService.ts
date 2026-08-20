import { supabase } from "../database/supabase";

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

export async function listarComissoes(clienteId: number) {
  const { data, error } = await supabase
    .from("comissoes")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("id");

  if (error) {
    console.error("Erro ao listar comissões:", error);
    throw error;
  }

  return data as Comissao[];
}

export async function salvarComissao(comissao: Comissao) {
  const { id, ...dados } = comissao;

  const { data, error } = await supabase
    .from("comissoes")
    .insert([dados])
    .select();

  if (error) {
    console.error("Erro ao salvar comissão:", error);
    throw error;
  }

  return data;
}

export async function atualizarComissao(comissao: Comissao) {
  if (!comissao.id) {
    throw new Error("ID da comissão não informado.");
  }

  const { id, ...dados } = comissao;

  const { data, error } = await supabase
    .from("comissoes")
    .update(dados)
    .eq("id", id)
    .select();

  if (error) {
    console.error("Erro ao atualizar comissão:", error);
    throw error;
  }

  return data;
}

export async function excluirComissao(id: number) {
  if (!id) {
    throw new Error("ID da comissão não informado.");
  }

  const { error } = await supabase
    .from("comissoes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao excluir comissão:", error);
    throw error;
  }
}