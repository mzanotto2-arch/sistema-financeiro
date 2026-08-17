import { useEffect, useState } from "react";
import type { Receita } from "../types/receita";
import type { Cliente } from "../types/cliente";
import {
  listarReceitas,
  salvarReceita,
  atualizarReceita,
  excluirReceita,
} from "../services/receitasService";
import { listarClientes } from "../services/clientesService";

export default function Receitas() {
  const [id, setId] = useState<number | undefined>();

  const [cliente, setCliente] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [vencimento, setVencimento] = useState("");

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [receitas, setReceitas] = useState<Receita[]>([]);

  useEffect(() => {
    carregarTudo();
  }, []);

  async function carregarTudo() {
    try {
      const listaClientes = await listarClientes();
      setClientes(listaClientes);

      const listaReceitas = await listarReceitas();
      setReceitas(listaReceitas);
    } catch (error) {
      console.error(error);
    }
  }

  async function salvar() {
    if (!cliente) {
      alert("Selecione um cliente.");
      return;
    }

    if (!descricao.trim()) {
      alert("Informe a descrição.");
      return;
    }

    try {
      if (id) {
        await atualizarReceita({
          id,
          cliente,
          descricao,
          valor: Number(valor),
          vencimento,
          status: "Pendente",
          recebido: false,
        });

        alert("Receita atualizada!");
      } else {
        await salvarReceita({
          cliente,
          descricao,
          valor: Number(valor),
          vencimento,
          status: "Pendente",
          recebido: false,
        });

        alert("Receita salva!");
      }

      limparFormulario();

      await carregarTudo();
    } catch (error: any) {
      alert(error.message);
    }
  }

  function editar(receita: Receita) {
    setId(receita.id);

    setCliente(receita.cliente);
    setDescricao(receita.descricao);
    setValor(String(receita.valor));
    setVencimento(receita.vencimento);
  }

  async function excluir(id: number) {
    if (!confirm("Deseja excluir esta receita?")) return;

    try {
      await excluirReceita(id);

      await carregarTudo();
    } catch (error: any) {
      alert(error.message);
    }
  }

  function limparFormulario() {
    setId(undefined);
    setCliente("");
    setDescricao("");
    setValor("");
    setVencimento("");
  }

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h2>💰 Cadastro de Receitas</h2>

      <p>Cliente</p>

      <select
        value={cliente}
        onChange={(e) => setCliente(e.target.value)}
        style={{ width: 350 }}
      >
        <option value="">Selecione...</option>

        {clientes.map((c) => (
          <option key={c.id} value={c.instituicao}>
            {c.instituicao}
          </option>
        ))}
      </select>

      <p>Descrição</p>

      <input
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
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
        {id ? "Atualizar Receita" : "Salvar Receita"}
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

      <h3>Receitas cadastradas</h3>

      {receitas.length === 0 ? (
        <p>Nenhuma receita cadastrada.</p>
      ) : (
        receitas.map((receita) => (
          <div
            key={receita.id}
            style={{
              border: "1px solid #ddd",
              padding: 10,
              borderRadius: 8,
              marginBottom: 10,
            }}
          >
            <strong>{receita.descricao}</strong>

            <br />

            Cliente: {receita.cliente}

            <br />

            Valor: R$ {receita.valor}

            <br />

            Vencimento: {receita.vencimento}

            <br />

            Status: {receita.status}

            <br />

            Recebido: {receita.recebido ? "✅ Sim" : "❌ Não"}

            <br />
            <br />

            <button onClick={() => editar(receita)}>
              ✏️ Editar
            </button>

            <button
              style={{ marginLeft: 10 }}
              onClick={() => excluir(receita.id!)}
            >
              🗑️ Excluir
            </button>
          </div>
        ))
      )}
    </div>
  );
}