import { useEffect, useMemo, useState } from "react";
import { supabase } from "../database/supabase";

type Status = "todo" | "in_progress" | "done";
type Priority = "none" | "low" | "medium" | "high" | "urgent";
type TaskType = "task" | "appointment" | "call" | "follow_up";

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

  useEffect(() => {
    carregarTarefas();
  }, []);

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
    setTitulo("");
    setObservacoes("");
    setPrioridade("medium");
    setTipo("task");
    setDataPrazo(hoje);
    setHorario("");
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

  function iniciarArraste(id: string) {
    setArrastando(id);
  }

  async function soltarNaColuna(
    novoStatus: Status
  ) {
    if (!arrastando) return;

    const id = arrastando;

    setArrastando(null);

    await mudarStatus(
      id,
      novoStatus
    );
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
        onDragStart={() =>
          iniciarArraste(tarefa.id)
        }
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

        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            marginTop: 10,
          }}
        >
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
            ➕ Criar compromisso ou tarefa
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
              onClick={salvarTarefa}
              style={{
                padding:
                  "10px 16px",
              }}
            >
              💾 Salvar
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

            <ColunaKanban
              titulo="Atrasadas"
              emoji="⚠️"
              lista={atrasadas}
              status="todo"
              fundo="#fff1f2"
            />

            <div
              onDragOver={(e) =>
                e.preventDefault()
              }
              onDrop={() =>
                soltarNaColuna(
                  "done"
                )
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