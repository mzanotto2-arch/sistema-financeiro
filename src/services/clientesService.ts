import { supabase } from "../database/supabase";
import type { Cliente } from "../types/cliente";

export async function listarClientes() {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("proposta");

  if (error) {
    console.error("Erro ao listar clientes:", error);
    throw error;
  }

  return data as Cliente[];
}

export async function salvarCliente(cliente: Cliente) {
  const { id, ...dados } = cliente;

  const { error } = await supabase
    .from("clientes")
    .insert([
      {
        ...dados,
        comissao_percentual: Number(cliente.comissao_percentual || 0),
        comissao_parcelas: Number(cliente.comissao_parcelas || 0),
      },
    ]);

  if (error) {
    console.error("Erro ao salvar cliente:", error);
    throw error;
  }
}

export async function atualizarCliente(cliente: Cliente) {
  if (cliente.id === undefined || cliente.id === null) {
    throw new Error(
      "Não foi possível atualizar: ID do cliente não encontrado."
    );
  }

  const { id, ...dados } = cliente;

  const { error } = await supabase
    .from("clientes")
    .update({
      ...dados,
      comissao_percentual: Number(cliente.comissao_percentual || 0),
      comissao_parcelas: Number(cliente.comissao_parcelas || 0),
    })
    .eq("id", id);

  if (error) {
    console.error("Erro ao atualizar cliente:", error);
    throw error;
  }
}

export async function excluirCliente(id: number) {
  if (!id) {
    throw new Error("ID do cliente não informado.");
  }

  const { error } = await supabase
    .from("clientes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao excluir cliente:", error);
    throw error;
  }
}