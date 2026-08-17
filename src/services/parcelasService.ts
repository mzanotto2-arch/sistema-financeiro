import { supabase } from "../database/supabase";
import type { Parcela } from "../types/parcela";

export async function listarParcelas() {
  const { data, error } = await supabase
    .from("parcelas")
    .select("*")
    .order("vencimento");

  if (error) throw error;

  return data as Parcela[];
}

export async function salvarParcela(parcela: Parcela) {
  console.log("Enviando:", parcela);

  const { id, ...dados } = parcela;

  const { data, error } = await supabase
    .from("parcelas")
    .insert([dados])
    .select();

  console.log("Retorno:", data);
  console.log("Erro:", error);

  if (error) throw error;

  return data;
}

export async function atualizarParcela(parcela: Parcela) {
  const { data, error } = await supabase
    .from("parcelas")
    .update({
      proposta: parcela.proposta,
      cliente_id: parcela.cliente_id,
      parcela: parcela.parcela,
      valor: parcela.valor,
      vencimento: parcela.vencimento,
      data_pagamento: parcela.data_pagamento,
      forma_pagamento: parcela.forma_pagamento,
      status: parcela.status,
      observacoes: parcela.observacoes,
    })
    .eq("id", parcela.id)
    .select();

  console.log("UPDATE:", data);
  console.log("ERRO UPDATE:", error);

  if (error) throw error;
}

export async function excluirParcela(id: number) {
  console.log("ID recebido:", id);

  const { data, error } = await supabase
    .from("parcelas")
    .delete()
    .eq("id", id)
    .select();

  console.log("DELETE DATA:", data);
    console.log("DELETE ERROR:", error);

  if (error) {
    alert(JSON.stringify(error));
    throw error;
  }

  console.log("Parcela excluída.");
}