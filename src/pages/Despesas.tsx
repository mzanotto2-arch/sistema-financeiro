import { useEffect, useMemo, useState } from "react";
import type {
  Despesa,
  DespesaLancamento,
} from "../types/despesa";

import {
  listarDespesas,
  salvarDespesa,
  atualizarDespesa,
  excluirDespesa,
  listarLancamentos,
  gerarLancamentosDespesa,
  atualizarLancamento,
  excluirLancamento,
  enviarArquivo,
  abrirArquivo,
} from "../services/despesasService";

export default function Despesas() {
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [lancamentos, setLancamentos] = useState<
    Record<number, DespesaLancamento[]>
  >({});

  const [id, setId] = useState<number | undefined>();

  const [descricao, setDescricao] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [valor, setValor] = useState("");
  const [vencimento, setVencimento] = useState("");

  const [categoria, setCategoria] = useState("Empresa");
  const [tipo, setTipo] = useState("Única");
  const [recorrencia, setRecorrencia] =
    useState("Nenhuma");

  const [linkBoleto, setLinkBoleto] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("Todas");

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [despesaAberta, setDespesaAberta] =
    useState<number | null>(null);

  const [carregando, setCarregando] =
    useState(false);

  useEffect(() => {
    carregarDespesas();
  }, []);

  async function carregarDespesas() {
    try {
      setCarregando(true);

      const lista = await listarDespesas();

      setDespesas(lista);

      const mapa: Record<
        number,
        DespesaLancamento[]
      > = {};

      for (const despesa of lista) {
        if (despesa.id) {
          try {
            mapa[despesa.id] =
              await listarLancamentos(despesa.id);
          } catch {
            mapa[despesa.id] = [];
          }
        }
      }

      setLancamentos(mapa);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar as despesas.");
    } finally {
      setCarregando(false);
    }
  }

  function limparFormulario() {
    setId(undefined);

    setDescricao("");
    setFornecedor("");
    setValor("");
    setVencimento("");

    setCategoria("Empresa");
    setTipo("Única");
    setRecorrencia("Nenhuma");

    setLinkBoleto("");
    setObservacoes("");

    setMostrarFormulario(false);
  }

  function novaDespesa() {
    limparFormulario();
    setMostrarFormulario(true);
  }

  function editar(despesa: Despesa) {
    setId(despesa.id);

    setDescricao(despesa.descricao);
    setFornecedor(despesa.fornecedor);
    setValor(String(despesa.valor));
    setVencimento(despesa.vencimento);

    setCategoria(
      despesa.categoria || "Empresa"
    );

    setTipo(
      despesa.tipo || "Única"
    );

    setRecorrencia(
      despesa.recorrencia || "Nenhuma"
    );

    setLinkBoleto(
      despesa.link_boleto || ""
    );

    setObservacoes(
      despesa.observacoes || ""
    );

    setMostrarFormulario(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function salvar() {
    if (!descricao.trim()) {
      alert("Informe a descrição.");
      return;
    }

    if (!valor || Number(valor) <= 0) {
      alert("Informe um valor válido.");
      return;
    }

    if (!vencimento) {
      alert("Informe o vencimento.");
      return;
    }

    try {
      setCarregando(true);

      const dados: Despesa = {
        id,
        descricao,
        fornecedor,
        valor: Number(valor),
        vencimento,
        status: "Pendente",
        pago: false,

        categoria,
        tipo,
        recorrencia,

        link_boleto: linkBoleto,
        observacoes,
      };

      let despesaSalva: Despesa;

      if (id) {
        despesaSalva =
          await atualizarDespesa(dados);

        alert("Despesa atualizada!");
      } else {
        despesaSalva =
          await salvarDespesa(dados);

        alert("Despesa salva!");

        /*
          Para despesas novas recorrentes,
          já criamos os lançamentos.
        */

        if (
          despesaSalva.id &&
          tipo === "Recorrente"
        ) {
          const quantidade = Number(
            prompt(
              "Quantos lançamentos deseja criar?",
              "12"
            )
          );

          if (
            quantidade &&
            quantidade > 0
          ) {
            await gerarLancamentosDespesa(
              despesaSalva,
              quantidade
            );
          }
        } else if (
          despesaSalva.id &&
          tipo === "Única"
        ) {
          await gerarLancamentosDespesa(
            despesaSalva,
            1
          );
        }
      }

      limparFormulario();

      await carregarDespesas();
    } catch (error: any) {
      console.error(error);

      alert(
        error?.message ||
          "Erro ao salvar a despesa."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function excluir(id: number) {
    if (
      !confirm(
        "Deseja excluir esta despesa e todos os seus lançamentos?"
      )
    ) {
      return;
    }

    try {
      await excluirDespesa(id);

      alert("Despesa excluída.");

      await carregarDespesas();
    } catch (error: any) {
      console.error(error);

      alert(
        error?.message ||
          "Erro ao excluir a despesa."
      );
    }
  }

  async function abrirHistorico(
    despesaId: number
  ) {
    if (despesaAberta === despesaId) {
      setDespesaAberta(null);
      return;
    }

    try {
      const lista =
        await listarLancamentos(despesaId);

      setLancamentos((anterior) => ({
        ...anterior,
        [despesaId]: lista,
      }));

      setDespesaAberta(despesaId);
    } catch (error) {
      console.error(error);

      alert(
        "Erro ao carregar o histórico."
      );
    }
  }

  async function darBaixa(
    lancamento: DespesaLancamento
  ) {
    const dataPagamento =
      prompt(
        "Data do pagamento (AAAA-MM-DD):",
        new Date()
          .toISOString()
          .split("T")[0]
      );

    if (!dataPagamento) {
      return;
    }

    const forma =
      prompt(
        "Forma de pagamento:",
        "PIX"
      ) || "";

    try {
      await atualizarLancamento({
        ...lancamento,

        pago: true,
        status: "Pago",

        data_pagamento:
          dataPagamento,

        forma_pagamento:
          forma,
      });

      alert(
        "Pagamento registrado com sucesso!"
      );

      await carregarDespesas();
    } catch (error: any) {
      console.error(error);

      alert(
        error?.message ||
          "Erro ao registrar o pagamento."
      );
    }
  }

  async function reabrir(
    lancamento: DespesaLancamento
  ) {
    if (
      !confirm(
        "Deseja reabrir este pagamento?"
      )
    ) {
      return;
    }

    try {
      await atualizarLancamento({
        ...lancamento,

        pago: false,
        status: "Em Aberto",

        data_pagamento: "",
        forma_pagamento: "",
      });

      await carregarDespesas();
    } catch (error: any) {
      console.error(error);

      alert(
        error?.message ||
          "Erro ao reabrir o pagamento."
      );
    }
  }

  async function excluirLancamentoConfirmar(
    id: number
  ) {
    if (
      !confirm(
        "Deseja excluir este lançamento?"
      )
    ) {
      return;
    }

    try {
      await excluirLancamento(id);

      await carregarDespesas();
    } catch (error: any) {
      console.error(error);

      alert(
        error?.message ||
          "Erro ao excluir lançamento."
      );
    }
  }

  async function anexarArquivo(
    lancamento: DespesaLancamento,
    tipoArquivo:
      | "boleto"
      | "comprovante"
  ) {
    if (!lancamento.id) {
      alert(
        "Lançamento ainda não possui ID."
      );
      return;
    }

    const input =
      document.createElement("input");

    input.type = "file";

    input.accept =
      ".pdf,.png,.jpg,.jpeg,.webp";

    input.onchange = async () => {
      const arquivo =
        input.files?.[0];

      if (!arquivo) {
        return;
      }

      try {
        const caminho =
          await enviarArquivo(
            arquivo,
            tipoArquivo,
            lancamento.despesa_id,
            lancamento.id!
          );

        const atualizado: DespesaLancamento =
          {
            ...lancamento,
          };

        if (
          tipoArquivo === "boleto"
        ) {
          atualizado.boleto_path =
            caminho;
        } else {
          atualizado.comprovante_path =
            caminho;
        }

        await atualizarLancamento(
          atualizado
        );

        alert(
          tipoArquivo === "boleto"
            ? "Boleto anexado!"
            : "Comprovante anexado!"
        );

        await carregarDespesas();
      } catch (error: any) {
        console.error(error);

        alert(
          error?.message ||
            "Erro ao enviar arquivo."
        );
      }
    };

    input.click();
  }

  async function abrirAnexo(
    caminho?: string
  ) {
    if (!caminho) {
      alert(
        "Nenhum arquivo anexado."
      );
      return;
    }

    try {
      await abrirArquivo(caminho);
    } catch (error: any) {
      console.error(error);

      alert(
        error?.message ||
          "Não foi possível abrir o arquivo."
      );
    }
  }

  function formatarMoeda(
    valor: number
  ) {
    return Number(valor || 0).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    );
  }

  function formatarData(
    data?: string
  ) {
    if (!data) return "-";

    const partes =
      data.split("-");

    if (partes.length !== 3) {
      return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  function statusLancamento(
    lancamento: DespesaLancamento
  ) {
    if (lancamento.pago) {
      return {
        texto: "Pago",
        cor: "#15803d",
        fundo: "#dcfce7",
      };
    }

    const hoje =
      new Date()
        .toISOString()
        .split("T")[0];

    if (
      lancamento.vencimento < hoje
    ) {
      return {
        texto: "Vencida",
        cor: "#b91c1c",
        fundo: "#fee2e2",
      };
    }

    return {
      texto: "Em Aberto",
      cor: "#b45309",
      fundo: "#ffedd5",
    };
  }

  const despesasFiltradas =
    useMemo(() => {
      const texto =
        busca.toLowerCase().trim();

      return despesas.filter(
        (despesa) => {
          const correspondeBusca =
            !texto ||
            despesa.descricao
              .toLowerCase()
              .includes(texto) ||
            despesa.fornecedor
              .toLowerCase()
              .includes(texto);

          if (!correspondeBusca) {
            return false;
          }

          if (
            filtro === "Empresa"
          ) {
            return (
              (despesa.categoria ||
                "Empresa") ===
              "Empresa"
            );
          }

          if (
            filtro === "Pessoal"
          ) {
            return (
              despesa.categoria ===
              "Pessoal"
            );
          }

          if (
            filtro === "Recorrentes"
          ) {
            return (
              despesa.tipo ===
              "Recorrente"
            );
          }

          if (
            filtro === "Únicas"
          ) {
            return (
              despesa.tipo !==
              "Recorrente"
            );
          }

          return true;
        }
      );
    }, [
      despesas,
      busca,
      filtro,
    ]);

  const totais = useMemo(() => {
    let aberto = 0;
    let vencido = 0;

    Object.values(
      lancamentos
    ).forEach((lista) => {
      lista.forEach(
        (item) => {
          if (item.pago) return;

          const hoje =
            new Date()
              .toISOString()
              .split("T")[0];

          if (
            item.vencimento < hoje
          ) {
            vencido += Number(
              item.valor
            );
          } else {
            aberto += Number(
              item.valor
            );
          }
        }
      );
    });

    return {
      aberto,
      vencido,
    };
  }, [lancamentos]);

  return (
    <div
      style={{
        padding: "30px",
        fontFamily: "Arial",
        background:
          "#f5f7fb",
        minHeight: "100vh",
      }}
    >
      {/* CABEÇALHO */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              color: "#1f2937",
            }}
          >
            💰 Despesas
          </h1>

          <p
            style={{
              marginTop: 5,
              color: "#64748b",
            }}
          >
            Controle de contas a pagar,
            boletos e comprovantes.
          </p>
        </div>

        <button
          onClick={novaDespesa}
          style={{
            background:
              "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding:
              "12px 20px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          ➕ Nova despesa
        </button>
      </div>

      {/* RESUMO */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, 1fr)",
          gap: 15,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            background:
              "#fff",
            padding: 18,
            borderRadius: 10,
            boxShadow:
              "0 2px 8px rgba(0,0,0,.08)",
          }}
        >
          <div
            style={{
              color: "#64748b",
            }}
          >
            Despesas cadastradas
          </div>

          <strong
            style={{
              fontSize: 24,
            }}
          >
            {despesas.length}
          </strong>
        </div>

        <div
          style={{
            background:
              "#fff7ed",
            padding: 18,
            borderRadius: 10,
          }}
        >
          <div
            style={{
              color: "#b45309",
            }}
          >
            Em aberto
          </div>

          <strong
            style={{
              fontSize: 22,
              color:
                "#b45309",
            }}
          >
            {formatarMoeda(
              totais.aberto
            )}
          </strong>
        </div>

        <div
          style={{
            background:
              "#fee2e2",
            padding: 18,
            borderRadius: 10,
          }}
        >
          <div
            style={{
              color:
                "#b91c1c",
            }}
          >
            Vencidas
          </div>

          <strong
            style={{
              fontSize: 22,
              color:
                "#b91c1c",
            }}
          >
            {formatarMoeda(
              totais.vencido
            )}
          </strong>
        </div>

        <div
          style={{
            background:
              "#eff6ff",
            padding: 18,
            borderRadius: 10,
          }}
        >
          <div
            style={{
              color:
                "#2563eb",
            }}
          >
            Próximas despesas
          </div>

          <strong
            style={{
              fontSize: 22,
              color:
                "#2563eb",
            }}
          >
            {
              despesasFiltradas.length
            }
          </strong>
        </div>
      </div>

      {/* FORMULÁRIO */}

      {mostrarFormulario && (
        <div
          style={{
            background:
              "#fff",
            padding: 25,
            borderRadius: 12,
            marginBottom: 25,
            boxShadow:
              "0 2px 10px rgba(0,0,0,.08)",
          }}
        >
          <h2>
            {id
              ? "✏️ Editar despesa"
              : "➕ Nova despesa"}
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, 1fr)",
              gap: 15,
            }}
          >
            <div>
              <label>
                Descrição
              </label>

              <input
                value={descricao}
                onChange={(e) =>
                  setDescricao(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  padding: 10,
                  boxSizing:
                    "border-box",
                }}
              />
            </div>

            <div>
              <label>
                Fornecedor
              </label>

              <input
                value={fornecedor}
                onChange={(e) =>
                  setFornecedor(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  padding: 10,
                  boxSizing:
                    "border-box",
                }}
              />
            </div>

            <div>
              <label>
                Valor
              </label>

              <input
                type="number"
                step="0.01"
                value={valor}
                onChange={(e) =>
                  setValor(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  padding: 10,
                  boxSizing:
                    "border-box",
                }}
              />
            </div>

            <div>
              <label>
                Primeiro vencimento
              </label>

              <input
                type="date"
                value={vencimento}
                onChange={(e) =>
                  setVencimento(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  padding: 10,
                  boxSizing:
                    "border-box",
                }}
              />
            </div>

            <div>
              <label>
                Categoria
              </label>

              <select
                value={categoria}
                onChange={(e) =>
                  setCategoria(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  padding: 10,
                }}
              >
                <option>
                  Empresa
                </option>

                <option>
                  Pessoal
                </option>
              </select>
            </div>

            <div>
              <label>
                Tipo
              </label>

              <select
                value={tipo}
                onChange={(e) =>
                  setTipo(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  padding: 10,
                }}
              >
                <option>
                  Única
                </option>

                <option>
                  Recorrente
                </option>
              </select>
            </div>

            {tipo ===
              "Recorrente" && (
              <div>
                <label>
                  Recorrência
                </label>

                <select
                  value={
                    recorrencia
                  }
                  onChange={(e) =>
                    setRecorrencia(
                      e.target.value
                    )
                  }
                  style={{
                    width:
                      "100%",
                    padding: 10,
                  }}
                >
                  <option>
                    Mensal
                  </option>

                  <option>
                    Bimestral
                  </option>

                  <option>
                    Trimestral
                  </option>

                  <option>
                    Semestral
                  </option>

                  <option>
                    Anual
                  </option>
                </select>
              </div>
            )}

            <div>
              <label>
                Link do boleto
              </label>

              <input
                value={
                  linkBoleto
                }
                onChange={(e) =>
                  setLinkBoleto(
                    e.target.value
                  )
                }
                placeholder="https://..."
                style={{
                  width: "100%",
                  padding: 10,
                  boxSizing:
                    "border-box",
                }}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: 15,
            }}
          >
            <label>
              Observações
            </label>

            <textarea
              rows={3}
              value={
                observacoes
              }
              onChange={(e) =>
                setObservacoes(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding: 10,
                boxSizing:
                  "border-box",
              }}
            />
          </div>

          <div
            style={{
              marginTop: 20,
            }}
          >
            <button
              onClick={salvar}
              disabled={
                carregando
              }
              style={{
                background:
                  "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding:
                  "11px 20px",
                fontWeight:
                  "bold",
                cursor:
                  "pointer",
              }}
            >
              💾{" "}
              {id
                ? "Atualizar"
                : "Salvar"}
            </button>

            <button
              onClick={
                limparFormulario
              }
              style={{
                marginLeft: 10,
                padding:
                  "11px 20px",
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* PESQUISA E FILTROS */}

      <div
        style={{
          background:
            "#fff",
          padding: 15,
          borderRadius: 10,
          marginBottom: 20,
        }}
      >
        <input
          value={busca}
          onChange={(e) =>
            setBusca(
              e.target.value
            )
          }
          placeholder="🔎 Pesquisar despesa ou fornecedor..."
          style={{
            width: "100%",
            padding: 12,
            boxSizing:
              "border-box",
            border:
              "1px solid #cbd5e1",
            borderRadius: 8,
          }}
        />

        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 12,
            flexWrap:
              "wrap",
          }}
        >
          {[
            "Todas",
            "Empresa",
            "Pessoal",
            "Recorrentes",
            "Únicas",
          ].map((item) => (
            <button
              key={item}
              onClick={() =>
                setFiltro(item)
              }
              style={{
                padding:
                  "8px 14px",
                borderRadius: 20,
                border:
                  "1px solid #cbd5e1",
                background:
                  filtro === item
                    ? "#2563eb"
                    : "#fff",
                color:
                  filtro === item
                    ? "#fff"
                    : "#334155",
                cursor:
                  "pointer",
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* LISTA */}

      <div
        style={{
          background:
            "#fff",
          padding: 20,
          borderRadius: 12,
          boxShadow:
            "0 2px 10px rgba(0,0,0,.06)",
        }}
      >
        <h2
          style={{
            marginTop: 0,
          }}
        >
          📋 Minhas despesas
        </h2>

        {despesasFiltradas.length ===
        0 ? (
          <p>
            Nenhuma despesa
            encontrada.
          </p>
        ) : (
          despesasFiltradas.map(
            (despesa) => {
              const lista =
                despesa.id
                  ? lancamentos[
                      despesa.id
                    ] || []
                  : [];

              const abertos =
                lista.filter(
                  (item) =>
                    !item.pago
                );

              const vencidos =
                abertos.filter(
                  (item) => {
                    const hoje =
                      new Date()
                        .toISOString()
                        .split(
                          "T"
                        )[0];

                    return (
                      item.vencimento <
                      hoje
                    );
                  }
                );

              const proximo =
                abertos
                  .slice()
                  .sort(
                    (a, b) =>
                      a.vencimento.localeCompare(
                        b.vencimento
                      )
                  )[0];

              return (
                <div
                  key={
                    despesa.id
                  }
                  style={{
                    border:
                      "1px solid #e2e8f0",
                    borderRadius: 10,
                    padding: 18,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      gap: 15,
                      flexWrap:
                        "wrap",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          margin:
                            "0 0 5px",
                        }}
                      >
                        💳{" "}
                        {
                          despesa.descricao
                        }
                      </h3>

                      <div
                        style={{
                          color:
                            "#64748b",
                        }}
                      >
                        {despesa.fornecedor ||
                          "Sem fornecedor"}{" "}
                        •{" "}
                        {
                          despesa.categoria ||
                          "Empresa"
                        }{" "}
                        •{" "}
                        {
                          despesa.tipo ||
                          "Única"
                        }
                      </div>
                    </div>

                    <div
                      style={{
                        textAlign:
                          "right",
                      }}
                    >
                      <strong
                        style={{
                          fontSize:
                            18,
                        }}
                      >
                        {formatarMoeda(
                          Number(
                            despesa.valor
                          )
                        )}
                      </strong>

                      {proximo && (
                        <div
                          style={{
                            color:
                              vencidos.length >
                              0
                                ? "#b91c1c"
                                : "#b45309",
                            marginTop: 4,
                          }}
                        >
                          Próximo:{" "}
                          {formatarData(
                            proximo.vencimento
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 12,
                      display:
                        "flex",
                      gap: 8,
                      flexWrap:
                        "wrap",
                      alignItems:
                        "center",
                    }}
                  >
                    {vencidos.length >
                      0 && (
                      <span
                        style={{
                          background:
                            "#fee2e2",
                          color:
                            "#b91c1c",
                          padding:
                            "5px 10px",
                          borderRadius:
                            20,
                          fontWeight:
                            "bold",
                        }}
                      >
                        🔴{" "}
                        {
                          vencidos.length
                        }{" "}
                        vencida(s)
                      </span>
                    )}

                    {lista.length >
                      0 && (
                      <span
                        style={{
                          background:
                            "#f1f5f9",
                          padding:
                            "5px 10px",
                          borderRadius:
                            20,
                        }}
                      >
                        📅{" "}
                        {
                          lista.length
                        }{" "}
                        lançamento(s)
                      </span>
                    )}

                    <button
                      onClick={() =>
                        abrirHistorico(
                          despesa.id!
                        )
                      }
                      style={{
                        marginLeft:
                          "auto",
                        padding:
                          "8px 14px",
                        border:
                          "none",
                        borderRadius:
                          7,
                        background:
                          "#1e293b",
                        color:
                          "#fff",
                        cursor:
                          "pointer",
                      }}
                    >
                      📅{" "}
                      {despesaAberta ===
                      despesa.id
                        ? "Fechar histórico"
                        : "Ver histórico"}
                    </button>

                    <button
                      onClick={() =>
                        editar(
                          despesa
                        )
                      }
                      style={{
                        padding:
                          "8px 12px",
                      }}
                    >
                      ✏️
                    </button>

                    <button
                      onClick={() =>
                        excluir(
                          despesa.id!
                        )
                      }
                      style={{
                        padding:
                          "8px 12px",
                      }}
                    >
                      🗑️
                    </button>
                  </div>

                  {/* HISTÓRICO */}

                  {despesaAberta ===
                    despesa.id && (
                    <div
                      style={{
                        marginTop: 18,
                        borderTop:
                          "1px solid #e2e8f0",
                        paddingTop:
                          15,
                        overflowX:
                          "auto",
                      }}
                    >
                      <h3>
                        📅 Histórico de pagamentos
                      </h3>

                      {lista.length ===
                      0 ? (
                        <p>
                          Nenhum lançamento
                          encontrado.
                        </p>
                      ) : (
                        lista.map(
                          (
                            item
                          ) => {
                            const status =
                              statusLancamento(
                                item
                              );

                            return (
                              <div
                                key={
                                  item.id
                                }
                                style={{
                                  display:
                                    "grid",
                                  gridTemplateColumns:
                                    "80px 110px 120px 120px 1fr",
                                  gap: 10,
                                  alignItems:
                                    "center",
                                  padding:
                                    "12px 8px",
                                  borderBottom:
                                    "1px solid #e2e8f0",
                                  minWidth:
                                    650,
                                }}
                              >
                                <strong>
                                  {item.referencia &&
                                  item.referencia !== "Única"
                                    ? item.referencia
                                    : lista.length > 1
                                      ? `${lista.indexOf(item) + 1}/${lista.length}`
                                      : "Única"}
                                </strong>

                                <span>
                                  {formatarData(
                                    item.vencimento
                                  )}
                                </span>

                                <strong>
                                  {formatarMoeda(
                                    Number(
                                      item.valor
                                    )
                                  )}
                                </strong>

                                <span
                                  style={{
                                    color:
                                      status.cor,
                                    background:
                                      status.fundo,
                                    padding:
                                      "5px 8px",
                                    borderRadius:
                                      15,
                                    textAlign:
                                      "center",
                                    fontWeight:
                                      "bold",
                                  }}
                                >
                                  {status.texto}
                                </span>

                                <div
                                  style={{
                                    display:
                                      "flex",
                                    gap: 6,
                                    flexWrap:
                                      "wrap",
                                  }}
                                >
                                  {!item.pago ? (
                                    <button
                                      onClick={() =>
                                        darBaixa(
                                          item
                                        )
                                      }
                                      style={{
                                        background:
                                          "#16a34a",
                                        color:
                                          "#fff",
                                        border:
                                          "none",
                                        borderRadius:
                                          6,
                                        padding:
                                          "6px 9px",
                                        cursor:
                                          "pointer",
                                      }}
                                    >
                                      ✅ Pagar
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        reabrir(
                                          item
                                        )
                                      }
                                      style={{
                                        padding:
                                          "6px 9px",
                                      }}
                                    >
                                      ↩️ Reabrir
                                    </button>
                                  )}

                                  <button
                                    onClick={() =>
                                      anexarArquivo(
                                        item,
                                        "boleto"
                                      )
                                    }
                                    style={{
                                      padding:
                                        "6px 9px",
                                    }}
                                  >
                                    📄 Boleto
                                  </button>

                                  {item.boleto_path && (
                                    <button
                                      onClick={() =>
                                        abrirAnexo(
                                          item.boleto_path
                                        )
                                      }
                                      style={{
                                        padding:
                                          "6px 9px",
                                      }}
                                    >
                                      🔗 Abrir
                                    </button>
                                  )}

                                  {item.pago && (
                                    <>
                                      <button
                                        onClick={() =>
                                          anexarArquivo(
                                            item,
                                            "comprovante"
                                          )
                                        }
                                        style={{
                                          padding:
                                            "6px 9px",
                                        }}
                                      >
                                        📎 Comprovante
                                      </button>

                                      {item.comprovante_path && (
                                        <button
                                          onClick={() =>
                                            abrirAnexo(
                                              item.comprovante_path
                                            )
                                          }
                                          style={{
                                            padding:
                                              "6px 9px",
                                          }}
                                        >
                                          📂 Abrir
                                        </button>
                                      )}
                                    </>
                                  )}

                                  <button
                                    onClick={() =>
                                      excluirLancamentoConfirmar(
                                        item.id!
                                      )
                                    }
                                    style={{
                                      padding:
                                        "6px 9px",
                                      color:
                                        "#b91c1c",
                                    }}
                                  >
                                    🗑️
                                  </button>
                                </div>

                                {item.pago &&
                                  item.data_pagamento && (
                                    <div
                                      style={{
                                        gridColumn:
                                          "2 / 6",
                                        color:
                                          "#15803d",
                                        fontSize:
                                          13,
                                      }}
                                    >
                                      Pago em{" "}
                                      {formatarData(
                                        item.data_pagamento
                                      )}

                                      {item.forma_pagamento &&
                                        ` • ${item.forma_pagamento}`}
                                    </div>
                                  )}
                              </div>
                            );
                          }
                        )
                      )}
                    </div>
                  )}
                </div>
              );
            }
          )
        )}
      </div>
    </div>
  );
}