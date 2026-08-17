import { useEffect, useState } from "react";
import type { Parcela } from "../types/parcela";
import type { Cliente } from "../types/cliente";

import {
  listarParcelas,
  salvarParcela,
  atualizarParcela,
  excluirParcela,
} from "../services/parcelasService";

import { listarClientes } from "../services/clientesService";

export default function Parcelas() {
  const [id, setId] = useState<number | undefined>();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [parcelas, setParcelas] = useState<Parcela[]>([]);

  const [clienteId, setClienteId] = useState("");
  const [proposta, setProposta] = useState("");
  const [parcela, setParcela] = useState("");
  const [valor, setValor] = useState("");
  const [vencimento, setVencimento] = useState("");

  const [status, setStatus] = useState("Em Aberto");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [dataPagamento, setDataPagamento] = useState("");
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const listaClientes = await listarClientes();
      setClientes(listaClientes);

      const listaParcelas = await listarParcelas();
      setParcelas(listaParcelas);
    } catch (error) {
      console.error(error);
    }
  }

  function selecionarCliente(idSelecionado: string) {
    setClienteId(idSelecionado);

    const cliente = clientes.find(
      (c) => c.id === Number(idSelecionado)
    );

    if (!cliente) return;

    setProposta(String(cliente.proposta));
  }

  function limparFormulario() {
    setId(undefined);

    setClienteId("");
    setProposta("");
    setParcela("");
    setValor("");
    setVencimento("");

    setStatus("Em Aberto");
    setFormaPagamento("");
    setDataPagamento("");
    setObservacoes("");
  }

  async function salvar() {
    if (!clienteId) {
      alert("Selecione um cliente.");
      return;
    }

    if (!parcela.trim()) {
      alert("Informe a parcela.");
      return;
    }

    const dados: Parcela = {
      cliente_id: Number(clienteId),
      proposta: proposta && proposta !== "null" ? Number(proposta) : 0,
      parcela,
      valor: Number(valor),
      vencimento,
      status,
      data_pagamento: dataPagamento,
      forma_pagamento: formaPagamento,
      observacoes,
    };

    try {
      if (id) {
        await atualizarParcela({
          id,
          ...dados,
        });

        alert("Parcela atualizada com sucesso!");
      } else {
        await salvarParcela(dados);

        alert("Parcela salva com sucesso!");
      }

      limparFormulario();

      await carregarDados();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar/atualizar a parcela. Veja o Console (F12).");
    }
  }

  function editar(item: Parcela) {
    setId(item.id);

    setClienteId(String(item.cliente_id ?? ""));
    setProposta(String(item.proposta));

    setParcela(item.parcela);
    setValor(String(item.valor));
    setVencimento(item.vencimento);

    setStatus(item.status);
    setFormaPagamento(item.forma_pagamento ?? "");
    setDataPagamento(item.data_pagamento ?? "");
    setObservacoes(item.observacoes ?? "");
  }

  async function excluir(id: number) {
    if (!confirm("Deseja excluir esta parcela?")) return;

    try {
      await excluirParcela(id);

      alert("Parcela excluída com sucesso!");

      await carregarDados();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Erro ao excluir a parcela.");
    }
  }

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h2>💳 Controle de Parcelas</h2>

      <p>Cliente</p>

      <select
        value={clienteId}
        onChange={(e) => selecionarCliente(e.target.value)}
        style={{ width: 450 }}
      >
        <option value="">Selecione...</option>

        {clientes.map((cliente) => (
          <option key={cliente.id} value={cliente.id}>
            {cliente.proposta} - {cliente.instituicao}
          </option>
        ))}
      </select>

      <p>Proposta</p>

      <input
        value={proposta}
        readOnly
      />

      <p>Parcela</p>

      <input
        value={parcela}
        onChange={(e) => setParcela(e.target.value)}
        placeholder="Ex.: 1/12"
      />

      <p>Valor</p>

      <input
        type="number"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
      />

      <p>Vencimento</p>

      <input
        type="date"
        value={vencimento}
        onChange={(e) => setVencimento(e.target.value)}
      />

      <p>Status</p>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option>Em Aberto</option>
        <option>Recebido</option>
        <option>Atrasado</option>
      </select>

      <p>Data do Pagamento</p>

      <input
        type="date"
        value={dataPagamento}
        onChange={(e) => setDataPagamento(e.target.value)}
      />

      <p>Forma de Pagamento</p>

      <input
        value={formaPagamento}
        onChange={(e) => setFormaPagamento(e.target.value)}
      />

      <p>Observações</p>

      <textarea
        rows={3}
        value={observacoes}
        onChange={(e) => setObservacoes(e.target.value)}
        style={{ width: 500 }}
      />

      <br />
      <br />

      <button onClick={salvar}>
        {id ? "Atualizar Parcela" : "Salvar Parcela"}
      </button>

      {id && (
        <button
          style={{ marginLeft: 10 }}
          onClick={limparFormulario}
        >
          Cancelar
        </button>
      )}

      <hr />

      <h3>Parcelas Cadastradas</h3>

      {parcelas.length === 0 ? (
        <p>Nenhuma parcela cadastrada.</p>
      ) : (
        parcelas.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 12,
              marginBottom: 12,
            }}
          >
            <strong>
              Proposta {item.proposta} - Parcela {item.parcela}
            </strong>

            <br />

            Valor: R$ {Number(item.valor).toFixed(2)}

            <br />

            Vencimento: {item.vencimento}

            <br />

            Status: {item.status}

            {item.data_pagamento && (
              <>
                <br />
                Pago em: {item.data_pagamento}
              </>
            )}

            {item.forma_pagamento && (
              <>
                <br />
                Forma: {item.forma_pagamento}
              </>
            )}

            {item.observacoes && (
              <>
                <br />
                Observações: {item.observacoes}
              </>
            )}

            <br />
            <br />

            <button onClick={() => editar(item)}>
              ✏️ Editar
            </button>

            <button
              style={{ marginLeft: 10 }}
              onClick={() => excluir(item.id!)}
            >
              🗑️ Excluir
            </button>
          </div>
        ))
      )}
    </div>
  );
}