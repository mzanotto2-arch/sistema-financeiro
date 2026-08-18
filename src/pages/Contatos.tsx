import { useEffect, useState } from "react";
import { supabase } from "../database/supabase";

type Contato = {
  id?: number;
  user_id?: string;
  nome: string;
  instituicao: string;
  telefone: string;
  whatsapp: string;
  email: string;
  cargo: string;
  observacoes: string;
};

export default function Contatos() {
  const [contatos, setContatos] = useState<Contato[]>([]);

  const [id, setId] = useState<number | undefined>();

  const [nome, setNome] = useState("");
  const [instituicao, setInstituicao] = useState("");
  const [telefone, setTelefone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [cargo, setCargo] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [pesquisa, setPesquisa] = useState("");

  useEffect(() => {
    carregarContatos();
  }, []);

  async function carregarContatos() {
    try {
      const { data, error } = await supabase
        .from("contatos")
        .select("*")
        .order("nome");

      if (error) throw error;

      setContatos(data || []);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar contatos.");
    }
  }

  async function salvar() {
    if (!nome.trim()) {
      alert("Informe o nome do contato.");
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Usuário não está logado.");
        return;
      }

      const dados = {
        nome,
        instituicao,
        telefone,
        whatsapp,
        email,
        cargo,
        observacoes,
        updated_at: new Date().toISOString(),
      };

      if (id) {
        const { error } = await supabase
          .from("contatos")
          .update(dados)
          .eq("id", id);

        if (error) throw error;

        alert("Contato atualizado!");
      } else {
        const { error } = await supabase
          .from("contatos")
          .insert([
            {
              ...dados,
              user_id: user.id,
            },
          ]);

        if (error) throw error;

        alert("Contato salvo!");
      }

      limparFormulario();
      await carregarContatos();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Erro ao salvar contato.");
    }
  }

  function editar(contato: Contato) {
    setId(contato.id);

    setNome(contato.nome || "");
    setInstituicao(contato.instituicao || "");
    setTelefone(contato.telefone || "");
    setWhatsapp(contato.whatsapp || "");
    setEmail(contato.email || "");
    setCargo(contato.cargo || "");
    setObservacoes(contato.observacoes || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function excluir(idContato: number) {
    if (!confirm("Deseja excluir este contato?")) return;

    try {
      const { error } = await supabase
        .from("contatos")
        .delete()
        .eq("id", idContato);

      if (error) throw error;

      await carregarContatos();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Erro ao excluir contato.");
    }
  }

  function limparFormulario() {
    setId(undefined);

    setNome("");
    setInstituicao("");
    setTelefone("");
    setWhatsapp("");
    setEmail("");
    setCargo("");
    setObservacoes("");
  }

  const contatosFiltrados = contatos.filter((contato) => {
    const texto = pesquisa.toLowerCase();

    return (
      contato.nome?.toLowerCase().includes(texto) ||
      contato.instituicao?.toLowerCase().includes(texto) ||
      contato.telefone?.toLowerCase().includes(texto) ||
      contato.whatsapp?.toLowerCase().includes(texto) ||
      contato.email?.toLowerCase().includes(texto)
    );
  });

  return (
    <div
      style={{
        padding: 30,
        fontFamily: "Arial",
        maxWidth: 1000,
        margin: "0 auto",
      }}
    >
      <h2>📞 Agenda Telefônica</h2>

      <p>
        Cadastre os contatos importantes para o seu trabalho.
      </p>

      <hr />

      <h3>
        {id ? "✏️ Editar contato" : "➕ Novo contato"}
      </h3>

      <p>Nome</p>

      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome da pessoa"
        style={{
          width: 400,
          padding: 8,
        }}
      />

      <p>Instituição</p>

      <input
        value={instituicao}
        onChange={(e) =>
          setInstituicao(e.target.value)
        }
        placeholder="ONG, associação, empresa..."
        style={{
          width: 400,
          padding: 8,
        }}
      />

      <p>Cargo / Função</p>

      <input
        value={cargo}
        onChange={(e) => setCargo(e.target.value)}
        placeholder="Presidente, responsável, secretário..."
        style={{
          width: 400,
          padding: 8,
        }}
      />

      <p>Telefone</p>

      <input
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
        placeholder="(83) 99999-9999"
        style={{
          width: 300,
          padding: 8,
        }}
      />

      <p>WhatsApp</p>

      <input
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.target.value)}
        placeholder="(83) 99999-9999"
        style={{
          width: 300,
          padding: 8,
        }}
      />

      <p>E-mail</p>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email@instituicao.com"
        style={{
          width: 400,
          padding: 8,
        }}
      />

      <p>Observações</p>

      <textarea
        value={observacoes}
        onChange={(e) =>
          setObservacoes(e.target.value)
        }
        rows={4}
        placeholder="Informações importantes sobre este contato..."
        style={{
          width: 500,
          padding: 8,
        }}
      />

      <br />
      <br />

      <button onClick={salvar}>
        {id ? "Atualizar Contato" : "Salvar Contato"}
      </button>

      {id && (
        <button
          onClick={limparFormulario}
          style={{ marginLeft: 10 }}
        >
          Cancelar
        </button>
      )}

      <hr />

      <h3>🔎 Pesquisar contatos</h3>

      <input
        value={pesquisa}
        onChange={(e) =>
          setPesquisa(e.target.value)
        }
        placeholder="Digite nome, instituição, telefone ou e-mail..."
        style={{
          width: 500,
          padding: 10,
        }}
      />

      <h3>
        📋 Contatos cadastrados (
        {contatosFiltrados.length})
      </h3>

      {contatosFiltrados.length === 0 ? (
        <p>Nenhum contato encontrado.</p>
      ) : (
        contatosFiltrados.map((contato) => (
          <div
            key={contato.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: 15,
              marginBottom: 12,
              background: "#fff",
            }}
          >
            <strong style={{ fontSize: 18 }}>
              👤 {contato.nome}
            </strong>

            {contato.instituicao && (
              <>
                <br />
                🏢 Instituição:{" "}
                {contato.instituicao}
              </>
            )}

            {contato.cargo && (
              <>
                <br />
                👔 Cargo: {contato.cargo}
              </>
            )}

            {contato.telefone && (
              <>
                <br />
                ☎️ Telefone: {contato.telefone}
              </>
            )}

            {contato.whatsapp && (
              <>
                <br />
                💬 WhatsApp: {contato.whatsapp}
              </>
            )}

            {contato.email && (
              <>
                <br />
                📧 E-mail: {contato.email}
              </>
            )}

            {contato.observacoes && (
              <>
                <br />
                📝 Observações:{" "}
                {contato.observacoes}
              </>
            )}

            <br />
            <br />

            <button
              onClick={() => editar(contato)}
            >
              ✏️ Editar
            </button>

            <button
              onClick={() =>
                excluir(contato.id!)
              }
              style={{ marginLeft: 10 }}
            >
              🗑️ Excluir
            </button>
          </div>
        ))
      )}
    </div>
  );
}