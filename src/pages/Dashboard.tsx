import { useEffect, useState } from "react";

export default function Dashboard() {
  const [anotacoes, setAnotacoes] = useState("");

  useEffect(() => {
    const salvo = localStorage.getItem("dashboard_anotacoes");

    if (salvo) {
      setAnotacoes(salvo);
    }
  }, []);

  const salvarAnotacoes = () => {
    localStorage.setItem("dashboard_anotacoes", anotacoes);
    alert("Anotações salvas com sucesso!");
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {/* PAINEL DE ANOTAÇÕES */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "14px",
          padding: "18px 20px",
          boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
          border: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
            marginBottom: "12px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "21px",
                color: "#1f2937",
              }}
            >
              📋 Acompanhamento
            </h2>

            <p
              style={{
                margin: "4px 0 0",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              Pendências, compromissos e documentos que precisam de acompanhamento.
            </p>
          </div>

          <button
            onClick={salvarAnotacoes}
            style={{
              background: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 18px",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            💾 Salvar
          </button>
        </div>

        <textarea
          value={anotacoes}
          onChange={(e) => setAnotacoes(e.target.value)}
          placeholder={`Exemplo:

Grupo 178 | Proposta 0245 | Instrumento 12/2026
• Falta documento da instituição
• Aguardar assinatura
• Conferir parecer
• Prazo: 30/08

Grupo 195 | Proposta 0310
• Documentação entregue
• Falta comprovante`}
          style={{
            width: "100%",
            minHeight: "150px",
            maxHeight: "220px",
            padding: "14px",
            border: "1px solid #cbd5e1",
            borderRadius: "10px",
            fontSize: "14px",
            lineHeight: "1.5",
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "Arial, sans-serif",
            color: "#334155",
          }}
        />
      </div>
    </div>
  );
}