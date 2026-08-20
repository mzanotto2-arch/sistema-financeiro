import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
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

type ClienteComFinanceiro = Cliente;

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

  const [clientes, setClientes] = useState<ClienteComFinanceiro[]>([]);
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [comissoes, setComissoes] = useState<Comissao[]>([]);

  const [busca, setBusca] = useState("");
  const [clienteSelecionado, setClienteSelecionado] =
    useState<ClienteComFinanceiro | null>(null);

  const [carregando, setCarregando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

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

  function calcularDataSemanal(numeroParcela: number) {
    const data = new Date();
    data.setHours(12, 0, 0, 0);
    data.setDate(data.getDate() + (numeroParcela - 1) * 7);

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
  }

  async function gerarPagamentosProfissional() {
    if (!clienteSelecionado?.id) return;

    const existentes = obterComissoesCliente(clienteSelecionado.id);

    if (existentes.length > 0) {
      alert(
        "Este contrato já possui pagamentos do profissional cadastrados. Para gerar novamente, exclua primeiro os pagamentos existentes."
      );
      return;
    }

    const valorInformado = prompt(
      "Qual é o valor TOTAL que será pago ao profissional?\n\nEx.: 1.000,00"
    );

    if (valorInformado === null) return;

    const total = converterValor(valorInformado);

    if (total <= 0) {
      alert("Informe um valor total válido.");
      return;
    }

    const quantidadeInformada = prompt(
      "Em quantas parcelas semanais o profissional receberá?\n\nEx.: 7"
    );

    if (quantidadeInformada === null) return;

    const quantidade = Number(quantidadeInformada);

    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      alert("Informe uma quantidade de parcelas válida.");
      return;
    }

    const totalCentavos = Math.round(total * 100);
    const valorBaseCentavos = Math.floor(totalCentavos / quantidade);
    const restoCentavos = totalCentavos % quantidade;

    try {
      setCarregando(true);

      for (let numero = 1; numero <= quantidade; numero++) {
        const valorCentavos =
          valorBaseCentavos + (numero <= restoCentavos ? 1 : 0);

        const novaComissao: Comissao = {
  cliente_id: clienteSelecionado.id,
  parcela: `${numero}/${quantidade}`,
  valor: valorCentavos / 100,
  vencimento: calcularDataSemanal(numero),
  status: "Em Aberto",
  observacoes: `Pagamento semanal do profissional ${clienteSelecionado.consultor || ""}. Total do contrato: ${formatarMoeda(total)}.`,
};

        const { error } = await supabase
          .from("comissoes")
          .insert([novaComissao]);

        if (error) throw error;
      }

      await carregarDados();

      alert(
        `Pagamentos gerados com sucesso!\n\nTotal: ${formatarMoeda(total)}\nParcelas: ${quantidade}\nPagamento: semanal`
      );
    } catch (error) {
      console.error("Erro ao gerar pagamentos do profissional:", error);
      alert("Erro ao gerar os pagamentos do profissional.");
    } finally {
      setCarregando(false);
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

  async function reabrirComissao(comissao: Comissao) {
    if (!comissao.id) return;

    if (!confirm(`Reabrir o pagamento ${comissao.parcela}?`)) return;

    try {
      const { error } = await supabase
        .from("comissoes")
        .update({
          status: "Em Aberto",
          data_pagamento: null,
        })
        .eq("id", comissao.id);

      if (error) throw error;

      await carregarDados();
      alert("Pagamento reaberto.");
    } catch (error) {
      console.error(error);
      alert("Erro ao reabrir o pagamento.");
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
    setMostrarFormulario(true);
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
    setMostrarFormulario(false);

  }

  const clientesFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    if (!termo) return clientes;

    return clientes.filter((cliente) => {
      return (
        String(cliente.proposta ?? "").toLowerCase().includes(termo) ||
        String(cliente.instituicao ?? "").toLowerCase().includes(termo) ||
        String(cliente.responsavel ?? "").toLowerCase().includes(termo) ||
        String(cliente.consultor ?? "").toLowerCase().includes(termo) ||
        String(cliente.telefone ?? "").toLowerCase().includes(termo) ||
        String(cliente.email ?? "").toLowerCase().includes(termo)
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
    .filter((item) => item.status.toLowerCase() === "em aberto")
    .reduce((total, item) => total + Number(item.valor || 0), 0);

  const totalComissaoPaga = comissoesSelecionadas
    .filter(
      (item) =>
        item.status.toLowerCase() === "pago" ||
        item.status.toLowerCase() === "recebido"
    )
    .reduce((total, item) => total + Number(item.valor || 0), 0);

  const totalContratos = clientes.reduce(
    (total, cliente) => total + resumoCliente(cliente).total,
    0
  );

  const totalRecebido = clientes.reduce(
    (total, cliente) => total + resumoCliente(cliente).recebido,
    0
  );

  const totalAberto = clientes.reduce(
    (total, cliente) => total + resumoCliente(cliente).aberto,
    0
  );

  const clientesExibidos = clientesFiltrados;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
        color: "#1f2937",
      }}
    >
      {/* CABEÇALHO */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 18,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 26 }}>👥 Clientes</h2>
          <p style={{ margin: "6px 0 0", color: "#64748b" }}>
            Cadastro, contratos e acompanhamento financeiro em um só lugar.
          </p>
        </div>

        <button
          onClick={() => {
            if (mostrarFormulario) {
              limparFormulario();
            } else {
              setId(undefined);
              setMostrarFormulario(true);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "12px 18px",
            fontWeight: "bold",
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          ➕ {id ? "Novo Cliente" : "Novo Cliente"}
        </button>
      </div>

      {/* RESUMO */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <div style={{ background: "#fff", borderRadius: 10, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
          <div style={{ color: "#64748b", fontSize: 13 }}>CLIENTES</div>
          <strong style={{ fontSize: 24 }}>{clientes.length}</strong>
        </div>

        <div style={{ background: "#fff", borderRadius: 10, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
          <div style={{ color: "#64748b", fontSize: 13 }}>TOTAL DOS CONTRATOS</div>
          <strong style={{ fontSize: 21 }}>{formatarMoeda(totalContratos)}</strong>
        </div>

        <div style={{ background: "#ecfdf5", borderRadius: 10, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
          <div style={{ color: "#15803d", fontSize: 13 }}>RECEBIDO</div>
          <strong style={{ fontSize: 21, color: "#15803d" }}>{formatarMoeda(totalRecebido)}</strong>
        </div>

        <div style={{ background: "#fff7ed", borderRadius: 10, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
          <div style={{ color: "#b45309", fontSize: 13 }}>A RECEBER</div>
          <strong style={{ fontSize: 21, color: "#b45309" }}>{formatarMoeda(totalAberto)}</strong>
        </div>
      </div>

      {/* FORMULÁRIO: SÓ APARECE QUANDO FOR NOVO/EDIÇÃO */}
      {mostrarFormulario && (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 20,
            marginBottom: 18,
            boxShadow: "0 2px 10px rgba(0,0,0,.08)",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              marginBottom: 18,
            }}
          >
            <div>
              <h3 style={{ margin: 0 }}>{id ? "✏️ Editar Cliente" : "➕ Novo Cliente"}</h3>
              <small style={{ color: "#64748b" }}>
                Preencha os dados do cliente e do contrato.
              </small>
            </div>

            <button
              onClick={limparFormulario}
              style={{
                border: "1px solid #cbd5e1",
                background: "#fff",
                borderRadius: 7,
                padding: "8px 12px",
                cursor: "pointer",
              }}
            >
              ✖ Fechar
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            <label>
              <span>Nº da Proposta</span>
              <input
                value={proposta}
                onChange={(e) => setProposta(e.target.value)}
                style={inputStyle}
              />
            </label>

            <label style={{ gridColumn: "span 2" }}>
              <span>Instituição</span>
              <input
                value={instituicao}
                onChange={(e) => setInstituicao(e.target.value)}
                style={inputStyle}
              />
            </label>

            <label>
              <span>Responsável</span>
              <input
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                style={inputStyle}
              />
            </label>

            <label>
              <span>Telefone</span>
              <input
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                style={inputStyle}
              />
            </label>

            <label style={{ gridColumn: "span 2" }}>
              <span>E-mail</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />
            </label>
          </div>

          <hr style={{ margin: "20px 0", border: 0, borderTop: "1px solid #e5e7eb" }} />

          <h3 style={{ margin: "0 0 12px" }}>📄 Contrato</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 12,
            }}
          >
            <label>
              <span>Nº do Contrato</span>
              <input value={contrato} onChange={(e) => setContrato(e.target.value)} style={inputStyle} />
            </label>

            <label>
              <span>Valor da Parcela</span>
              <input
                type="text"
                value={valorParcela}
                onChange={(e) => setValorParcela(e.target.value)}
                placeholder="Ex.: 3.750,00"
                style={inputStyle}
              />
            </label>

            <label>
              <span>Quantidade de Parcelas</span>
              <input
                type="number"
                value={quantidadeParcelas}
                onChange={(e) => setQuantidadeParcelas(e.target.value)}
                style={inputStyle}
              />
            </label>

            <label>
              <span>Parcela Atual</span>
              <input
                value={parcelaAtual}
                onChange={(e) => setParcelaAtual(e.target.value)}
                placeholder="Ex.: 1/12"
                style={inputStyle}
              />
            </label>

            <label>
              <span>Dia do Vencimento</span>
              <input
                type="number"
                value={diaVencimento}
                onChange={(e) => setDiaVencimento(e.target.value)}
                style={inputStyle}
              />
            </label>

            <label>
              <span>Início da Vigência</span>
              <input
                type="date"
                value={inicioVigencia}
                onChange={(e) => setInicioVigencia(e.target.value)}
                style={inputStyle}
              />
            </label>

            <label>
              <span>Fim da Vigência</span>
              <input
                type="date"
                value={fimVigencia}
                onChange={(e) => setFimVigencia(e.target.value)}
                style={inputStyle}
              />
            </label>

            <label>
              <span>Consultor</span>
              <input
                value={consultor}
                onChange={(e) => setConsultor(e.target.value)}
                style={inputStyle}
              />
            </label>

            <label>
              <span>Grupo WhatsApp</span>
              <input
                value={grupoWhatsapp}
                onChange={(e) => setGrupoWhatsapp(e.target.value)}
                style={inputStyle}
              />
            </label>

            <label style={{ gridColumn: "span 2" }}>
              <span>Pasta de Documentos</span>
              <input
                value={pastaDocumentos}
                onChange={(e) => setPastaDocumentos(e.target.value)}
                style={inputStyle}
              />
            </label>

            <label style={{ gridColumn: "1 / -1" }}>
              <span>Observações</span>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </label>
          </div>

          <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={salvar}
              disabled={carregando}
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 7,
                padding: "10px 18px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {carregando ? "Salvando..." : id ? "Atualizar Cliente" : "Salvar Cliente"}
            </button>

            {id && (
              <button
                onClick={limparFormulario}
                style={{
                  background: "#fff",
                  border: "1px solid #cbd5e1",
                  borderRadius: 7,
                  padding: "10px 18px",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}

      {/* LISTA PRINCIPAL */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 2px 10px rgba(0,0,0,.08)",
          border: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 15,
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>📋 Clientes cadastrados</h2>
            <small style={{ color: "#64748b" }}>
              {clientesExibidos.length} cliente(s) encontrado(s)
            </small>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: 1, justifyContent: "flex-end" }}>
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="🔎 Pesquisar instituição, proposta, responsável ou consultor..."
              style={{
                width: "min(600px, 100%)",
                minWidth: 260,
                padding: 11,
                border: "1px solid #cbd5e1",
                borderRadius: 8,
              }}
            />
          </div>
        </div>

        {clientesExibidos.length === 0 ? (
          <div
            style={{
              padding: 35,
              textAlign: "center",
              background: "#f8fafc",
              borderRadius: 10,
              color: "#64748b",
            }}
          >
            {clientes.length === 0
              ? "Nenhum cliente cadastrado. Clique em “Novo Cliente” para começar."
              : "Nenhum cliente encontrado para esta pesquisa."}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 1050,
              }}
            >
              <thead>
                <tr style={{ background: "#1f2937", color: "#fff" }}>
                  <th style={thStyle}>Proposta</th>
                  <th style={thStyle}>Cliente</th>
                  <th style={thStyle}>Consultor</th>
                  <th style={thStyle}>Contrato</th>
                  <th style={thStyle}>Parcelas</th>
                  <th style={thStyle}>Recebido</th>
                  <th style={thStyle}>A receber</th>
                  <th style={thStyle}>Ações</th>
                </tr>
              </thead>

              <tbody>
                {clientesExibidos.map((cliente) => {
                  const resumo = resumoCliente(cliente);

                  return (
                    <tr key={cliente.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={tdStyle}>
                        <strong>{cliente.proposta}</strong>
                      </td>

                      <td style={tdStyle}>
                        <strong>{cliente.instituicao}</strong>
                        <br />
                        <small style={{ color: "#64748b" }}>{cliente.responsavel || "-"}</small>
                      </td>

                      <td style={tdStyle}>{cliente.consultor || "-"}</td>

                      <td style={tdStyle}>
                        <strong>{formatarMoeda(resumo.total)}</strong>
                      </td>

                      <td style={tdStyle}>
                        <span style={{ color: "#15803d", fontWeight: "bold" }}>
                          🟢 {resumo.pagas}
                        </span>{" "}
                        /{" "}
                        <span style={{ color: "#b45309", fontWeight: "bold" }}>
                          🟠 {resumo.abertas}
                        </span>
                        {resumo.atrasadas > 0 && (
                          <>
                            {" "}
                            /{" "}
                            <span style={{ color: "#dc2626", fontWeight: "bold" }}>
                              🔴 {resumo.atrasadas}
                            </span>
                          </>
                        )}
                      </td>

                      <td style={{ ...tdStyle, color: "#15803d", fontWeight: "bold" }}>
                        {formatarMoeda(resumo.recebido)}
                      </td>

                      <td style={{ ...tdStyle, color: "#b45309", fontWeight: "bold" }}>
                        {formatarMoeda(resumo.aberto)}
                      </td>

                      <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                        <button
                          onClick={() => setClienteSelecionado(cliente)}
                          style={{
                            background: "#2563eb",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            padding: "7px 10px",
                            cursor: "pointer",
                            marginRight: 5,
                          }}
                        >
                          💰 Financeiro
                        </button>

                        <button
                          onClick={() => editar(cliente)}
                          title="Editar cliente"
                          style={{ padding: "7px 9px", marginRight: 5, cursor: "pointer" }}
                        >
                          ✏️
                        </button>

                        <button
                          onClick={() => excluir(cliente.id!)}
                          title="Excluir cliente"
                          style={{ padding: "7px 9px", cursor: "pointer" }}
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

      {/* FINANCEIRO DO CLIENTE SELECIONADO */}
      {clienteSelecionado && resumoSelecionado && (
        <div
          style={{
            marginTop: 18,
            background: "#fff",
            padding: 20,
            borderRadius: 12,
            boxShadow: "0 2px 10px rgba(0,0,0,.10)",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 15,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2 style={{ margin: 0 }}>
                💰 Financeiro — {clienteSelecionado.instituicao}
              </h2>
              <p style={{ margin: "5px 0", color: "#64748b" }}>
                Proposta: <strong>{clienteSelecionado.proposta}</strong>
              </p>
            </div>

            <button
              onClick={() => setClienteSelecionado(null)}
              style={{
                border: "1px solid #cbd5e1",
                background: "#fff",
                borderRadius: 7,
                padding: "8px 12px",
                cursor: "pointer",
              }}
            >
              ✖ Fechar financeiro
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
              marginTop: 18,
            }}
          >
            <div style={{ padding: 16, background: "#eef2ff", borderRadius: 10 }}>
              <small>Total do contrato</small>
              <h3>{formatarMoeda(resumoSelecionado.total)}</h3>
            </div>

            <div style={{ padding: 16, background: "#ecfdf5", borderRadius: 10 }}>
              <small>Recebido</small>
              <h3 style={{ color: "#15803d" }}>{formatarMoeda(resumoSelecionado.recebido)}</h3>
            </div>

            <div style={{ padding: 16, background: "#fff7ed", borderRadius: 10 }}>
              <small>A receber</small>
              <h3 style={{ color: "#b45309" }}>{formatarMoeda(resumoSelecionado.aberto)}</h3>
            </div>

            <div style={{ padding: 16, background: "#f3f4f6", borderRadius: 10 }}>
              <small>Situação</small>
              <h3>
                {resumoSelecionado.pagas}/{clienteSelecionado.quantidade_parcelas}
              </h3>
              <small>parcelas pagas</small>
            </div>
          </div>

          <hr style={{ margin: "20px 0", border: 0, borderTop: "1px solid #e5e7eb" }} />

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <h3 style={{ margin: 0 }}>📋 Parcelas</h3>

            <button
              onClick={() => gerarParcelas(clienteSelecionado)}
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
            <div style={{ padding: 20, background: "#f8fafc", borderRadius: 8, marginTop: 12 }}>
              <p style={{ marginTop: 0 }}>Nenhuma parcela foi gerada ainda.</p>
              <p style={{ marginBottom: 0 }}>
                Clique em <strong>Gerar parcelas</strong> para criar automaticamente as parcelas do contrato.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto", marginTop: 12 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                <thead>
                  <tr style={{ background: "#f3f4f6" }}>
                    <th style={thStyle}>Parcela</th>
                    <th style={thStyle}>Valor</th>
                    <th style={thStyle}>Vencimento</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Pagamento</th>
                    <th style={thStyle}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {resumoSelecionado.parcelas.map((item) => {
                    const recebida =
                      item.status.toLowerCase() === "recebido" ||
                      item.status.toLowerCase() === "pago";

                    return (
                      <tr key={item.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <td style={tdStyle}><strong>{item.parcela}</strong></td>
                        <td style={tdStyle}>{formatarMoeda(item.valor)}</td>
                        <td style={tdStyle}>{formatarData(item.vencimento)}</td>
                        <td style={tdStyle}>
                          {recebida ? (
                            <span style={{ color: "#15803d", fontWeight: "bold" }}>🟢 Recebido</span>
                          ) : item.status.toLowerCase() === "atrasado" ? (
                            <span style={{ color: "#dc2626", fontWeight: "bold" }}>🔴 Atrasado</span>
                          ) : (
                            <span style={{ color: "#b45309", fontWeight: "bold" }}>🟠 Em Aberto</span>
                          )}
                        </td>
                        <td style={tdStyle}>
                          {item.data_pagamento ? formatarData(item.data_pagamento) : "-"}
                        </td>
                        <td style={tdStyle}>
                          {recebida ? (
                            <button onClick={() => reabrirParcela(item)}>↩ Reabrir</button>
                          ) : (
                            <button
                              onClick={() => darBaixaParcela(item)}
                              style={{
                                background: "#16a34a",
                                color: "#fff",
                                border: "none",
                                borderRadius: 5,
                                padding: "7px 10px",
                                cursor: "pointer",
                              }}
                            >
                              ✅ Dar baixa
                            </button>
                          )}

                          <button
                            onClick={async () => {
                              if (!item.id || !confirm(`Excluir a parcela ${item.parcela}?`)) return;
                              try {
                                await excluirParcela(item.id);
                                await carregarDados();
                              } catch (error) {
                                console.error(error);
                                alert("Erro ao excluir parcela.");
                              }
                            }}
                            style={{ marginLeft: 5 }}
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

          <hr style={{ margin: "20px 0", border: 0, borderTop: "1px solid #e5e7eb" }} />

          <h3>💼 Pagamento do Profissional</h3>
          <p style={{ color: "#64748b" }}>
            <strong>Profissional:</strong>{" "}
            {clienteSelecionado.consultor || "Não informado"}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
              marginBottom: 15,
            }}
          >
            <div style={{ padding: 15, background: "#eef2ff", borderRadius: 8 }}>
              <strong>Total do profissional</strong>
              <h3>
                {formatarMoeda(
                  comissoesSelecionadas.reduce(
                    (total, item) => total + Number(item.valor || 0),
                    0
                  )
                )}
              </h3>
            </div>

            <div style={{ padding: 15, background: "#dcfce7", borderRadius: 8 }}>
              <strong>Total pago</strong>
              <h3 style={{ color: "#15803d" }}>{formatarMoeda(totalComissaoPaga)}</h3>
            </div>

            <div style={{ padding: 15, background: "#fff7ed", borderRadius: 8 }}>
              <strong>Total em aberto</strong>
              <h3 style={{ color: "#b45309" }}>{formatarMoeda(totalComissaoAberta)}</h3>
            </div>

            <div style={{ padding: 15, background: "#f3f4f6", borderRadius: 8 }}>
              <strong>Situação</strong>
              <h3>
                {
                  comissoesSelecionadas.filter(
                    (item) =>
                      item.status.toLowerCase() === "pago" ||
                      item.status.toLowerCase() === "recebido"
                  ).length
                }
                /{comissoesSelecionadas.length}
              </h3>
              <small>pagamentos feitos</small>
            </div>
          </div>

          <button
            onClick={gerarPagamentosProfissional}
            disabled={carregando || comissoesSelecionadas.length > 0}
            style={{
              background: comissoesSelecionadas.length > 0 ? "#9ca3af" : "#2563eb",
              color: "#fff",
              border: "none",
              padding: "9px 14px",
              borderRadius: 6,
              cursor: comissoesSelecionadas.length > 0 ? "not-allowed" : "pointer",
              marginBottom: 15,
            }}
          >
            ➕ Gerar pagamentos do profissional
          </button>

          {comissoesSelecionadas.length === 0 ? (
            <div style={{ padding: 20, background: "#f8fafc", borderRadius: 8 }}>
              <p>Nenhum pagamento do profissional foi gerado ainda.</p>
              <p style={{ marginBottom: 0 }}>
                Informe o valor total e a quantidade de parcelas semanais para gerar os pagamentos.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto", marginTop: 10 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                <thead>
                  <tr style={{ background: "#f3f4f6" }}>
                    <th style={thStyle}>Parcela</th>
                    <th style={thStyle}>Valor</th>
                    <th style={thStyle}>Vencimento</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Pagamento</th>
                    <th style={thStyle}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {comissoesSelecionadas.map((comissao) => {
                    const paga =
                      comissao.status.toLowerCase() === "pago" ||
                      comissao.status.toLowerCase() === "recebido";

                    return (
                      <tr key={comissao.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <td style={tdStyle}><strong>{comissao.parcela}</strong></td>
                        <td style={tdStyle}>{formatarMoeda(comissao.valor)}</td>
                        <td style={tdStyle}>{formatarData(comissao.vencimento)}</td>
                        <td style={tdStyle}>
                          {paga ? (
                            <span style={{ color: "#15803d", fontWeight: "bold" }}>🟢 Pago</span>
                          ) : (
                            <span style={{ color: "#b45309", fontWeight: "bold" }}>🟠 Em Aberto</span>
                          )}
                        </td>
                        <td style={tdStyle}>
                          {comissao.data_pagamento ? formatarData(comissao.data_pagamento) : "-"}
                        </td>
                        <td style={tdStyle}>
                          {paga ? (
                            <button onClick={() => reabrirComissao(comissao)}>↩ Reabrir</button>
                          ) : (
                            <button
                              onClick={() => darBaixaComissao(comissao)}
                              style={{
                                background: "#16a34a",
                                color: "#fff",
                                border: "none",
                                borderRadius: 5,
                                padding: "7px 10px",
                                cursor: "pointer",
                              }}
                            >
                              ✅ Dar baixa
                            </button>
                          )}

                          {comissao.id && (
                            <button
                              onClick={() => excluirComissao(comissao.id!)}
                              style={{ marginLeft: 5 }}
                            >
                              🗑️
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 11px",
  marginTop: 5,
  border: "1px solid #cbd5e1",
  borderRadius: 7,
  background: "#fff",
};

const thStyle: CSSProperties = {
  padding: 11,
  textAlign: "left",
  whiteSpace: "nowrap",
};

const tdStyle: CSSProperties = {
  padding: 11,
  verticalAlign: "middle",
};