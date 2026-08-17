import { supabase } from "../database/supabase";
import type { Dashboard } from "../types/dashboard";

export async function obterDashboard(): Promise<Dashboard> {
  const { count: clientes } = await supabase
    .from("clientes")
    .select("*", { count: "exact", head: true });

  const { data: parcelas } = await supabase
    .from("parcelas")
    .select("valor");

  const { data: despesas } = await supabase
    .from("despesas")
    .select("valor");

  const totalParcelas =
    parcelas?.reduce((total, item) => total + Number(item.valor), 0) ?? 0;

  const totalDespesas =
    despesas?.reduce((total, item) => total + Number(item.valor), 0) ?? 0;

  return {
    clientes: clientes ?? 0,
    receitas: totalParcelas,
    despesas: totalDespesas,
    saldo: totalParcelas - totalDespesas,
  };
}