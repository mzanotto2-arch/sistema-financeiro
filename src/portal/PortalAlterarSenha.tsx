import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../database/supabase";

export default function PortalAlterarSenha() {
  const navigate = useNavigate();

  const [codigoProposta, setCodigoProposta] = useState(
    sessionStorage.getItem("portal_codigo_proposta") || ""
  );

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function alterarSenha() {
    const codigo = codigoProposta.trim();

    if (!codigo) {
      alert("Digite o número da proposta.");
      return;
    }

    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      alert("Preencha todos os campos.");
      return;
    }

    if (novaSenha.length < 6) {
      alert("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      alert("A nova senha e a confirmação não são iguais.");
      return;
    }

    if (senhaAtual === novaSenha) {
      alert("A nova senha precisa ser diferente da senha atual.");
      return;
    }

    try {
      setCarregando(true);

      const { data, error } = await supabase.rpc(
        "portal_alterar_senha",
        {
          p_codigo_proposta: codigo,
          p_senha_atual: senhaAtual,
          p_nova_senha: novaSenha,
        }
      );

      if (error) {
        throw error;
      }

      if (!data) {
        alert(
          "A senha atual está incorreta ou o número da proposta não foi encontrado."
        );
        return;
      }

      alert("Senha alterada com sucesso!");

      sessionStorage.removeItem("portal_codigo_proposta");
      sessionStorage.removeItem("portal_usuario_id");
      sessionStorage.removeItem("portal_instituicao_id");
      sessionStorage.removeItem("portal_proposta_id");
      sessionStorage.removeItem("portal_nome_usuario");
      sessionStorage.removeItem("portal_nome_instituicao");

      navigate("/portal", { replace: true });

    } catch (error: any) {
      console.error("Erro ao alterar senha:", error);

      alert(
        error?.message ||
          "Não foi possível alterar a senha."
      );
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
            marginBottom: 25,
          }}
        >
          <div
            style={{
              fontSize: 45,
              marginBottom: 10,
            }}
          >
            🔐
          </div>

          <h1
            style={{
              margin: 0,
              color: "#1f3c88",
              fontSize: 26,
            }}
          >
            Alterar senha
          </h1>

          <p
            style={{
              color: "#64748b",
              marginTop: 8,
            }}
          >
            Altere a senha de acesso ao Portal.
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
          Número da proposta
        </label>

        <input
          type="text"
          value={codigoProposta}
          onChange={(e) => setCodigoProposta(e.target.value)}
          placeholder="Digite o número da proposta"
          autoComplete="off"
          style={{
            width: "100%",
            padding: 13,
            border: "1px solid #cbd5e1",
            borderRadius: 8,
            boxSizing: "border-box",
            marginBottom: 20,
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
          Senha atual
        </label>

        <input
          type="password"
          value={senhaAtual}
          onChange={(e) => setSenhaAtual(e.target.value)}
          placeholder="Digite sua senha atual"
          autoComplete="current-password"
          style={{
            width: "100%",
            padding: 13,
            marginBottom: 20,
            border: "1px solid #cbd5e1",
            borderRadius: 8,
            boxSizing: "border-box",
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
          Nova senha
        </label>

        <input
          type="password"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          placeholder="Digite a nova senha"
          autoComplete="new-password"
          style={{
            width: "100%",
            padding: 13,
            marginBottom: 20,
            border: "1px solid #cbd5e1",
            borderRadius: 8,
            boxSizing: "border-box",
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
          Confirmar nova senha
        </label>

        <input
          type="password"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          placeholder="Digite novamente a nova senha"
          autoComplete="new-password"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              alterarSenha();
            }
          }}
          style={{
            width: "100%",
            padding: 13,
            marginBottom: 22,
            border: "1px solid #cbd5e1",
            borderRadius: 8,
            boxSizing: "border-box",
            fontSize: 15,
          }}
        />

        <button
          type="button"
          onClick={alterarSenha}
          disabled={carregando}
          style={{
            width: "100%",
            padding: 13,
            background: carregando ? "#94a3b8" : "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: carregando ? "wait" : "pointer",
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          {carregando ? "Alterando..." : "Alterar senha"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/portal")}
          style={{
            width: "100%",
            padding: 12,
            marginTop: 12,
            background: "#fff",
            color: "#2563eb",
            border: "1px solid #2563eb",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Voltar
        </button>

        <div
          style={{
            marginTop: 20,
            padding: 12,
            background: "#f8fafc",
            borderRadius: 8,
            textAlign: "center",
            color: "#64748b",
            fontSize: 12,
            lineHeight: 1.5,
          }}
        >
          Informe o número da proposta e sua senha atual
          para cadastrar uma nova senha.
        </div>
      </div>
    </div>
  );
}