import { supabase } from "../database/supabase";
import type { Despesa } from "../types/despesa";

export async function listarDespesas() {
  const { data, error } = await supabase
    .from("despesas")
    .select("*")
    .order("id");

  console.log("Lista:", data);
  console.log("Erro lista:", error);

  if (error) throw error;

  return data as Despesa[];
}

export async function salvarDespesa(despesa: Despesa) {
  console.log("Enviando despesa:", despesa);

  const { data, error } = await supabase
    .from("despesas")
    .insert([
      {
        descricao: despesa.descricao,
        fornecedor: despesa.fornecedor,
        valor: despesa.valor,
        vencimento: despesa.vencimento,
        status: despesa.status,
        pago: despesa.pago,
      },
    ])
    .select();

  console.log("Retorno:", data);
  console.log("Erro:", error);

  if (error) throw error;

  return data;
}

export async function atualizarDespesa(despesa: Despesa) {
  const { data, error } = await supabase
    .from("despesas")
    .update({
      descricao: despesa.descricao,
      fornecedor: despesa.fornecedor,
      valor: despesa.valor,
      vencimento: despesa.vencimento,
      status: despesa.status,
      pago: despesa.pago,
    })
    .eq("id", despesa.id)
    .select();

  console.log("Atualização:", data);
  console.log("Erro atualização:", error);

  if (error) throw error;
}

export async function excluirDespesa(id: number) {
  const { data, error } = await supabase
    .from("despesas")
    .delete()
    .eq("id", id)
    .select();

  console.log("DELETE:", data);
  console.log("ERRO:", error);

  if (error) throw error;
}