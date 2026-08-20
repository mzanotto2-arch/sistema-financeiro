import { supabase } from "../database/supabase";
import type { Receita } from "../types/receita";

export async function listarReceitas() {
  const { data, error } = await supabase
    .from("receitas")
    .select("*")
    .order("id");

  if (error) {
    console.error("Erro ao listar receitas:", error);
    throw error;
  }

  return data as Receita[];
}

export async function salvarReceita(receita: Receita) {
  const { error } = await supabase
    .from("receitas")
    .insert([
      {
        cliente: receita.cliente,
        descricao: receita.descricao,
        valor: Number(receita.valor),
        vencimento: receita.vencimento,
        status: receita.status,
        recebido: receita.recebido,
      },
    ]);

  if (error) {
    console.error("Erro ao salvar receita:", error);
    throw error;
  }
}

export async function atualizarReceita(receita: Receita) {
  if (receita.id === undefined || receita.id === null) {
    throw new Error("Não foi possível atualizar: ID da receita não encontrado.");
  }

  const { error } = await supabase
    .from("receitas")
    .update({
      cliente: receita.cliente,
      descricao: receita.descricao,
      valor: Number(receita.valor),
      vencimento: receita.vencimento,
      status: receita.status,
      recebido: receita.recebido,
    })
    .eq("id", receita.id);

  if (error) {
    console.error("Erro ao atualizar receita:", error);
    throw error;
  }
}

export async function excluirReceita(id: number) {
  if (!id) {
    throw new Error("ID da receita não informado.");
  }

  const { error } = await supabase
    .from("receitas")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao excluir receita:", error);
    throw error;
  }
}