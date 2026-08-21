import { supabase } from "../database/supabase";

import type {
  Despesa,
  DespesaLancamento,
} from "../types/despesa";

/* =========================================================
   DESPESAS
========================================================= */

export async function listarDespesas() {
  const { data, error } = await supabase
    .from("despesas")
    .select("*")
    .order("id");

  if (error) {
    console.error("Erro ao listar despesas:", error);
    throw error;
  }

  return (data || []) as Despesa[];
}

/* =========================================================
   SALVAR DESPESA
========================================================= */

export async function salvarDespesa(
  despesa: Despesa
) {
  const { id, ...dados } = despesa;

  const { data, error } = await supabase
    .from("despesas")
    .insert([
      {
        ...dados,

        valor: Number(
          despesa.valor || 0
        ),

        status:
          despesa.status ||
          "Pendente",

        pago:
          despesa.pago ?? false,

        categoria:
          despesa.categoria ||
          "Empresa",

        tipo:
          despesa.tipo ||
          "Única",

        recorrencia:
          despesa.recorrencia ||
          "Nenhuma",

        link_boleto:
          despesa.link_boleto ||
          "",

        observacoes:
          despesa.observacoes ||
          "",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error(
      "Erro ao salvar despesa:",
      error
    );

    throw error;
  }

  return data as Despesa;
}

/* =========================================================
   ATUALIZAR DESPESA
========================================================= */

export async function atualizarDespesa(
  despesa: Despesa
) {
  if (!despesa.id) {
    throw new Error(
      "ID da despesa não informado."
    );
  }

  const { id, ...dados } = despesa;

  const { data, error } = await supabase
    .from("despesas")
    .update({
      ...dados,

      valor: Number(
        despesa.valor || 0
      ),

      status:
        despesa.status ||
        "Pendente",

      pago:
        despesa.pago ?? false,

      categoria:
        despesa.categoria ||
        "Empresa",

      tipo:
        despesa.tipo ||
        "Única",

      recorrencia:
        despesa.recorrencia ||
        "Nenhuma",

      link_boleto:
        despesa.link_boleto ||
        "",

      observacoes:
        despesa.observacoes ||
        "",
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(
      "Erro ao atualizar despesa:",
      error
    );

    throw error;
  }

  return data as Despesa;
}

/* =========================================================
   EXCLUIR DESPESA
========================================================= */

export async function excluirDespesa(
  id: number
) {
  if (!id) {
    throw new Error(
      "ID da despesa não informado."
    );
  }

  const { error } = await supabase
    .from("despesas")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(
      "Erro ao excluir despesa:",
      error
    );

    throw error;
  }
}

/* =========================================================
   LANÇAMENTOS DAS DESPESAS
========================================================= */

export async function listarLancamentos(
  despesaId: number
) {
  const { data, error } = await supabase
    .from("despesas_lancamentos")
    .select("*")
    .eq(
      "despesa_id",
      despesaId
    )
    .order("numero");

  if (error) {
    console.error(
      "Erro ao listar lançamentos:",
      error
    );

    throw error;
  }

  return (
    data || []
  ) as DespesaLancamento[];
}

/* =========================================================
   SALVAR LANÇAMENTO
========================================================= */

export async function salvarLancamento(
  lancamento: DespesaLancamento
) {
  const { id, ...dados } =
    lancamento;

  const { data, error } =
    await supabase
      .from(
        "despesas_lancamentos"
      )
      .insert([
        {
          ...dados,

          valor: Number(
            lancamento.valor || 0
          ),

          pago:
            lancamento.pago ??
            false,

          status:
            lancamento.status ||
            "Em Aberto",
        },
      ])
      .select()
      .single();

  if (error) {
    console.error(
      "Erro ao salvar lançamento:",
      error
    );

    throw error;
  }

  return data as DespesaLancamento;
}

/* =========================================================
   ATUALIZAR LANÇAMENTO
========================================================= */

export async function atualizarLancamento(
  lancamento: DespesaLancamento
) {
  if (!lancamento.id) {
    throw new Error(
      "ID do lançamento não informado."
    );
  }

  const { id, ...dados } =
    lancamento;

  const { data, error } =
    await supabase
      .from(
        "despesas_lancamentos"
      )
      .update({
        ...dados,

        valor: Number(
          lancamento.valor || 0
        ),

        pago:
          lancamento.pago ??
          false,

        status:
          lancamento.status ||
          "Em Aberto",
      })
      .eq("id", id)
      .select()
      .single();

  if (error) {
    console.error(
      "Erro ao atualizar lançamento:",
      error
    );

    throw error;
  }

  return data as DespesaLancamento;
}

/* =========================================================
   EXCLUIR LANÇAMENTO
========================================================= */

export async function excluirLancamento(
  id: number
) {
  if (!id) {
    throw new Error(
      "ID do lançamento não informado."
    );
  }

  const { error } =
    await supabase
      .from(
        "despesas_lancamentos"
      )
      .delete()
      .eq("id", id);

  if (error) {
    console.error(
      "Erro ao excluir lançamento:",
      error
    );

    throw error;
  }
}

/* =========================================================
   ARQUIVOS
========================================================= */

export async function enviarArquivo(
  arquivo: File,
  tipo:
    | "boleto"
    | "comprovante",
  despesaId: number,
  lancamentoId: number
) {
  if (!arquivo) {
    throw new Error(
      "Nenhum arquivo selecionado."
    );
  }

  const extensao =
    arquivo.name
      .split(".")
      .pop()
      ?.toLowerCase() ||
    "arquivo";

  const caminho =
    `${despesaId}/${lancamentoId}/${tipo}-${Date.now()}.${extensao}`;

  const { error } =
    await supabase.storage
      .from(
        "despesas-arquivos"
      )
      .upload(
        caminho,
        arquivo,
        {
          upsert: true,
        }
      );

  if (error) {
    console.error(
      "Erro ao enviar arquivo:",
      error
    );

    throw error;
  }

  return caminho;
}

/* =========================================================
   ABRIR ARQUIVO
========================================================= */

export async function abrirArquivo(
  caminho: string
) {
  if (!caminho) {
    throw new Error(
      "Arquivo não informado."
    );
  }

  const { data, error } =
    await supabase.storage
      .from(
        "despesas-arquivos"
      )
      .createSignedUrl(
        caminho,
        60 * 10
      );

  if (error) {
    console.error(
      "Erro ao abrir arquivo:",
      error
    );

    throw error;
  }

  window.open(
    data.signedUrl,
    "_blank"
  );
}

/* =========================================================
   ADICIONAR MESES À DATA
========================================================= */

function adicionarMeses(
  data: string,
  quantidade: number
) {
  const [
    ano,
    mes,
    dia,
  ] = data
    .split("-")
    .map(Number);

  /*
    Começamos no dia 1 para evitar
    problemas de virada de mês.

    Exemplo:
    31/01 + 1 mês
    não pode virar 03/03.

    Depois calculamos o último dia
    do mês desejado e usamos o menor
    entre o dia original e esse limite.
  */

  const dataBase = new Date(
    ano,
    mes - 1,
    1
  );

  dataBase.setMonth(
    dataBase.getMonth() + quantidade
  );

  const novoAno =
    dataBase.getFullYear();

  const novoMes =
    dataBase.getMonth();

  const ultimoDiaDoMes =
    new Date(
      novoAno,
      novoMes + 1,
      0
    ).getDate();

  const novoDia = Math.min(
    dia,
    ultimoDiaDoMes
  );

  const resultado =
    new Date(
      novoAno,
      novoMes,
      novoDia
    );

  const anoFinal =
    resultado.getFullYear();

  const mesFinal =
    String(
      resultado.getMonth() + 1
    ).padStart(2, "0");

  const diaFinal =
    String(
      resultado.getDate()
    ).padStart(2, "0");

  return `${anoFinal}-${mesFinal}-${diaFinal}`;
}

/* =========================================================
   GERAR LANÇAMENTOS RECORRENTES
========================================================= */

export async function gerarLancamentosDespesa(
  despesa: Despesa,
  quantidade: number
) {
  if (!despesa.id) {
    throw new Error(
      "A despesa precisa estar salva primeiro."
    );
  }

  if (
    !quantidade ||
    quantidade < 1
  ) {
    throw new Error(
      "Informe uma quantidade válida de lançamentos."
    );
  }

  let intervalo = 0;

  switch (
    despesa.recorrencia
  ) {
    case "Mensal":
      intervalo = 1;
      break;

    case "Bimestral":
      intervalo = 2;
      break;

    case "Trimestral":
      intervalo = 3;
      break;

    case "Semestral":
      intervalo = 6;
      break;

    case "Anual":
      intervalo = 12;
      break;

    default:
      intervalo = 0;
  }

  const lancamentos:
    DespesaLancamento[] =
    [];

  for (
    let i = 0;
    i < quantidade;
    i++
  ) {
    const vencimento =
      intervalo === 0
        ? despesa.vencimento
        : adicionarMeses(
            despesa.vencimento,
            i * intervalo
          );

    lancamentos.push({
      despesa_id:
        despesa.id,

      numero:
        i + 1,

      referencia:
        intervalo === 0
          ? "Única"
          : `${i + 1}/${quantidade}`,

      valor: Number(
        despesa.valor || 0
      ),

      vencimento,

      status:
        "Em Aberto",

      pago:
        false,

      link_boleto:
        despesa.link_boleto ||
        "",

      observacoes:
        "",
    });
  }

  const { data, error } =
    await supabase
      .from(
        "despesas_lancamentos"
      )
      .insert(lancamentos)
      .select();

  if (error) {
    console.error(
      "Erro ao gerar lançamentos:",
      error
    );

    throw error;
  }

  return (
    data || []
  ) as DespesaLancamento[];
}