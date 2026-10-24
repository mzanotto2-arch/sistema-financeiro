import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../database/supabase";

export default function PortalLogin() {
  const navigate = useNavigate();

  const [codigoProposta, setCodigoProposta] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mostrarAlterarSenha, setMostrarAlterarSenha] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [alterandoSenha, setAlterandoSenha] = useState(false);

  function limparSessaoPortal() {
    sessionStorage.removeItem("portal_codigo_proposta");
    sessionStorage.removeItem("portal_usuario_id");
    sessionStorage.removeItem("portal_instituicao_id");
    sessionStorage.removeItem("portal_proposta_id");
    sessionStorage.removeItem("portal_nome_usuario");
    sessionStorage.removeItem("portal_nome_instituicao");
    sessionStorage.removeItem("portal_tipo_usuario");
    sessionStorage.removeItem("portal_sessao_token");
  }

  async function entrar() {
    if (!codigoProposta.trim() || !senha) {
      alert("Digite o código da proposta e a senha.");
      return;
    }

    try {
      setCarregando(true);
      limparSessaoPortal();
      setMostrarAlterarSenha(false);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");

      const { data, error } = await supabase.rpc("portal_login", {
        p_codigo_proposta: codigoProposta.trim(),
        p_senha: senha,
      });

      if (error) {
        console.error("Erro retornado pelo portal_login:", error);
        throw new Error(
          "Não foi possível validar o acesso. Tente novamente. Se o erro continuar, será necessário conferir a função de login no Supabase."
        );
      }

      if (!Array.isArray(data) || data.length === 0) {
        alert("Código da proposta ou senha inválidos.");
        return;
      }

      const usuario = data[0];
      if (
        !usuario.usuario_id ||
        !usuario.instituicao_id ||
        !usuario.proposta_id ||
        !usuario.codigo_proposta
      ) {
        throw new Error(
          "O login não retornou todos os dados necessários. Confira a função portal_login no Supabase."
        );
      }

      if (usuario.senha_troca_obrigatoria === true) {
        setSenhaAtual(senha);
        setMostrarAlterarSenha(true);
        alert(
          "Por segurança, crie uma nova senha antes de continuar. O acesso aos documentos ficará bloqueado até a conclusão da troca."
        );
        return;
      }

      sessionStorage.setItem("portal_codigo_proposta", String(usuario.codigo_proposta));
      sessionStorage.setItem("portal_usuario_id", String(usuario.usuario_id));
      sessionStorage.setItem("portal_instituicao_id", String(usuario.instituicao_id));
      sessionStorage.setItem("portal_proposta_id", String(usuario.proposta_id));
      sessionStorage.setItem("portal_nome_usuario", String(usuario.nome_usuario || ""));
      sessionStorage.setItem("portal_nome_instituicao", String(usuario.nome_instituicao || ""));
      sessionStorage.setItem("portal_tipo_usuario", String(usuario.tipo_usuario || "instituicao"));

      navigate("/portal/documentos", { replace: true });
    } catch (error: unknown) {
      console.error("Erro no login do portal:", error);
      const mensagem =
        error instanceof Error
          ? error.message
          : "Não foi possível entrar no Portal.";
      alert(mensagem);
    } finally {
      setCarregando(false);
    }
  }

  async function alterarSenha() {
    if (!codigoProposta.trim() || !senhaAtual || !novaSenha || !confirmarSenha) {
      alert("Preencha o código da proposta e todos os campos de senha.");
      return;
    }
    if (novaSenha.length < 8) {
      alert("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (novaSenha === senhaAtual) {
      alert("A nova senha deve ser diferente da senha atual.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      alert("A confirmação da nova senha não confere.");
      return;
    }

    try {
      setAlterandoSenha(true);
      const { data, error } = await supabase.rpc("portal_alterar_senha", {
        p_codigo_proposta: codigoProposta.trim(),
        p_senha_atual: senhaAtual,
        p_nova_senha: novaSenha,
      });

      if (error) {
        console.error("Erro retornado pelo portal_alterar_senha:", error);
        throw new Error(
          "Não foi possível alterar a senha. Confira a função portal_alterar_senha no Supabase."
        );
      }
      if (data !== true) {
        throw new Error(
          "Não foi possível alterar a senha. Confira o código da proposta e a senha atual."
        );
      }

      limparSessaoPortal();
      setSenha(novaSenha);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      setMostrarAlterarSenha(false);
      alert("Senha alterada com sucesso! Entre novamente usando a nova senha.");
    } catch (error: unknown) {
      console.error("Erro ao alterar senha:", error);
      const mensagem =
        error instanceof Error
          ? error.message
          : "Não foi possível alterar a senha.";
      alert(mensagem);
    } finally {
      setAlterandoSenha(false);
    }
  }

  const estiloInput = {
    width: "100%",
    padding: 13,
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    boxSizing: "border-box" as const,
    marginBottom: 16,
    fontSize: 15,
    outline: "none",
  };

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
          margin: "20px 0",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ fontSize: 50, marginBottom: 10 }}>📁</div>
          <h1 style={{ margin: 0, color: "#1f3c88", fontSize: 28 }}>
            Portal da Instituição
          </h1>
          <p style={{ color: "#64748b", marginTop: 8 }}>
            Acesso exclusivo para documentos
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
          placeholder="Ex.: 277602025"
          disabled={carregando || alterandoSenha}
          autoComplete="username"
          style={estiloInput}
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
          disabled={carregando || alterandoSenha}
          autoComplete="current-password"
          onKeyDown={(e) => {
            if (e.key === "Enter") void entrar();
          }}
          style={estiloInput}
        />

        <button
          type="button"
          onClick={() => void entrar()}
          disabled={carregando || alterandoSenha}
          style={{
            width: "100%",
            padding: 13,
            background: carregando ? "#93c5fd" : "#2563eb",
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

        <button
          type="button"
          onClick={() => {
            setMostrarAlterarSenha(!mostrarAlterarSenha);
            setSenhaAtual("");
            setNovaSenha("");
            setConfirmarSenha("");
          }}
          disabled={carregando || alterandoSenha}
          style={{
            width: "100%",
            marginTop: 12,
            padding: 12,
            background: "#fff",
            color: "#2563eb",
            border: "1px solid #2563eb",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 15,
          }}
        >
          {mostrarAlterarSenha ? "Cancelar troca de senha" : "Trocar senha"}
        </button>

        {mostrarAlterarSenha && (
          <div
            style={{
              marginTop: 20,
              padding: 16,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
            }}
          >
            <h3 style={{ color: "#1f3c88", marginTop: 0 }}>Alterar senha</h3>
            <p style={{ color: "#64748b", fontSize: 13 }}>
              Informe o código da proposta, a senha atual e escolha uma nova
              senha com pelo menos 8 caracteres.
            </p>

            <label style={{ display: "block", marginBottom: 6 }}>
              Senha atual
            </label>
            <input
              type="password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              autoComplete="current-password"
              disabled={alterandoSenha}
              style={estiloInput}
            />

            <label style={{ display: "block", marginBottom: 6 }}>
              Nova senha
            </label>
            <input
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              autoComplete="new-password"
              disabled={alterandoSenha}
              style={estiloInput}
            />

            <label style={{ display: "block", marginBottom: 6 }}>
              Confirmar nova senha
            </label>
            <input
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              autoComplete="new-password"
              disabled={alterandoSenha}
              style={estiloInput}
            />

            <button
              type="button"
              onClick={() => void alterarSenha()}
              disabled={alterandoSenha}
              style={{
                width: "100%",
                padding: 13,
                background: alterandoSenha ? "#93c5fd" : "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: alterandoSenha ? "wait" : "pointer",
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              {alterandoSenha ? "Alterando..." : "Salvar nova senha"}
            </button>
          </div>
        )}

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
          🔒 Área exclusiva para documentos.
          <br />
          Os documentos ficam vinculados à proposta autorizada.
        </div>
      </div>
    </div>
  );
}
