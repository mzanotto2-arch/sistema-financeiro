import { useMemo, useRef, useState } from "react";

type TipoDocumento = "arquivo" | "link";

type Documento = {
  id: number;
  nome: string;
  tipo: TipoDocumento;
  status: "Pendente" | "Concluído";
  arquivo?: File;
  link?: string;
};

type MesPagamento = {
  id: number;
  mes: number;
  ano: number;
  documentos: Documento[];
};

const documentosIniciais: Documento[] = [
  {
    id: 1,
    nome: "Estatuto",
    tipo: "arquivo",
    status: "Pendente",
  },
  {
    id: 2,
    nome: "Portfólio",
    tipo: "arquivo",
    status: "Pendente",
  },
  {
    id: 3,
    nome: "CNPJ",
    tipo: "arquivo",
    status: "Pendente",
  },
  {
    id: 4,
    nome: "Certidões",
    tipo: "arquivo",
    status: "Pendente",
  },
  {
    id: 5,
    nome: "Declarações",
    tipo: "arquivo",
    status: "Pendente",
  },
  {
    id: 6,
    nome: "Fotos",
    tipo: "arquivo",
    status: "Pendente",
  },
  {
    id: 7,
    nome: "Documentos bancários",
    tipo: "arquivo",
    status: "Pendente",
  },
  {
    id: 8,
    nome: "Site da instituição",
    tipo: "link",
    status: "Pendente",
  },
];

const documentosPagamentoIniciais = (): Documento[] => [
  {
    id: Date.now() + 1,
    nome: "Cotação 1",
    tipo: "arquivo",
    status: "Pendente",
  },
  {
    id: Date.now() + 2,
    nome: "Cotação 2",
    tipo: "arquivo",
    status: "Pendente",
  },
  {
    id: Date.now() + 3,
    nome: "Cotação 3",
    tipo: "arquivo",
    status: "Pendente",
  },
  {
    id: Date.now() + 4,
    nome: "Certidão Municipal",
    tipo: "arquivo",
    status: "Pendente",
  },
  {
    id: Date.now() + 5,
    nome: "Certidão Federal",
    tipo: "arquivo",
    status: "Pendente",
  },
  {
    id: Date.now() + 6,
    nome: "Certidão Trabalhista",
    tipo: "arquivo",
    status: "Pendente",
  },
  {
    id: Date.now() + 7,
    nome: "Certidão FGTS",
    tipo: "arquivo",
    status: "Pendente",
  },
  {
    id: Date.now() + 8,
    nome: "Certidão Estadual",
    tipo: "arquivo",
    status: "Pendente",
  },
  {
    id: Date.now() + 9,
    nome: "Cartão CNPJ",
    tipo: "arquivo",
    status: "Pendente",
  },
  {
    id: Date.now() + 10,
    nome: "Nota Fiscal",
    tipo: "arquivo",
    status: "Pendente",
  },
];

const nomesMeses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export default function PortalHome() {
  const [codigoProposta] = useState(
    sessionStorage.getItem("portal_codigo_proposta") || ""
  );

  const [nomeInstituicao] = useState(
    sessionStorage.getItem("portal_nome_instituicao") || ""
  );

  const [nomeUsuario] = useState(
    sessionStorage.getItem("portal_nome_usuario") || ""
  );

  // ==========================================
  // DOCUMENTOS DA PROPOSTA
  // ==========================================

  const [documentos, setDocumentos] =
    useState<Documento[]>(documentosIniciais);

  const [pesquisa, setPesquisa] = useState("");

  const [novoDocumento, setNovoDocumento] = useState("");

  const [mostrarAdicionar, setMostrarAdicionar] = useState(false);

  // ==========================================
  // FASE DE PAGAMENTOS - POR MÊS E ANO
  // ==========================================

  const [mesesPagamento, setMesesPagamento] =
    useState<MesPagamento[]>([]);

  const [mesAberto, setMesAberto] = useState<number | null>(null);

  const [pesquisaPagamento, setPesquisaPagamento] =
    useState("");

  const [mostrarNovoMes, setMostrarNovoMes] =
    useState(false);

  const [novoMes, setNovoMes] = useState(
    new Date().getMonth() + 1
  );

  const [novoAno, setNovoAno] = useState(
    new Date().getFullYear()
  );

  const [novoDocumentoPagamento, setNovoDocumentoPagamento] =
    useState("");

  const [mostrarAdicionarPagamento, setMostrarAdicionarPagamento] =
    useState(false);

  // ==========================================
  // CONTROLE DE UPLOAD
  // ==========================================

  const [documentoSelecionado, setDocumentoSelecionado] =
    useState<number | null>(null);

  const [mesSelecionado, setMesSelecionado] =
    useState<number | null>(null);

  const [tipoUpload, setTipoUpload] = useState<
    "proposta" | "pagamento"
  >("proposta");

  const inputArquivo =
    useRef<HTMLInputElement | null>(null);

  // ==========================================
  // LINK
  // ==========================================

  const [linkAberto, setLinkAberto] =
    useState<number | null>(null);

  const [valorLink, setValorLink] = useState("");

  // ==========================================
  // DOCUMENTOS DA PROPOSTA - PESQUISA
  // ==========================================

  const documentosFiltrados = useMemo(() => {
    const termo = pesquisa.toLowerCase().trim();

    if (!termo) {
      return documentos;
    }

    return documentos.filter((documento) =>
      documento.nome.toLowerCase().includes(termo)
    );
  }, [documentos, pesquisa]);

  // ==========================================
  // ABRIR UPLOAD
  // ==========================================

  function abrirArquivo(
    id: number,
    tipo: "proposta" | "pagamento",
    idMes?: number
  ) {
    setDocumentoSelecionado(id);
    setTipoUpload(tipo);

    if (tipo === "pagamento") {
      setMesSelecionado(idMes ?? null);
    } else {
      setMesSelecionado(null);
    }

    setTimeout(() => {
      inputArquivo.current?.click();
    }, 50);
  }

  // ==========================================
  // SELECIONAR ARQUIVO
  // ==========================================

  function selecionarArquivo(
    evento: React.ChangeEvent<HTMLInputElement>
  ) {
    const arquivo = evento.target.files?.[0];

    if (
      !arquivo ||
      documentoSelecionado === null
    ) {
      return;
    }

    // DOCUMENTO DA PROPOSTA
    if (tipoUpload === "proposta") {
      setDocumentos((lista) =>
        lista.map((documento) =>
          documento.id === documentoSelecionado
            ? {
                ...documento,
                arquivo,
                status: "Concluído",
              }
            : documento
        )
      );
    }

    // DOCUMENTO DA FASE DE PAGAMENTOS
    if (
      tipoUpload === "pagamento" &&
      mesSelecionado !== null
    ) {
      setMesesPagamento((lista) =>
        lista.map((mes) =>
          mes.id === mesSelecionado
            ? {
                ...mes,
                documentos: mes.documentos.map(
                  (documento) =>
                    documento.id === documentoSelecionado
                      ? {
                          ...documento,
                          arquivo,
                          status: "Concluído",
                        }
                      : documento
                ),
              }
            : mes
        )
      );
    }

    setDocumentoSelecionado(null);
    setMesSelecionado(null);

    evento.target.value = "";
  }

  // ==========================================
  // LINK
  // ==========================================

  function abrirLink(
    id: number,
    linkAtual?: string
  ) {
    setLinkAberto(id);
    setValorLink(linkAtual || "");
  }

  function salvarLink() {
    if (linkAberto === null) {
      return;
    }

    if (!valorLink.trim()) {
      alert("Digite o endereço do site ou link.");
      return;
    }

    setDocumentos((lista) =>
      lista.map((documento) =>
        documento.id === linkAberto
          ? {
              ...documento,
              link: valorLink.trim(),
              status: "Concluído",
            }
          : documento
      )
    );

    setLinkAberto(null);
    setValorLink("");
  }

  // ==========================================
  // ADICIONAR DOCUMENTO DA PROPOSTA
  // ==========================================

  function adicionarDocumento() {
    const nome = novoDocumento.trim();

    if (!nome) {
      alert("Digite o nome do documento.");
      return;
    }

    const novo: Documento = {
      id: Date.now(),
      nome,
      tipo: "arquivo",
      status: "Pendente",
    };

    setDocumentos((lista) => [
      ...lista,
      novo,
    ]);

    setNovoDocumento("");
    setMostrarAdicionar(false);
  }

  // ==========================================
  // REMOVER DOCUMENTO DA PROPOSTA
  // ==========================================

  function removerDocumento(id: number) {
    const confirmar = window.confirm(
      "Deseja remover este documento da lista?"
    );

    if (!confirmar) {
      return;
    }

    setDocumentos((lista) =>
      lista.filter(
        (documento) => documento.id !== id
      )
    );
  }

  // ==========================================
  // CRIAR NOVO MÊS
  // ==========================================

  function criarMesPagamento() {
    const jaExiste = mesesPagamento.some(
      (mes) =>
        mes.mes === novoMes &&
        mes.ano === novoAno
    );

    if (jaExiste) {
      alert(
        "Este mês já foi criado. Abra o mês existente para adicionar os documentos."
      );
      return;
    }

    const novo: MesPagamento = {
      id: Date.now(),
      mes: novoMes,
      ano: novoAno,
      documentos:
        documentosPagamentoIniciais(),
    };

    setMesesPagamento((lista) =>
      [...lista, novo].sort((a, b) => {
        if (a.ano !== b.ano) {
          return b.ano - a.ano;
        }

        return b.mes - a.mes;
      })
    );

    setMesAberto(novo.id);
    setMostrarNovoMes(false);
    setPesquisaPagamento("");
    setMostrarAdicionarPagamento(false);
  }

  // ==========================================
  // ABRIR / FECHAR MÊS
  // ==========================================

  function alternarMes(id: number) {
    if (mesAberto === id) {
      setMesAberto(null);
      return;
    }

    setMesAberto(id);
    setPesquisaPagamento("");
    setMostrarAdicionarPagamento(false);
  }

  // ==========================================
  // DOCUMENTOS DO MÊS ABERTO
  // ==========================================

  const mesAtual = mesesPagamento.find(
    (mes) => mes.id === mesAberto
  );

  const documentosPagamentoFiltrados =
    useMemo(() => {
      if (!mesAtual) {
        return [];
      }

      const termo =
        pesquisaPagamento
          .toLowerCase()
          .trim();

      if (!termo) {
        return mesAtual.documentos;
      }

      return mesAtual.documentos.filter(
        (documento) =>
          documento.nome
            .toLowerCase()
            .includes(termo)
      );
    }, [
      mesAtual,
      pesquisaPagamento,
    ]);

  // ==========================================
  // ADICIONAR DOCUMENTO DENTRO DO MÊS
  // ==========================================

  function adicionarDocumentoPagamento() {
    if (mesAberto === null) {
      return;
    }

    const nome =
      novoDocumentoPagamento.trim();

    if (!nome) {
      alert("Digite o nome do documento.");
      return;
    }

    const novo: Documento = {
      id: Date.now(),
      nome,
      tipo: "arquivo",
      status: "Pendente",
    };

    setMesesPagamento((lista) =>
      lista.map((mes) =>
        mes.id === mesAberto
          ? {
              ...mes,
              documentos: [
                ...mes.documentos,
                novo,
              ],
            }
          : mes
      )
    );

    setNovoDocumentoPagamento("");
    setMostrarAdicionarPagamento(false);
  }

  // ==========================================
  // REMOVER DOCUMENTO DO MÊS
  // ==========================================

  function removerDocumentoPagamento(
    id: number
  ) {
    if (mesAberto === null) {
      return;
    }

    const confirmar = window.confirm(
      "Deseja remover este documento da lista?"
    );

    if (!confirmar) {
      return;
    }

    setMesesPagamento((lista) =>
      lista.map((mes) =>
        mes.id === mesAberto
          ? {
              ...mes,
              documentos:
                mes.documentos.filter(
                  (documento) =>
                    documento.id !== id
                ),
            }
          : mes
      )
    );
  }

  // ==========================================
  // REMOVER MÊS
  // ==========================================

  function removerMes(id: number) {
    const mes = mesesPagamento.find(
      (item) => item.id === id
    );

    if (!mes) {
      return;
    }

    const confirmar = window.confirm(
      `Deseja remover ${nomesMeses[mes.mes - 1]}/${mes.ano}?`
    );

    if (!confirmar) {
      return;
    }

    setMesesPagamento((lista) =>
      lista.filter((item) => item.id !== id)
    );

    if (mesAberto === id) {
      setMesAberto(null);
    }
  }

  // ==========================================
  // RESUMO DOCUMENTOS DA PROPOSTA
  // ==========================================

  const totalDocumentos = documentos.length;

  const concluidos = documentos.filter(
    (documento) =>
      documento.status === "Concluído"
  ).length;

  const pendentes =
    totalDocumentos - concluidos;

  // ==========================================
  // RESUMO DE CADA MÊS
  // ==========================================

  function quantidadeConcluida(
    mes: MesPagamento
  ) {
    return mes.documentos.filter(
      (documento) =>
        documento.status === "Concluído"
    ).length;
  }

  function quantidadePendente(
    mes: MesPagamento
  ) {
    return (
      mes.documentos.length -
      quantidadeConcluida(mes)
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f6f9",
        padding: "25px 20px 50px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        {/* ==========================================
            CABEÇALHO
           ========================================== */}

        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            padding: "25px 30px",
            boxShadow:
              "0 5px 20px rgba(0,0,0,.10)",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  color: "#1f3c88",
                  fontSize: 28,
                }}
              >
                📁 Portal da Instituição
              </h1>

              <p
                style={{
                  margin: "7px 0 0",
                  color: "#64748b",
                }}
              >
                Envio e acompanhamento de
                documentos
              </p>

              {nomeInstituicao && (
                <p
                  style={{
                    margin: "10px 0 0",
                    color: "#334155",
                    fontWeight: 600,
                  }}
                >
                  {nomeInstituicao}
                </p>
              )}

              {nomeUsuario && (
                <p
                  style={{
                    margin: "4px 0 0",
                    color: "#64748b",
                    fontSize: 13,
                  }}
                >
                  Usuário: {nomeUsuario}
                </p>
              )}
            </div>

            <div
              style={{
                background: "#eef4ff",
                padding: "13px 20px",
                borderRadius: 10,
                color: "#1f3c88",
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              Proposta:{" "}
              {codigoProposta || "—"}
            </div>
          </div>
        </div>

        {/* ==========================================
            RESUMO DA PROPOSTA
           ========================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 15,
            marginBottom: 20,
          }}
        >
          <Resumo
            titulo="Documentos"
            valor={totalDocumentos}
            icone="📄"
          />

          <Resumo
            titulo="Pendentes"
            valor={pendentes}
            icone="🟠"
          />

          <Resumo
            titulo="Concluídos"
            valor={concluidos}
            icone="🟢"
          />
        </div>

        {/* ==========================================
            DOCUMENTOS DA PROPOSTA
           ========================================== */}

        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            padding: 30,
            boxShadow:
              "0 5px 20px rgba(0,0,0,.10)",
            marginBottom: 25,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: 15,
              flexWrap: "wrap",
              marginBottom: 20,
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  color: "#334155",
                }}
              >
                Documentos da proposta
              </h2>

              <p
                style={{
                  margin: "6px 0 0",
                  color: "#64748b",
                  fontSize: 14,
                }}
              >
                Encontre o documento que
                precisa enviar.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setMostrarAdicionar(true)
              }
              style={{
                border: "none",
                borderRadius: 8,
                padding: "11px 16px",
                background: "#2563eb",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ＋ Adicionar documento
            </button>
          </div>

          {/* PESQUISA */}

          <div
            style={{
              marginBottom: 25,
            }}
          >
            <input
              type="text"
              value={pesquisa}
              onChange={(e) =>
                setPesquisa(e.target.value)
              }
              placeholder="🔎 Pesquisar documento..."
              style={{
                width: "100%",
                padding: 14,
                border:
                  "1px solid #cbd5e1",
                borderRadius: 9,
                boxSizing: "border-box",
                fontSize: 15,
                outline: "none",
              }}
            />
          </div>

          {/* ADICIONAR DOCUMENTO */}

          {mostrarAdicionar && (
            <div
              style={{
                background: "#f8fafc",
                border:
                  "1px solid #dbe3ef",
                borderRadius: 10,
                padding: 18,
                marginBottom: 25,
              }}
            >
              <strong
                style={{
                  display: "block",
                  marginBottom: 10,
                  color: "#334155",
                }}
              >
                Adicionar novo documento
              </strong>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <input
                  type="text"
                  value={novoDocumento}
                  onChange={(e) =>
                    setNovoDocumento(
                      e.target.value
                    )
                  }
                  placeholder="Ex.: Ata de eleição 2026"
                  style={{
                    flex: 1,
                    minWidth: 220,
                    padding: 11,
                    border:
                      "1px solid #cbd5e1",
                    borderRadius: 7,
                  }}
                />

                <button
                  type="button"
                  onClick={
                    adicionarDocumento
                  }
                  style={{
                    border: "none",
                    borderRadius: 7,
                    padding:
                      "10px 16px",
                    background: "#198754",
                    color: "#fff",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Adicionar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMostrarAdicionar(
                      false
                    );
                    setNovoDocumento("");
                  }}
                  style={{
                    border: "none",
                    borderRadius: 7,
                    padding:
                      "10px 16px",
                    background:
                      "#e2e8f0",
                    color: "#334155",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* LISTA */}

          {documentosFiltrados.length ===
          0 ? (
            <div
              style={{
                textAlign: "center",
                padding: 40,
                color: "#64748b",
              }}
            >
              Nenhum documento
              encontrado.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 16,
              }}
            >
              {documentosFiltrados.map(
                (documento) => (
                  <div
                    key={documento.id}
                    style={{
                      border:
                        "1px solid #dbe3ef",
                      borderRadius: 12,
                      padding: 18,
                      background:
                        "#fafcff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "flex-start",
                        gap: 10,
                        marginBottom: 15,
                      }}
                    >
                      <strong
                        style={{
                          color: "#334155",
                          fontSize: 17,
                        }}
                      >
                        {documento.tipo ===
                        "link"
                          ? "🔗"
                          : "📄"}{" "}
                        {documento.nome}
                      </strong>

                      <span
                        style={{
                          background:
                            documento.status ===
                            "Concluído"
                              ? "#dcfce7"
                              : "#fff3cd",
                          color:
                            documento.status ===
                            "Concluído"
                              ? "#166534"
                              : "#856404",
                          padding:
                            "5px 9px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 700,
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {documento.status}
                      </span>
                    </div>

                    {documento.arquivo && (
                      <div
                        style={{
                          background:
                            "#f0fdf4",
                          borderRadius: 8,
                          padding: 10,
                          marginBottom: 12,
                          color:
                            "#166534",
                          fontSize: 13,
                          wordBreak:
                            "break-word",
                        }}
                      >
                        📎{" "}
                        {documento.arquivo.name}
                      </div>
                    )}

                    {documento.link && (
                      <div
                        style={{
                          background:
                            "#eff6ff",
                          borderRadius: 8,
                          padding: 10,
                          marginBottom: 12,
                          color:
                            "#1d4ed8",
                          fontSize: 13,
                          wordBreak:
                            "break-word",
                        }}
                      >
                        🔗{" "}
                        {documento.link}
                      </div>
                    )}

                    {documento.tipo ===
                    "arquivo" ? (
                      <button
                        type="button"
                        onClick={() =>
                          abrirArquivo(
                            documento.id,
                            "proposta"
                          )
                        }
                        style={{
                          width: "100%",
                          padding: 11,
                          border: "none",
                          borderRadius: 7,
                          background:
                            "#2563eb",
                          color: "#fff",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        📤{" "}
                        {documento.arquivo
                          ? "Trocar arquivo"
                          : "Anexar arquivo"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          abrirLink(
                            documento.id,
                            documento.link
                          )
                        }
                        style={{
                          width: "100%",
                          padding: 11,
                          border: "none",
                          borderRadius: 7,
                          background:
                            "#2563eb",
                          color: "#fff",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        🔗{" "}
                        {documento.link
                          ? "Alterar link"
                          : "Adicionar link"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        removerDocumento(
                          documento.id
                        )
                      }
                      style={{
                        width: "100%",
                        marginTop: 8,
                        padding: 8,
                        border: "none",
                        background:
                          "transparent",
                        color: "#64748b",
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      Remover da lista
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* ==========================================
            FASE DE PAGAMENTOS
           ========================================== */}

        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            padding: 30,
            boxShadow:
              "0 5px 20px rgba(0,0,0,.10)",
          }}
        >
          {/* CABEÇALHO */}

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: 15,
              flexWrap: "wrap",
              marginBottom: 20,
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  color: "#334155",
                  fontSize: 24,
                }}
              >
                💰 Fase de Pagamentos
              </h2>

              <p
                style={{
                  margin: "7px 0 0",
                  color: "#64748b",
                  fontSize: 14,
                  maxWidth: 700,
                }}
              >
                Organize os documentos para
                conferência por mês e ano.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setMostrarNovoMes(true)
              }
              style={{
                border: "none",
                borderRadius: 8,
                padding: "11px 16px",
                background: "#2563eb",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ＋ Novo mês
            </button>
          </div>

          {/* AVISO */}

          <div
            style={{
              background: "#eff6ff",
              border:
                "1px solid #bfdbfe",
              borderRadius: 10,
              padding: 14,
              marginBottom: 22,
              color: "#1e40af",
              fontSize: 14,
            }}
          >
            📌 Nesta etapa, a instituição
            apenas envia os documentos
            necessários para conferência.
            <strong>
              {" "}
              Não é necessário informar
              valor, fornecedor ou data de
              pagamento.
            </strong>
          </div>

          {/* CRIAR NOVO MÊS */}

          {mostrarNovoMes && (
            <div
              style={{
                background: "#f8fafc",
                border:
                  "1px solid #dbe3ef",
                borderRadius: 12,
                padding: 20,
                marginBottom: 25,
              }}
            >
              <h3
                style={{
                  margin:
                    "0 0 15px",
                  color: "#334155",
                }}
              >
                📅 Criar mês de
                conferência
              </h3>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  alignItems:
                    "center",
                }}
              >
                <select
                  value={novoMes}
                  onChange={(e) =>
                    setNovoMes(
                      Number(
                        e.target.value
                      )
                    )
                  }
                  style={{
                    padding: 11,
                    border:
                      "1px solid #cbd5e1",
                    borderRadius: 7,
                    fontSize: 15,
                    background:
                      "#fff",
                  }}
                >
                  {nomesMeses.map(
                    (
                      nome,
                      indice
                    ) => (
                      <option
                        key={indice}
                        value={indice + 1}
                      >
                        {nome}
                      </option>
                    )
                  )}
                </select>

                <select
                  value={novoAno}
                  onChange={(e) =>
                    setNovoAno(
                      Number(
                        e.target.value
                      )
                    )
                  }
                  style={{
                    padding: 11,
                    border:
                      "1px solid #cbd5e1",
                    borderRadius: 7,
                    fontSize: 15,
                    background:
                      "#fff",
                  }}
                >
                  {Array.from(
                    {
                      length: 7,
                    },
                    (_, i) =>
                      new Date().getFullYear() -
                      2 +
                      i
                  ).map(
                    (ano) => (
                      <option
                        key={ano}
                        value={ano}
                      >
                        {ano}
                      </option>
                    )
                  )}
                </select>

                <button
                  type="button"
                  onClick={
                    criarMesPagamento
                  }
                  style={{
                    border: "none",
                    borderRadius: 7,
                    padding:
                      "11px 18px",
                    background:
                      "#198754",
                    color: "#fff",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Criar mês
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setMostrarNovoMes(
                      false
                    )
                  }
                  style={{
                    border: "none",
                    borderRadius: 7,
                    padding:
                      "11px 18px",
                    background:
                      "#e2e8f0",
                    color: "#334155",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* NENHUM MÊS */}

          {mesesPagamento.length ===
            0 &&
            !mostrarNovoMes && (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  border:
                    "1px dashed #cbd5e1",
                  borderRadius: 12,
                  color: "#64748b",
                }}
              >
                <div
                  style={{
                    fontSize: 40,
                    marginBottom: 10,
                  }}
                >
                  📅
                </div>

                <strong
                  style={{
                    display: "block",
                    color:
                      "#334155",
                    fontSize: 17,
                    marginBottom: 6,
                  }}
                >
                  Nenhum mês criado
                </strong>

                <span
                  style={{
                    fontSize: 14,
                  }}
                >
                  Clique em
                  <strong>
                    {" "}
                    ＋ Novo mês
                  </strong>{" "}
                  para começar.
                </span>
              </div>
            )}

          {/* LISTA DE MESES */}

          <div
            style={{
              display: "flex",
              flexDirection:
                "column",
              gap: 12,
            }}
          >
            {mesesPagamento.map(
              (mes) => {
                const concluidosMes =
                  quantidadeConcluida(
                    mes
                  );

                const pendentesMes =
                  quantidadePendente(
                    mes
                  );

                const completo =
                  pendentesMes === 0;

                const aberto =
                  mesAberto === mes.id;

                return (
                  <div
                    key={mes.id}
                    style={{
                      border:
                        "1px solid #dbe3ef",
                      borderRadius: 12,
                      overflow:
                        "hidden",
                    }}
                  >
                    {/* CABEÇALHO DO MÊS */}

                    <div
                      style={{
                        padding: 18,
                        background:
                          aberto
                            ? "#f8fbff"
                            : "#fff",
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                        gap: 15,
                        flexWrap:
                          "wrap",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          alternarMes(
                            mes.id
                          )
                        }
                        style={{
                          border:
                            "none",
                          background:
                            "transparent",
                          cursor:
                            "pointer",
                          padding: 0,
                          textAlign:
                            "left",
                          flex: 1,
                          minWidth:
                            250,
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: 10,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 25,
                            }}
                          >
                            {aberto
                              ? "📂"
                              : "📁"}
                          </span>

                          <div>
                            <strong
                              style={{
                                display:
                                  "block",
                                color:
                                  "#334155",
                                fontSize:
                                  18,
                              }}
                            >
                              {
                                nomesMeses[
                                  mes.mes -
                                    1
                                ]
                              }{" "}
                              {mes.ano}
                            </strong>

                            <span
                              style={{
                                color:
                                  "#64748b",
                                fontSize:
                                  13,
                              }}
                            >
                              {
                                mes
                                  .documentos
                                  .length
                              }{" "}
                              documentos
                            </span>
                          </div>
                        </div>
                      </button>

                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: 8,
                          flexWrap:
                            "wrap",
                        }}
                      >
                        <span
                          style={{
                            background:
                              completo
                                ? "#dcfce7"
                                : "#fff3cd",
                            color:
                              completo
                                ? "#166534"
                                : "#856404",
                            padding:
                              "6px 10px",
                            borderRadius:
                              20,
                            fontSize:
                              12,
                            fontWeight:
                              700,
                          }}
                        >
                          {completo
                            ? "🟢 Completo"
                            : "🟡 Pendente"}
                        </span>

                        <span
                          style={{
                            background:
                              "#f1f5f9",
                            color:
                              "#475569",
                            padding:
                              "6px 10px",
                            borderRadius:
                              20,
                            fontSize:
                              12,
                            fontWeight:
                              600,
                          }}
                        >
                          {concluidosMes}/
                          {
                            mes
                              .documentos
                              .length
                          }{" "}
                          concluídos
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            removerMes(
                              mes.id
                            )
                          }
                          style={{
                            border:
                              "none",
                            background:
                              "transparent",
                            color:
                              "#94a3b8",
                            cursor:
                              "pointer",
                            padding:
                              5,
                            fontSize:
                              16,
                          }}
                          title="Remover mês"
                        >
                          🗑️
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            alternarMes(
                              mes.id
                            )
                          }
                          style={{
                            border:
                              "1px solid #cbd5e1",
                            background:
                              "#fff",
                            borderRadius:
                              7,
                            padding:
                              "7px 12px",
                            color:
                              "#334155",
                            cursor:
                              "pointer",
                            fontWeight:
                              600,
                          }}
                        >
                          {aberto
                            ? "Fechar"
                            : "Abrir"}
                        </button>
                      </div>
                    </div>

                    {/* CONTEÚDO DO MÊS */}

                    {aberto && (
                      <div
                        style={{
                          borderTop:
                            "1px solid #dbe3ef",
                          padding: 22,
                          background:
                            "#fff",
                        }}
                      >
                        {/* PESQUISA E ADICIONAR */}

                        <div
                          style={{
                            display:
                              "flex",
                            gap: 10,
                            marginBottom:
                              20,
                            flexWrap:
                              "wrap",
                          }}
                        >
                          <input
                            type="text"
                            value={
                              pesquisaPagamento
                            }
                            onChange={(
                              e
                            ) =>
                              setPesquisaPagamento(
                                e
                                  .target
                                  .value
                              )
                            }
                            placeholder="🔎 Pesquisar documento deste mês..."
                            style={{
                              flex: 1,
                              minWidth:
                                250,
                              padding:
                                13,
                              border:
                                "1px solid #cbd5e1",
                              borderRadius:
                                8,
                              boxSizing:
                                "border-box",
                              fontSize:
                                14,
                            }}
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setMostrarAdicionarPagamento(
                                true
                              )
                            }
                            style={{
                              border:
                                "none",
                              borderRadius:
                                8,
                              padding:
                                "11px 16px",
                              background:
                                "#2563eb",
                              color:
                                "#fff",
                              fontWeight:
                                700,
                              cursor:
                                "pointer",
                            }}
                          >
                            ＋ Adicionar documento
                          </button>
                        </div>

                        {/* ADICIONAR DOCUMENTO */}

                        {mostrarAdicionarPagamento && (
                          <div
                            style={{
                              background:
                                "#f8fafc",
                              border:
                                "1px solid #dbe3ef",
                              borderRadius:
                                10,
                              padding:
                                18,
                              marginBottom:
                                20,
                            }}
                          >
                            <strong
                              style={{
                                display:
                                  "block",
                                marginBottom:
                                  10,
                                color:
                                  "#334155",
                              }}
                            >
                              Adicionar documento
                              para este mês
                            </strong>

                            <div
                              style={{
                                display:
                                  "flex",
                                gap: 10,
                                flexWrap:
                                  "wrap",
                              }}
                            >
                              <input
                                type="text"
                                value={
                                  novoDocumentoPagamento
                                }
                                onChange={(
                                  e
                                ) =>
                                  setNovoDocumentoPagamento(
                                    e
                                      .target
                                      .value
                                  )
                                }
                                placeholder="Ex.: Contrato"
                                style={{
                                  flex: 1,
                                  minWidth:
                                    240,
                                  padding:
                                    11,
                                  border:
                                    "1px solid #cbd5e1",
                                  borderRadius:
                                    7,
                                }}
                              />

                              <button
                                type="button"
                                onClick={
                                  adicionarDocumentoPagamento
                                }
                                style={{
                                  border:
                                    "none",
                                  borderRadius:
                                    7,
                                  padding:
                                    "10px 16px",
                                  background:
                                    "#198754",
                                  color:
                                    "#fff",
                                  fontWeight:
                                    700,
                                  cursor:
                                    "pointer",
                                }}
                              >
                                Adicionar
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setMostrarAdicionarPagamento(
                                    false
                                  );
                                  setNovoDocumentoPagamento(
                                    ""
                                  );
                                }}
                                style={{
                                  border:
                                    "none",
                                  borderRadius:
                                    7,
                                  padding:
                                    "10px 16px",
                                  background:
                                    "#e2e8f0",
                                  color:
                                    "#334155",
                                  fontWeight:
                                    600,
                                  cursor:
                                    "pointer",
                                }}
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}

                        {/* LISTA DOCUMENTOS */}

                        {documentosPagamentoFiltrados.length ===
                        0 ? (
                          <div
                            style={{
                              textAlign:
                                "center",
                              padding:
                                35,
                              color:
                                "#64748b",
                            }}
                          >
                            Nenhum documento
                            encontrado.
                          </div>
                        ) : (
                          <div
                            style={{
                              display:
                                "grid",
                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(280px, 1fr))",
                              gap: 15,
                            }}
                          >
                            {documentosPagamentoFiltrados.map(
                              (
                                documento
                              ) => (
                                <div
                                  key={
                                    documento.id
                                  }
                                  style={{
                                    border:
                                      "1px solid #dbe3ef",
                                    borderRadius:
                                      12,
                                    padding:
                                      18,
                                    background:
                                      "#fafcff",
                                  }}
                                >
                                  <div
                                    style={{
                                      display:
                                        "flex",
                                      justifyContent:
                                        "space-between",
                                      alignItems:
                                        "flex-start",
                                      gap: 10,
                                      marginBottom:
                                        15,
                                    }}
                                  >
                                    <strong
                                      style={{
                                        color:
                                          "#334155",
                                        fontSize:
                                          16,
                                      }}
                                    >
                                      📄{" "}
                                      {
                                        documento.nome
                                      }
                                    </strong>

                                    <span
                                      style={{
                                        background:
                                          documento.status ===
                                          "Concluído"
                                            ? "#dcfce7"
                                            : "#fff3cd",
                                        color:
                                          documento.status ===
                                          "Concluído"
                                            ? "#166534"
                                            : "#856404",
                                        padding:
                                          "5px 9px",
                                        borderRadius:
                                          20,
                                        fontSize:
                                          12,
                                        fontWeight:
                                          700,
                                        whiteSpace:
                                          "nowrap",
                                      }}
                                    >
                                      {
                                        documento.status
                                      }
                                    </span>
                                  </div>

                                  {documento.arquivo && (
                                    <div
                                      style={{
                                        background:
                                          "#f0fdf4",
                                        borderRadius:
                                          8,
                                        padding:
                                          10,
                                        marginBottom:
                                          12,
                                        color:
                                          "#166534",
                                        fontSize:
                                          13,
                                        wordBreak:
                                          "break-word",
                                      }}
                                    >
                                      📎{" "}
                                      {
                                        documento
                                          .arquivo
                                          .name
                                      }
                                    </div>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      abrirArquivo(
                                        documento.id,
                                        "pagamento",
                                        mes.id
                                      )
                                    }
                                    style={{
                                      width:
                                        "100%",
                                      padding:
                                        11,
                                      border:
                                        "none",
                                      borderRadius:
                                        7,
                                      background:
                                        "#2563eb",
                                      color:
                                        "#fff",
                                      fontWeight:
                                        700,
                                      cursor:
                                        "pointer",
                                    }}
                                  >
                                    📤{" "}
                                    {documento.arquivo
                                      ? "Trocar arquivo"
                                      : "Anexar documento"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      removerDocumentoPagamento(
                                        documento.id
                                      )
                                    }
                                    style={{
                                      width:
                                        "100%",
                                      marginTop:
                                        8,
                                      padding:
                                        8,
                                      border:
                                        "none",
                                      background:
                                        "transparent",
                                      color:
                                        "#64748b",
                                      cursor:
                                        "pointer",
                                      fontSize:
                                        12,
                                    }}
                                  >
                                    Remover da lista
                                  </button>
                                </div>
                              )
                            )}
                          </div>
                        )}

                        {/* MENSAGEM COMPLETO */}

                        {mes.documentos.length >
                          0 &&
                          pendentesMes ===
                            0 && (
                            <div
                              style={{
                                marginTop:
                                  20,
                                background:
                                  "#f0fdf4",
                                border:
                                  "1px solid #bbf7d0",
                                borderRadius:
                                  10,
                                padding:
                                  15,
                                color:
                                  "#166534",
                                fontWeight:
                                  700,
                                textAlign:
                                  "center",
                              }}
                            >
                              🟢 Todos os
                              documentos de{" "}
                              {
                                nomesMeses[
                                  mes.mes -
                                    1
                                ]
                              }{" "}
                              de{" "}
                              {mes.ano}{" "}
                              foram
                              anexados e
                              estão prontos
                              para
                              conferência.
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* ==========================================
            INPUT DE ARQUIVO
           ========================================== */}

        <input
          ref={inputArquivo}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
          style={{
            display: "none",
          }}
          onChange={
            selecionarArquivo
          }
        />

        {/* ==========================================
            MODAL DE LINK
           ========================================== */}

        {linkAberto !== null && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background:
                "rgba(0,0,0,.45)",
              display: "flex",
              justifyContent:
                "center",
              alignItems: "center",
              padding: 20,
              zIndex: 9999,
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 500,
                background: "#fff",
                borderRadius: 14,
                padding: 25,
                boxShadow:
                  "0 10px 40px rgba(0,0,0,.25)",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  color: "#334155",
                }}
              >
                🔗 Adicionar link
              </h2>

              <p
                style={{
                  color: "#64748b",
                  fontSize: 14,
                }}
              >
                Informe o endereço do
                site, página ou outro
                link solicitado.
              </p>

              <input
                type="url"
                value={valorLink}
                onChange={(e) =>
                  setValorLink(
                    e.target.value
                  )
                }
                placeholder="https://www.exemplo.com.br"
                style={{
                  width: "100%",
                  padding: 13,
                  border:
                    "1px solid #cbd5e1",
                  borderRadius: 8,
                  boxSizing:
                    "border-box",
                  marginBottom: 15,
                }}
              />

              <div
                style={{
                  display: "flex",
                  gap: 10,
                }}
              >
                <button
                  type="button"
                  onClick={salvarLink}
                  style={{
                    flex: 1,
                    padding: 12,
                    border: "none",
                    borderRadius: 8,
                    background:
                      "#198754",
                    color: "#fff",
                    fontWeight: 700,
                    cursor:
                      "pointer",
                  }}
                >
                  Salvar link
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLinkAberto(
                      null
                    );
                    setValorLink("");
                  }}
                  style={{
                    flex: 1,
                    padding: 12,
                    border: "none",
                    borderRadius: 8,
                    background:
                      "#e2e8f0",
                    color:
                      "#334155",
                    fontWeight: 600,
                    cursor:
                      "pointer",
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTE RESUMO
// ==========================================

function Resumo({
  titulo,
  valor,
  icone,
}: {
  titulo: string;
  valor: number;
  icone: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 18,
        boxShadow:
          "0 4px 15px rgba(0,0,0,.07)",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span
        style={{
          fontSize: 25,
        }}
      >
        {icone}
      </span>

      <div>
        <div
          style={{
            color: "#64748b",
            fontSize: 13,
          }}
        >
          {titulo}
        </div>

        <strong
          style={{
            color: "#334155",
            fontSize: 22,
          }}
        >
          {valor}
        </strong>
      </div>
    </div>
  );
}