import { useMemo, useRef, useState } from "react";

type TipoDocumento = "arquivo" | "link";

type Documento = {
  id: number;
  nome: string;
  tipo: TipoDocumento;
  status: "Pendente" | "Concluído";
  arquivo?: File;
  link?: string;
  dataEnvio?: string;
  ultimaTroca?: string;
  foiTrocado?: boolean;
  oculto?: boolean;
  recado?: string;
  lembrete?: string;
  dataVencimento?: string;
};

type Fornecedor = {
  id: number;
  nome: string;
  documentos: Documento[];
};

type MesPagamento = {
  id: number;
  mes: number;
  ano: number;
  fornecedores: Fornecedor[];
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

  const [novoFornecedor, setNovoFornecedor] = useState("");

  const [fornecedorAberto, setFornecedorAberto] =
    useState<number | null>(null);

  // ==========================================
  // CONTROLE DE UPLOAD
  // ==========================================

  const [documentoSelecionado, setDocumentoSelecionado] =
    useState<number | null>(null);

  const [mesSelecionado, setMesSelecionado] =
    useState<number | null>(null);

  const [fornecedorSelecionado, setFornecedorSelecionado] =
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
    idMes?: number,
    idFornecedor?: number
  ) {
    setDocumentoSelecionado(id);
    setTipoUpload(tipo);

    if (tipo === "pagamento") {
      setMesSelecionado(idMes ?? null);
      setFornecedorSelecionado(idFornecedor ?? null);
    } else {
      setMesSelecionado(null);
      setFornecedorSelecionado(null);
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
      mesSelecionado !== null &&
      fornecedorSelecionado !== null
    ) {
      const agora = new Date().toLocaleString("pt-BR");

      setMesesPagamento((lista) =>
        lista.map((mes) =>
          mes.id === mesSelecionado
            ? {
                ...mes,
                fornecedores: mes.fornecedores.map((fornecedor) =>
                  fornecedor.id === fornecedorSelecionado
                    ? {
                        ...fornecedor,
                        documentos: fornecedor.documentos.map((documento) => {
                          if (documento.id !== documentoSelecionado) {
                            return documento;
                          }

                          const primeiraVersao = !documento.arquivo;

                          return {
                            ...documento,
                            arquivo,
                            status: "Concluído",
                            dataEnvio: primeiraVersao
                              ? agora
                              : documento.dataEnvio || agora,
                            ultimaTroca: primeiraVersao
                              ? documento.ultimaTroca
                              : agora,
                            foiTrocado: primeiraVersao
                              ? documento.foiTrocado
                              : true,
                          };
                        }),
                      }
                    : fornecedor
                ),
              }
            : mes
        )
      );
    }

    setDocumentoSelecionado(null);
    setMesSelecionado(null);
    setFornecedorSelecionado(null);

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
        "Este mês já foi criado. Abra o mês existente para adicionar fornecedores."
      );
      return;
    }

    const novoFornecedor: Fornecedor = {
      id: Date.now() + 1,
      nome: "Fornecedor 1",
      documentos: documentosPagamentoIniciais(),
    };

    const novo: MesPagamento = {
      id: Date.now(),
      mes: novoMes,
      ano: novoAno,
      fornecedores: [novoFornecedor],
    };

    setMesesPagamento((lista) =>
      [...lista, novo].sort((a, b) => {
        if (a.ano !== b.ano) return b.ano - a.ano;
        return b.mes - a.mes;
      })
    );

    setMesAberto(novo.id);
    setFornecedorAberto(novoFornecedor.id);
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
      setFornecedorAberto(null);
      return;
    }

    setMesAberto(id);
    setPesquisaPagamento("");
    setMostrarAdicionarPagamento(false);
  }

  // ==========================================
  // ADICIONAR FORNECEDOR
  // ==========================================

  function adicionarFornecedorPagamento() {
    if (mesAberto === null) return;

    const nome = novoFornecedor.trim();

    if (!nome) {
      alert("Digite o nome do fornecedor.");
      return;
    }

    const novo: Fornecedor = {
      id: Date.now(),
      nome,
      documentos: documentosPagamentoIniciais(),
    };

    setMesesPagamento((lista) =>
      lista.map((mes) =>
        mes.id === mesAberto
          ? { ...mes, fornecedores: [...mes.fornecedores, novo] }
          : mes
      )
    );

    setNovoFornecedor("");
    setFornecedorAberto(novo.id);
    setMostrarAdicionarPagamento(false);
  }

  function renomearFornecedor(mesId: number, fornecedorId: number) {
    const mes = mesesPagamento.find((item) => item.id === mesId);
    const fornecedor = mes?.fornecedores.find((item) => item.id === fornecedorId);
    if (!fornecedor) return;

    const nome = window.prompt("Nome do fornecedor:", fornecedor.nome);
    if (!nome?.trim()) return;

    setMesesPagamento((lista) =>
      lista.map((item) =>
        item.id === mesId
          ? {
              ...item,
              fornecedores: item.fornecedores.map((f) =>
                f.id === fornecedorId ? { ...f, nome: nome.trim() } : f
              ),
            }
          : item
      )
    );
  }

  function alternarFornecedor(id: number) {
    setFornecedorAberto((atual) => (atual === id ? null : id));
  }

  // ==========================================
  // ADICIONAR DOCUMENTO DENTRO DO FORNECEDOR
  // ==========================================

  function adicionarDocumentoPagamento() {
    if (mesAberto === null || fornecedorAberto === null) return;

    const nome = novoDocumentoPagamento.trim();

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
              fornecedores: mes.fornecedores.map((fornecedor) =>
                fornecedor.id === fornecedorAberto
                  ? { ...fornecedor, documentos: [...fornecedor.documentos, novo] }
                  : fornecedor
              ),
            }
          : mes
      )
    );

    setNovoDocumentoPagamento("");
    setMostrarAdicionarPagamento(false);
  }

  function ocultarDocumento(mesId: number, fornecedorId: number, documentoId: number) {
    setMesesPagamento((lista) =>
      lista.map((mes) =>
        mes.id === mesId
          ? {
              ...mes,
              fornecedores: mes.fornecedores.map((fornecedor) =>
                fornecedor.id === fornecedorId
                  ? {
                      ...fornecedor,
                      documentos: fornecedor.documentos.map((documento) =>
                        documento.id === documentoId
                          ? { ...documento, oculto: !documento.oculto }
                          : documento
                      ),
                    }
                  : fornecedor
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
    const mes = mesesPagamento.find((item) => item.id === id);
    if (!mes) return;

    const confirmar = window.confirm(
      `Deseja remover ${nomesMeses[mes.mes - 1]}/${mes.ano}?`
    );
    if (!confirmar) return;

    setMesesPagamento((lista) => lista.filter((item) => item.id !== id));
    if (mesAberto === id) {
      setMesAberto(null);
      setFornecedorAberto(null);
    }
  }

  // ==========================================
  // RESUMO DOS DOCUMENTOS DE PAGAMENTO
  // ==========================================

  function documentosVisiveis(mes: MesPagamento) {
    return mes.fornecedores.flatMap((fornecedor) =>
      fornecedor.documentos.filter((documento) => !documento.oculto)
    );
  }

  function quantidadeConcluida(mes: MesPagamento) {
    return documentosVisiveis(mes).filter(
      (documento) => documento.status === "Concluído"
    ).length;
  }

  function quantidadePendente(mes: MesPagamento) {
    return documentosVisiveis(mes).filter(
      (documento) => documento.status !== "Concluído"
    ).length;
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
            boxShadow: "0 5px 20px rgba(0,0,0,.10)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 15,
              flexWrap: "wrap",
              marginBottom: 20,
            }}
          >
            <div>
              <h2 style={{ margin: 0, color: "#334155", fontSize: 24 }}>
                💰 Fase de Pagamentos
              </h2>
              <p style={{ margin: "7px 0 0", color: "#64748b", fontSize: 14, maxWidth: 760 }}>
                Organize os documentos por mês, fornecedor e tipo de documento.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setMostrarNovoMes(true)}
              style={{ border: "none", borderRadius: 8, padding: "11px 16px", background: "#2563eb", color: "#fff", fontWeight: 700, cursor: "pointer" }}
            >
              ＋ Novo mês
            </button>
          </div>

          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: 14, marginBottom: 22, color: "#1e40af", fontSize: 14 }}>
            📌 Cada mês possui seus próprios fornecedores. Dentro de cada fornecedor ficam os documentos.
            <strong> A instituição pode anexar ou substituir arquivos, mas não pode excluir documentos.</strong>
          </div>

          {mostrarNovoMes && (
            <div style={{ background: "#f8fafc", border: "1px solid #dbe3ef", borderRadius: 12, padding: 20, marginBottom: 25 }}>
              <h3 style={{ margin: "0 0 15px", color: "#334155" }}>📅 Criar mês de conferência</h3>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <select value={novoMes} onChange={(e) => setNovoMes(Number(e.target.value))} style={{ padding: 11, border: "1px solid #cbd5e1", borderRadius: 7, fontSize: 15, background: "#fff" }}>
                  {nomesMeses.map((nome, indice) => <option key={indice} value={indice + 1}>{nome}</option>)}
                </select>
                <select value={novoAno} onChange={(e) => setNovoAno(Number(e.target.value))} style={{ padding: 11, border: "1px solid #cbd5e1", borderRadius: 7, fontSize: 15, background: "#fff" }}>
                  {Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 2 + i).map((ano) => <option key={ano} value={ano}>{ano}</option>)}
                </select>
                <button type="button" onClick={criarMesPagamento} style={{ border: "none", borderRadius: 7, padding: "11px 18px", background: "#198754", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Criar mês</button>
                <button type="button" onClick={() => setMostrarNovoMes(false)} style={{ border: "none", borderRadius: 7, padding: "11px 18px", background: "#e2e8f0", color: "#334155", fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
              </div>
            </div>
          )}

          {mesesPagamento.length === 0 && !mostrarNovoMes && (
            <div style={{ textAlign: "center", padding: "40px 20px", border: "1px dashed #cbd5e1", borderRadius: 12, color: "#64748b" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📅</div>
              <strong style={{ display: "block", color: "#334155", fontSize: 17, marginBottom: 6 }}>Nenhum mês criado</strong>
              <span style={{ fontSize: 14 }}>Clique em <strong>＋ Novo mês</strong> para começar.</span>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {mesesPagamento.map((mes) => {
              const concluidosMes = quantidadeConcluida(mes);
              const pendentesMes = quantidadePendente(mes);
              const totalMes = documentosVisiveis(mes).length;
              const completo = totalMes > 0 && pendentesMes === 0;
              const aberto = mesAberto === mes.id;

              return (
                <div key={mes.id} style={{ border: "1px solid #dbe3ef", borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ padding: 18, background: aberto ? "#f8fbff" : "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 15, flexWrap: "wrap" }}>
                    <button type="button" onClick={() => alternarMes(mes.id)} style={{ border: "none", background: "transparent", cursor: "pointer", padding: 0, textAlign: "left", flex: 1, minWidth: 250 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 25 }}>{aberto ? "📂" : "📁"}</span>
                        <div>
                          <strong style={{ display: "block", color: "#334155", fontSize: 18 }}>{nomesMeses[mes.mes - 1]} {mes.ano}</strong>
                          <span style={{ color: "#64748b", fontSize: 13 }}>{mes.fornecedores.length} fornecedor(es) · {totalMes} documentos visíveis</span>
                        </div>
                      </div>
                    </button>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ background: completo ? "#dcfce7" : "#fff3cd", color: completo ? "#166534" : "#856404", padding: "6px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{completo ? "🟢 Completo" : "🟡 Pendente"}</span>
                      <span style={{ background: "#f1f5f9", color: "#475569", padding: "6px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{concluidosMes}/{totalMes} concluídos</span>
                      <button type="button" onClick={() => removerMes(mes.id)} style={{ border: "none", background: "transparent", color: "#94a3b8", cursor: "pointer", padding: 5, fontSize: 16 }} title="Remover mês">🗑️</button>
                      <button type="button" onClick={() => alternarMes(mes.id)} style={{ border: "1px solid #cbd5e1", background: "#fff", borderRadius: 7, padding: "7px 12px", color: "#334155", cursor: "pointer", fontWeight: 600 }}>{aberto ? "Fechar" : "Abrir"}</button>
                    </div>
                  </div>

                  {aberto && (
                    <div style={{ borderTop: "1px solid #dbe3ef", padding: 22, background: "#fff" }}>
                      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                        <input type="text" value={pesquisaPagamento} onChange={(e) => setPesquisaPagamento(e.target.value)} placeholder="🔎 Pesquisar fornecedor ou documento..." style={{ flex: 1, minWidth: 250, padding: 13, border: "1px solid #cbd5e1", borderRadius: 8, boxSizing: "border-box", fontSize: 14 }} />
                        <button type="button" onClick={() => setMostrarAdicionarPagamento(true)} style={{ border: "none", borderRadius: 8, padding: "11px 16px", background: "#2563eb", color: "#fff", fontWeight: 700, cursor: "pointer" }}>＋ Adicionar fornecedor</button>
                      </div>

                      {mostrarAdicionarPagamento && (
                        <div style={{ background: "#f8fafc", border: "1px solid #dbe3ef", borderRadius: 10, padding: 18, marginBottom: 20 }}>
                          <strong style={{ display: "block", marginBottom: 10, color: "#334155" }}>Adicionar fornecedor neste mês</strong>
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <input type="text" value={novoFornecedor} onChange={(e) => setNovoFornecedor(e.target.value)} placeholder="Nome do fornecedor" style={{ flex: 1, minWidth: 240, padding: 11, border: "1px solid #cbd5e1", borderRadius: 7 }} />
                            <button type="button" onClick={adicionarFornecedorPagamento} style={{ border: "none", borderRadius: 7, padding: "10px 16px", background: "#198754", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Adicionar</button>
                            <button type="button" onClick={() => { setMostrarAdicionarPagamento(false); setNovoFornecedor(""); }} style={{ border: "none", borderRadius: 7, padding: "10px 16px", background: "#e2e8f0", color: "#334155", fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
                          </div>
                        </div>
                      )}

                      {mes.fornecedores.filter((fornecedor) => {
                        const termo = pesquisaPagamento.toLowerCase().trim();
                        if (!termo) return true;
                        return fornecedor.nome.toLowerCase().includes(termo) || fornecedor.documentos.some((documento) => documento.nome.toLowerCase().includes(termo));
                      }).map((fornecedor) => {
                        const fornecedorAbertoAtual = fornecedorAberto === fornecedor.id;
                        const docsVisiveis = fornecedor.documentos.filter((documento) => !documento.oculto);
                        const concluidosFornecedor = docsVisiveis.filter((documento) => documento.status === "Concluído").length;
                        const pendentesFornecedor = docsVisiveis.length - concluidosFornecedor;

                        return (
                          <div key={fornecedor.id} style={{ border: "1px solid #cbd5e1", borderRadius: 12, marginBottom: 14, overflow: "hidden" }}>
                            <div style={{ padding: 16, background: fornecedorAbertoAtual ? "#f8fbff" : "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                              <button type="button" onClick={() => alternarFornecedor(fornecedor.id)} style={{ border: "none", background: "transparent", padding: 0, cursor: "pointer", textAlign: "left", flex: 1, minWidth: 240 }}>
                                <strong style={{ color: "#1f3c88", fontSize: 17 }}>🏢 {fornecedor.nome}</strong>
                                <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>{concluidosFornecedor}/{docsVisiveis.length} documentos concluídos · {pendentesFornecedor} pendente(s)</div>
                              </button>
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <button type="button" onClick={() => renomearFornecedor(mes.id, fornecedor.id)} style={{ border: "1px solid #cbd5e1", background: "#fff", borderRadius: 7, padding: "7px 10px", cursor: "pointer", fontWeight: 600, color: "#334155" }}>✏️ Editar nome</button>
                                <button type="button" onClick={() => alternarFornecedor(fornecedor.id)} style={{ border: "1px solid #cbd5e1", background: "#fff", borderRadius: 7, padding: "7px 10px", cursor: "pointer", fontWeight: 600, color: "#334155" }}>{fornecedorAbertoAtual ? "Fechar" : "Abrir"}</button>
                              </div>
                            </div>

                            {fornecedorAbertoAtual && (
                              <div style={{ borderTop: "1px solid #dbe3ef", padding: 18, background: "#fff" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                                  <div>
                                    <strong style={{ color: "#334155" }}>📂 Documentos de {fornecedor.nome}</strong>
                                    <div style={{ color: "#64748b", fontSize: 13, marginTop: 3 }}>Cotação, certidões, contrato, nota fiscal e outros documentos.</div>
                                  </div>
                                  <button type="button" onClick={() => setMostrarAdicionarPagamento(true)} style={{ border: "none", borderRadius: 7, padding: "9px 13px", background: "#2563eb", color: "#fff", fontWeight: 700, cursor: "pointer" }}>＋ Adicionar documento</button>
                                </div>

                                {mostrarAdicionarPagamento && (
                                  <div style={{ background: "#f8fafc", border: "1px solid #dbe3ef", borderRadius: 10, padding: 15, marginBottom: 18 }}>
                                    <strong style={{ display: "block", marginBottom: 9, color: "#334155" }}>Novo documento para este fornecedor</strong>
                                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                      <input type="text" value={novoDocumentoPagamento} onChange={(e) => setNovoDocumentoPagamento(e.target.value)} placeholder="Ex.: Recibo, comprovante, contrato..." style={{ flex: 1, minWidth: 240, padding: 10, border: "1px solid #cbd5e1", borderRadius: 7 }} />
                                      <button type="button" onClick={adicionarDocumentoPagamento} style={{ border: "none", borderRadius: 7, padding: "10px 15px", background: "#198754", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Adicionar</button>
                                      <button type="button" onClick={() => { setMostrarAdicionarPagamento(false); setNovoDocumentoPagamento(""); }} style={{ border: "none", borderRadius: 7, padding: "10px 15px", background: "#e2e8f0", color: "#334155", fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
                                    </div>
                                  </div>
                                )}

                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
                                  {fornecedor.documentos.filter((documento) => !documento.oculto).filter((documento) => {
                                    const termo = pesquisaPagamento.toLowerCase().trim();
                                    return !termo || documento.nome.toLowerCase().includes(termo) || fornecedor.nome.toLowerCase().includes(termo);
                                  }).map((documento) => (
                                    <div key={documento.id} style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 16, background: "#fafcff" }}>
                                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                                        <strong style={{ color: "#334155", fontSize: 15 }}>📄 {documento.nome}</strong>
                                        <span style={{ background: documento.status === "Concluído" ? "#dcfce7" : "#fff3cd", color: documento.status === "Concluído" ? "#166534" : "#856404", padding: "5px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{documento.status}</span>
                                      </div>

                                      {documento.arquivo && (
                                        <div style={{ background: "#f0fdf4", borderRadius: 8, padding: 10, marginBottom: 10, color: "#166534", fontSize: 12, wordBreak: "break-word" }}>📎 {documento.arquivo.name}</div>
                                      )}

                                      {documento.dataEnvio && !documento.ultimaTroca && (
                                        <div style={{ color: "#64748b", fontSize: 12, marginBottom: 8 }}>🕐 Enviado em: {documento.dataEnvio}</div>
                                      )}

                                      {documento.foiTrocado && documento.ultimaTroca && (
                                        <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, padding: 9, marginBottom: 10, color: "#9a3412", fontSize: 12, fontWeight: 700 }}>🔄 Documento trocado em: {documento.ultimaTroca}<br /><span style={{ fontWeight: 500 }}>O novo arquivo ficará sujeito a nova conferência.</span></div>
                                      )}

                                      <button type="button" onClick={() => abrirArquivo(documento.id, "pagamento", mes.id, fornecedor.id)} style={{ width: "100%", padding: 10, border: "none", borderRadius: 7, background: "#2563eb", color: "#fff", fontWeight: 700, cursor: "pointer", marginBottom: 7 }}>📤 {documento.arquivo ? "Trocar arquivo" : "Anexar documento"}</button>
                                      <button type="button" onClick={() => ocultarDocumento(mes.id, fornecedor.id, documento.id)} style={{ width: "100%", padding: 8, border: "1px solid #cbd5e1", borderRadius: 7, background: "#fff", color: "#475569", fontWeight: 600, cursor: "pointer", fontSize: 12 }}>👁️ Ocultar deste mês</button>
                                    </div>
                                  ))}
                                </div>

                                {fornecedor.documentos.some((documento) => documento.oculto) && (
                                  <div style={{ marginTop: 14, padding: 11, background: "#f8fafc", borderRadius: 8, color: "#64748b", fontSize: 12 }}>
                                    👁️ {fornecedor.documentos.filter((documento) => documento.oculto).length} documento(s) ocultado(s). Eles não entram na contagem de pendências.
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
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