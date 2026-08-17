import { supabase } from "../database/supabase";
import type { Receita } from "../types/receita";

export async function listarReceitas() {
  const { data, error } = await supabase
    .from("receitas")
    .select("*")
    .order("id");

  if (error) throw error;

  return data as Receita[];
}

export async function salvarReceita(receita: Receita) {
  const { error } = await supabase
    .from("receitas")
    .insert([
      {
        cliente: receita.cliente,
        descricao: receita.descricao,
        valor: receita.valor,
        vencimento: receita.vencimento,
        status: receita.status,
        recebido: receita.recebido,
      },
    ]);

  if (error) throw error;
}

export async function atualizarReceita(receita: Receita) {
  const { error } = await supabase
    .from("receitas")
    .update({
      cliente: receita.cliente,
      descricao: receita.descricao,
      valor: receita.valor,
      vencimento: receita.vencimento,
      status: receita.status,
      recebido: receita.recebido,
    })
    .eq("id", receita.id);

  if (error) throw error;
}

export async function excluirReceita(id: number) {
  const { error } = await supabase
    .from("receitas")
    .delete()
    .eq("id", id);

  if (error) throw error;
}