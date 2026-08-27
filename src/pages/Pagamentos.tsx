import { useState } from "react";

type StatusPagamento = "Pendente" | "Em andamento" | "Concluído";

interface DocumentoPagamento {
  nome: string;
  obrigatorio: boolean;
  concluido: boolean;
}

interface Pagamento {
  id: number;
  descricao: string;
  fornecedor: string;
  valor: number;
  status: StatusPagamento;
  dataPrevista: string;
  dataPagamento: string;
  documentos: DocumentoPagamento[];
}

const documentosIniciais: DocumentoPagamento[] = [
  { nome: "Cotação 1", obrigatorio: true, concluido: false },
  { nome: "Cotação 2", obrigatorio: true, concluido: false },
  { nome: "Cotação 3", obrigatorio: true, concluido: false },
  { nome: "Certidão Municipal", obrigatorio: true, concluido: false },
  { nome: "Certidão Estadual", obrigatorio: true, concluido: false },
  { nome: "Certidão Federal", obrigatorio: true, concluido: false },
  { nome: "Certidão Trabalhista", obrigatorio: true, concluido: false },
  { nome: "Certidão FGTS", obrigatorio: true, concluido: false },
  { nome: "Cartão CNPJ", obrigatorio: true, concluido: false },
  { nome: "Nota Fiscal", obrigatorio: true, concluido: false },
];

const pagamentosIniciais: Pagamento[] = [
  {
    id: 1,
    descricao: "Compra de equipamentos",
    fornecedor: "Empresa Exemplo LTDA",
    valor: 5000,
    status: "Pendente",
    dataPrevista: "",
    dataPagamento: "",
    documentos: documentosIniciais,
  },
];

export default function Pagamentos() {
  const [pagamentos, setPagamentos] =
    useState<Pagamento[]>(pagamentosIniciais);

  const [pagamentoAberto, setPagamentoAberto] = useState<number | null>(null);

  const formatarValor = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const calcularDocumentos = (pagamento: Pagamento) => {
    const total = pagamento.documentos.filter(
      (documento) => documento.obrigatorio
    ).length;

    const concluidos = pagamento.documentos.filter(
      (documento) => documento.obrigatorio && documento.concluido
    ).length;

    return { total, concluidos };
  };

  const atualizarStatus = (id: number, status: StatusPagamento) => {
    setPagamentos((atual) =>
      atual.map((pagamento) =>
        pagamento.id === id
          ? { ...pagamento, status }
          : pagamento
      )
    );
  };

  const adicionarPagamento = () => {
    const novoPagamento: Pagamento = {
      id: Date.now(),
      descricao: "Novo pagamento",
      fornecedor: "",
      valor: 0,
      status: "Pendente",
      dataPrevista: "",
      dataPagamento: "",
      documentos: documentosIniciais.map((documento) => ({
        ...documento,
        concluido: false,
      })),
    };

    setPagamentos((atual) => [...atual, novoPagamento]);
    setPagamentoAberto(novoPagamento.id);
  };

  const alternarDocumento = (
    pagamentoId: number,
    documentoNome: string
  ) => {
    setPagamentos((atual) =>
      atual.map((pagamento) => {
        if (pagamento.id !== pagamentoId) {
          return pagamento;
        }

        return {
          ...pagamento,
          documentos: pagamento.documentos.map((documento) =>
            documento.nome === documentoNome
              ? {
                  ...documento,
                  concluido: !documento.concluido,
                }
              : documento
          ),
        };
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">

        {/* CABEÇALHO */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Fase de Pagamentos
            </h1>

            <p className="mt-1 text-slate-500">
              Organize os pagamentos e acompanhe toda a documentação necessária.
            </p>
          </div>

          <button
            onClick={adicionarPagamento}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            + Novo pagamento
          </button>
        </div>

        {/* RESUMO */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total de pagamentos
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-800">
              {pagamentos.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Pendentes
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-500">
              {
                pagamentos.filter(
                  (pagamento) => pagamento.status === "Pendente"
                ).length
              }
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Concluídos
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {
                pagamentos.filter(
                  (pagamento) => pagamento.status === "Concluído"
                ).length
              }
            </p>
          </div>

        </div>

        {/* PAGAMENTOS */}
        <div className="space-y-5">

          {pagamentos.map((pagamento, index) => {
            const { total, concluidos } =
              calcularDocumentos(pagamento);

            const documentosCompletos =
              total > 0 && concluidos === total;

            return (
              <div
                key={pagamento.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >

                {/* CABEÇALHO DO PAGAMENTO */}
                <div className="p-6">

                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                    <div>
                      <div className="flex items-center gap-3">

                        <h2 className="text-xl font-bold text-slate-800">
                          Pagamento {index + 1}
                        </h2>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            pagamento.status === "Concluído"
                              ? "bg-green-100 text-green-700"
                              : pagamento.status === "Em andamento"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {pagamento.status}
                        </span>

                      </div>

                      <p className="mt-2 text-slate-600">
                        {pagamento.descricao}
                      </p>
                    </div>

                    <div className="text-left lg:text-right">

                      <p className="text-sm text-slate-500">
                        Valor
                      </p>

                      <p className="text-2xl font-bold text-slate-800">
                        {formatarValor(pagamento.valor)}
                      </p>

                    </div>

                  </div>

                  {/* INFORMAÇÕES */}
                  <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        Fornecedor
                      </p>

                      <p className="mt-1 font-medium text-slate-700">
                        {pagamento.fornecedor || "Não informado"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        Data prevista
                      </p>

                      <p className="mt-1 font-medium text-slate-700">
                        {pagamento.dataPrevista || "Não definida"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        Data do pagamento
                      </p>

                      <p className="mt-1 font-medium text-slate-700">
                        {pagamento.dataPagamento || "Ainda não realizado"}
                      </p>
                    </div>

                  </div>

                  {/* DOCUMENTAÇÃO */}
                  <div className="mt-6 rounded-lg bg-slate-50 p-4">

                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                      <div>
                        <p className="font-semibold text-slate-700">
                          Documentação do pagamento
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {concluidos} de {total} documentos concluídos
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold ${
                          documentosCompletos
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {documentosCompletos
                          ? "🟢 Documentação completa"
                          : "🟡 Documentação pendente"}
                      </span>

                    </div>

                    {/* BARRA DE PROGRESSO */}
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-green-500 transition-all"
                        style={{
                          width: `${
                            total > 0
                              ? (concluidos / total) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>

                  </div>

                  {/* BOTÕES */}
                  <div className="mt-5 flex flex-wrap gap-3">

                    <button
                      onClick={() =>
                        setPagamentoAberto(
                          pagamentoAberto === pagamento.id
                            ? null
                            : pagamento.id
                        )
                      }
                      className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                    >
                      {pagamentoAberto === pagamento.id
                        ? "Fechar documentos"
                        : "Ver documentação"}
                    </button>

                    <select
                      value={pagamento.status}
                      onChange={(e) =>
                        atualizarStatus(
                          pagamento.id,
                          e.target.value as StatusPagamento
                        )
                      }
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm"
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Em andamento">
                        Em andamento
                      </option>
                      <option value="Concluído">Concluído</option>
                    </select>

                  </div>

                </div>

                {/* LISTA DE DOCUMENTOS */}
                {pagamentoAberto === pagamento.id && (
                  <div className="border-t border-slate-200 bg-slate-50 p-6">

                    <h3 className="mb-4 text-lg font-bold text-slate-800">
                      Documentos necessários
                    </h3>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

                      {pagamento.documentos.map((documento) => (

                        <button
                          key={documento.nome}
                          onClick={() =>
                            alternarDocumento(
                              pagamento.id,
                              documento.nome
                            )
                          }
                          className={`flex items-center justify-between rounded-lg border p-4 text-left transition ${
                            documento.concluido
                              ? "border-green-200 bg-green-50"
                              : "border-slate-200 bg-white hover:border-blue-300"
                          }`}
                        >

                          <div className="flex items-center gap-3">

                            <span className="text-xl">
                              {documento.concluido
                                ? "✅"
                                : "📄"}
                            </span>

                            <span
                              className={`font-medium ${
                                documento.concluido
                                  ? "text-green-700"
                                  : "text-slate-700"
                              }`}
                            >
                              {documento.nome}
                            </span>

                          </div>

                          <span className="text-xs text-slate-400">
                            {documento.concluido
                              ? "Concluído"
                              : "Pendente"}
                          </span>

                        </button>

                      ))}

                    </div>

                  </div>
                )}

              </div>
            );
          })}

        </div>

      </div>
    </div>
  );
}