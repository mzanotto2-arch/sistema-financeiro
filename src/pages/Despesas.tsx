import { useEffect, useState } from "react";
import type { Despesa } from "../types/despesa";
import {
  listarDespesas,
  salvarDespesa,
  atualizarDespesa,
  excluirDespesa,
} from "../services/despesasService";

export default function Despesas() {
  const [id, setId] = useState<number | undefined>();

  const [descricao, setDescricao] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [valor, setValor] = useState("");
  const [vencimento, setVencimento] = useState("");

  const [despesas, setDespesas] = useState<Despesa[]>([]);

  useEffect(() => {
    carregarDespesas();
  }, []);

  async function carregarDespesas() {
    try {
      const lista = await listarDespesas();
      setDespesas(lista);
    } catch (error) {
      console.error(error);
    }
  }

  async function salvar() {
    if (!descricao.trim()) {
      alert("Informe a descrição.");
      return;
    }

    try {
      if (id) {
        await atualizarDespesa({
          id,
          descricao,
          fornecedor,
          valor: Number(valor),
          vencimento,
          status: "Pendente",
          pago: false,
        });

        alert("Despesa atualizada!");
      } else {
        await salvarDespesa({
          descricao,
          fornecedor,
          valor: Number(valor),
          vencimento,
          status: "Pendente",
          pago: false,
        });

        alert("Despesa salva!");
      }

      limparFormulario();

      await carregarDespesas();
    } catch (error: any) {
      alert(error.message);
    }
  }

  function editar(despesa: Despesa) {
    setId(despesa.id);

    setDescricao(despesa.descricao);
    setFornecedor(despesa.fornecedor);
    setValor(String(despesa.valor));
    setVencimento(despesa.vencimento);
  }

  async function excluir(id: number) {
    if (!confirm("Deseja excluir esta despesa?")) return;

    try {
      await excluirDespesa(id);

      await carregarDespesas();
    } catch (error: any) {
      alert(error.message);
    }
  }

  function limparFormulario() {
    setId(undefined);
    setDescricao("");
    setFornecedor("");
    setValor("");
    setVencimento("");
  }

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h2>💸 Cadastro de Despesas</h2>

      <p>Descrição</p>

      <input
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        style={{ width: 350 }}
      />

      <p>Fornecedor</p>

      <input
        value={fornecedor}
        onChange={(e) => setFornecedor(e.target.value)}
        style={{ width: 350 }}
      />

      <p>Valor</p>

      <input
        type="number"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        style={{ width: 350 }}
      />

      <p>Vencimento</p>

      <input
        type="date"
        value={vencimento}
        onChange={(e) => setVencimento(e.target.value)}
        style={{ width: 350 }}
      />

      <br />
      <br />

      <button onClick={salvar}>
        {id ? "Atualizar Despesa" : "Salvar Despesa"}
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

      <h3>Despesas cadastradas</h3>

      {despesas.length === 0 ? (
        <p>Nenhuma despesa cadastrada.</p>
      ) : (
        despesas.map((despesa) => (
          <div
            key={despesa.id}
            style={{
              border: "1px solid #ddd",
              padding: 10,
              marginBottom: 10,
              borderRadius: 8,
            }}
          >
            <strong>{despesa.descricao}</strong>

            <br />

            Fornecedor: {despesa.fornecedor}

            <br />

            Valor: R$ {despesa.valor}

            <br />

            Vencimento: {despesa.vencimento}

            <br />

            Status: {despesa.status}

            <br />

            Pago: {despesa.pago ? "✅ Sim" : "❌ Não"}

            <br />
            <br />

            <button onClick={() => editar(despesa)}>
              ✏️ Editar
            </button>

            <button
              style={{ marginLeft: 10 }}
              onClick={() => excluir(despesa.id!)}
            >
              🗑️ Excluir
            </button>
          </div>
        ))
      )}
    </div>
  );
}