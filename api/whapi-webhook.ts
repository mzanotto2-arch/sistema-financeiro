const WHAPI_TOKEN = (globalThis as any).process?.env?.WHAPI_TOKEN || "";
const OPENAI_API_KEY = (globalThis as any).process?.env?.OPENAI_API_KEY || "";
const OPENAI_PROMPT_ID = (globalThis as any).process?.env?.OPENAI_PROMPT_ID || "";

const WHAPI_URL = "https://gate.whapi.cloud/messages/text";
const OPENAI_URL = "https://api.openai.com/v1/responses";

async function enviarMensagem(chatId: string, body: string) {
  const response = await fetch(WHAPI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHAPI_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: chatId,
      body,
    }),
  });

  const result = await response.json().catch(() => ({}));

  console.log(
    "Resposta do Whapi:",
    JSON.stringify({ status: response.status, result }, null, 2),
  );

  return { response, result };
}

function limparResultadoEditais(texto: string): string {
  const textoInicial = texto.trim();
  if (!textoInicial) return "";

  // Separa oportunidades numeradas ou identificadas por marcador.
  const blocos = textoInicial
    .split(/(?=📌\s*(?:Edital|Oportunidade)|(?=\n\d+[.)]\s))/i)
    .map((bloco) => bloco.trim())
    .filter(Boolean);

  const itens = blocos.length ? blocos : [textoInicial];

  return itens
    .map((bloco) => {
      const urls = [
        ...bloco.matchAll(/https?:\/\/[^\s<>)\]]+/gi),
      ].map((match) => match[0].replace(/[),.;]+$/g, ""));

      // Prioriza links de órgãos públicos; se não houver, usa o primeiro link encontrado.
      const linkOficial =
        urls.find((url) => /gov\.br|\.gov\.br|\.jus\.br|\.leg\.br/i.test(url)) ||
        urls[0];

      let textoLimpo = bloco;

      // Remove links Markdown e URLs do corpo para evitar duplicação.
      textoLimpo = textoLimpo.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/gi, "$1");
      textoLimpo = textoLimpo.replace(/https?:\/\/[^\s<>)\]]+/gi, "");
      textoLimpo = textoLimpo.replace(/🔗\s*\*{0,2}\s*Edital oficial:?\s*\*{0,2}/gi, "");
      textoLimpo = textoLimpo.replace(/\(\s*(?:gov\.br|www\.[^)]+)\s*\)/gi, "");
      textoLimpo = textoLimpo.replace(/[ \t]+\n/g, "\n");
      textoLimpo = textoLimpo.replace(/\n{3,}/g, "\n\n").trim();

      if (linkOficial) {
        textoLimpo += `\n\n🔗 Edital oficial:\n${linkOficial}`;
      }

      return textoLimpo;
    })
    .filter(Boolean)
    .join("\n\n");
}

export default async function handler(req: any, res: any) {
  // Verificação simples do endpoint do webhook.
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      webhook: "Whapi conectado",
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];

    if (messages.length === 0) {
      return res.status(200).json({ received: true });
    }

    const comandos: Record<string, string> = {
      "@editalcultura": "pesquisa geral e nacional de oportunidades para OSCs e terceiro setor",
      "@esporte": "pesquisa de oportunidades e editais da área de esporte",
      "@mulheres": "pesquisa de oportunidades e editais voltados para mulheres",
      "@saude": "pesquisa de oportunidades e editais da área de saúde",
      "@ambiental": "pesquisa de oportunidades e editais de meio ambiente e sustentabilidade",
      "@cultura": "pesquisa de oportunidades e editais da área de cultura",
      "@educacao": "pesquisa de oportunidades e editais da área de educação",
      "@assistenciasocial": "pesquisa de oportunidades e editais de assistência social",
      "@inclusao": "pesquisa de oportunidades e editais de inclusão e pessoas com deficiência",
      "@direitoshumanos": "pesquisa de oportunidades e editais de direitos humanos",
      "@criancaseadolescentes": "pesquisa de oportunidades e editais voltados para crianças e adolescentes",
      "@norte": "pesquisa de oportunidades e editais com abrangência ou interesse na região Norte do Brasil",
      "@nordeste": "pesquisa de oportunidades e editais com abrangência ou interesse na região Nordeste do Brasil",
      "@sudeste": "pesquisa de oportunidades e editais com abrangência ou interesse na região Sudeste do Brasil",
      "@centrooeste": "pesquisa de oportunidades e editais com abrangência ou interesse na região Centro-Oeste do Brasil",
      "@sul": "pesquisa de oportunidades e editais com abrangência ou interesse na região Sul do Brasil",
      "@acre": "pesquisa de oportunidades e editais com abrangência ou interesse no Acre",
      "@alagoas": "pesquisa de oportunidades e editais com abrangência ou interesse em Alagoas",
      "@amapa": "pesquisa de oportunidades e editais com abrangência ou interesse no Amapá",
      "@amazonas": "pesquisa de oportunidades e editais com abrangência ou interesse no Amazonas",
      "@bahia": "pesquisa de oportunidades e editais com abrangência ou interesse na Bahia",
      "@ceara": "pesquisa de oportunidades e editais com abrangência ou interesse no Ceará",
      "@distritofederal": "pesquisa de oportunidades e editais com abrangência ou interesse no Distrito Federal",
      "@espiritosanto": "pesquisa de oportunidades e editais com abrangência ou interesse no Espírito Santo",
      "@goias": "pesquisa de oportunidades e editais com abrangência ou interesse em Goiás",
      "@maranhao": "pesquisa de oportunidades e editais com abrangência ou interesse no Maranhão",
      "@matogrosso": "pesquisa de oportunidades e editais com abrangência ou interesse em Mato Grosso",
      "@matogrossodosul": "pesquisa de oportunidades e editais com abrangência ou interesse em Mato Grosso do Sul",
      "@minasgerais": "pesquisa de oportunidades e editais com abrangência ou interesse em Minas Gerais",
      "@para": "pesquisa de oportunidades e editais com abrangência ou interesse no Pará",
      "@paraiba": "pesquisa de oportunidades e editais com abrangência ou interesse na Paraíba",
      "@parana": "pesquisa de oportunidades e editais com abrangência ou interesse no Paraná",
      "@pernambuco": "pesquisa de oportunidades e editais com abrangência ou interesse em Pernambuco",
      "@piaui": "pesquisa de oportunidades e editais com abrangência ou interesse no Piauí",
      "@riodejaneiro": "pesquisa de oportunidades e editais com abrangência ou interesse no Rio de Janeiro",
      "@riograndedonorte": "pesquisa de oportunidades e editais com abrangência ou interesse no Rio Grande do Norte",
      "@riograndedosul": "pesquisa de oportunidades e editais com abrangência ou interesse no Rio Grande do Sul",
      "@rondonia": "pesquisa de oportunidades e editais com abrangência ou interesse em Rondônia",
      "@roraima": "pesquisa de oportunidades e editais com abrangência ou interesse em Roraima",
      "@santacatarina": "pesquisa de oportunidades e editais com abrangência ou interesse em Santa Catarina",
      "@saopaulo": "pesquisa de oportunidades e editais com abrangência ou interesse em São Paulo",
      "@sergipe": "pesquisa de oportunidades e editais com abrangência ou interesse em Sergipe",
      "@tocantins": "pesquisa de oportunidades e editais com abrangência ou interesse no Tocantins",
    };

    for (const message of messages) {
      // Ignora mensagens do próprio bot e mensagens que não sejam texto.
      if (message?.from_me || message?.type !== "text") continue;

      const chatId = message?.chat_id;
      const texto = String(message?.text?.body || "").trim().toLowerCase();

      console.log("Mensagem recebida:", { chatId, texto });

      // Responde apenas em grupos e apenas quando um comando exato é enviado.
      if (!chatId || !chatId.endsWith("@g.us")) continue;

      const pesquisa = comandos[texto];
      if (!pesquisa) continue;

      if (!WHAPI_TOKEN) {
        console.error("WHAPI_TOKEN não configurado.");
        return res.status(500).json({ error: "WHAPI_TOKEN não configurado" });
      }

      if (!OPENAI_API_KEY) {
        console.error("OPENAI_API_KEY não configurada.");
        return res.status(500).json({ error: "OPENAI_API_KEY não configurada" });
      }

      if (!OPENAI_PROMPT_ID) {
        console.error("OPENAI_PROMPT_ID não configurado.");
        return res.status(500).json({ error: "OPENAI_PROMPT_ID não configurado" });
      }

      await enviarMensagem(
        chatId,
        `🔎 *Pesquisando editais abertos...*\n\nEstou verificando ${pesquisa}.\n\nSó vou enviar oportunidades com inscrição aberta e prazo de submissão confirmado.`,
      );

      const openAIResponse = await fetch(OPENAI_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: {
            id: OPENAI_PROMPT_ID,
          },
          // Configura explicitamente a pesquisa na web na Responses API.
          tools: [
            {
              type: "web_search",
              search_context_size: "high",
            },
          ],
          input:
            `Execute agora uma ${pesquisa} para o Clube de Captação de Recursos. ` +
            "Pesquise na web neste momento. Retorne somente oportunidades para as quais a fonte oficial confirme que as inscrições estão abertas e informe o prazo final de submissão. " +
            "Para cada oportunidade, informe nome do edital, órgão responsável, público elegível, abrangência geográfica, valor ou faixa de apoio se publicado, prazo final e link oficial. " +
            "Não invente informações. Se não conseguir confirmar oportunidades abertas e seus prazos em fontes oficiais, diga claramente que não encontrou oportunidades confirmadas.",
          max_output_tokens: 2200,
        }),
      });

      const openAIResult = await openAIResponse.json().catch(() => ({}));

      console.log("Status OpenAI:", openAIResponse.status);
      console.log("Resposta completa da OpenAI:", JSON.stringify(openAIResult, null, 2));

      if (!openAIResponse.ok) {
        console.error("Erro na OpenAI:", openAIResult);

        await enviarMensagem(
          chatId,
          "⚠️ Tive um problema ao consultar os editais agora.\n\nNenhuma oportunidade foi publicada sem verificação.",
        );

        continue;
      }

      let resultado = "";

      if (typeof openAIResult?.output_text === "string") {
        resultado = openAIResult.output_text.trim();
      }

      if (!resultado && Array.isArray(openAIResult?.output)) {
        const partesTexto = openAIResult.output.flatMap((item: any) => {
          if (!Array.isArray(item?.content)) return [];

          return item.content
            .filter(
              (content: any) =>
                content?.type === "output_text" &&
                typeof content?.text === "string",
            )
            .map((content: any) => content.text);
        });

        resultado = partesTexto.join("\n").trim();
      }

      console.log("Texto final extraído da OpenAI:", resultado);

      if (!resultado) {
        console.error("A OpenAI respondeu, mas nenhum texto foi encontrado.");

        await enviarMensagem(
          chatId,
          "📚 *Nenhum edital confirmado neste momento.*\n\nNão encontrei uma oportunidade com inscrição comprovadamente aberta e prazo de submissão confirmado.",
        );

        continue;
      }

      const resultadoLimpo = limparResultadoEditais(resultado);

      console.log("Resultado após limpeza:", resultadoLimpo);

      const mensagemFinal =
        "📚 *EDITAIS ABERTOS — CLUBE*\n\n" +
        resultadoLimpo +
        "\n\n⚠️ *Importante:* confira o prazo e os critérios na fonte oficial antes de submeter a proposta.";

      const envioFinal = await enviarMensagem(chatId, mensagemFinal);

      if (!envioFinal.response.ok) {
        console.error("Erro ao enviar resultado:", envioFinal.result);

        return res.status(500).json({
          error: "Erro ao enviar os editais pelo Whapi",
          details: envioFinal.result,
        });
      }
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error("Erro no webhook Whapi:", error);

    return res.status(500).json({
      error: "Erro interno no webhook Whapi",
      details: error?.message || "Erro desconhecido",
    });
  }
}
