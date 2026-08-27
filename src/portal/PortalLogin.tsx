import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../database/supabase";

export default function PortalLogin() {
  const navigate = useNavigate();

  const [codigoProposta, setCodigoProposta] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    if (!codigoProposta.trim() || !senha.trim()) {
      alert("Digite o código da proposta e a senha.");
      return;
    }

    try {
      setCarregando(true);

      const { data, error } = await supabase.rpc("portal_login", {
        p_codigo_proposta: codigoProposta.trim(),
        p_senha: senha,
      });

      console.log("Resultado do portal_login:", data);
      console.log("Erro do portal_login:", error);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        alert("Código da proposta ou senha inválidos.");
        return;
      }

      const usuario = data[0];

      // Guarda os dados necessários para o Portal
      sessionStorage.setItem(
        "portal_codigo_proposta",
        usuario.codigo_proposta
      );

      sessionStorage.setItem(
        "portal_usuario_id",
        usuario.usuario_id
      );

      sessionStorage.setItem(
        "portal_instituicao_id",
        usuario.instituicao_id
      );

      sessionStorage.setItem(
        "portal_proposta_id",
        usuario.proposta_id
      );

      sessionStorage.setItem(
        "portal_nome_usuario",
        usuario.nome_usuario
      );

      sessionStorage.setItem(
        "portal_nome_instituicao",
        usuario.nome_instituicao
      );

      // Entra somente na área do Portal
      navigate("/portal/documentos");

    } catch (error: any) {
      console.error("Erro no login do portal:", error);
      alert(error.message || "Não foi possível entrar no Portal.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f4f6f9",
        padding: 20,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          padding: 35,
          borderRadius: 14,
          boxShadow: "0 5px 25px rgba(0,0,0,.12)",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: 30,
          }}
        >
          <div
            style={{
              fontSize: 50,
              marginBottom: 10,
            }}
          >
            📁
          </div>

          <h1
            style={{
              margin: 0,
              color: "#1f3c88",
              fontSize: 28,
            }}
          >
            Portal da Instituição
          </h1>

          <p
            style={{
              color: "#64748b",
              marginTop: 8,
            }}
          >
            Envio e acompanhamento de documentos
          </p>
        </div>

        <label
          style={{
            display: "block",
            textAlign: "center",
            fontWeight: 600,
            color: "#334155",
            marginBottom: 8,
          }}
        >
          Código da proposta
        </label>

        <input
          type="text"
          value={codigoProposta}
          onChange={(e) => setCodigoProposta(e.target.value)}
          placeholder="Ex.: 202250 ou PROP-2026-001"
          style={{
            width: "100%",
            padding: 13,
            border: "1px solid #cbd5e1",
            borderRadius: 8,
            boxSizing: "border-box",
            marginBottom: 22,
            fontSize: 15,
          }}
        />

        <label
          style={{
            display: "block",
            textAlign: "center",
            fontWeight: 600,
            color: "#334155",
            marginBottom: 8,
          }}
        >
          Senha
        </label>

        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Digite sua senha"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              entrar();
            }
          }}
          style={{
            width: "100%",
            padding: 13,
            border: "1px solid #cbd5e1",
            borderRadius: 8,
            boxSizing: "border-box",
            marginBottom: 22,
            fontSize: 15,
          }}
        />

        <button
          type="button"
          onClick={entrar}
          disabled={carregando}
          style={{
            width: "100%",
            padding: 13,
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: carregando ? "wait" : "pointer",
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          {carregando ? "Entrando..." : "Entrar no Portal"}
        </button>

        <div
          style={{
            marginTop: 25,
            padding: 15,
            background: "#f8fafc",
            borderRadius: 8,
            textAlign: "center",
            color: "#64748b",
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          Área exclusiva para envio e acompanhamento de documentos.
        </div>
      </div>
    </div>
  );
}