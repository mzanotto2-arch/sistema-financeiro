import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../database/supabase";

export default function RedefinirSenha() {
  const navigate = useNavigate();

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    let montado = true;

    async function prepararRecuperacao() {
      try {
        // Verifica se o Supabase já criou a sessão
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          if (montado) {
            setAutorizado(true);
            setVerificando(false);
          }

          return;
        }

        // Se ainda não criou a sessão, aguarda o evento
        // PASSWORD_RECOVERY
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(
          async (event, sessionAtual) => {
            console.log(
              "Evento de autenticação:",
              event
            );

            if (
              event === "PASSWORD_RECOVERY" &&
              sessionAtual?.user
            ) {
              if (montado) {
                setAutorizado(true);
                setVerificando(false);
              }
            }
          }
        );

        // Dá um pequeno tempo para o Supabase processar
        // o link recebido por e-mail
        setTimeout(async () => {
          const {
            data: { session: sessaoFinal },
          } = await supabase.auth.getSession();

          if (!montado) return;

          if (sessaoFinal?.user) {
            setAutorizado(true);
            setVerificando(false);
          } else {
            setVerificando(false);
          }
        }, 1500);

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error(
          "Erro ao preparar recuperação:",
          error
        );

        if (montado) {
          setVerificando(false);
        }
      }
    }

    prepararRecuperacao();

    return () => {
      montado = false;
    };
  }, []);

  async function salvarNovaSenha() {
    if (!senha || !confirmarSenha) {
      alert("Preencha os dois campos.");
      return;
    }

    if (senha.length < 6) {
      alert(
        "A nova senha precisa ter pelo menos 6 caracteres."
      );
      return;
    }

    if (senha !== confirmarSenha) {
      alert("As senhas não são iguais.");
      return;
    }

    try {
      setCarregando(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        alert(
          "A sessão de recuperação não está mais válida. Solicite um novo link."
        );

        navigate("/portal");
        return;
      }

      const { error } =
        await supabase.auth.updateUser({
          password: senha,
        });

      if (error) {
        throw error;
      }

      alert("Senha alterada com sucesso!");

      // Sai da sessão de recuperação
      await supabase.auth.signOut();

      // Volta para o Portal
      navigate("/portal", {
        replace: true,
      });
    } catch (error: any) {
      console.error(
        "Erro ao salvar nova senha:",
        error
      );

      alert(
        error?.message ||
          "Não foi possível alterar a senha."
      );
    } finally {
      setCarregando(false);
    }
  }

  if (verificando) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f4f6f9",
          padding: 20,
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: 35,
            borderRadius: 14,
            boxShadow:
              "0 5px 25px rgba(0,0,0,.12)",
            textAlign: "center",
            maxWidth: 420,
            width: "100%",
          }}
        >
          <div
            style={{
              fontSize: 45,
              marginBottom: 15,
            }}
          >
            🔐
          </div>

          <h2
            style={{
              color: "#1f3c88",
              margin: 0,
            }}
          >
            Verificando recuperação...
          </h2>

          <p
            style={{
              color: "#64748b",
              marginTop: 10,
            }}
          >
            Aguarde enquanto validamos seu acesso.
          </p>
        </div>
      </div>
    );
  }

  if (!autorizado) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f4f6f9",
          padding: 20,
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: 35,
            borderRadius: 14,
            boxShadow:
              "0 5px 25px rgba(0,0,0,.12)",
            textAlign: "center",
            maxWidth: 420,
            width: "100%",
          }}
        >
          <div
            style={{
              fontSize: 45,
              marginBottom: 15,
            }}
          >
            ⚠️
          </div>

          <h2
            style={{
              color: "#1f3c88",
              margin: 0,
            }}
          >
            Link inválido ou expirado
          </h2>

          <p
            style={{
              color: "#64748b",
              lineHeight: 1.5,
            }}
          >
            Solicite uma nova recuperação de senha
            pelo Portal da Instituição.
          </p>

          <button
            type="button"
            onClick={() => navigate("/portal")}
            style={{
              width: "100%",
              padding: 13,
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Voltar para o Portal
          </button>
        </div>
      </div>
    );
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
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          padding: 35,
          borderRadius: 14,
          boxShadow:
            "0 5px 25px rgba(0,0,0,.12)",
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
              fontSize: 48,
              marginBottom: 10,
            }}
          >
            🔐
          </div>

          <h2
            style={{
              margin: 0,
              color: "#1f3c88",
              fontSize: 27,
            }}
          >
            Criar nova senha
          </h2>

          <p
            style={{
              color: "#64748b",
              marginTop: 10,
              lineHeight: 1.5,
            }}
          >
            Digite abaixo a nova senha para
            acessar o Portal da Instituição.
          </p>
        </div>

        <label
          style={{
            display: "block",
            fontWeight: 600,
            color: "#334155",
            marginBottom: 8,
          }}
        >
          Nova senha
        </label>

        <input
          type="password"
          value={senha}
          onChange={(e) =>
            setSenha(e.target.value)
          }
          placeholder="Digite a nova senha"
          autoComplete="new-password"
          style={{
            width: "100%",
            padding: 13,
            border:
              "1px solid #cbd5e1",
            borderRadius: 8,
            boxSizing: "border-box",
            marginBottom: 18,
            fontSize: 15,
          }}
        />

        <label
          style={{
            display: "block",
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
          onChange={(e) =>
            setConfirmarSenha(e.target.value)
          }
          placeholder="Digite novamente a nova senha"
          autoComplete="new-password"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              salvarNovaSenha();
            }
          }}
          style={{
            width: "100%",
            padding: 13,
            border:
              "1px solid #cbd5e1",
            borderRadius: 8,
            boxSizing: "border-box",
            marginBottom: 22,
            fontSize: 15,
          }}
        />

        <button
          type="button"
          onClick={salvarNovaSenha}
          disabled={carregando}
          style={{
            width: "100%",
            padding: 13,
            background: carregando
              ? "#94a3b8"
              : "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: carregando
              ? "wait"
              : "pointer",
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          {carregando
            ? "Salvando..."
            : "Salvar nova senha"}
        </button>

        <div
          style={{
            marginTop: 20,
            padding: 14,
            background: "#f8fafc",
            borderRadius: 8,
            textAlign: "center",
            color: "#64748b",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          Depois de salvar, você voltará para
          o Portal da Instituição.
        </div>
      </div>
    </div>
  );
}