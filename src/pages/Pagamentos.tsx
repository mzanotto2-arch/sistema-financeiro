import { useState } from "react";

type StatusDocumento = "Pendente" | "Concluído" | "Vencido";

interface DocumentoFornecedor {
  id: number;
  nome: string;
  obrigatorio: boolean;
  visivel: boolean;
  status: StatusDocumento;
  arquivo?: string;
  dataEnvio?: string;
  ultimaTroca?: string;
  foiTrocado?: boolean;
  recado?: string;
}

interface Fornecedor {
  id: number;
  nome: string;
  documentos: DocumentoFornecedor[];
  observacao: string;
}

interface MesPagamento {
  id: number;
  mes: string;
  fornecedores: Fornecedor[];
}

const documentosPadrao = (): DocumentoFornecedor[] => [
  {
    id: Date.now() + 1,
    nome: "Cotação 1",
    obrigatorio: false,
    visivel: true,
    status: "Pendente",
  },
  {
    id: Date.now() + 2,
    nome: "Cotação 2",
    obrigatorio: false,
    visivel: true,
    status: "Pendente",
  },
  {
    id: Date.now() + 3,
    nome: "Cotação 3",
    obrigatorio: false,
    visivel: true,
    status: "Pendente",
  },
  {
    id: Date.now() + 4,
    nome: "Certidão Municipal",
    obrigatorio: true,
    visivel: true,
    status: "Pendente",
  },
  {
    id: Date.now() + 5,
    nome: "Certidão Estadual",
    obrigatorio: true,
    visivel: true,
    status: "Pendente",
  },
  {
    id: Date.now() + 6,
    nome: "Certidão Federal",
    obrigatorio: true,
    visivel: true,
    status: "Pendente",
  },
  {
    id: Date.now() + 7,
    nome: "Certidão Trabalhista",
    obrigatorio: true,
    visivel: true,
    status: "Pendente",
  },
  {
    id: Date.now() + 8,
    nome: "Certidão FGTS",
    obrigatorio: true,
    visivel: true,
    status: "Pendente",
  },
  {
    id: Date.now() + 9,
    nome: "Cartão CNPJ",
    obrigatorio: true,
    visivel: true,
    status: "Pendente",
  },
  {
    id: Date.now() + 10,
    nome: "Contrato",
    obrigatorio: true,
    visivel: true,
    status: "Pendente",
  },
  {
    id: Date.now() + 11,
    nome: "Nota Fiscal",
    obrigatorio: true,
    visivel: true,
    status: "Pendente",
  },
];

const mesesIniciais: MesPagamento[] = [
  {
    id: 1,
    mes: "Setembro 2026",
    fornecedores: [
      {
        id: 1,
        nome: "Fornecedor Teste",
        observacao: "",
        documentos: documentosPadrao(),
      },
    ],
  },
];

export default function Pagamentos() {
  const [meses, setMeses] = useState<MesPagamento[]>(mesesIniciais);

  const [mesAberto, setMesAberto] = useState<number | null>(1);

  const [fornecedorAberto, setFornecedorAberto] = useState<number | null>(1);

  const [editandoFornecedor, setEditandoFornecedor] = useState<number | null>(
    null
  );

  const [novoNomeFornecedor, setNovoNomeFornecedor] = useState("");

  const adicionarMes = () => {
    const novoMes: MesPagamento = {
      id: Date.now(),
      mes: "Novo mês",
      fornecedores: [],
    };

    setMeses((atual) => [...atual, novoMes]);
    setMesAberto(novoMes.id);
  };

  const adicionarFornecedor = (mesId: number) => {
    const novoFornecedor: Fornecedor = {
      id: Date.now(),
      nome: "Novo fornecedor",
      observacao: "",
      documentos: documentosPadrao(),
    };

    setMeses((atual) =>
      atual.map((mes) =>
        mes.id === mesId
          ? {
              ...mes,
              fornecedores: [...mes.fornecedores, novoFornecedor],
            }
          : mes
      )
    );

    setFornecedorAberto(novoFornecedor.id);
  };

  const editarFornecedor = (mesId: number, fornecedorId: number) => {
    if (!novoNomeFornecedor.trim()) return;

    setMeses((atual) =>
      atual.map((mes) =>
        mes.id === mesId
          ? {
              ...mes,
              fornecedores: mes.fornecedores.map((fornecedor) =>
                fornecedor.id === fornecedorId
                  ? {
                      ...fornecedor,
                      nome: novoNomeFornecedor,
                    }
                  : fornecedor
              ),
            }
          : mes
      )
    );

    setEditandoFornecedor(null);
    setNovoNomeFornecedor("");
  };

  const ocultarDocumento = (
    mesId: number,
    fornecedorId: number,
    documentoId: number
  ) => {
    setMeses((atual) =>
      atual.map((mes) =>
        mes.id === mesId
          ? {
              ...mes,
              fornecedores: mes.fornecedores.map((fornecedor) =>
                fornecedor.id === fornecedorId
                  ? {
                      ...fornecedor,
                      documentos: fornecedor.documentos.map((documento) =>
                        documento.id === documentoId
                          ? {
                              ...documento,
                              visivel: !documento.visivel,
                            }
                          : documento
                      ),
                    }
                  : fornecedor
              ),
            }
          : mes
      )
    );
  };

  const alterarStatusDocumento = (
    mesId: number,
    fornecedorId: number,
    documentoId: number,
    status: StatusDocumento
  ) => {
    setMeses((atual) =>
      atual.map((mes) =>
        mes.id === mesId
          ? {
              ...mes,
              fornecedores: mes.fornecedores.map((fornecedor) =>
                fornecedor.id === fornecedorId
                  ? {
                      ...fornecedor,
                      documentos: fornecedor.documentos.map((documento) =>
                        documento.id === documentoId
                          ? {
                              ...documento,
                              status,
                            }
                          : documento
                      ),
                    }
                  : fornecedor
              ),
            }
          : mes
      )
    );
  };

 const anexarDocumento = (
  mesId: number,
  fornecedorId: number,
  documentoId: number,
  arquivo: File
) => {
  const agora = new Date().toLocaleString("pt-BR");

  setMeses((atual) =>
    atual.map((mes) =>
      mes.id === mesId
        ? {
            ...mes,
            fornecedores: mes.fornecedores.map((fornecedor) =>
              fornecedor.id === fornecedorId
                ? {
                    ...fornecedor,
                    documentos: fornecedor.documentos.map((documento) =>
                      documento.id === documentoId
                        ? {
                            ...documento,
                            arquivo: arquivo.name,

                            // Primeiro envio
                            dataEnvio: documento.arquivo
                              ? documento.dataEnvio
                              : agora,

                            // Se já existia arquivo, foi uma troca
                            ultimaTroca: documento.arquivo
                              ? agora
                              : documento.ultimaTroca,

                            // Identifica que o documento foi substituído
                            foiTrocado: documento.arquivo
                              ? true
                              : documento.foiTrocado,

                            status: "Concluído",
                          }
                        : documento
                    ),
                  }
                : fornecedor
            ),
          }
        : mes
    )
  );
};

  const atualizarObservacao = (
    mesId: number,
    fornecedorId: number,
    observacao: string
  ) => {
    setMeses((atual) =>
      atual.map((mes) =>
        mes.id === mesId
          ? {
              ...mes,
              fornecedores: mes.fornecedores.map((fornecedor) =>
                fornecedor.id === fornecedorId
                  ? {
                      ...fornecedor,
                      observacao,
                    }
                  : fornecedor
              ),
            }
          : mes
      )
    );
  };

  const documentosVisiveis = (fornecedor: Fornecedor) =>
    fornecedor.documentos.filter((documento) => documento.visivel);

  const documentosConcluidos = (fornecedor: Fornecedor) =>
    documentosVisiveis(fornecedor).filter(
      (documento) => documento.status === "Concluído"
    ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">

        {/* CABEÇALHO */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              💰 Fase de Pagamentos
            </h1>

            <p className="mt-1 text-slate-500">
              Organize os documentos de pagamento por mês e por fornecedor.
            </p>
          </div>

          <button
            onClick={adicionarMes}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            + Novo mês
          </button>
        </div>

        {/* AVISO */}
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-800">
          📌 <strong>Como funciona:</strong> cada mês possui seus fornecedores
          e cada fornecedor possui sua própria documentação. Documentos que
          não forem necessários podem ser ocultados.
        </div>

        {/* MESES */}
        <div className="space-y-6">

          {meses.map((mes) => (
            <div
              key={mes.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >

              {/* CABEÇALHO DO MÊS */}
              <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 p-5 md:flex-row md:items-center md:justify-between">

                <div>
                  <button
                    onClick={() =>
                      setMesAberto(mesAberto === mes.id ? null : mes.id)
                    }
                    className="text-left"
                  >
                    <h2 className="text-xl font-bold text-slate-800">
                      📁 {mes.mes}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {mes.fornecedores.length} fornecedor(es)
                    </p>
                  </button>
                </div>

                <button
                  onClick={() => adicionarFornecedor(mes.id)}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                >
                  + Adicionar fornecedor
                </button>
              </div>

              {mesAberto === mes.id && (
                <div className="p-5">

                  {mes.fornecedores.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
                      <div className="mb-2 text-4xl">📂</div>
                      <p>Nenhum fornecedor cadastrado neste mês.</p>

                      <button
                        onClick={() => adicionarFornecedor(mes.id)}
                        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
                      >
                        + Adicionar fornecedor
                      </button>
                    </div>
                  )}

                  <div className="space-y-5">

                    {mes.fornecedores.map((fornecedor) => {

                      const visiveis = documentosVisiveis(fornecedor);

                      const concluidos =
                        documentosConcluidos(fornecedor);

                      const vencidos = visiveis.filter(
                        (documento) => documento.status === "Vencido"
                      ).length;

                      return (
                        <div
                          key={fornecedor.id}
                          className="overflow-hidden rounded-xl border border-slate-200"
                        >

                          {/* FORNECEDOR */}
                          <div className="bg-white p-5">

                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                              <div className="flex-1">

                                {editandoFornecedor === fornecedor.id ? (
                                  <div className="flex flex-col gap-2 sm:flex-row">
                                    <input
                                      value={novoNomeFornecedor}
                                      onChange={(e) =>
                                        setNovoNomeFornecedor(e.target.value)
                                      }
                                      className="rounded-lg border border-slate-300 px-3 py-2"
                                      placeholder="Nome do fornecedor"
                                    />

                                    <button
                                      onClick={() =>
                                        editarFornecedor(
                                          mes.id,
                                          fornecedor.id
                                        )
                                      }
                                      className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white"
                                    >
                                      Salvar
                                    </button>

                                    <button
                                      onClick={() =>
                                        setEditandoFornecedor(null)
                                      }
                                      className="rounded-lg border border-slate-300 px-4 py-2"
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                ) : (
                                  <div>
                                    <div className="flex items-center gap-3">
                                      <h3 className="text-lg font-bold text-slate-800">
                                        👤 {fornecedor.nome}
                                      </h3>

                                      <button
                                        onClick={() => {
                                          setEditandoFornecedor(
                                            fornecedor.id
                                          );
                                          setNovoNomeFornecedor(
                                            fornecedor.nome
                                          );
                                        }}
                                        className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                                      >
                                        ✏️ Editar
                                      </button>
                                    </div>

                                    <p className="mt-1 text-sm text-slate-500">
                                      {concluidos} de {visiveis.length} documentos
                                      concluídos
                                    </p>
                                  </div>
                                )}

                              </div>

                              <div className="flex flex-wrap gap-2">

                                {vencidos > 0 && (
                                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                                    ⚠️ {vencidos} certidão(ões) vencida(s)
                                  </span>
                                )}

                                <button
                                  onClick={() =>
                                    setFornecedorAberto(
                                      fornecedorAberto === fornecedor.id
                                        ? null
                                        : fornecedor.id
                                    )
                                  }
                                  className="rounded-lg bg-slate-800 px-4 py-2 font-semibold text-white hover:bg-slate-900"
                                >
                                  {fornecedorAberto === fornecedor.id
                                    ? "Fechar documentos"
                                    : "Ver documentos"}
                                </button>

                              </div>

                            </div>

                            {/* OBSERVAÇÃO */}
                            <div className="mt-5">
                              <label className="mb-2 block text-sm font-semibold text-slate-600">
                                📝 Recado / observação
                              </label>

                              <textarea
                                value={fornecedor.observacao}
                                onChange={(e) =>
                                  atualizarObservacao(
                                    mes.id,
                                    fornecedor.id,
                                    e.target.value
                                  )
                                }
                                placeholder="Ex.: Favor enviar a nota fiscal até sexta-feira."
                                className="min-h-[80px] w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
                              />
                            </div>

                          </div>

                          {/* DOCUMENTOS */}
                          {fornecedorAberto === fornecedor.id && (
                            <div className="border-t border-slate-200 bg-slate-50 p-5">

                              <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <div>
                                  <h4 className="text-lg font-bold text-slate-800">
                                    📄 Documentos de {fornecedor.nome}
                                  </h4>

                                  <p className="text-sm text-slate-500">
                                    A instituição poderá enviar os documentos
                                    individualmente.
                                  </p>
                                </div>

                                <span className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-600">
                                  {concluidos}/{visiveis.length} concluídos
                                </span>
                              </div>

                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                {fornecedor.documentos.map((documento) => {

                                  if (!documento.visivel) {
                                    return null;
                                  }

                                  return (
                                    <div
                                      key={documento.id}
                                      className={`rounded-xl border p-4 ${
                                        documento.status === "Concluído"
                                          ? "border-green-200 bg-green-50"
                                          : documento.status === "Vencido"
                                          ? "border-red-200 bg-red-50"
                                          : "border-slate-200 bg-white"
                                      }`}
                                    >

                                      <div className="flex items-start justify-between gap-3">

                                        <div>
                                          <h5 className="font-bold text-slate-800">
                                            📄 {documento.nome}
                                          </h5>

                                          <p className="mt-1 text-xs text-slate-500">
                                            {documento.obrigatorio
                                              ? "Documento obrigatório"
                                              : "Documento opcional"}
                                          </p>
                                        </div>

                                        <span
                                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                            documento.status === "Concluído"
                                              ? "bg-green-100 text-green-700"
                                              : documento.status === "Vencido"
                                              ? "bg-red-100 text-red-700"
                                              : "bg-orange-100 text-orange-700"
                                          }`}
                                        >
                                          {documento.status === "Concluído"
                                            ? "Concluído"
                                            : documento.status === "Vencido"
                                            ? "Vencido"
                                            : "Pendente"}
                                        </span>

                                      </div>

                                      {documento.arquivo && (
                                        <div className="mt-3 rounded-lg bg-white p-3 text-sm">
                                          📎 <strong>{documento.arquivo}</strong>

                                          {documento.ultimaTroca && (
                                            <p className="mt-1 text-xs text-slate-500">
                                              🔄 Documento trocado em{" "}
                                              {documento.ultimaTroca}
                                            </p>
                                          )}
                                        </div>
                                      )}

                                      <div className="mt-4 flex flex-wrap gap-2">

                                        <label className="cursor-pointer rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                                          📎{" "}
                                          {documento.arquivo
                                            ? "Trocar documento"
                                            : "Anexar documento"}

                                          <input
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => {
                                              const arquivo =
                                                e.target.files?.[0];

                                              if (arquivo) {
                                                anexarDocumento(
                                                  mes.id,
                                                  fornecedor.id,
                                                  documento.id,
                                                  arquivo
                                                );
                                              }
                                            }}
                                          />
                                        </label>

                                        <button
                                          onClick={() =>
                                            alterarStatusDocumento(
                                              mes.id,
                                              fornecedor.id,
                                              documento.id,
                                              documento.status === "Vencido"
                                                ? "Pendente"
                                                : "Vencido"
                                            )
                                          }
                                          className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                                        >
                                          ⚠️ Marcar vencida
                                        </button>

                                        {/* SOMENTE ADMINISTRADOR */}
                                        {!documento.obrigatorio && (
                                          <button
                                            onClick={() =>
                                              ocultarDocumento(
                                                mes.id,
                                                fornecedor.id,
                                                documento.id
                                              )
                                            }
                                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                                          >
                                            👁️ Ocultar
                                          </button>
                                        )}

                                      </div>

                                      {documento.status === "Vencido" && (
                                        <div className="mt-3 rounded-lg border border-red-200 bg-red-100 p-3 text-sm text-red-700">
                                          ⚠️ <strong>Atenção:</strong> esta
                                          certidão está vencida e precisa ser
                                          substituída.
                                        </div>
                                      )}

                                    </div>
                                  );
                                })}

                              </div>

                              {/* LEMBRETE */}
                              <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4">

                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                                  <div>
                                    <h5 className="font-bold text-yellow-800">
                                      🔔 Lembrete de pendência
                                    </h5>

                                    <p className="mt-1 text-sm text-yellow-700">
                                      Use esta opção para lembrar a instituição
                                      dos documentos que ainda estão pendentes.
                                    </p>
                                  </div>

                                  <button
                                    onClick={() =>
                                      alert(
                                        `Lembrete preparado para ${fornecedor.nome}.`
                                      )
                                    }
                                    className="rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-white hover:bg-yellow-600"
                                  >
                                    📨 Enviar lembrete
                                  </button>

                                </div>

                              </div>

                            </div>
                          )}

                        </div>
                      );
                    })}

                  </div>
                </div>
              )}

            </div>
          ))}

        </div>
      </div>
    </div>
  );
}