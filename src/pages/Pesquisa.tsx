import { useEffect, useState } from "react";
import type { Cliente } from "../types/cliente";
import { listarClientes } from "../services/clientesService";

export default function Pesquisa() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [texto, setTexto] = useState("");

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const lista = await listarClientes();
    setClientes(lista);
  }

  const resultado = clientes.filter((cliente) => {
    const pesquisa = texto.toLowerCase();

    return (
      cliente.instituicao.toLowerCase().includes(pesquisa) ||
      cliente.responsavel.toLowerCase().includes(pesquisa) ||
      String(cliente.proposta).includes(pesquisa) ||
      cliente.contrato.toLowerCase().includes(pesquisa)
    );
  });

  return (
    <div style={{ padding: 30 }}>
      <h2>🔍 Pesquisa Geral</h2>

      <input
        placeholder="Digite proposta, instituição, responsável ou contrato..."
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        style={{
          width: 500,
          padding: 10,
          fontSize: 16,
        }}
      />

      <br />
      <br />

      {resultado.map((cliente) => (
        <div
          key={cliente.id}
          style={{
            border: "1px solid #ccc",
            padding: 15,
            marginBottom: 10,
            borderRadius: 8,
          }}
        >
          <strong>{cliente.instituicao}</strong>

          <br />

          Proposta: {cliente.proposta}

          <br />

          Contrato: {cliente.contrato}

          <br />

          Responsável: {cliente.responsavel}

          <br />

          Telefone: {cliente.telefone}

          <br />

          Parcela Atual: {cliente.parcela_atual}

          <br />

          Valor Parcela: R$ {cliente.valor_parcela}
        </div>
      ))}
    </div>
  );
}