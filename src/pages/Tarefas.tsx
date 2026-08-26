import { useEffect, useMemo, useState } from "react";
import { supabase } from "../database/supabase";

type Status = "todo" | "in_progress" | "done";
type Priority = "none" | "low" | "medium" | "high" | "urgent";
type TaskType = "task" | "appointment" | "call" | "follow_up";

type Documento = {
  id: string;
  titulo: string;
  entregue: boolean;
};

type Tarefa = {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  status: Status;
  priority: Priority;
  start_date: string | null;
  due_date: string | null;
  due_time: string | null;
  original_due_date: string | null;
  completed_at: string | null;
  is_important: boolean;
  is_urgent: boolean;
  task_type: TaskType;
  grupo_numero: string | null;
  proposta_numero: string | null;
  instrumento_numero: string | null;
  documentos: Documento[] | null;
};

function dataLocal(date = new Date()) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function hojeLocal() {
  return dataLocal();
}

function formatarData(data: string | null) {
  if (!data) return "";

  const [ano, mes, dia] = data.split("-");

  return `${dia}/${mes}/${ano}`;
}

function adicionarDias(data: string, quantidade: number) {
  const [ano, mes, dia] = data.split("-");

  const novaData = new Date(
    Number(ano),
    Number(mes) - 1,
    Number(dia)
  );

  novaData.setDate(novaData.getDate() + quantidade);

  return dataLocal(novaData);
}

function nomeDia(data: string) {
  const [ano, mes, dia] = data.split("-");

  const date = new Date(
    Number(ano),
    Number(mes) - 1,
    Number(dia)
  );

  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
  });
}

function nomeDiaCurto(data: string) {
  const [ano, mes, dia] = data.split("-");

  const date = new Date(
    Number(ano),
    Number(mes) - 1,
    Number(dia)
  );

  return date.toLocaleDateString("pt-BR", {
    weekday: "short",
  });
}

export default function Tarefas() {
  const hoje = hojeLocal();

  const [tarefas, setTarefas] = useState<Tarefa[]>([]);

  const [aba, setAba] = useState<
    "hoje" | "semana" | "kanban"
  >("hoje");

  const [dataSelecionada, setDataSelecionada] =
    useState(hoje);

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [mostrarHistorico, setMostrarHistorico] =
    useState(false);

  const [arrastando, setArrastando] = useState<
    string | null
  >(null);

  const [titulo, setTitulo] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [prioridade, setPrioridade] =
    useState<Priority>("medium");

  const [tipo, setTipo] =
    useState<TaskType>("task");

  const [dataPrazo, setDataPrazo] =
    useState(hoje);

  const [horario, setHorario] = useState("");

  const [grupoNumero, setGrupoNumero] = useState("");
  const [propostaNumero, setPropostaNumero] = useState("");
  const [instrumentoNumero, setInstrumentoNumero] = useState("");
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [novoDocumento, setNovoDocumento] = useState("");

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [anotacoesAcompanhamento, setAnotacoesAcompanhamento] = useState("");

  useEffect(() => {
    carregarTarefas();

    const salvo = localStorage.getItem("tarefas_acompanhamento");
    if (salvo) {
      setAnotacoesAcompanhamento(salvo);
    }
  }, []);

  function salvarAcompanhamento() {
    localStorage.setItem("tarefas_acompanhamento", anotacoesAcompanhamento);
    alert("Acompanhamento salvo com sucesso!");
  }

  async function carregarTarefas() {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("due_date", {
          ascending: true,
        })
        .order("due_time", {
          ascending: true,
        });

      if (error) throw error;

      setTarefas((data || []) as Tarefa[]);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar tarefas.");
    }
  }

  async function salvarTarefa() {
    if (!titulo.trim()) {
      alert("Informe a tarefa.");
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Usuário não encontrado.");
        return;
      }

      const { error } = await supabase
        .from("tasks")
        .insert([
          {
            user_id: user.id,
            title: titulo.trim(),
            notes: observacoes.trim() || null,
            status: "todo",
            priority: prioridade,
            task_type: tipo,
            start_date: hoje,
            due_date: dataPrazo || null,
            due_time: horario || null,
            original_due_date:
              dataPrazo || null,
            is_important:
              prioridade === "high" ||
              prioridade === "urgent",
            is_urgent:
              prioridade === "urgent",
            grupo_numero: grupoNumero.trim() || null,
            proposta_numero: propostaNumero.trim() || null,
            instrumento_numero: instrumentoNumero.trim() || null,
            documentos,
          },
        ]);

      if (error) throw error;

      limparFormulario();
      setMostrarFormulario(false);

      await carregarTarefas();

      alert("Tarefa criada com sucesso!");
    } catch (error: any) {
      console.error(error);

      alert(
        error.message ||
          "Erro ao salvar tarefa."
      );
    }
  }

  function preencherEdicao(tarefa: Tarefa) {
    setEditandoId(tarefa.id);
    setTitulo(tarefa.title);
    setObservacoes(tarefa.notes || "");
    setPrioridade(tarefa.priority);
    setTipo(tarefa.task_type);
    setDataPrazo(tarefa.due_date || hoje);
    setHorario(tarefa.due_time || "");
    setGrupoNumero(tarefa.grupo_numero || "");
    setPropostaNumero(tarefa.proposta_numero || "");
    setInstrumentoNumero(tarefa.instrumento_numero || "");
    setDocumentos(tarefa.documentos || []);
    setNovoDocumento("");
    setMostrarFormulario(true);
    setMostrarHistorico(false);
  }

  async function atualizarTarefa() {
    if (!editandoId) return;

    if (!titulo.trim()) {
      alert("Informe a tarefa.");
      return;
    }

    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          title: titulo.trim(),
          notes: observacoes.trim() || null,
          priority: prioridade,
          task_type: tipo,
          due_date: dataPrazo || null,
          due_time: horario || null,
          is_important:
            prioridade === "high" ||
            prioridade === "urgent",
          is_urgent:
            prioridade === "urgent",
          grupo_numero: grupoNumero.trim() || null,
          proposta_numero: propostaNumero.trim() || null,
          instrumento_numero: instrumentoNumero.trim() || null,
          documentos,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editandoId);

      if (error) throw error;

      limparFormulario();
      setEditandoId(null);
      setMostrarFormulario(false);

      await carregarTarefas();

      alert("Tarefa atualizada com sucesso!");
    } catch (error: any) {
      console.error(error);

      alert(
        error.message ||
          "Erro ao atualizar tarefa."
      );
    }
  }

  async function mudarStatus(
    id: string,
    novoStatus: Status
  ) {
    try {
      const dados: any = {
        status: novoStatus,
        updated_at: new Date().toISOString(),
      };

      if (novoStatus === "done") {
        dados.completed_at =
          new Date().toISOString();
      } else {
        dados.completed_at = null;
      }

      const { error } = await supabase
        .from("tasks")
        .update(dados)
        .eq("id", id);

      if (error) throw error;

      await carregarTarefas();
    } catch (error: any) {
      console.error(error);

      alert(
        error.message ||
          "Erro ao atualizar tarefa."
      );
    }
  }

  async function alterarData(
    id: string,
    novaData: string
  ) {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          due_date: novaData,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      await carregarTarefas();
    } catch (error: any) {
      console.error(error);

      alert(
        error.message ||
          "Erro ao alterar a data."
      );
    }
  }

  async function excluirTarefa(id: string) {
    if (
      !confirm(
        "Deseja excluir esta tarefa definitivamente?"
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await carregarTarefas();
    } catch (error: any) {
      console.error(error);

      alert(
        error.message ||
          "Erro ao excluir tarefa."
      );
    }
  }

  function reabrirTarefa(id: string) {
    mudarStatus(id, "todo");
  }

  function limparFormulario() {
    setEditandoId(null);
    setTitulo("");
    setObservacoes("");
    setPrioridade("medium");
    setTipo("task");
    setDataPrazo(hoje);
    setHorario("");
  }

  function adicionarDocumento() {
    const titulo = novoDocumento.trim();
    if (!titulo) return;

    setDocumentos((lista) => [
      ...lista,
      {
        id: crypto.randomUUID(),
        titulo,
        entregue: false,
      },
    ]);
    setNovoDocumento("");
  }

  function alternarDocumento(id: string) {
    setDocumentos((lista) =>
      lista.map((documento) =>
        documento.id === id
          ? { ...documento, entregue: !documento.entregue }
          : documento
      )
    );
  }

  function excluirDocumento(id: string) {
    setDocumentos((lista) => lista.filter((documento) => documento.id !== id));
  }

  function prioridadeTexto(
    valor: Priority
  ) {
    switch (valor) {
      case "urgent":
        return "🔴 Urgente";

      case "high":
        return "🟠 Alta";

      case "medium":
        return "🟡 Média";

      case "low":
        return "🟢 Baixa";

      default:
        return "⚪ Normal";
    }
  }

  function prioridadeCor(
    valor: Priority
  ) {
    switch (valor) {
      case "urgent":
        return "#dc2626";

      case "high":
        return "#ea580c";

      case "medium":
        return "#ca8a04";

      case "low":
        return "#16a34a";

      default:
        return "#64748b";
    }
  }

  function tipoTexto(valor: TaskType) {
    switch (valor) {
      case "appointment":
        return "📅 Compromisso";

      case "call":
        return "📞 Ligação";

      case "follow_up":
        return "🔄 Retorno";

      default:
        return "📋 Tarefa";
    }
  }

  function estaAtrasada(
    tarefa: Tarefa
  ) {
    return (
      tarefa.status !== "done" &&
      !!tarefa.due_date &&
      tarefa.due_date < hoje
    );
  }

  function tarefaDoDia(
    tarefa: Tarefa,
    data: string
  ) {
    return (
      tarefa.status !== "done" &&
      tarefa.due_date === data
    );
  }

  const tarefasHoje = useMemo(() => {
    return tarefas.filter((tarefa) =>
      tarefaDoDia(
        tarefa,
        dataSelecionada
      )
    );
  }, [
    tarefas,
    dataSelecionada,
  ]);

  const atrasadas = useMemo(() => {
    return tarefas.filter((tarefa) =>
      estaAtrasada(tarefa)
    );
  }, [tarefas, hoje]);

  const aFazer = useMemo(() => {
    return tarefas.filter(
      (tarefa) =>
        tarefa.status === "todo" &&
        !estaAtrasada(tarefa)
    );
  }, [tarefas, hoje]);

  const emAndamento = useMemo(() => {
    return tarefas.filter(
      (tarefa) =>
        tarefa.status ===
          "in_progress" &&
        !estaAtrasada(tarefa)
    );
  }, [tarefas, hoje]);

  const historico = useMemo(() => {
    return tarefas.filter(
      (tarefa) =>
        tarefa.status === "done"
    );
  }, [tarefas]);

  const semana = useMemo(() => {
    const dias = [];

    for (let i = 0; i < 7; i++) {
      dias.push(
        adicionarDias(hoje, i)
      );
    }

    return dias;
  }, [hoje]);

  const totalDocumentos = useMemo(
    () => tarefas.reduce((total, tarefa) => total + (tarefa.documentos?.length || 0), 0),
    [tarefas]
  );

  const documentosEntregues = useMemo(
    () => tarefas.reduce((total, tarefa) => total + (tarefa.documentos?.filter((documento) => documento.entregue).length || 0), 0),
    [tarefas]
  );

  const documentosPendentes = totalDocumentos - documentosEntregues;

  const gruposResumo = useMemo(() => {
    const mapa = new Map<string, { grupo: string; proposta: string; instrumento: string; pendentes: number; entregues: number; tarefas: number }>();

    tarefas.forEach((tarefa) => {
      if (!tarefa.grupo_numero && !tarefa.proposta_numero && !tarefa.instrumento_numero) return;
      const chave = `${tarefa.grupo_numero || ""}|${tarefa.proposta_numero || ""}|${tarefa.instrumento_numero || ""}`;
      const atual = mapa.get(chave) || {
        grupo: tarefa.grupo_numero || "—",
        proposta: tarefa.proposta_numero || "—",
        instrumento: tarefa.instrumento_numero || "—",
        pendentes: 0,
        entregues: 0,
        tarefas: 0,
      };
      atual.pendentes += tarefa.documentos?.filter((documento) => !documento.entregue).length || 0;
      atual.entregues += tarefa.documentos?.filter((documento) => documento.entregue).length || 0;
      atual.tarefas += 1;
      mapa.set(chave, atual);
    });

    return Array.from(mapa.values()).slice(0, 6);
  }, [tarefas]);

  function iniciarArraste(id: string) {
    setArrastando(id);
  }

  async function soltarNaColuna(
    novoStatus: Status
  ) {
    if (!arrastando) return;

    const id = arrastando;
    setArrastando(null);

    await mudarStatus(id, novoStatus);
  }

  async function soltarNasAtrasadas() {
    if (!arrastando) return;

    const id = arrastando;
    const tarefa = tarefas.find((item) => item.id === id);

    setArrastando(null);

    if (!tarefa || tarefa.status === "done") return;

    // "Atrasadas" não é um status do banco.
    // Para uma tarefa entrar nessa coluna de forma real,
    // colocamos o prazo para ontem e mantemos seu status atual.
    const novaData = adicionarDias(hoje, -1);

    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          due_date: novaData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      await carregarTarefas();
    } catch (error: any) {
      console.error(error);
      alert(
        error.message ||
          "Erro ao colocar a tarefa como atrasada."
      );
    }
  }

  function Cartao({
    tarefa,
    compacto = false,
  }: {
    tarefa: Tarefa;
    compacto?: boolean;
  }) {
    const atrasada =
      estaAtrasada(tarefa);

    return (
      <div
        draggable
        onDragStart={(e) => {
          iniciarArraste(tarefa.id);
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData(
            "text/plain",
            tarefa.id
          );
        }}
        onDragEnd={() => setArrastando(null)}
        style={{
          background: "#fff",
          borderRadius: 10,
          padding: compacto
            ? 10
            : 14,
          marginBottom: 10,
          border: atrasada
            ? "2px solid #dc2626"
            : "1px solid #ddd",
          boxShadow:
            "0 2px 6px rgba(0,0,0,.10)",
          cursor: "grab",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            gap: 10,
          }}
        >
          <strong>
            {tarefa.title}
          </strong>

          {tarefa.priority ===
            "urgent" && (
            <span>🔴</span>
          )}
        </div>

        <div
          style={{
            fontSize: 13,
            color: "#666",
            marginTop: 7,
          }}
        >
          {tipoTexto(
            tarefa.task_type
          )}
        </div>

        {(tarefa.grupo_numero || tarefa.proposta_numero || tarefa.instrumento_numero) && (
          <div
            style={{
              marginTop: 7,
              fontSize: 12,
              color: "#475569",
              fontWeight: 600,
            }}
          >
            🏷️ Grupo {tarefa.grupo_numero || "—"} &nbsp;|&nbsp; Prop. {tarefa.proposta_numero || "—"} &nbsp;|&nbsp; Instr. {tarefa.instrumento_numero || "—"}
          </div>
        )}

        {(tarefa.documentos?.length || 0) > 0 && (
          <div
            style={{
              marginTop: 8,
              padding: "7px 9px",
              borderRadius: 8,
              background: "#f8fafc",
              fontSize: 12,
            }}
          >
            📎 Documentação: <strong>{tarefa.documentos?.filter((documento) => documento.entregue).length || 0}</strong> entregue(s) de <strong>{tarefa.documentos?.length || 0}</strong>
            {(tarefa.documentos?.filter((documento) => !documento.entregue).length || 0) > 0 && (
              <span style={{ color: "#dc2626", marginLeft: 8, fontWeight: 700 }}>
                • {tarefa.documentos?.filter((documento) => !documento.entregue).length} faltando
              </span>
            )}
          </div>
        )}

        <div
          style={{
            marginTop: 5,
            fontSize: 13,
            color:
              prioridadeCor(
                tarefa.priority
              ),
            fontWeight: "bold",
          }}
        >
          {prioridadeTexto(
            tarefa.priority
          )}
        </div>

        {tarefa.due_date && (
          <div
            style={{
              marginTop: 6,
              fontSize: 13,
            }}
          >
            📅{" "}
            {formatarData(
              tarefa.due_date
            )}
          </div>
        )}

        {tarefa.due_time && (
          <div
            style={{
              marginTop: 4,
              fontSize: 13,
            }}
          >
            ⏰ {tarefa.due_time}
          </div>
        )}

        {atrasada && (
          <div
            style={{
              color: "#dc2626",
              fontWeight: "bold",
              marginTop: 7,
              fontSize: 13,
            }}
          >
            ⚠️ ATRASADA
          </div>
        )}

        {!compacto &&
          tarefa.notes && (
            <div
              style={{
                marginTop: 8,
                fontSize: 13,
                color: "#555",
              }}
            >
              {tarefa.notes}
            </div>
          )}

        {!compacto && (tarefa.documentos?.length || 0) > 0 && (
          <div style={{ marginTop: 9, fontSize: 12 }}>
            {tarefa.documentos?.map((documento) => (
              <div key={documento.id} style={{ marginBottom: 4 }}>
                {documento.entregue ? "🟢" : "🔴"} {documento.titulo} — {documento.entregue ? "Entregue" : "Faltando"}
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            marginTop: 10,
          }}
        >
          <button
            onClick={() => preencherEdicao(tarefa)}
          >
            ✏️ Editar
          </button>
          {tarefa.status ===
            "todo" && (
            <button
              onClick={() =>
                mudarStatus(
                  tarefa.id,
                  "in_progress"
                )
              }
            >
              ▶️ Iniciar
            </button>
          )}

          {tarefa.status ===
            "in_progress" && (
            <button
              onClick={() =>
                mudarStatus(
                  tarefa.id,
                  "done"
                )
              }
            >
              ✅ Concluir
            </button>
          )}

          {tarefa.status !== "done" && tarefa.due_date && (
            <button
              onClick={() => {
                const novaData = prompt(
                  "Digite a nova data (AAAA-MM-DD):",
                  tarefa.due_date || hoje
                );

                if (novaData) {
                  alterarData(tarefa.id, novaData);
                }
              }}
            >
              🔄 Reprogramar
            </button>
          )}

          {atrasada && (
            <button
              onClick={() =>
                alterarData(
                  tarefa.id,
                  hoje
                )
              }
            >
              📅 Trazer para hoje
            </button>
          )}

          <button
            onClick={() =>
              excluirTarefa(
                tarefa.id
              )
            }
          >
            🗑️
          </button>
        </div>
      </div>
    );
  }

  function mudarDia(
    quantidade: number
  ) {
    setDataSelecionada(
      adicionarDias(
        dataSelecionada,
        quantidade
      )
    );
  }

  function ColunaKanban({
    titulo,
    emoji,
    lista,
    status,
    fundo,
  }: {
    titulo: string;
    emoji: string;
    lista: Tarefa[];
    status: Status;
    fundo: string;
  }) {
    return (
      <div
        onDragOver={(e) =>
          e.preventDefault()
        }
        onDrop={() =>
          soltarNaColuna(status)
        }
        style={{
          flex: 1,
          minWidth: 280,
          background: fundo,
          borderRadius: 12,
          padding: 15,
          minHeight: 480,
          border:
            "1px solid #ddd",
        }}
      >
        <h3
          style={{
            textAlign: "center",
            marginTop: 0,
          }}
        >
          {emoji} {titulo} (
          {lista.length})
        </h3>

        {lista.length === 0 ? (
          <div
            style={{
              border:
                "2px dashed #cbd5e1",
              borderRadius: 10,
              padding: 35,
              textAlign: "center",
              color: "#64748b",
            }}
          >
            Arraste tarefas
            para cá
          </div>
        ) : (
          lista.map((tarefa) => (
            <Cartao
              key={tarefa.id}
              tarefa={tarefa}
            />
          ))
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 25,
        fontFamily: "Arial",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* CABEÇALHO */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 15,
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
            }}
          >
            📅 Agenda de Trabalho
          </h1>

          <div
            style={{
              color: "#64748b",
              marginTop: 5,
            }}
          >
            Organize o dia, os
            compromissos e os
            retornos em um só lugar.
          </div>
        </div>

        <button
          onClick={() =>
            setMostrarFormulario(
              !mostrarFormulario
            )
          }
          style={{
            padding:
              "11px 18px",
            fontSize: 15,
            border: "none",
            borderRadius: 8,
            background:
              "#2563eb",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          ➕ Nova tarefa
        </button>
      </div>

      {/* ABAS */}

      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <button
          onClick={() =>
            setAba("hoje")
          }
          style={{
            padding:
              "10px 16px",
            borderRadius: 8,
            border: "none",
            background:
              aba === "hoje"
                ? "#2563eb"
                : "#e5e7eb",
            color:
              aba === "hoje"
                ? "#fff"
                : "#111",
            cursor: "pointer",
          }}
        >
          📅 Hoje
        </button>

        <button
          onClick={() =>
            setAba("semana")
          }
          style={{
            padding:
              "10px 16px",
            borderRadius: 8,
            border: "none",
            background:
              aba === "semana"
                ? "#2563eb"
                : "#e5e7eb",
            color:
              aba === "semana"
                ? "#fff"
                : "#111",
            cursor: "pointer",
          }}
        >
          📆 Semana
        </button>

        <button
          onClick={() =>
            setAba("kanban")
          }
          style={{
            padding:
              "10px 16px",
            borderRadius: 8,
            border: "none",
            background:
              aba === "kanban"
                ? "#2563eb"
                : "#e5e7eb",
            color:
              aba === "kanban"
                ? "#fff"
                : "#111",
            cursor: "pointer",
          }}
        >
          📋 Kanban
        </button>

        <button
          onClick={() =>
            setMostrarHistorico(
              !mostrarHistorico
            )
          }
          style={{
            padding:
              "10px 16px",
            borderRadius: 8,
            border: "none",
            background:
              mostrarHistorico
                ? "#16a34a"
                : "#e5e7eb",
            color:
              mostrarHistorico
                ? "#fff"
                : "#111",
            cursor: "pointer",
          }}
        >
          📚 Histórico (
          {historico.length})
        </button>
      </div>

      {/* FORMULÁRIO */}

      {mostrarFormulario && (
        <div
          style={{
            background: "#f8fafc",
            border:
              "1px solid #ddd",
            borderRadius: 12,
            padding: 20,
            marginBottom: 25,
          }}
        >
          <h3>
            {editandoId
              ? "✏️ Editar tarefa"
              : "➕ Criar compromisso ou tarefa"}
          </h3>

          <p>Tarefa / compromisso</p>

          <input
            value={titulo}
            onChange={(e) =>
              setTitulo(
                e.target.value
              )
            }
            placeholder="Ex.: Ligar para Instituto ABC"
            style={{
              width: 500,
              maxWidth: "100%",
              padding: 9,
              boxSizing:
                "border-box",
            }}
          />

          <p>Tipo</p>

          <select
            value={tipo}
            onChange={(e) =>
              setTipo(
                e.target
                  .value as TaskType
              )
            }
          >
            <option value="task">
              📋 Tarefa
            </option>

            <option value="appointment">
              📅 Compromisso
            </option>

            <option value="call">
              📞 Ligação
            </option>

            <option value="follow_up">
              🔄 Retorno
            </option>
          </select>

          <p>Prioridade</p>

          <select
            value={prioridade}
            onChange={(e) =>
              setPrioridade(
                e.target
                  .value as Priority
              )
            }
          >
            <option value="urgent">
              🔴 Urgente
            </option>

            <option value="high">
              🟠 Alta
            </option>

            <option value="medium">
              🟡 Média
            </option>

            <option value="low">
              🟢 Baixa
            </option>

            <option value="none">
              ⚪ Normal
            </option>
          </select>

          <p>Data</p>

          <input
            type="date"
            value={dataPrazo}
            onChange={(e) =>
              setDataPrazo(
                e.target.value
              )
            }
          />

          <p>Horário</p>

          <input
            type="time"
            value={horario}
            onChange={(e) =>
              setHorario(
                e.target.value
              )
            }
          />

          <div
            style={{
              marginTop: 18,
              padding: 14,
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
            }}
          >
            <strong>📋 Identificação do acompanhamento</strong>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(120px, 1fr))", gap: 8, marginTop: 10 }}>
              <input value={grupoNumero} onChange={(e) => setGrupoNumero(e.target.value)} placeholder="Nº do grupo" />
              <input value={propostaNumero} onChange={(e) => setPropostaNumero(e.target.value)} placeholder="Nº da proposta" />
              <input value={instrumentoNumero} onChange={(e) => setInstrumentoNumero(e.target.value)} placeholder="Nº do instrumento" />
            </div>

            <div style={{ marginTop: 12, fontWeight: 600 }}>📎 Documentos / pendências</div>
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              <input
                value={novoDocumento}
                onChange={(e) => setNovoDocumento(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") adicionarDocumento(); }}
                placeholder="Ex.: Certidão Federal"
                style={{ flex: 1, minWidth: 220 }}
              />
              <button type="button" onClick={adicionarDocumento}>➕ Adicionar</button>
            </div>

            {documentos.length > 0 && (
              <div style={{ marginTop: 10 }}>
                {documentos.map((documento) => (
                  <div key={documento.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <button type="button" onClick={() => alternarDocumento(documento.id)}>
                      {documento.entregue ? "🟢 Entregue" : "🔴 Faltando"}
                    </button>
                    <span style={{ flex: 1, textDecoration: documento.entregue ? "line-through" : "none" }}>{documento.titulo}</span>
                    <button type="button" onClick={() => excluirDocumento(documento.id)}>🗑️</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p>Observações</p>

          <textarea
            rows={4}
            value={observacoes}
            onChange={(e) =>
              setObservacoes(
                e.target.value
              )
            }
            placeholder="Detalhes, telefone, documentos, retorno, etc."
            style={{
              width: 500,
              maxWidth: "100%",
              boxSizing:
                "border-box",
            }}
          />

          <div
            style={{
              marginTop: 15,
            }}
          >
            <button
              onClick={
                editandoId
                  ? atualizarTarefa
                  : salvarTarefa
              }
              style={{
                padding:
                  "10px 16px",
              }}
            >
              💾 {editandoId ? "Salvar alterações" : "Salvar"}
            </button>

            <button
              onClick={() => {
                limparFormulario();
                setMostrarFormulario(
                  false
                );
              }}
              style={{
                marginLeft: 8,
                padding:
                  "10px 16px",
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* VISÃO HOJE */}

      {aba === "hoje" && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: 20,
              background:
                "#f8fafc",
              padding: 15,
              borderRadius: 10,
            }}
          >
            <button
              onClick={() =>
                mudarDia(-1)
              }
            >
              ◀
            </button>

            <div
              style={{
                textAlign:
                  "center",
              }}
            >
              <strong
                style={{
                  fontSize: 20,
                }}
              >
                {dataSelecionada ===
                hoje
                  ? "Hoje"
                  : nomeDia(
                      dataSelecionada
                    )}
              </strong>

              <div
                style={{
                  color:
                    "#64748b",
                }}
              >
                {formatarData(
                  dataSelecionada
                )}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
              }}
            >
              <button
                onClick={() =>
                  setDataSelecionada(
                    hoje
                  )
                }
              >
                Hoje
              </button>

              <button
                onClick={() =>
                  mudarDia(1)
                }
              >
                ▶
              </button>
            </div>
          </div>

          {/* ANOTAÇÕES DE ACOMPANHAMENTO SEM PRAZO */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: 15,
              marginBottom: 20,
              boxShadow: "0 2px 8px rgba(15,23,42,.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
                marginBottom: 8,
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: 19 }}>📋 Acompanhamento</h2>
                <div style={{ color: "#64748b", fontSize: 13, marginTop: 3 }}>
                  Anote situações, pendências e informações importantes que não têm prazo definido.
                </div>
              </div>

              <button
                onClick={salvarAcompanhamento}
                style={{
                  padding: "9px 14px",
                  border: "none",
                  borderRadius: 8,
                  background: "#2563eb",
                  color: "#fff",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                💾 Salvar
              </button>
            </div>

            <textarea
              value={anotacoesAcompanhamento}
              onChange={(e) => setAnotacoesAcompanhamento(e.target.value)}
              placeholder={`Exemplo:

Grupo 178 | Prop. 0245 | Instr. 12/2026
• Falta documento da instituição
• Aguardar assinatura
• Conferir parecer

Grupo 195 | Prop. 0310 | Instr. 08/2026
• Documento entregue
• Falta comprovante`}
              style={{
                width: "100%",
                minHeight: 120,
                padding: 12,
                border: "1px solid #cbd5e1",
                borderRadius: 9,
                boxSizing: "border-box",
                resize: "vertical",
                fontFamily: "Arial, sans-serif",
                fontSize: 14,
                lineHeight: 1.5,
                outline: "none",
              }}
            />
          </div>

          {/* PAINEL DE ACOMPANHAMENTO */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: 15,
              marginBottom: 20,
              boxShadow: "0 2px 8px rgba(15,23,42,.05)",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 12 }}>📊 Acompanhamento de Pendências</h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(110px, 1fr))", gap: 8 }}>
              <div style={{ padding: 10, borderRadius: 10, background: "#fff1f2", textAlign: "center" }}>🔴<div style={{ fontSize: 24, fontWeight: 800 }}>{atrasadas.length}</div><small>Atrasadas</small></div>
              <div style={{ padding: 10, borderRadius: 10, background: "#fff7ed", textAlign: "center" }}>🟠<div style={{ fontSize: 24, fontWeight: 800 }}>{tarefasHoje.length}</div><small>Vencem hoje</small></div>
              <div style={{ padding: 10, borderRadius: 10, background: "#eff6ff", textAlign: "center" }}>🔵<div style={{ fontSize: 24, fontWeight: 800 }}>{emAndamento.length}</div><small>Em andamento</small></div>
              <div style={{ padding: 10, borderRadius: 10, background: "#f0fdf4", textAlign: "center" }}>🟢<div style={{ fontSize: 24, fontWeight: 800 }}>{historico.length}</div><small>Concluídas</small></div>
            </div>

            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <strong>📁 Pendências por Grupo / Proposta</strong>
                <span style={{ fontSize: 12, color: "#64748b" }}>{documentosEntregues} entregues • {documentosPendentes} faltando</span>
              </div>
              {gruposResumo.length === 0 ? (
                <div style={{ color: "#64748b", fontSize: 13 }}>Cadastre grupo, proposta e instrumento nas tarefas para acompanhar por instituição.</div>
              ) : (
                gruposResumo.map((grupo) => (
                  <div key={`${grupo.grupo}-${grupo.proposta}-${grupo.instrumento}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 13 }}><strong>Grupo {grupo.grupo}</strong> | Prop. {grupo.proposta} | Instr. {grupo.instrumento}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: grupo.pendentes > 0 ? "#dc2626" : "#16a34a" }}>{grupo.pendentes > 0 ? `🔴 ${grupo.pendentes} faltando` : `🟢 ${grupo.entregues} entregues`}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ATRASADAS */}

          {atrasadas.length >
            0 && (
            <div
              style={{
                background:
                  "#fff1f2",
                border:
                  "1px solid #fecaca",
                borderRadius: 10,
                padding: 15,
                marginBottom: 20,
              }}
            >
              <h3
                style={{
                  color:
                    "#b91c1c",
                  marginTop: 0,
                }}
              >
                ⚠️ Pendências atrasadas (
                {
                  atrasadas.length
                }
                )
              </h3>

              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 10,
                }}
              >
                {atrasadas.map(
                  (tarefa) => (
                    <Cartao
                      key={
                        tarefa.id
                      }
                      tarefa={
                        tarefa
                      }
                    />
                  )
                )}
              </div>
            </div>
          )}

          {/* TAREFAS DO DIA */}

          <div>
            <h2>
              📌 Compromissos e tarefas do dia
            </h2>

            {tarefasHoje.length ===
            0 ? (
              <div
                style={{
                  background:
                    "#f8fafc",
                  padding: 40,
                  textAlign:
                    "center",
                  borderRadius: 12,
                  border:
                    "1px dashed #cbd5e1",
                }}
              >
                <div
                  style={{
                    fontSize: 35,
                  }}
                >
                  🎉
                </div>

                <strong>
                  Nada pendente neste dia.
                </strong>

                <div
                  style={{
                    color:
                      "#64748b",
                    marginTop: 5,
                  }}
                >
                  Dia livre ou tudo resolvido.
                </div>
              </div>
            ) : (
              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: 12,
                }}
              >
                {tarefasHoje
                  .sort((a, b) =>
                    (a.due_time ||
                      "99:99").localeCompare(
                      b.due_time ||
                        "99:99"
                    )
                  )
                  .map(
                    (tarefa) => (
                      <Cartao
                        key={
                          tarefa.id
                        }
                        tarefa={
                          tarefa
                        }
                      />
                    )
                  )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VISÃO SEMANA */}

      {aba === "semana" && (
        <div>
          <h2>
            📆 Próximos 7 dias
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(7, minmax(190px, 1fr))",
              gap: 10,
              overflowX:
                "auto",
              paddingBottom: 15,
            }}
          >
            {semana.map(
              (dia) => {
                const tarefasDia =
                  tarefas.filter(
                    (tarefa) =>
                      tarefa.status !==
                        "done" &&
                      tarefa.due_date ===
                        dia
                  );

                const ehHoje =
                  dia === hoje;

                return (
                  <div
                    key={dia}
                    style={{
                      background:
                        ehHoje
                          ? "#eff6ff"
                          : "#f8fafc",
                      border:
                        ehHoje
                          ? "2px solid #2563eb"
                          : "1px solid #ddd",
                      borderRadius: 10,
                      padding: 12,
                      minHeight: 400,
                    }}
                  >
                    <div
                      style={{
                        textAlign:
                          "center",
                        marginBottom: 12,
                      }}
                    >
                      <strong>
                        {nomeDiaCurto(
                          dia
                        )}
                      </strong>

                      <div>
                        {formatarData(
                          dia
                        )}
                      </div>
                    </div>

                    {tarefasDia.length ===
                    0 ? (
                      <div
                        style={{
                          color:
                            "#94a3b8",
                          fontSize: 13,
                          textAlign:
                            "center",
                          marginTop: 30,
                        }}
                      >
                        Sem tarefas
                      </div>
                    ) : (
                      tarefasDia.map(
                        (
                          tarefa
                        ) => (
                          <Cartao
                            key={
                              tarefa.id
                            }
                            tarefa={
                              tarefa
                            }
                            compacto
                          />
                        )
                      )
                    )}
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* VISÃO KANBAN */}

      {aba === "kanban" && (
        <div>
          <h2>
            📋 Kanban de tarefas
          </h2>

          <div
            style={{
              color: "#64748b",
              marginBottom: 12,
            }}
          >
            Arraste cada tarefa para a coluna que representa a situação atual.
          </div>

          <div
            style={{
              display:
                "flex",
              gap: 15,
              overflowX:
                "auto",
              alignItems:
                "flex-start",
            }}
          >
            <ColunaKanban
              titulo="A Fazer"
              emoji="📥"
              lista={aFazer}
              status="todo"
              fundo="#f8fafc"
            />

            <ColunaKanban
              titulo="Em Andamento"
              emoji="🔵"
              lista={emAndamento}
              status="in_progress"
              fundo="#eff6ff"
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }}
              onDrop={soltarNasAtrasadas}
              style={{
                flex: 1,
                minWidth: 280,
                background: "#fff1f2",
                borderRadius: 12,
                padding: 15,
                minHeight: 480,
                border: "1px solid #ddd",
              }}
            >
              <h3
                style={{
                  textAlign: "center",
                  marginTop: 0,
                }}
              >
                ⚠️ Atrasadas ({atrasadas.length})
              </h3>

              {atrasadas.length === 0 ? (
                <div
                  style={{
                    border: "2px dashed #cbd5e1",
                    borderRadius: 10,
                    padding: 35,
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  Arraste tarefas para cá
                </div>
              ) : (
                atrasadas.map((tarefa) => (
                  <Cartao
                    key={tarefa.id}
                    tarefa={tarefa}
                  />
                ))
              )}
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }}
              onDrop={() =>
                soltarNaColuna("done")
              }
              style={{
                flex: 1,
                minWidth: 280,
                minHeight: 480,
                background:
                  "#f0fdf4",
                border:
                  "2px dashed #86efac",
                borderRadius: 12,
                padding: 15,
              }}
            >
              <h3
                style={{
                  textAlign:
                    "center",
                  marginTop: 0,
                  color:
                    "#166534",
                }}
              >
                ✅ Concluir
              </h3>

              <div
                style={{
                  textAlign:
                    "center",
                  padding: 50,
                  color:
                    "#166534",
                }}
              >
                Arraste para cá
                quando terminar.
                <br />
                <br />
                A tarefa sai do Kanban
                e vai para o histórico.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HISTÓRICO */}

      {mostrarHistorico && (
        <div
          style={{
            marginTop: 30,
            borderTop:
              "2px solid #e5e7eb",
            paddingTop: 20,
          }}
        >
          <h2>
            📚 Histórico de tarefas concluídas
          </h2>

          {historico.length ===
          0 ? (
            <div
              style={{
                color:
                  "#64748b",
              }}
            >
              Nenhuma tarefa concluída ainda.
            </div>
          ) : (
            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 12,
              }}
            >
              {historico
                .sort(
                  (a, b) =>
                    (
                      b.completed_at ||
                      ""
                    ).localeCompare(
                      a.completed_at ||
                        ""
                    )
                )
                .map(
                  (tarefa) => (
                    <div
                      key={
                        tarefa.id
                      }
                      style={{
                        background:
                          "#f8fafc",
                        border:
                          "1px solid #ddd",
                        borderRadius: 10,
                        padding: 15,
                      }}
                    >
                      <strong>
                        ✅{" "}
                        {
                          tarefa.title
                        }
                      </strong>

                      <div
                        style={{
                          marginTop: 7,
                          color:
                            "#64748b",
                        }}
                      >
                        {tipoTexto(
                          tarefa.task_type
                        )}
                      </div>

                      {tarefa.original_due_date && (
                        <div
                          style={{
                            marginTop: 6,
                          }}
                        >
                          📅 Prazo:{" "}
                          {formatarData(
                            tarefa.original_due_date
                          )}
                        </div>
                      )}

                      {tarefa.completed_at && (
                        <div
                          style={{
                            marginTop: 6,
                          }}
                        >
                          ✅ Concluída:{" "}
                          {new Date(
                            tarefa.completed_at
                          ).toLocaleString(
                            "pt-BR"
                          )}
                        </div>
                      )}

                      {tarefa.notes && (
                        <div
                          style={{
                            marginTop: 8,
                            color:
                              "#555",
                          }}
                        >
                          📝{" "}
                          {
                            tarefa.notes
                          }
                        </div>
                      )}

                      <div
                        style={{
                          marginTop: 12,
                        }}
                      >
                        <button
                          onClick={() =>
                            reabrirTarefa(
                              tarefa.id
                            )
                          }
                        >
                          ↩️ Reabrir
                        </button>

                        <button
                          onClick={() =>
                            excluirTarefa(
                              tarefa.id
                            )
                          }
                          style={{
                            marginLeft: 8,
                          }}
                        >
                          🗑️ Excluir
                        </button>
                      </div>
                    </div>
                  )
                )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}