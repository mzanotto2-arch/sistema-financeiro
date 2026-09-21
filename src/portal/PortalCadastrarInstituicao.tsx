import { useState } from "react";
import { supabase } from "../database/supabase";

export default function PortalCadastrarInstituicao() {
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [codigoProposta, setCodigoProposta] = useState("");
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function cadastrar() {
    if (
      !nome.trim() ||
      !cnpj.trim() ||
      !codigoProposta.trim() ||
      !nomeUsuario.trim() ||
      !senha.trim()
    ) {
      alert("Preencha todos os campos.");
      return;
    }

    if (senha.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      setCarregando(true);

      const { error } = await supabase.rpc(
        "portal_cadastrar_instituicao",
        {
          p_nome_instituicao: nome.trim(),
          p_cnpj: cnpj.trim(),
          p_codigo_proposta: codigoProposta.trim(),
          p_nome_usuario: nomeUsuario.trim(),
          p_senha: senha,
        }
      );

      if (error) {
        console.error(
          "Erro ao cadastrar instituição:",
          error
        );

        alert(error.message);
        return;
      }

      alert("Instituição cadastrada com sucesso!");

      setNome("");
      setCnpj("");
      setCodigoProposta("");
      setNomeUsuario("");
      setSenha("");
    } catch (error: any) {
      console.error(
        "Erro inesperado:",
        error
      );

      alert(
        error?.message ||
          "Não foi possível cadastrar a instituição."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f6f9",
        padding: 30,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 650,
          margin: "0 auto",
          background: "#fff",
          padding: 35,
          borderRadius: 14,
          boxShadow: "0 5px 25px rgba(0,0,0,.10)",
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
              fontSize: 45,
            }}
          >
            🏢
          </div>

          <h1
            style={{
              color: "#1f3c88",
              margin: "10px 0 5px",
            }}
          >
            Cadastrar Instituição
          </h1>

          <p
            style={{
              color: "#64748b",
            }}
          >
            Crie o acesso da instituição ao Portal.
          </p>
        </div>

        <label>Nome da instituição</label>

        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome completo da instituição"
          style={campo}
        />

        <label>CNPJ</label>

        <input
          type="text"
          value={cnpj}
          onChange={(e) => setCnpj(e.target.value)}
          placeholder="00.000.000/0000-00"
          style={campo}
        />

        <label>Número da proposta</label>

        <input
          type="text"
          value={codigoProposta}
          onChange={(e) =>
            setCodigoProposta(e.target.value)
          }
          placeholder="Ex.: 030381/2026"
          style={campo}
        />

        <label>
          Nome do presidente ou responsável
        </label>

        <input
          type="text"
          value={nomeUsuario}
          onChange={(e) =>
            setNomeUsuario(e.target.value)
          }
          placeholder="Nome do responsável"
          style={campo}
        />

        <label>Senha de acesso</label>

        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Mínimo de 6 caracteres"
          style={campo}
        />

        <button
          type="button"
          onClick={cadastrar}
          disabled={carregando}
          style={{
            width: "100%",
            padding: 14,
            marginTop: 20,
            background: carregando
              ? "#93c5fd"
              : "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 16,
            cursor: carregando
              ? "wait"
              : "pointer",
          }}
        >
          {carregando
            ? "Cadastrando..."
            : "Cadastrar Instituição"}
        </button>
      </div>
    </div>
  );
}

const campo = {
  width: "100%",
  padding: 13,
  marginTop: 7,
  marginBottom: 18,
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  boxSizing: "border-box" as const,
  fontSize: 15,
};