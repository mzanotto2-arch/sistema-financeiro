
import { useState } from "react";
import { supabase } from "../database/supabase";

export default function PortalCadastrarInstituicao() {
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [codigoProposta, setCodigoProposta] = useState("");
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  const [nomeConsultor, setNomeConsultor] = useState("");
  const [cpfConsultor, setCpfConsultor] = useState("");
  const [nascimentoConsultor, setNascimentoConsultor] = useState("");
  const [emailConsultor, setEmailConsultor] = useState("");
  const [propostaConsultor, setPropostaConsultor] = useState("");
  const [carregandoConsultor, setCarregandoConsultor] = useState(false);

  async function cadastrar() {
    if (
      !nome.trim() ||
      !cnpj.trim() ||
      !codigoProposta.trim() ||
      !nomeUsuario.trim() ||
      !senha.trim()
    ) {
      alert("Preencha todos os campos da instituição.");
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
        console.error("Erro ao cadastrar instituição:", error);
        alert(error.message);
        return;
      }

      alert("Instituição cadastrada com sucesso!");

      setNome("");
      setCnpj("");
      setCodigoProposta("");
      setNomeUsuario("");
      setSenha("");
    } catch (error: unknown) {
      console.error("Erro inesperado:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar a instituição."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function cadastrarConsultor() {
    if (
      !nomeConsultor.trim() ||
      !cpfConsultor.trim() ||
      !nascimentoConsultor ||
      !propostaConsultor.trim()
    ) {
      alert(
        "Informe o nome, o CPF, a data de nascimento e o número da proposta do consultor."
      );
      return;
    }

    try {
      setCarregandoConsultor(true);

      // Localiza a proposta ativa pelo código informado.
      const { data: proposta, error: erroProposta } = await supabase
        .from("portal_propostas")
        .select("id, codigo_proposta, ativo")
        .eq("codigo_proposta", propostaConsultor.trim())
        .eq("ativo", true)
        .maybeSingle();

      if (erroProposta) {
        console.error("Erro ao localizar proposta:", erroProposta);
        alert("Não foi possível consultar a proposta: " + erroProposta.message);
        return;
      }

      if (!proposta) {
        alert(
          "Não encontramos uma proposta ativa com esse número. Confira o código e tente novamente."
        );
        return;
      }

      // A função do banco exige que o administrador esteja autorizado.
      const { data, error } = await supabase.rpc(
        "portal_cadastrar_consultor",
        {
          p_nome: nomeConsultor.trim(),
          p_data_nascimento: nascimentoConsultor,
          p_email: emailConsultor.trim() || null,
          p_propostas: [proposta.id],
          p_cpf: cpfConsultor.replace(/\D/g, ""),
        }
      );

      if (error) {
        console.error("Erro ao cadastrar consultor:", error);
        alert(
          "Não foi possível cadastrar o consultor.\n\n" + error.message
        );
        return;
      }

      if (!data) {
        alert(
          "O banco não retornou a confirmação do cadastro. Verifique se o consultor foi criado antes de tentar novamente."
        );
        return;
      }

      alert(
        "Consultor cadastrado com sucesso!\n\n" +
          "Proposta: " +
          proposta.codigo_proposta +
          "\n" +
          "Senha provisória: data de nascimento no formato DDMMAAAA.\n\n" +
          "Oriente o consultor a alterar a senha no primeiro acesso."
      );

      setNomeConsultor("");
      setCpfConsultor("");
      setNascimentoConsultor("");
      setEmailConsultor("");
      setPropostaConsultor("");
    } catch (error: unknown) {
      console.error("Erro inesperado ao cadastrar consultor:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado ao cadastrar o consultor."
      );
    } finally {
      setCarregandoConsultor(false);
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
          display: "grid",
          gap: 24,
        }}
      >
        <section style={cartao}>
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <div style={{ fontSize: 45 }}>🏢</div>
            <h1 style={titulo}>Cadastrar Instituição</h1>
            <p style={{ color: "#64748b" }}>
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
            onChange={(e) => setCodigoProposta(e.target.value)}
            placeholder="Ex.: 030381/2026"
            style={campo}
          />

          <label>Nome do presidente ou responsável</label>
          <input
            type="text"
            value={nomeUsuario}
            onChange={(e) => setNomeUsuario(e.target.value)}
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
            style={botao(carregando)}
          >
            {carregando ? "Cadastrando..." : "Cadastrar Instituição"}
          </button>
        </section>

        <section style={cartao}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 42 }}>👤</div>
            <h2 style={titulo}>Cadastrar Consultor</h2>
            <p style={{ color: "#64748b", lineHeight: 1.6 }}>
              Cadastre um consultor e vincule seu acesso a uma proposta ativa.
            </p>
          </div>

          <label>Nome completo do consultor</label>
          <input
            type="text"
            value={nomeConsultor}
            onChange={(e) => setNomeConsultor(e.target.value)}
            placeholder="Nome completo"
            autoComplete="name"
            style={campo}
          />

          <label>CPF do consultor</label>
          <input
            type="text"
            value={cpfConsultor}
            onChange={(e) => setCpfConsultor(e.target.value)}
            placeholder="000.000.000-00"
            inputMode="numeric"
            autoComplete="off"
            maxLength={14}
            style={campo}
          />

          <label>Data de nascimento</label>
          <input
            type="date"
            value={nascimentoConsultor}
            onChange={(e) => setNascimentoConsultor(e.target.value)}
            style={campo}
          />

          <label>E-mail (opcional)</label>
          <input
            type="email"
            value={emailConsultor}
            onChange={(e) => setEmailConsultor(e.target.value)}
            placeholder="consultor@exemplo.com"
            autoComplete="email"
            style={campo}
          />

          <label>Número da proposta a que terá acesso</label>
          <input
            type="text"
            value={propostaConsultor}
            onChange={(e) => setPropostaConsultor(e.target.value)}
            placeholder="Ex.: 030381/2026"
            style={campo}
          />

          <p style={aviso}>
            A senha provisória será a data de nascimento no formato DDMMAAAA.
            A troca de senha será obrigatória no primeiro acesso.
          </p>

          <button
            type="button"
            onClick={cadastrarConsultor}
            disabled={carregandoConsultor}
            style={botao(carregandoConsultor)}
          >
            {carregandoConsultor
              ? "Cadastrando consultor..."
              : "Cadastrar Consultor"}
          </button>
        </section>
      </div>
    </div>
  );
}

const cartao = {
  background: "#fff",
  padding: 35,
  borderRadius: 14,
  boxShadow: "0 5px 25px rgba(0,0,0,.10)",
  boxSizing: "border-box" as const,
};

const titulo = {
  color: "#1f3c88",
  margin: "10px 0 5px",
};

const campo = {
  display: "block",
  width: "100%",
  padding: 13,
  marginTop: 7,
  marginBottom: 18,
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  boxSizing: "border-box" as const,
  fontSize: 15,
};

const aviso = {
  color: "#475569",
  background: "#eff6ff",
  padding: 12,
  borderRadius: 8,
  fontSize: 14,
  lineHeight: 1.6,
  marginTop: 0,
};

function botao(carregando: boolean) {
  return {
    width: "100%",
    padding: 14,
    marginTop: 8,
    background: carregando ? "#93c5fd" : "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 16,
    cursor: carregando ? "wait" : "pointer",
  };
}
