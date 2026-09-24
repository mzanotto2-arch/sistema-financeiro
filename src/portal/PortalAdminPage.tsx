import { useEffect, useState } from "react";
import { supabase } from "../database/supabase";

type Instituicao = {
  id: string;
  nome: string;
  cnpj: string | null;
  ativo: boolean;
};

type Proposta = {
  id: string;
  instituicao_id: string;
  codigo_proposta: string;
  numero_instrumento: string | null;
  descricao: string | null;
  ativo: boolean;
};

type Documento = {
  id: string;
  nome_documento: string;
  nome_arquivo: string | null;
  caminho_arquivo: string | null;
  tamanho_arquivo: number | null;
  tipo_arquivo: string | null;
  enviado_em: string | null;
  enviado_por: string | null;
};

export default function PortalAdmin() {
  const [carregando, setCarregando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);

  const [codigoProposta, setCodigoProposta] = useState("");
  const [proposta, setProposta] = useState<Proposta | null>(null);
  const [instituicao, setInstituicao] = useState<Instituicao | null>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);

  const [carregandoProposta, setCarregandoProposta] = useState(false);
  const [carregandoDocumentos, setCarregandoDocumentos] = useState(false);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    verificarAdministrador();
  }, []);

  async function verificarAdministrador() {
    try {
      setCarregando(true);
      setMensagem("");

      const {
        data: { user },
        error: erroUsuario,
      } = await supabase.auth.getUser();

      if (erroUsuario || !user) {
        setAutorizado(false);
        setMensagem("Usuário não autenticado.");
        return;
      }

      const { data, error } = await supabase.rpc("portal_admin_eh");

      if (error) {
        console.error("Erro ao verificar administrador:", error);
        setAutorizado(false);
        setMensagem("Não foi possível verificar o acesso administrativo.");
        return;
      }

      if (!data) {
        setAutorizado(false);
        setMensagem("Seu usuário não possui acesso administrativo.");
        return;
      }

      setAutorizado(true);
    } catch (error: any) {
      console.error("Erro inesperado:", error);
      setAutorizado(false);
      setMensagem(
        error?.message || "Ocorreu um erro ao verificar o acesso."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function localizarProposta() {
    const codigo = codigoProposta.trim();

    setMensagem("");
    setProposta(null);
    setInstituicao(null);
    setDocumentos([]);

    if (!codigo) {
      setMensagem("Digite o número/código da proposta.");
      return;
    }

    try {
      setCarregandoProposta(true);

      const { data, error } = await supabase
        .from("portal_propostas")
        .select(
          "id, instituicao_id, codigo_proposta, numero_instrumento, descricao, ativo"
        )
        .eq("codigo_proposta", codigo)
        .eq("ativo", true)
        .maybeSingle();

      if (error) {
        console.error("Erro ao localizar proposta:", error);
        setMensagem(error.message || "Não foi possível localizar a proposta.");
        return;
      }

      if (!data) {
        setMensagem(`Nenhuma proposta encontrada para "${codigo}".`);
        return;
      }

      setProposta(data as Proposta);

      const { data: instituicaoData, error: instituicaoError } = await supabase
        .from("portal_instituicoes")
        .select("id, nome, cnpj, ativo")
        .eq("id", data.instituicao_id)
        .maybeSingle();

      if (instituicaoError) {
        console.error("Erro ao localizar instituição:", instituicaoError);
        setMensagem(
          "Proposta encontrada, mas não foi possível carregar a instituição."
        );
        return;
      }

      setInstituicao((instituicaoData || null) as Instituicao | null);

      await carregarDocumentos(data.id);
    } catch (error: any) {
      console.error("Erro inesperado ao localizar proposta:", error);
      setMensagem(
        error?.message || "Não foi possível localizar a proposta."
      );
    } finally {
      setCarregandoProposta(false);
    }
  }

  async function carregarDocumentos(propostaId: string) {
    try {
      setCarregandoDocumentos(true);
      setMensagem("");

      const { data, error } = await supabase.rpc("portal_listar_documentos", {
        p_proposta_id: propostaId,
      });

      if (error) {
        console.error("Erro ao carregar documentos:", error);
        setMensagem(
          error.message || "Não foi possível carregar os documentos."
        );
        return;
      }

      setDocumentos((data || []) as Documento[]);
    } catch (error: any) {
      console.error("Erro inesperado ao carregar documentos:", error);
      setMensagem(
        error?.message || "Não foi possível carregar os documentos."
      );
    } finally {
      setCarregandoDocumentos(false);
    }
  }

  async function baixarDocumento(documento: Documento) {
    if (!documento.caminho_arquivo) {
      alert("Este documento não possui arquivo salvo.");
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from("portal-documentos")
        .createSignedUrl(documento.caminho_arquivo, 60 * 60, {
          download: documento.nome_arquivo || true,
        });

      if (error) {
        console.error("Erro ao gerar link para download:", error);
        alert(error.message || "Não foi possível baixar o documento.");
        return;
      }

      if (!data?.signedUrl) {
        alert("Não foi possível gerar o link do documento.");
        return;
      }

      const link = document.createElement("a");
      link.href = data.signedUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      console.error("Erro ao baixar documento:", error);
      alert(error?.message || "Não foi possível baixar o documento.");
    }
  }

  function formatarData(data: string | null) {
    if (!data) return "-";
    return new Date(data).toLocaleString("pt-BR");
  }

  function formatarTamanho(tamanho: number | null) {
    if (!tamanho) return "-";
    if (tamanho < 1024) return `${tamanho} B`;
    if (tamanho < 1024 * 1024) {
      return `${(tamanho / 1024).toFixed(1)} KB`;
    }
    return `${(tamanho / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (carregando) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          fontSize: 18,
          color: "#334155",
        }}
      >
        Carregando área administrativa...
      </div>
    );
  }

  if (!autorizado) {
    return (
      <div
        style={{
          maxWidth: 700,
          margin: "40px auto",
          padding: 30,
          background: "#fff",
          borderRadius: 14,
          boxShadow: "0 5px 25px rgba(0,0,0,.10)",
        }}
      >
        <h1 style={{ color: "#b91c1c" }}>🔒 Acesso não autorizado</h1>
        <p style={{ color: "#475569" }}>
          {mensagem || "Você não possui permissão para acessar esta área."}
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: 30,
          marginBottom: 25,
          boxShadow: "0 5px 25px rgba(0,0,0,.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ margin: 0, color: "#1f3c88" }}>
              📁 Portal da Instituição
            </h1>
            <p style={{ marginTop: 8, color: "#64748b" }}>
              Área administrativa de documentos
            </p>
          </div>

          <div
            style={{
              background: "#eff6ff",
              padding: "12px 18px",
              borderRadius: 10,
              color: "#1d4ed8",
              fontWeight: 700,
            }}
          >
            👩‍💼 Administradora
          </div>
        </div>
      </div>

      {mensagem && (
        <div
          style={{
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            color: "#9a3412",
            padding: 15,
            borderRadius: 10,
            marginBottom: 20,
          }}
        >
          {mensagem}
        </div>
      )}

      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: 30,
          boxShadow: "0 5px 25px rgba(0,0,0,.08)",
        }}
      >
        <h2 style={{ marginTop: 0, color: "#1e3a8a" }}>
          Buscar proposta
        </h2>

        <p style={{ color: "#64748b" }}>
          Digite o número/código da proposta para localizar a instituição e
          seus documentos. A proposta é o identificador do processo.
        </p>

        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 15,
            flexWrap: "wrap",
          }}
        >
          <input
            value={codigoProposta}
            onChange={(e) => setCodigoProposta(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") localizarProposta();
            }}
            placeholder="Ex.: 277602025"
            style={{
              flex: 1,
              minWidth: 250,
              padding: 14,
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              fontSize: 15,
            }}
          />

          <button
            type="button"
            onClick={localizarProposta}
            disabled={carregandoProposta}
            style={{
              padding: "14px 22px",
              border: "none",
              borderRadius: 8,
              background: "#2563eb",
              color: "#fff",
              fontWeight: 700,
              cursor: carregandoProposta ? "wait" : "pointer",
            }}
          >
            {carregandoProposta ? "Buscando..." : "🔎 Buscar proposta"}
          </button>
        </div>

        {proposta && (
          <div
            style={{
              marginTop: 25,
              padding: 20,
              background: "#f8fafc",
              borderRadius: 10,
              border: "1px solid #dbeafe",
            }}
          >
            <h3 style={{ marginTop: 0, color: "#1e3a8a" }}>
              Proposta {proposta.codigo_proposta}
            </h3>

            <div style={{ color: "#475569", lineHeight: 1.7 }}>
              <strong>Instituição:</strong>{" "}
              {instituicao?.nome || "Não identificada"}
              <br />
              {instituicao?.cnpj && (
                <>
                  <strong>CNPJ:</strong> {instituicao.cnpj}
                  <br />
                </>
              )}
              {proposta.numero_instrumento && (
                <>
                  <strong>Instrumento:</strong>{" "}
                  {proposta.numero_instrumento}
                  <br />
                </>
              )}
              {proposta.descricao && (
                <>
                  <strong>Descrição:</strong> {proposta.descricao}
                </>
              )}
            </div>
          </div>
        )}

        {proposta && (
          <div style={{ marginTop: 30 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 15,
                gap: 15,
                flexWrap: "wrap",
              }}
            >
              <h3 style={{ margin: 0, color: "#1e3a8a" }}>
                📄 Documentos recebidos
              </h3>

              <button
                type="button"
                onClick={() => carregarDocumentos(proposta.id)}
                style={{
                  padding: "9px 14px",
                  border: "1px solid #cbd5e1",
                  borderRadius: 8,
                  background: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                🔄 Atualizar
              </button>
            </div>

            {carregandoDocumentos ? (
              <div
                style={{
                  padding: 25,
                  textAlign: "center",
                  background: "#f8fafc",
                  borderRadius: 10,
                  color: "#64748b",
                }}
              >
                Carregando documentos...
              </div>
            ) : documentos.length === 0 ? (
              <div
                style={{
                  padding: 25,
                  textAlign: "center",
                  background: "#f8fafc",
                  borderRadius: 10,
                  color: "#64748b",
                }}
              >
                Nenhum documento enviado para esta proposta.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {documentos.map((documento) => (
                  <div
                    key={documento.id}
                    style={{
                      border: "1px solid #dbeafe",
                      borderRadius: 10,
                      padding: 18,
                      background: "#f8fbff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 15,
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <strong
                          style={{
                            fontSize: 16,
                            color: "#1e40af",
                          }}
                        >
                          📄{" "}
                          {documento.nome_documento ||
                            documento.nome_arquivo ||
                            "Documento"}
                        </strong>

                        <div
                          style={{
                            marginTop: 8,
                            color: "#475569",
                            fontSize: 13,
                            lineHeight: 1.6,
                          }}
                        >
                          📎 Arquivo:{" "}
                          {documento.nome_arquivo || "Não informado"}
                          <br />
                          👤 Enviado por:{" "}
                          {documento.enviado_por || "Usuário do Portal"}
                          <br />
                          🕐 Enviado em:{" "}
                          {formatarData(documento.enviado_em)}
                          <br />
                          💾 Tamanho:{" "}
                          {formatarTamanho(documento.tamanho_arquivo)}
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={!documento.caminho_arquivo}
                        onClick={() => baixarDocumento(documento)}
                        style={{
                          padding: "11px 18px",
                          border: "none",
                          borderRadius: 8,
                          background: documento.caminho_arquivo
                            ? "#16a34a"
                            : "#94a3b8",
                          color: "#fff",
                          fontWeight: 700,
                          cursor: documento.caminho_arquivo
                            ? "pointer"
                            : "not-allowed",
                          whiteSpace: "nowrap",
                        }}
                      >
                        📥 Baixar documento
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
