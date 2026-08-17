import { useEffect, useState } from "react";

import { listarClientes } from "../services/clientesService";
import { listarReceitas } from "../services/receitasService";
import { listarDespesas } from "../services/despesasService";
import { listarParcelas } from "../services/parcelasService";

export default function Dashboard() {
  const [clientes, setClientes] = useState(0);
  const [receitas, setReceitas] = useState(0);
  const [despesas, setDespesas] = useState(0);
  const [parcelas, setParcelas] = useState(0);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const listaClientes = await listarClientes();
    const listaReceitas = await listarReceitas();
    const listaDespesas = await listarDespesas();
    const listaParcelas = await listarParcelas();

    setClientes(listaClientes.length);

    setReceitas(
      listaReceitas.reduce((total, item) => total + Number(item.valor), 0)
    );

    setDespesas(
      listaDespesas.reduce((total, item) => total + Number(item.valor), 0)
    );

    setParcelas(listaParcelas.length);
  }

  const saldo = receitas - despesas;

  function card(
    titulo: string,
    valor: string,
    cor: string
  ) {
    return (
      <div
        style={{
          background: cor,
          color: "#fff",
          padding: 20,
          borderRadius: 10,
          width: 220,
          boxShadow: "0 3px 8px rgba(0,0,0,.2)",
        }}
      >
        <h3>{titulo}</h3>

        <h2>{valor}</h2>
      </div>
    );
  }

  return (
    <div>
      <h1>📊 Dashboard</h1>

      <div
        style={{
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
          marginTop: 30,
        }}
      >
        {card("Clientes", String(clientes), "#2563eb")}

        {card(
          "Receitas",
          `R$ ${receitas.toFixed(2)}`,
          "#16a34a"
        )}

        {card(
          "Despesas",
          `R$ ${despesas.toFixed(2)}`,
          "#dc2626"
        )}

        {card(
          "Saldo",
          `R$ ${saldo.toFixed(2)}`,
          "#7c3aed"
        )}

        {card(
          "Parcelas",
          String(parcelas),
          "#ea580c"
        )}
      </div>
    </div>
  );
}