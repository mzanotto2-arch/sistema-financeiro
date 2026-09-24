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

  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [documentos, setDocumentos] = useState<Documento[]>([]);

  const [instituicaoSelecionada, setInstituicaoSelecionada] =
    useState("");

  const [propostaSelecionada, setPropostaSelecionada] =
    useState("");

  const [carregandoDocumentos, setCarregandoDocumentos] =
    useState(false);

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

      const { data, error } =
        await supabase.rpc("portal_admin_eh");

      if (error) {
        console.error(
          "Erro ao verificar administrador:",
          error
        );

        setAutorizado(false);
        setMensagem(
          "Não foi possível verificar o acesso administrativo."
        );

        return;
      }

      if (!data) {
        setAutorizado(false);
        setMensagem(
          "Seu usuário não possui acesso administrativo."
        );

        return;
      }

      setAutorizado(true);

      await carregarInstituicoes();
    } catch (error: any) {
      console.error("Erro inesperado:", error);

      setAutorizado(false);

      setMensagem(
        error?.message ||
          "Ocorreu um erro ao verificar o acesso."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function carregarInstituicoes() {
    const { data, error } = await supabase
      .from("portal_instituicoes")
      .select("id, nome, cnpj, ativo")
      .order("nome");

    if (error) {
      console.error(
        "Erro ao carregar instituições:",
        error
      );

      setMensagem(
        "Não foi possível carregar as instituições."
      );

      return;
    }

    setInstituicoes(data || []);
  }

  async function selecionarInstituicao(id: string) {
    setInstituicaoSelecionada(id);
    setPropostaSelecionada("");
    setPropostas([]);
    setDocumentos([]);
    setMensagem("");

    if (!id) {
      return;
    }

    const { data, error } = await supabase
      .from("portal_propostas")
      .select(
        "id, instituicao_id, codigo_proposta, numero_instrumento, descricao, ativo"
      )
      .eq("instituicao_id", id)
      .order("codigo_proposta");

    if (error) {
      console.error(
        "Erro ao carregar propostas:",
        error
      );

      setMensagem(
        "Não foi possível carregar as propostas."
      );

      return;
    }

    setPropostas(data || []);
  }

  async function selecionarProposta(id: string) {
    setPropostaSelecionada(id);
    setDocumentos([]);
    setMensagem("");

    if (!id) {
      return;
    }

    await carregarDocumentos(id);
  }

  async function carregarDocumentos(propostaId: string) {
    try {
      setCarregandoDocumentos(true);
      setMensagem("");

      const { data, error } =
        await supabase.rpc("portal_listar_documentos", {
          p_proposta_id: propostaId,
        });

      if (error) {
        console.error(
          "Erro ao carregar documentos:",
          error
        );

        setMensagem(
          error.message ||
            "Não foi possível carregar os documentos."
        );

        return;
      }

      setDocumentos(
        (data || []) as Documento[]
      );
    } catch (error: any) {
      console.error(
        "Erro inesperado ao carregar documentos:",
        error
      );

      setMensagem(
        error?.message ||
          "Não foi possível carregar os documentos."
      );
    } finally {
      setCarregandoDocumentos(false);
    }
  }

  async function baixarDocumento(
    documento: Documento
  ) {
    if (!documento.caminho_arquivo) {
      alert(
        "Este documento não possui arquivo salvo."
      );
      return;
    }

    try {
      const { data, error } =
        await supabase.storage
          .from("portal-documentos")
          .createSignedUrl(
            documento.caminho_arquivo,
            60 * 60,
            {
              download:
                documento.nome_arquivo || true,
            }
          );

      if (error) {
        console.error(
          "Erro ao gerar link para download:",
          error
        );

        alert(
          error.message ||
            "Não foi possível baixar o documento."
        );

        return;
      }

      if (!data?.signedUrl) {
        alert(
          "Não foi possível gerar o link do documento."
        );

        return;
      }

      const link =
        document.createElement("a");

      link.href = data.signedUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      document.body.appendChild(link);

      link.click();

      link.remove();
    } catch (error: any) {
      console.error(
        "Erro ao baixar documento:",
        error
      );

      alert(
        error?.message ||
          "Não foi possível baixar o documento."
      );
    }
  }

  function formatarData(
    data: string | null
  ) {
    if (!data) {
      return "-";
    }

    return new Date(data).toLocaleString(
      "pt-BR"
    );
  }

  function formatarTamanho(
    tamanho: number | null
  ) {
    if (!tamanho) {
      return "-";
    }

    if (tamanho < 1024) {
      return `${tamanho} B`;
    }

    if (tamanho < 1024 * 1024) {
      return `${(
        tamanho / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      tamanho /
      (1024 * 1024)
    ).toFixed(1)} MB`;
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
          boxShadow:
            "0 5px 25px rgba(0,0,0,.10)",
        }}
      >
        <h1 style={{ color: "#b91c1c" }}>
          🔒 Acesso não autorizado
        </h1>

        <p style={{ color: "#475569" }}>
          {mensagem ||
            "Você não possui permissão para acessar esta área."}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: 30,
          marginBottom: 25,
          boxShadow:
            "0 5px 25px rgba(0,0,0,.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                color: "#1f3c88",
              }}
            >
              📁 Portal da Instituição
            </h1>

            <p
              style={{
                marginTop: 8,
                color: "#64748b",
              }}
            >
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
            border:
              "1px solid #fed7aa",
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
          boxShadow:
            "0 5px 25px rgba(0,0,0,.08)",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            color: "#1e3a8a",
          }}
        >
          Instituições
        </h2>

        <p
          style={{
            color: "#64748b",
          }}
        >
          Selecione uma instituição para
          visualizar os documentos recebidos.
        </p>

        <select
          value={instituicaoSelecionada}
          onChange={(e) =>
            selecionarInstituicao(
              e.target.value
            )
          }
          style={{
            width: "100%",
            padding: 14,
            border:
              "1px solid #cbd5e1",
            borderRadius: 8,
            fontSize: 15,
            background: "#fff",
            marginTop: 10,
          }}
        >
          <option value="">
            Selecione uma instituição
          </option>

          {instituicoes.map(
            (instituicao) => (
              <option
                key={instituicao.id}
                value={instituicao.id}
              >
                {instituicao.nome}
                {instituicao.cnpj
                  ? ` — ${instituicao.cnpj}`
                  : ""}
              </option>
            )
          )}
        </select>

        {instituicaoSelecionada && (
          <div
            style={{
              marginTop: 25,
            }}
          >
            <h3
              style={{
                color: "#334155",
              }}
            >
              Propostas
            </h3>

            <select
              value={
                propostaSelecionada
              }
              onChange={(e) =>
                selecionarProposta(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding: 14,
                border:
                  "1px solid #cbd5e1",
                borderRadius: 8,
                fontSize: 15,
                background: "#fff",
              }}
            >
              <option value="">
                Selecione uma proposta
              </option>

              {propostas.map(
                (proposta) => (
                  <option
                    key={proposta.id}
                    value={proposta.id}
                  >
                    {proposta.codigo_proposta}
                    {proposta.numero_instrumento
                      ? ` — ${proposta.numero_instrumento}`
                      : ""}
                  </option>
                )
              )}
            </select>
          </div>
        )}

        {propostaSelecionada && (
          <div
            style={{
              marginTop: 30,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom: 15,
                gap: 15,
                flexWrap: "wrap",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: "#1e3a8a",
                }}
              >
                📄 Documentos recebidos
              </h3>

              <button
                type="button"
                onClick={() =>
                  carregarDocumentos(
                    propostaSelecionada
                  )
                }
                style={{
                  padding:
                    "9px 14px",
                  border:
                    "1px solid #cbd5e1",
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
                  background:
                    "#f8fafc",
                  borderRadius: 10,
                  color: "#64748b",
                }}
              >
                Carregando documentos...
              </div>
            ) : documentos.length ===
              0 ? (
              <div
                style={{
                  padding: 25,
                  textAlign: "center",
                  background:
                    "#f8fafc",
                  borderRadius: 10,
                  color: "#64748b",
                }}
              >
                Nenhum documento enviado
                para esta proposta.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: 12,
                }}
              >
                {documentos.map(
                  (documento) => (
                    <div
                      key={documento.id}
                      style={{
                        border:
                          "1px solid #dbeafe",
                        borderRadius: 10,
                        padding: 18,
                        background:
                          "#f8fbff",
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          alignItems:
                            "flex-start",
                          gap: 15,
                          flexWrap:
                            "wrap",
                        }}
                      >
                        <div>
                          <strong
                            style={{
                              fontSize: 16,
                              color:
                                "#1e40af",
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
                              color:
                                "#475569",
                              fontSize: 13,
                              lineHeight:
                                1.6,
                            }}
                          >
                            📎 Arquivo:{" "}
                            {documento.nome_arquivo ||
                              "Não informado"}
                            <br />

                            👤 Enviado por:{" "}
                            {documento.enviado_por ||
                              "Usuário do Portal"}
                            <br />

                            🕐 Enviado em:{" "}
                            {formatarData(
                              documento.enviado_em
                            )}
                            <br />

                            💾 Tamanho:{" "}
                            {formatarTamanho(
                              documento.tamanho_arquivo
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={
                            !documento.caminho_arquivo
                          }
                          onClick={() =>
                            baixarDocumento(
                              documento
                            )
                          }
                          style={{
                            padding:
                              "11px 18px",
                            border: "none",
                            borderRadius: 8,
                            background:
                              documento.caminho_arquivo
                                ? "#16a34a"
                                : "#94a3b8",
                            color: "#fff",
                            fontWeight: 700,
                            cursor:
                              documento.caminho_arquivo
                                ? "pointer"
                                : "not-allowed",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          📥 Baixar documento
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}