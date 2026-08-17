import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../database/supabase";

export default function RedefinirSenha() {
  const navigate = useNavigate();

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function salvarNovaSenha() {
    if (!senha || !confirmarSenha) {
      alert("Preencha os dois campos.");
      return;
    }

    if (senha.length < 6) {
      alert("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      alert("As senhas não são iguais.");
      return;
    }

    try {
      setCarregando(true);

      const { error } = await supabase.auth.updateUser({
        password: senha,
      });

      if (error) {
        throw error;
      }

      alert("Senha alterada com sucesso!");

      await supabase.auth.signOut();

      navigate("/login");

    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f4f6f9",
      }}
    >
      <div
        style={{
          width: 350,
          background: "#fff",
          padding: 30,
          borderRadius: 10,
          boxShadow: "0 5px 20px rgba(0,0,0,.15)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: 30,
          }}
        >
          Nova Senha
        </h2>

        <p
          style={{
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          Digite sua nova senha.
        </p>

        <input
          type="password"
          placeholder="Nova senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 15,
            boxSizing: "border-box",
          }}
        />

        <input
          type="password"
          placeholder="Confirmar nova senha"
          value={confirmarSenha}
          onChange={(e) =>
            setConfirmarSenha(e.target.value)
          }
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 20,
            boxSizing: "border-box",
          }}
        />

        <button
          onClick={salvarNovaSenha}
          disabled={carregando}
          style={{
            width: "100%",
            padding: 12,
            background: "#0d6efd",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          {carregando
            ? "Salvando..."
            : "Salvar nova senha"}
        </button>
      </div>
    </div>
  );
}