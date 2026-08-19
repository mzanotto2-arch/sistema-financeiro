import { useEffect, useMemo, useState } from "react";
import type { Cliente } from "../types/cliente";
import type { Parcela } from "../types/parcela";

import {
  listarClientes,
  salvarCliente,
  atualizarCliente,
  excluirCliente,
} from "../services/clientesService";

import {
  listarParcelas,
  salvarParcela,
  atualizarParcela,
  excluirParcela,
} from "../services/parcelasService";

import { supabase } from "../database/supabase";

type ClienteComFinanceiro = Cliente & {
  comissao_percentual?: number;
  comissao_parcelas?: number;
};

type Comissao = {
  id?: number;
  cliente_id: number;
  parcela: string;
  valor: number;
  vencimento?: string;
  status: string;
  data_pagamento?: string;
  observacoes?: string;
};

export default function Clientes() {
  const [id, setId] = useState<number | undefined>();

  const [proposta, setProposta] = useState("");
  const [instituicao, setInstituicao] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");

  const [contrato, setContrato] = useState("");
  const [valorParcela, setValorParcela] = useState("");
  const [quantidadeParcelas, setQuantidadeParcelas] = useState("");
  const [parcelaAtual, setParcelaAtual] = useState("");

  const [diaVencimento, setDiaVencimento] = useState("");
  const [inicioVigencia, setInicioVigencia] = useState("");
  const [fimVigencia, setFimVigencia] = useState("");

  const [grupoWhatsapp, setGrupoWhatsapp] = useState("");
  const [pastaDocumentos, setPastaDocumentos] = useState("");
  const [consultor, setConsultor] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [comissaoPercentual, setComissaoPercentual] = useState("");
  const [comissaoParcelas, setComissaoParcelas] = useState("1");

  const [clientes, setClientes] = useState<ClienteComFinanceiro[]>([]);
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [comissoes, setComissoes] = useState<Comissao[]>([]);

  const [busca, setBusca] = useState("");
  const [clienteSelecionado, setClienteSelecionado] =
    useState<ClienteComFinanceiro | null>(null);

  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setCarregando(true);

      const listaClientes = await listarClientes();
      setClientes(listaClientes as ClienteComFinanceiro[]);

      const listaParcelas = await listarParcelas();
      setParcelas(listaParcelas);

      const { data, error } = await supabase
        .from("comissoes")
        .select("*")
        .order("id");

      if (error) {
        console.error("Erro ao carregar comissões:", error);
      } else {
        setComissoes((data || []) as Comissao[]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCarregando(false);
    }
  }

  function formatarMoeda(valor: number | string | undefined) {
    const numero = Number(valor || 0);

    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function converterValor(valor: string) {
    if (!valor) return 0;

    return Number(
      valor
        .replace(/\s/g, "")
        .replace(/\./g, "")
        .replace(",", ".")
    );
  }

  function formatarData(data: string | undefined) {
    if (!data) return "-";

    const partes = data.split("-");

    if (partes.length !== 3) return data;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  function obterParcelasCliente(clienteId: number) {
    return parcelas
      .filter((item) => Number(item.cliente_id) === Number(clienteId))
      .sort((a, b) => {
        const numeroA = Number(String(a.parcela).split("/")[0]) || 0;
        const numeroB = Number(String(b.parcela).split("/")[0]) || 0;

        return numeroA - numeroB;
      });
  }

  function obterComissoesCliente(clienteId: number) {
    return comissoes
      .filter((item) => Number(item.cliente_id) === Number(clienteId))
      .sort((a, b) => {
        const numeroA = Number(String(a.parcela).split("/")[0]) || 0;
        const numeroB = Number(String(b.parcela).split("/")[0]) || 0;

        return numeroA - numeroB;
      });
  }

  function resumoCliente(cliente: ClienteComFinanceiro) {
    if (!cliente.id) {
      return {
        parcelas: [],
        pagas: 0,
        abertas: 0,
        atrasadas: 0,
        recebido: 0,
        aberto: Number(cliente.valor_parcela || 0) *
          Number(cliente.quantidade_parcelas || 0),
        total: Number(cliente.valor_parcela || 0) *
          Number(cliente.quantidade_parcelas || 0),
      };
    }

    const lista = obterParcelasCliente(cliente.id);

    const pagas = lista.filter(
      (item) =>
        item.status.toLowerCase() === "recebido" ||
        item.status.toLowerCase() === "pago"
    );

    const abertas = lista.filter(
      (item) =>
        item.status.toLowerCase() === "em aberto"
    );

    const atrasadas = lista.filter(
      (item) =>
        item.status.toLowerCase() === "atrasado"
    );

    const recebido = pagas.reduce(
      (total, item) => total + Number(item.valor || 0),
      0
    );

    const aberto = [...abertas, ...atrasadas].reduce(
      (total, item) => total + Number(item.valor || 0),
      0
    );

    const total =
      Number(cliente.valor_parcela || 0) *
      Number(cliente.quantidade_parcelas || 0);

    return {
      parcelas: lista,
      pagas: pagas.length,
      abertas: abertas.length,
      atrasadas: atrasadas.length,
      recebido,
      aberto: aberto || Math.max(total - recebido, 0),
      total,
    };
  }

  function calcularVencimento(
    cliente: ClienteComFinanceiro,
    numeroParcela: number
  ) {
    const base = cliente.inicio_vigencia
      ? new Date(`${cliente.inicio_vigencia}T12:00:00`)
      : new Date();

    const dia = Number(cliente.dia_vencimento);

    if (!Number.isNaN(dia) && dia >= 1 && dia <= 31) {
      base.setMonth(base.getMonth() + numeroParcela - 1);
      base.setDate(Math.min(dia, 28));
    } else {
      base.setMonth(base.getMonth() + numeroParcela - 1);
    }

    const ano = base.getFullYear();
    const mes = String(base.getMonth() + 1).padStart(2, "0");
    const diaFinal = String(base.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${diaFinal}`;
  }
 async function gerarParcelas(cliente: ClienteComFinanceiro) {
    if (!cliente.id) {
      alert("Salve o cliente primeiro.");
      return;
    }

    const quantidade = Number(cliente.quantidade_parcelas || 0);
    const valor = Number(cliente.valor_parcela || 0);

    if (quantidade <= 0) {
      alert("Informe a quantidade de parcelas do cliente.");
      return;
    }

    if (valor <= 0) {
      alert("Informe um valor de parcela válido.");
      return;
    }

    try {
      setCarregando(true);

      const existentes = obterParcelasCliente(cliente.id);

      for (let numero = 1; numero <= quantidade; numero++) {
        const jaExiste = existentes.some(
          (item) =>
            String(item.parcela).split("/")[0] === String(numero)
        );

        if (jaExiste) continue;

        const dados: Parcela = {
          cliente_id: cliente.id,
          proposta: Number(cliente.proposta || 0),
          parcela: `${numero}/${quantidade}`,
          valor,
          vencimento: calcularVencimento(cliente, numero),
          status: "Em Aberto",
          forma_pagamento: "",
          observacoes: "",
        };

        await salvarParcela(dados);
      }

      await carregarDados();

      alert("Parcelas geradas com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar as parcelas.");
    } finally {
      setCarregando(false);
    }
  }

  async function darBaixaParcela(item: Parcela) {
    if (!item.id) return;

    const hoje = new Date();
    const dataHoje = `${hoje.getFullYear()}-${String(
      hoje.getMonth() + 1
    ).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;

    const confirmar = confirm(
      `Dar baixa na parcela ${item.parcela} no valor de ${formatarMoeda(
        item.valor
      )}?`
    );

    if (!confirmar) return;

    try {
      await atualizarParcela({
        ...item,
        status: "Recebido",
        data_pagamento: dataHoje,
      });

      await registrarComissaoDaParcela(item);

      await carregarDados();

      if (clienteSelecionado) {
        const atualizado = clientes.find(
          (cliente) => cliente.id === clienteSelecionado.id
        );

        if (atualizado) {
          setClienteSelecionado(atualizado);
        }
      }

      alert("Parcela baixada com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao dar baixa na parcela.");
    }
  }

  async function reabrirParcela(item: Parcela) {
    if (!item.id) return;

    const confirmar = confirm(
      `Reabrir a parcela ${item.parcela}?`
    );

    if (!confirmar) return;

    try {
      await atualizarParcela({
        ...item,
        status: "Em Aberto",
        data_pagamento: null as any,
      });

      await carregarDados();

      alert("Parcela reaberta.");
    } catch (error) {
      console.error(error);
      alert("Erro ao reabrir parcela.");
    }
  }

  async function registrarComissaoDaParcela(item: Parcela) {
    if (!item.cliente_id) return;

    const cliente = clientes.find(
      (c) => Number(c.id) === Number(item.cliente_id)
    );

    if (!cliente) return;

    const percentual = Number(cliente.comissao_percentual || 0);

    if (percentual <= 0) return;

    const quantidadeComissao = Number(
      cliente.comissao_parcelas || 1
    );

    const valorComissao =
      Number(item.valor || 0) * (percentual / 100);

    const numeroParcela =
      Number(String(item.parcela).split("/")[0]) || 1;

    const jaExiste = comissoes.some(
      (comissao) =>
        Number(comissao.cliente_id) === Number(item.cliente_id) &&
        String(comissao.parcela).split("/")[0] ===
          String(numeroParcela)
    );

    if (jaExiste) return;

    const novaComissao: Comissao = {
      cliente_id: Number(item.cliente_id),
      parcela: `${numeroParcela}/${quantidadeComissao}`,
      valor: valorComissao,
      vencimento: item.data_pagamento,
      status: "Em Aberto",
      data_pagamento: "",
      observacoes: `Comissão de ${percentual}% referente à parcela ${item.parcela}.`,
    };

    const { error } = await supabase
      .from("comissoes")
      .insert([novaComissao]);

    if (error) {
      console.error("Erro ao registrar comissão:", error);
    }
  }

  async function darBaixaComissao(comissao: Comissao) {
    if (!comissao.id) return;

    const hoje = new Date();
    const dataHoje = `${hoje.getFullYear()}-${String(
      hoje.getMonth() + 1
    ).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;

    try {
      const { error } = await supabase
        .from("comissoes")
        .update({
          status: "Pago",
          data_pagamento: dataHoje,
        })
        .eq("id", comissao.id);

      if (error) throw error;

      await carregarDados();

      alert("Comissão baixada com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao baixar comissão.");
    }
  }

  async function excluirComissao(idComissao: number) {
    if (!confirm("Deseja excluir esta comissão?")) return;

    try {
      const { error } = await supabase
        .from("comissoes")
        .delete()
        .eq("id", idComissao);

      if (error) throw error;

      await carregarDados();
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir comissão.");
    }
  }

  async function salvar() {
    if (!proposta.trim()) {
      alert("Informe o número da proposta.");
      return;
    }

    if (!instituicao.trim()) {
      alert("Informe a instituição.");
      return;
    }

    const cliente: ClienteComFinanceiro = {
      proposta: Number(proposta),
      instituicao,
      responsavel,
      telefone,
      email,
      contrato,
      valor_parcela: converterValor(valorParcela),
      quantidade_parcelas: Number(quantidadeParcelas),
      parcela_atual: parcelaAtual,
      dia_vencimento: Number(diaVencimento),
      inicio_vigencia: inicioVigencia,
      fim_vigencia: fimVigencia,
      grupo_whatsapp: grupoWhatsapp,
      pasta_documentos: pastaDocumentos,
      consultor,
      observacoes,
      comissao_percentual: Number(comissaoPercentual || 0),
      comissao_parcelas: Number(comissaoParcelas || 1),
    };

    try {
      setCarregando(true);

      if (id) {
        await atualizarCliente({
          id,
          ...cliente,
        });

        alert("Cliente atualizado!");
      } else {
        await salvarCliente(cliente);
        alert("Cliente salvo!");
      }

      limparFormulario();
      await carregarDados();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar o cliente.");
    } finally {
      setCarregando(false);
    }
  }

  function editar(cliente: ClienteComFinanceiro) {
    setId(cliente.id);

    setProposta(String(cliente.proposta || ""));
    setInstituicao(cliente.instituicao || "");
    setResponsavel(cliente.responsavel || "");
    setTelefone(cliente.telefone || "");
    setEmail(cliente.email || "");

    setContrato(cliente.contrato || "");
    setValorParcela(
      Number(cliente.valor_parcela || 0).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })
    );
    setQuantidadeParcelas(
      String(cliente.quantidade_parcelas || "")
    );
    setParcelaAtual(cliente.parcela_atual || "");

    setDiaVencimento(String(cliente.dia_vencimento || ""));
    setInicioVigencia(cliente.inicio_vigencia || "");
    setFimVigencia(cliente.fim_vigencia || "");

    setGrupoWhatsapp(cliente.grupo_whatsapp || "");
    setPastaDocumentos(cliente.pasta_documentos || "");
    setConsultor(cliente.consultor || "");
    setObservacoes(cliente.observacoes || "");

    setComissaoPercentual(
      String(cliente.comissao_percentual || "")
    );
    setComissaoParcelas(
      String(cliente.comissao_parcelas || 1)
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function excluir(idCliente: number) {
    if (!confirm("Deseja excluir este cliente?")) return;

    try {
      await excluirCliente(idCliente);

      if (clienteSelecionado?.id === idCliente) {
        setClienteSelecionado(null);
      }

      await carregarDados();
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir o cliente.");
    }
  }

  function limparFormulario() {
    setId(undefined);

    setProposta("");
    setInstituicao("");
    setResponsavel("");
    setTelefone("");
    setEmail("");

    setContrato("");
    setValorParcela("");
    setQuantidadeParcelas("");
    setParcelaAtual("");

    setDiaVencimento("");
    setInicioVigencia("");
    setFimVigencia("");

    setGrupoWhatsapp("");
    setPastaDocumentos("");
    setConsultor("");
    setObservacoes("");

    setComissaoPercentual("");
    setComissaoParcelas("1");
  }

  const clientesFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    if (!termo) return clientes;

    return clientes.filter((cliente) => {
      return (
        String(cliente.proposta || "")
          .toLowerCase()
          .includes(termo) ||
        cliente.instituicao
          ?.toLowerCase()
          .includes(termo) ||
        cliente.responsavel
          ?.toLowerCase()
          .includes(termo) ||
        cliente.consultor
          ?.toLowerCase()
          .includes(termo)
      );
    });
  }, [clientes, busca]);

  const resumoSelecionado = clienteSelecionado
    ? resumoCliente(clienteSelecionado)
    : null;

  const comissoesSelecionadas = clienteSelecionado?.id
    ? obterComissoesCliente(clienteSelecionado.id)
    : [];

  const totalComissaoAberta = comissoesSelecionadas
    .filter(
      (item) => item.status.toLowerCase() === "em aberto"
    )
    .reduce((total, item) => total + Number(item.valor || 0), 0);

  const totalComissaoPaga = comissoesSelecionadas
    .filter(
      (item) =>
        item.status.toLowerCase() === "pago" ||
        item.status.toLowerCase() === "recebido"
    )
    .reduce((total, item) => total + Number(item.valor || 0), 0);

  return (
    <div
      style={{
        padding: 25,
        fontFamily: "Arial",
        background: "#f5f7fa",
        minHeight: "100vh",
      }}
    >
      <h2>👥 Cadastro de Clientes</h2>

      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          marginBottom: 25,
        }}
      >
        <h3>{id ? "✏️ Editar Cliente" : "➕ Novo Cliente"}</h3>

        <p>Nº da Proposta</p>

        <input
          value={proposta}
          onChange={(e) => setProposta(e.target.value)}
          style={{ width: 200, padding: 8 }}
        />

        <p>Instituição</p>

        <input
          value={instituicao}
          onChange={(e) => setInstituicao(e.target.value)}
          style={{ width: 400, padding: 8 }}
        />

        <p>Responsável</p>

        <input
          value={responsavel}
          onChange={(e) => setResponsavel(e.target.value)}
          style={{ width: 400, padding: 8 }}
        />

        <p>Telefone</p>

        <input
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          style={{ width: 250, padding: 8 }}
        />

        <p>E-mail</p>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: 400, padding: 8 }}
        />

        <hr />

        <h3>📄 Contrato</h3>

        <p>Nº do Contrato</p>

        <input
          value={contrato}
          onChange={(e) => setContrato(e.target.value)}
          style={{ width: 250, padding: 8 }}
        />

        <p>Valor da Parcela</p>

        <input
          type="text"
          value={valorParcela}
          onChange={(e) => setValorParcela(e.target.value)}
          placeholder="Ex.: 3.750,00"
          style={{ width: 180, padding: 8 }}
        />

        <p>Quantidade de Parcelas</p>

        <input
          type="number"
          value={quantidadeParcelas}
          onChange={(e) =>
            setQuantidadeParcelas(e.target.value)
          }
          style={{ width: 180, padding: 8 }}
        />

        <p>Parcela Atual</p>

        <input
          value={parcelaAtual}
          onChange={(e) => setParcelaAtual(e.target.value)}
          placeholder="Ex.: 1/12"
          style={{ width: 180, padding: 8 }}
        />

        <p>Dia do Vencimento</p>

        <input
          type="number"
          value={diaVencimento}
          onChange={(e) =>
            setDiaVencimento(e.target.value)
          }
          style={{ width: 120, padding: 8 }}
        />

        <p>Início da Vigência</p>

        <input
          type="date"
          value={inicioVigencia}
          onChange={(e) =>
            setInicioVigencia(e.target.value)
          }
        />

        <p>Fim da Vigência</p>

        <input
          type="date"
          value={fimVigencia}
          onChange={(e) =>
            setFimVigencia(e.target.value)
          }
        />

        <hr />

        <h3>💰 Comissão do Consultor</h3>

        <p>Percentual da Comissão</p>

        <input
          type="number"
          min="0"
          step="0.01"
          value={comissaoPercentual}
          onChange={(e) =>
            setComissaoPercentual(e.target.value)
          }
          placeholder="Ex.: 10"
          style={{ width: 150, padding: 8 }}
        />

        <span style={{ marginLeft: 8 }}>%</span>

        <p>Quantidade de parcelas da comissão</p>

        <input
          type="number"
          min="1"
          value={comissaoParcelas}
          onChange={(e) =>
            setComissaoParcelas(e.target.value)
          }
          style={{ width: 150, padding: 8 }}
        />

        <hr />

        <h3>📌 Informações Adicionais</h3>

        <p>Grupo WhatsApp</p>

        <input
          value={grupoWhatsapp}
          onChange={(e) =>
            setGrupoWhatsapp(e.target.value)
          }
          style={{ width: 400, padding: 8 }}
        />

        <p>Pasta de Documentos</p>

        <input
          value={pastaDocumentos}
          onChange={(e) =>
            setPastaDocumentos(e.target.value)
          }
          style={{ width: 400, padding: 8 }}
        />

        <p>Consultor</p>

        <input
          value={consultor}
          onChange={(e) => setConsultor(e.target.value)}
          style={{ width: 300, padding: 8 }}
        />

        <p>Observações</p>

        <textarea
          value={observacoes}
          onChange={(e) =>
            setObservacoes(e.target.value)
          }
          rows={4}
          style={{ width: 500, padding: 8 }}
        />

        <br />
        <br />

        <button
          onClick={salvar}
          disabled={carregando}
          style={{
            padding: "10px 20px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          {carregando
            ? "Salvando..."
            : id
            ? "Atualizar Cliente"
            : "Salvar Cliente"}
        </button>

        {id && (
          <button
            style={{
              marginLeft: 10,
              padding: "10px 20px",
            }}
            onClick={limparFormulario}
          >
            Cancelar
          </button>
        )}
      </div>

      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <h2>👥 Clientes Cadastrados</h2>

        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="🔎 Pesquisar instituição, proposta, responsável ou consultor..."
          style={{
            width: "100%",
            maxWidth: 600,
            padding: 12,
            marginBottom: 20,
            border: "1px solid #ccc",
            borderRadius: 8,
          }}
        />

        {clientesFiltrados.length === 0 ? (
          <p>Nenhum cliente encontrado.</p>
        ) : (
          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 950,
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#1f2937",
                    color: "#fff",
                  }}
                >
                  <th style={{ padding: 12 }}>Proposta</th>
                  <th style={{ padding: 12 }}>Cliente</th>
                  <th style={{ padding: 12 }}>Consultor</th>
                  <th style={{ padding: 12 }}>Contrato</th>
                  <th style={{ padding: 12 }}>Parcelas</th>
                  <th style={{ padding: 12 }}>Recebido</th>
                  <th style={{ padding: 12 }}>A receber</th>
                  <th style={{ padding: 12 }}>Ações</th>
                </tr>
              </thead>

              <tbody>
                {clientesFiltrados.map((cliente) => {
                  const resumo = resumoCliente(cliente);

                  return (
                    <tr
                      key={cliente.id}
                      style={{
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      <td style={{ padding: 12 }}>
                        <strong>{cliente.proposta}</strong>
                      </td>

                      <td style={{ padding: 12 }}>
                        <strong>
                          {cliente.instituicao}
                        </strong>
                        <br />
                        <small>
                          {cliente.responsavel}
                        </small>
                      </td>

                      <td style={{ padding: 12 }}>
                        {cliente.consultor || "-"}
                      </td>

                      <td style={{ padding: 12 }}>
                        {formatarMoeda(resumo.total)}
                      </td>

                      <td style={{ padding: 12 }}>
                        🟢 {resumo.pagas} pagas
                        <br />
                        🟠 {resumo.abertas} abertas
                        {resumo.atrasadas > 0 && (
                          <>
                            <br />
                            🔴 {resumo.atrasadas} atrasadas
                          </>
                        )}
                      </td>

                      <td
                        style={{
                          padding: 12,
                          color: "#15803d",
                          fontWeight: "bold",
                        }}
                      >
                        {formatarMoeda(resumo.recebido)}
                      </td>

                      <td
                        style={{
                          padding: 12,
                          color: "#b45309",
                          fontWeight: "bold",
                        }}
                      >
                        {formatarMoeda(resumo.aberto)}
                      </td>

                      <td style={{ padding: 12 }}>
                        <button
                          onClick={() =>
                            setClienteSelecionado(cliente)
                          }
                          style={{
                            background: "#2563eb",
                            color: "#fff",
                            border: "none",
                            borderRadius: 5,
                            padding: "7px 10px",
                            marginRight: 5,
                            cursor: "pointer",
                          }}
                        >
                          💰 Financeiro
                        </button>

                        <button
                          onClick={() => editar(cliente)}
                          style={{
                            marginRight: 5,
                          }}
                        >
                          ✏️
                        </button>

                        <button
                          onClick={() =>
                            excluir(cliente.id!)
                          }
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {clienteSelecionado && resumoSelecionado && (
        <div
          style={{
            marginTop: 25,
            background: "#fff",
            padding: 25,
            borderRadius: 12,
            boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 15,
            }}
          >
            <div>
              <h2>
                💰 Financeiro —{" "}
                {clienteSelecionado.instituicao}
              </h2>

              <p>
                Proposta:{" "}
                <strong>
                  {clienteSelecionado.proposta}
                </strong>
              </p>
            </div>

            <button
              onClick={() =>
                setClienteSelecionado(null)
              }
            >
              ✖ Fechar
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
              marginTop: 20,
            }}
          >
            <div
              style={{
                padding: 18,
                background: "#eef2ff",
                borderRadius: 10,
              }}
            >
              <strong>Total do contrato</strong>
              <h3>
                {formatarMoeda(resumoSelecionado.total)}
              </h3>
            </div>

            <div
              style={{
                padding: 18,
                background: "#ecfdf5",
                borderRadius: 10,
              }}
            >
              <strong>Recebido</strong>
              <h3
                style={{
                  color: "#15803d",
                }}
              >
                {formatarMoeda(
                  resumoSelecionado.recebido
                )}
              </h3>
            </div>

            <div
              style={{
                padding: 18,
                background: "#fff7ed",
                borderRadius: 10,
              }}
            >
              <strong>A receber</strong>
              <h3
                style={{
                  color: "#b45309",
                }}
              >
                {formatarMoeda(
                  resumoSelecionado.aberto
                )}
              </h3>
            </div>

            <div
              style={{
                padding: 18,
                background: "#f3f4f6",
                borderRadius: 10,
              }}
            >
              <strong>Situação</strong>
              <h3>
                {resumoSelecionado.pagas}/
                {clienteSelecionado.quantidade_parcelas}
              </h3>
              <small>parcelas pagas</small>
            </div>
          </div>

          <hr />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 15,
              flexWrap: "wrap",
            }}
          >
            <h3>📋 Parcelas</h3>

            <button
              onClick={() =>
                gerarParcelas(clienteSelecionado)
              }
              disabled={carregando}
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                padding: "9px 14px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              ➕ Gerar parcelas
            </button>
          </div>

          {resumoSelecionado.parcelas.length === 0 ? (
            <div
              style={{
                padding: 20,
                background: "#f9fafb",
                borderRadius: 8,
              }}
            >
              <p>
                Nenhuma parcela foi gerada ainda.
              </p>

              <p>
                Clique em{" "}
                <strong>Gerar parcelas</strong> para
                criar automaticamente as parcelas do
                contrato.
              </p>
            </div>
          ) : (
            <div
              style={{
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: 800,
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f3f4f6",
                    }}
                  >
                    <th style={{ padding: 10 }}>
                      Parcela
                    </th>
                    <th style={{ padding: 10 }}>
                      Valor
                    </th>
                    <th style={{ padding: 10 }}>
                      Vencimento
                    </th>
                    <th style={{ padding: 10 }}>
                      Status
                    </th>
                    <th style={{ padding: 10 }}>
                      Pagamento
                    </th>
                    <th style={{ padding: 10 }}>
                      Ação
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {resumoSelecionado.parcelas.map(
                    (item) => {
                      const recebida =
                        item.status.toLowerCase() ===
                          "recebido" ||
                        item.status.toLowerCase() ===
                          "pago";

                      return (
                        <tr
                          key={item.id}
                          style={{
                            borderBottom:
                              "1px solid #ddd",
                          }}
                        >
                          <td
                            style={{
                              padding: 10,
                              fontWeight: "bold",
                            }}
                          >
                            {item.parcela}
                          </td>

                          <td style={{ padding: 10 }}>
                            {formatarMoeda(item.valor)}
                          </td>

                          <td style={{ padding: 10 }}>
                            {formatarData(
                              item.vencimento
                            )}
                          </td>

                          <td style={{ padding: 10 }}>
                            {recebida ? (
                              <span
                                style={{
                                  color: "#15803d",
                                  fontWeight: "bold",
                                }}
                              >
                                🟢 Recebido
                              </span>
                            ) : item.status
                                .toLowerCase() ===
                              "atrasado" ? (
                              <span
                                style={{
                                  color: "#dc2626",
                                  fontWeight: "bold",
                                }}
                              >
                                🔴 Atrasado
                              </span>
                            ) : (
                              <span
                                style={{
                                  color: "#b45309",
                                  fontWeight: "bold",
                                }}
                              >
                                🟠 Em Aberto
                              </span>
                            )}
                          </td>

                          <td style={{ padding: 10 }}>
                            {item.data_pagamento
                              ? formatarData(
                                  item.data_pagamento
                                )
                              : "-"}
                          </td>

                          <td style={{ padding: 10 }}>
                            {recebida ? (
                              <button
                                onClick={() =>
                                  reabrirParcela(item)
                                }
                              >
                                ↩ Reabrir
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  darBaixaParcela(
                                    item
                                  )
                                }
                                style={{
                                  background:
                                    "#16a34a",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: 5,
                                  padding:
                                    "7px 10px",
                                  cursor: "pointer",
                                }}
                              >
                                ✅ Dar baixa
                              </button>
                            )}

                            <button
                              onClick={async () => {
                                if (
                                  !item.id ||
                                  !confirm(
                                    `Excluir a parcela ${item.parcela}?`
                                  )
                                )
                                  return;

                                try {
                                  await excluirParcela(
                                    item.id
                                  );
                                  await carregarDados();
                                } catch (error) {
                                  console.error(
                                    error
                                  );
                                  alert(
                                    "Erro ao excluir parcela."
                                  );
                                }
                              }}
                              style={{
                                marginLeft: 5,
                              }}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}

          <hr />

          <h3>💼 Comissão do Consultor</h3>

          <p>
            <strong>Consultor:</strong>{" "}
            {clienteSelecionado.consultor || "-"}
          </p>

          <p>
            <strong>Percentual:</strong>{" "}
            {Number(
              clienteSelecionado.comissao_percentual ||
                0
            )}
            %
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            <div
              style={{
                padding: 15,
                background: "#fef3c7",
                borderRadius: 8,
              }}
            >
              <strong>Comissão em aberto</strong>
              <h3>
                {formatarMoeda(totalComissaoAberta)}
              </h3>
            </div>

            <div
              style={{
                padding: 15,
                background: "#dcfce7",
                borderRadius: 8,
              }}
            >
              <strong>Comissão paga</strong>
              <h3>
                {formatarMoeda(totalComissaoPaga)}
              </h3>
            </div>
          </div>

          {comissoesSelecionadas.length === 0 ? (
            <p>
              Nenhuma comissão registrada ainda.
              <br />
              As comissões serão criadas quando as
              parcelas do cliente forem recebidas.
            </p>
          ) : (
            <div
              style={{
                overflowX: "auto",
                marginTop: 15,
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f3f4f6",
                    }}
                  >
                    <th style={{ padding: 10 }}>
                      Parcela
                    </th>
                    <th style={{ padding: 10 }}>
                      Valor
                    </th>
                    <th style={{ padding: 10 }}>
                      Status
                    </th>
                    <th style={{ padding: 10 }}>
                      Pagamento
                    </th>
                    <th style={{ padding: 10 }}>
                      Ação
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {comissoesSelecionadas.map(
                    (comissao) => (
                      <tr
                        key={comissao.id}
                        style={{
                          borderBottom:
                            "1px solid #ddd",
                        }}
                      >
                        <td style={{ padding: 10 }}>
                          {comissao.parcela}
                        </td>

                        <td style={{ padding: 10 }}>
                          {formatarMoeda(
                            comissao.valor
                          )}
                        </td>

                        <td style={{ padding: 10 }}>
                          {comissao.status}
                        </td>

                        <td style={{ padding: 10 }}>
                          {comissao.data_pagamento
                            ? formatarData(
                                comissao.data_pagamento
                              )
                            : "-"}
                        </td>

                        <td style={{ padding: 10 }}>
                          {comissao.status.toLowerCase() ===
                          "pago" ? (
                            <span>
                              ✅ Pago
                            </span>
                          ) : (
                            <button
                              onClick={() =>
                                darBaixaComissao(
                                  comissao
                                )
                              }
                              style={{
                                background:
                                  "#16a34a",
                                color: "#fff",
                                border: "none",
                                borderRadius: 5,
                                padding:
                                  "7px 10px",
                              }}
                            >
                              💵 Pagar comissão
                            </button>
                          )}

                          {comissao.id && (
                            <button
                              onClick={() =>
                                excluirComissao(
                                  comissao.id!
                                )
                              }
                              style={{
                                marginLeft: 5,
                              }}
                            >
                              🗑️
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}