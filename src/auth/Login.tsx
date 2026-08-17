import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function Login() {
  const navigate = useNavigate();

  const {
    login,
    criarConta,
    recuperarSenha,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    try {
      setCarregando(true);

      await login(email, senha);

      navigate("/");

    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setCarregando(false);
    }
  }

  async function cadastrar() {
    try {
      setCarregando(true);

      await criarConta(email, senha);

      alert("Conta criada com sucesso!");

    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setCarregando(false);
    }
  }

  async function esqueciSenha() {
    if (!email) {
      alert("Digite seu e-mail primeiro.");
      return;
    }

    try {
      setCarregando(true);

      await recuperarSenha(email);

      alert(
        "Enviamos um e-mail para redefinir sua senha. Verifique sua caixa de entrada."
      );

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
          Sistema Financeiro
        </h2>

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 15,
            boxSizing: "border-box",
          }}
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10,
            boxSizing: "border-box",
          }}
        />

        <button
          onClick={entrar}
          disabled={carregando}
          style={{
            width: "100%",
            padding: 12,
            background: "#0d6efd",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            marginBottom: 10,
          }}
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>

        <button
          onClick={esqueciSenha}
          disabled={carregando}
          style={{
            width: "100%",
            padding: 10,
            background: "transparent",
            color: "#0d6efd",
            border: "none",
            cursor: "pointer",
            marginBottom: 10,
          }}
        >
          Esqueci minha senha
        </button>

        <button
          onClick={cadastrar}
          disabled={carregando}
          style={{
            width: "100%",
            padding: 12,
            background: "#198754",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Criar Conta
        </button>
      </div>
    </div>
  );
}