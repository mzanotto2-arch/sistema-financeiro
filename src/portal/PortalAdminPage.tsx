import { useEffect, useMemo, useState } from "react";
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

type DocumentoBanco = {
  id: string;
  nome_documento: string;
  descricao: string | null;
  obrigatorio: boolean | null;
  nome_arquivo: string | null;
  caminho_arquivo: string | null;
  tamanho_arquivo: number | null;
  tipo_arquivo: string | null;
  enviado_em: string | null;
  enviado_por: string | null;
};

type DocumentoExibicao = {
  id: string;
  nome: string;
  nomeArquivo: string | null;
  caminhoArquivo: string | null;
  tamanho: number | null;
  tipoArquivo: string | null;
  enviadoEm: string | null;
  enviadoPor: string | null;
  concluido: boolean;
};

type FornecedorPagamento = {
  nome: string;
  documentos: DocumentoExibicao[];
};

type MesPagamento = {
  chave: string;
  mes: number;
  ano: number;
  fornecedores: FornecedorPagamento[];
};

const DOCUMENTOS_PROPOSTA = [
  "Estatuto",
  "Portfólio",
  "CNPJ",
  "Certidões",
  "Declarações",
  "Fotos",
  "Documentos bancários",
  "Site da instituição",
];

const DOCUMENTOS_PAGAMENTO = [
  "Cotação 1",
  "Cotação 2",
  "Cotação 3",
  "Certidão Municipal",
  "Certidão Federal",
  "Certidão Trabalhista",
  "Certidão FGTS",
  "Certidão Estadual",
  "Cartão CNPJ",
  "Nota Fiscal",
];

const NOMES_MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export default function PortalAdmin() {
  const [carregando, setCarregando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);

  const [codigoProposta, setCodigoProposta] = useState("");
  const [proposta, setProposta] = useState<Proposta | null>(null);
  const [instituicao, setInstituicao] = useState<Instituicao | null>(null);

  const [documentosBanco, setDocumentosBanco] = useState<DocumentoBanco[]>([]);
  const [carregandoDocumentos, setCarregandoDocumentos] = useState(false);
  const [carregandoProposta, setCarregandoProposta] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [pesquisa, setPesquisa] = useState("");

  const [mesesPagamento, setMesesPagamento] = useState<MesPagamento[]>([]);
  const [mesesAbertos, setMesesAbertos] = useState<Record<string, boolean>>({});
  const [fornecedoresAbertos, setFornecedoresAbertos] = useState<Record<string, boolean>>({});

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
      setMensagem(error?.message || "Ocorreu um erro ao verificar o acesso.");
    } finally {
      setCarregando(false);
    }
  }

  async function localizarProposta() {
    const codigo = codigoProposta.trim();

    setMensagem("");
    setProposta(null);
    setInstituicao(null);
    setDocumentosBanco([]);
    setMesesPagamento([]);
    setMesesAbertos({});
    setFornecedoresAbertos({});

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
      setMensagem(error?.message || "Não foi possível localizar a proposta.");
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
        setMensagem(error.message || "Não foi possível carregar os documentos.");
        return;
      }

      const registros = (data || []) as DocumentoBanco[];
      setDocumentosBanco(registros);
      reconstruirPagamentos(registros);
    } catch (error: any) {
      console.error("Erro inesperado ao carregar documentos:", error);
      setMensagem(error?.message || "Não foi possível carregar os documentos.");
    } finally {
      setCarregandoDocumentos(false);
    }
  }

  function reconstruirPagamentos(registros: DocumentoBanco[]) {
    const grupos = new Map<string, Map<string, DocumentoBanco[]>>();

    for (const item of registros) {
      if (!item.descricao) continue;

      try {
        const meta = JSON.parse(item.descricao);

        if (
          meta?.tipo !== "pagamento" ||
          !meta?.mes ||
          !meta?.ano ||
          !meta?.fornecedor ||
          !meta?.documento
        ) {
          continue;
        }

        const chaveMes = `${Number(meta.ano)}-${Number(meta.mes)}`;
        const fornecedor = String(meta.fornecedor);

        if (!grupos.has(chaveMes)) {
          grupos.set(chaveMes, new Map());
        }

        const fornecedores = grupos.get(chaveMes)!;
        const lista = fornecedores.get(fornecedor) || [];
        lista.push(item);
        fornecedores.set(fornecedor, lista);
      } catch {
        // Registros antigos sem JSON de pagamento são documentos normais da proposta.
      }
    }

    const resultado: MesPagamento[] = [];

    for (const [chaveMes, fornecedoresMap] of grupos.entries()) {
      const [anoTexto, mesTexto] = chaveMes.split("-");
      const ano = Number(anoTexto);
      const mes = Number(mesTexto);

      const fornecedores: FornecedorPagamento[] = [];

      for (const [nomeFornecedor, registrosFornecedor] of fornecedoresMap.entries()) {
        const documentosPorNome = new Map<string, DocumentoBanco>();

        for (const registro of registrosFornecedor) {
          let nomeDocumento = registro.nome_documento;

          try {
            const meta = JSON.parse(registro.descricao || "{}");
            nomeDocumento = String(meta.documento || registro.nome_documento);
          } catch {
            // Mantém o nome do banco.
          }

          const anterior = documentosPorNome.get(nomeDocumento);
          if (
            !anterior ||
            new Date(registro.enviado_em || 0).getTime() >
              new Date(anterior.enviado_em || 0).getTime()
          ) {
            documentosPorNome.set(nomeDocumento, registro);
          }
        }

        const documentos: DocumentoExibicao[] = DOCUMENTOS_PAGAMENTO.map((nome) => {
          const registro = documentosPorNome.get(nome);
          return montarDocumentoExibicao(nome, registro);
        });

        for (const [nome, registro] of documentosPorNome.entries()) {
          if (!DOCUMENTOS_PAGAMENTO.includes(nome)) {
            documentos.push(montarDocumentoExibicao(nome, registro));
          }
        }

        fornecedores.push({ nome: nomeFornecedor, documentos });
      }

      resultado.push({
        chave: chaveMes,
        mes,
        ano,
        fornecedores,
      });
    }

    resultado.sort((a, b) => {
      if (a.ano !== b.ano) return b.ano - a.ano;
      return b.mes - a.mes;
    });

    setMesesPagamento(resultado);
  }

  function montarDocumentoExibicao(
    nome: string,
    registro?: DocumentoBanco
  ): DocumentoExibicao {
    return {
      id: registro?.id || `${nome}-${Math.random()}`,
      nome,
      nomeArquivo: registro?.nome_arquivo || null,
      caminhoArquivo: registro?.caminho_arquivo || null,
      tamanho: registro?.tamanho_arquivo || null,
      tipoArquivo: registro?.tipo_arquivo || null,
      enviadoEm: registro?.enviado_em || null,
      enviadoPor: registro?.enviado_por || null,
      concluido: Boolean(registro?.caminho_arquivo),
    };
  }

  const documentosProposta = useMemo<DocumentoExibicao[]>(() => {
    return DOCUMENTOS_PROPOSTA.map((nome) => {
      const encontrados = documentosBanco
        .filter((item) => item.nome_documento === nome && !isPagamento(item))
        .sort(
          (a, b) =>
            new Date(b.enviado_em || 0).getTime() -
            new Date(a.enviado_em || 0).getTime()
        );

      return montarDocumentoExibicao(nome, encontrados[0]);
    });
  }, [documentosBanco]);

  const documentosPropostaFiltrados = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase();
    if (!termo) return documentosProposta;
    return documentosProposta.filter((item) =>
      item.nome.toLowerCase().includes(termo)
    );
  }, [documentosProposta, pesquisa]);

  function isPagamento(item: DocumentoBanco) {
    if (!item.descricao) return false;
    try {
      const meta = JSON.parse(item.descricao);
      return meta?.tipo === "pagamento";
    } catch {
      return false;
    }
  }

  async function baixarDocumento(documento: DocumentoExibicao) {
    if (!documento.caminhoArquivo) {
      alert("Este documento ainda não foi enviado pela instituição.");
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from("portal-documentos")
        .createSignedUrl(documento.caminhoArquivo, 60 * 60, {
          download: documento.nomeArquivo || true,
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
    if (!data) return "Ainda não enviado";
    return new Date(data).toLocaleString("pt-BR");
  }

  function formatarTamanho(tamanho: number | null) {
    if (!tamanho) return "-";
    if (tamanho < 1024) return `${tamanho} B`;
    if (tamanho < 1024 * 1024) return `${(tamanho / 1024).toFixed(1)} KB`;
    return `${(tamanho / (1024 * 1024)).toFixed(1)} MB`;
  }

  function alternarMes(chave: string) {
    setMesesAbertos((atual) => ({
      ...atual,
      [chave]: !atual[chave],
    }));
  }

  function alternarFornecedor(chave: string) {
    setFornecedoresAbertos((atual) => ({
      ...atual,
      [chave]: !atual[chave],
    }));
  }

  if (carregando) {
    return (
      <div style={{ padding: 40, textAlign: "center", fontSize: 18, color: "#334155" }}>
        Carregando área administrativa...
      </div>
    );
  }

  if (!autorizado) {
    return (
      <div style={{ maxWidth: 700, margin: "40px auto", padding: 30, background: "#fff", borderRadius: 14, boxShadow: "0 5px 25px rgba(0,0,0,.10)" }}>
        <h1 style={{ color: "#b91c1c" }}>🔒 Acesso não autorizado</h1>
        <p style={{ color: "#475569" }}>{mensagem || "Você não possui permissão para acessar esta área."}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: 30, marginBottom: 25, boxShadow: "0 5px 25px rgba(0,0,0,.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, color: "#1f3c88" }}>📁 Portal da Instituição</h1>
            <p style={{ marginTop: 8, color: "#64748b" }}>Área administrativa de documentos</p>
          </div>
          <div style={{ background: "#eff6ff", padding: "12px 18px", borderRadius: 10, color: "#1d4ed8", fontWeight: 700 }}>
            👩‍💼 Administradora
          </div>
        </div>
      </div>

      {mensagem && (
        <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", color: "#9a3412", padding: 15, borderRadius: 10, marginBottom: 20 }}>
          {mensagem}
        </div>
      )}

      <div style={{ background: "#fff", borderRadius: 14, padding: 30, boxShadow: "0 5px 25px rgba(0,0,0,.08)" }}>
        <h2 style={{ marginTop: 0, color: "#1e3a8a" }}>Buscar proposta</h2>
        <p style={{ color: "#64748b" }}>
          Digite o número/código da proposta para localizar a instituição e todos os documentos do processo.
        </p>

        <div style={{ display: "flex", gap: 10, marginTop: 15, flexWrap: "wrap" }}>
          <input
            value={codigoProposta}
            onChange={(e) => setCodigoProposta(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") localizarProposta(); }}
            placeholder="Ex.: 277602025"
            style={{ flex: 1, minWidth: 250, padding: 14, border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 15 }}
          />
          <button
            type="button"
            onClick={localizarProposta}
            disabled={carregandoProposta}
            style={{ padding: "14px 22px", border: "none", borderRadius: 8, background: "#2563eb", color: "#fff", fontWeight: 700, cursor: carregandoProposta ? "wait" : "pointer" }}
          >
            {carregandoProposta ? "Buscando..." : "🔎 Buscar proposta"}
          </button>
        </div>

        {proposta && (
          <div style={{ marginTop: 25, padding: 20, background: "#f8fafc", borderRadius: 10, border: "1px solid #dbeafe" }}>
            <h3 style={{ marginTop: 0, color: "#1e3a8a" }}>Proposta {proposta.codigo_proposta}</h3>
            <div style={{ color: "#475569", lineHeight: 1.7 }}>
              <strong>Instituição:</strong> {instituicao?.nome || "Não identificada"}<br />
              {instituicao?.cnpj && <><strong>CNPJ:</strong> {instituicao.cnpj}<br /></>}
              {proposta.numero_instrumento && <><strong>Instrumento:</strong> {proposta.numero_instrumento}<br /></>}
              {proposta.descricao && <><strong>Descrição:</strong> {proposta.descricao}</>}
            </div>
          </div>
        )}

        {proposta && (
          <>
            <section style={{ marginTop: 30 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 15, flexWrap: "wrap", marginBottom: 15 }}>
                <div>
                  <h3 style={{ margin: 0, color: "#1e3a8a" }}>📄 Documentos da proposta</h3>
                  <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 14 }}>
                    Os mesmos documentos que aparecem para a instituição anexar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => carregarDocumentos(proposta.id)}
                  style={{ padding: "9px 14px", border: "1px solid #cbd5e1", borderRadius: 8, background: "#fff", cursor: "pointer", fontWeight: 600 }}
                >
                  🔄 Atualizar
                </button>
              </div>

              <input
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                placeholder="🔎 Pesquisar documento..."
                style={{ width: "100%", boxSizing: "border-box", padding: 12, border: "1px solid #cbd5e1", borderRadius: 8, marginBottom: 15 }}
              />

              {carregandoDocumentos ? (
                <div style={{ padding: 25, textAlign: "center", background: "#f8fafc", borderRadius: 10, color: "#64748b" }}>
                  Carregando documentos...
                </div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {documentosPropostaFiltrados.map((documento) => (
                    <div key={documento.id} style={{ border: "1px solid #dbe3ef", borderRadius: 10, padding: 16, background: documento.concluido ? "#f0fdf4" : "#f8fafc" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 15, flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 250 }}>
                          <strong style={{ color: "#1f3c88", fontSize: 16 }}>📄 {documento.nome}</strong>
                          <div style={{ marginTop: 7, color: "#475569", fontSize: 13, lineHeight: 1.6 }}>
                            <strong>Status:</strong> {documento.concluido ? "✅ Concluído" : "⏳ Pendente"}<br />
                            {documento.concluido && <>
                              📎 Arquivo: {documento.nomeArquivo || "-"}<br />
                              👤 Enviado por: {documento.enviadoPor || "Usuário do Portal"}<br />
                              🕐 Enviado em: {formatarData(documento.enviadoEm)}<br />
                              💾 Tamanho: {formatarTamanho(documento.tamanho)}
                            </>}
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={!documento.caminhoArquivo}
                          onClick={() => baixarDocumento(documento)}
                          style={{ padding: "10px 15px", border: "none", borderRadius: 8, background: documento.caminhoArquivo ? "#16a34a" : "#cbd5e1", color: documento.caminhoArquivo ? "#fff" : "#64748b", fontWeight: 700, cursor: documento.caminhoArquivo ? "pointer" : "not-allowed", whiteSpace: "nowrap" }}
                        >
                          {documento.caminhoArquivo ? "📥 Baixar arquivo" : "Aguardando arquivo"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section style={{ marginTop: 40 }}>
              <div style={{ marginBottom: 15 }}>
                <h3 style={{ margin: 0, color: "#1e3a8a" }}>💰 Fase de pagamentos</h3>
                <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 14 }}>
                  Organizada por mês, fornecedor e documento, conforme o portal da instituição.
                </p>
              </div>

              {mesesPagamento.length === 0 ? (
                <div style={{ padding: 20, background: "#f8fafc", borderRadius: 10, color: "#64748b" }}>
                  Nenhum mês de pagamento possui documentos registrados nesta proposta.
                </div>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {mesesPagamento.map((mes) => {
                    const aberto = Boolean(mesesAbertos[mes.chave]);
                    const total = mes.fornecedores.reduce((soma, fornecedor) => soma + fornecedor.documentos.length, 0);
                    const concluidos = mes.fornecedores.reduce((soma, fornecedor) => soma + fornecedor.documentos.filter((d) => d.concluido).length, 0);

                    return (
                      <div key={mes.chave} style={{ border: "1px solid #dbe3ef", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
                        <button
                          type="button"
                          onClick={() => alternarMes(mes.chave)}
                          style={{ width: "100%", border: "none", background: aberto ? "#eff6ff" : "#f8fafc", padding: 16, cursor: "pointer", textAlign: "left" }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 15 }}>
                            <div>
                              <strong style={{ color: "#1f3c88", fontSize: 17 }}>📅 {NOMES_MESES[mes.mes - 1] || mes.mes} {mes.ano}</strong>
                              <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
                                {concluidos}/{total} documentos concluídos · {mes.fornecedores.length} fornecedor(es)
                              </div>
                            </div>
                            <span style={{ fontWeight: 700, color: "#334155" }}>{aberto ? "▲ Fechar" : "▼ Abrir"}</span>
                          </div>
                        </button>

                        {aberto && (
                          <div style={{ padding: 15, display: "grid", gap: 12 }}>
                            {mes.fornecedores.map((fornecedor) => {
                              const chaveFornecedor = `${mes.chave}-${fornecedor.nome}`;
                              const fornecedorAberto = Boolean(fornecedoresAbertos[chaveFornecedor]);
                              const concluidosFornecedor = fornecedor.documentos.filter((d) => d.concluido).length;

                              return (
                                <div key={chaveFornecedor} style={{ border: "1px solid #dbe3ef", borderRadius: 10, overflow: "hidden" }}>
                                  <button
                                    type="button"
                                    onClick={() => alternarFornecedor(chaveFornecedor)}
                                    style={{ width: "100%", border: "none", background: fornecedorAberto ? "#f8fbff" : "#fff", padding: 15, cursor: "pointer", textAlign: "left" }}
                                  >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 15 }}>
                                      <div>
                                        <strong style={{ color: "#1f3c88", fontSize: 16 }}>🏢 {fornecedor.nome}</strong>
                                        <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
                                          {concluidosFornecedor}/{fornecedor.documentos.length} documentos concluídos
                                        </div>
                                      </div>
                                      <span style={{ fontWeight: 700, color: "#334155" }}>{fornecedorAberto ? "▲ Fechar" : "▼ Abrir"}</span>
                                    </div>
                                  </button>

                                  {fornecedorAberto && (
                                    <div style={{ borderTop: "1px solid #dbe3ef", padding: 15, background: "#fff", display: "grid", gap: 10 }}>
                                      {fornecedor.documentos.map((documento) => (
                                        <div key={documento.id} style={{ border: "1px solid #e2e8f0", borderRadius: 9, padding: 14, background: documento.concluido ? "#f0fdf4" : "#f8fafc" }}>
                                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 15, flexWrap: "wrap" }}>
                                            <div style={{ flex: 1, minWidth: 240 }}>
                                              <strong style={{ color: "#334155" }}>📄 {documento.nome}</strong>
                                              <div style={{ marginTop: 6, color: "#64748b", fontSize: 13, lineHeight: 1.6 }}>
                                                <strong>Status:</strong> {documento.concluido ? "✅ Concluído" : "⏳ Pendente"}<br />
                                                {documento.concluido && <>
                                                  📎 Arquivo: {documento.nomeArquivo || "-"}<br />
                                                  👤 Enviado por: {documento.enviadoPor || "Usuário do Portal"}<br />
                                                  🕐 Enviado em: {formatarData(documento.enviadoEm)}<br />
                                                  💾 Tamanho: {formatarTamanho(documento.tamanho)}
                                                </>}
                                              </div>
                                            </div>
                                            <button
                                              type="button"
                                              disabled={!documento.caminhoArquivo}
                                              onClick={() => baixarDocumento(documento)}
                                              style={{ padding: "10px 15px", border: "none", borderRadius: 8, background: documento.caminhoArquivo ? "#16a34a" : "#cbd5e1", color: documento.caminhoArquivo ? "#fff" : "#64748b", fontWeight: 700, cursor: documento.caminhoArquivo ? "pointer" : "not-allowed", whiteSpace: "nowrap" }}
                                            >
                                              {documento.caminhoArquivo ? "📥 Baixar arquivo" : "Aguardando arquivo"}
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
