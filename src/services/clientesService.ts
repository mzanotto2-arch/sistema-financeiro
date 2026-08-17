import { supabase } from "../database/supabase";
import type { Cliente } from "../types/cliente";

export async function listarClientes() {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("proposta");

  if (error) throw error;

  return data as Cliente[];
}

export async function salvarCliente(cliente: Cliente) {
  const { error } = await supabase
    .from("clientes")
    .insert([cliente]);

  if (error) throw error;
}

export async function atualizarCliente(cliente: Cliente) {
  const { error } = await supabase
    .from("clientes")
    .update(cliente)
    .eq("id", cliente.id);

  if (error) throw error;
}

export async function excluirCliente(id: number) {
  const { error } = await supabase
    .from("clientes")
    .delete()
    .eq("id", id);

  if (error) throw error;
}