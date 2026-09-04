import { useEffect, useState } from "react";
import { supabase } from "../database/supabase";

type Edital = {
  id: number;
  nome: string;
  orgao: string;
  data_abertura: string | null;
  data_encerramento: string | null;
  link: string | null;
  observacoes: string | null;
};

export default function Editais() {
  const [editais, setEditais] = useState<Edital[]>([]);
  const [carregando, setCarregando] = useState(false);

  const [nome, setNome] = useState("");
  const [orgao, setOrgao] = useState("");
  const [dataAbertura, setDataAbertura] = useState("");
  const [dataEncerramento, setDataEncerramento] = useState("");
  const [link, setLink] = useState("");
  const [observacoes, setObservacoes] = useState("");

  async function carregarEditais() {
    setCarregando(true);

    const { data, error } = await supabase
      .from("editais")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      alert("Erro ao carregar os editais.");
    } else {
      setEditais(data || []);
    }

    setCarregando(false);
  }

  async function salvarEdital() {
    if (!nome.trim()) {
      alert("Informe o nome do edital.");
      return;
    }

    const { error } = await supabase.from("editais").insert({
      nome,
      orgao,
      data_abertura: dataAbertura || null,
      data_encerramento: dataEncerramento || null,
      link: link || null,
      observacoes: observacoes || null,
    });

    if (error) {
      console.error(error);
      alert("Erro ao salvar o edital: " + error.message);
      return;
    }

    alert("Edital salvo!");

    setNome("");
    setOrgao("");
    setDataAbertura("");
    setDataEncerramento("");
    setLink("");
    setObservacoes("");

    carregarEditais();
  }

  useEffect(() => {
    carregarEditais();
  }, []);

  return (
    <div style={{ padding: 30 }}>
      <h1>📋 Editais</h1>

      <p>Cadastre e acompanhe os editais disponíveis.</p>

      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 10,
          marginBottom: 30,
        }}
      >
        <h2>Novo Edital</h2>

        <input
          type="text"
          placeholder="Nome do edital"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10,
          }}
        />

        <input
          type="text"
          placeholder="Órgão / Instituição"
          value={orgao}
          onChange={(e) => setOrgao(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10,
          }}
        />

        <label>Data de abertura</label>

        <input
          type="date"
          value={dataAbertura}
          onChange={(e) => setDataAbertura(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10,
          }}
        />

        <label>Data de encerramento</label>

        <input
          type="date"
          value={dataEncerramento}
          onChange={(e) => setDataEncerramento(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10,
          }}
        />

        <input
          type="text"
          placeholder="Link do edital"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10,
          }}
        />

        <textarea
          placeholder="Observações"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            minHeight: 100,
            marginBottom: 10,
          }}
        />

        <button
          onClick={salvarEdital}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          💾 Salvar Edital
        </button>
      </div>

      <h2>
        Editais cadastrados ({editais.length})
      </h2>

      {carregando ? (
        <p>Carregando...</p>
      ) : editais.length === 0 ? (
        <p>Nenhum edital cadastrado.</p>
      ) : (
        editais.map((edital) => (
          <div
            key={edital.id}
            style={{
              background: "#fff",
              padding: 20,
              marginBottom: 15,
              borderRadius: 10,
            }}
          >
            <h3>{edital.nome}</h3>

            {edital.orgao && <p>🏢 Órgão: {edital.orgao}</p>}

            {edital.data_abertura && (
              <p>📅 Abertura: {edital.data_abertura}</p>
            )}

            {edital.data_encerramento && (
              <p>⏰ Encerramento: {edital.data_encerramento}</p>
            )}

            {edital.link && (
              <p>
                🔗{" "}
                <a
                  href={edital.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir edital
                </a>
              </p>
            )}

            {edital.observacoes && (
              <p>📝 {edital.observacoes}</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}