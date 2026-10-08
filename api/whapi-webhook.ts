const WHAPI_TOKEN =
  (globalThis as any).process?.env?.WHAPI_TOKEN || "";

const OPENAI_API_KEY =
  (globalThis as any).process?.env?.OPENAI_API_KEY || "";

const OPENAI_PROMPT_ID =
  (globalThis as any).process?.env?.OPENAI_PROMPT_ID || "";

const WHAPI_URL =
  "https://gate.whapi.cloud/messages/text";

const OPENAI_URL =
  "https://api.openai.com/v1/responses";

async function enviarMensagem(
  chatId: string,
  body: string
) {
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

  const result = await response.json();

  console.log(
    "Resposta do Whapi:",
    JSON.stringify(result, null, 2)
  );

  return {
    response,
    result,
  };
}

export default async function handler(
  req: any,
  res: any
) {
  // ==========================================
  // VERIFICAÇÃO DO WEBHOOK PELA WHAPI
  // ==========================================

  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      webhook: "Whapi conectado",
    });
  }

  // ==========================================
  // ACEITA SOMENTE POST
  // ==========================================

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método não permitido",
    });
  }

  try {
    // ==========================================
    // RECEBE AS MENSAGENS
    // ==========================================

    const messages = Array.isArray(
      req.body?.messages
    )
      ? req.body.messages
      : [];

    if (messages.length === 0) {
      return res.status(200).json({
        received: true,
      });
    }

    // ==========================================
    // PROCESSA AS MENSAGENS
    // ==========================================

    for (const message of messages) {
      // Ignora mensagens enviadas pelo próprio bot
      if (message?.from_me) {
        continue;
      }

      // Trabalha somente com texto
      if (message?.type !== "text") {
        continue;
      }

      const chatId = message?.chat_id;

      const texto = (
        message?.text?.body || ""
      )
        .trim()
        .toLowerCase();

      console.log(
        "Mensagem recebida:",
        {
          chatId,
          texto,
        }
      );

      // ==========================================
      // SÓ RESPONDE EM GRUPOS
      // ==========================================

      if (
        !chatId ||
        !chatId.endsWith("@g.us")
      ) {
        continue;
      }

      // ==========================================
      // COMANDO PRINCIPAL
      // ==========================================

      if (texto !== "@editalcultura") {
        continue;
      }

      // ==========================================
      // VERIFICA WHAPI TOKEN
      // ==========================================

      if (!WHAPI_TOKEN) {
        console.error(
          "WHAPI_TOKEN não configurado."
        );

        return res.status(500).json({
          error:
            "WHAPI_TOKEN não configurado",
        });
      }

      // ==========================================
      // VERIFICA OPENAI API KEY
      // ==========================================

      if (!OPENAI_API_KEY) {
        console.error(
          "OPENAI_API_KEY não configurada."
        );

        return res.status(500).json({
          error:
            "OPENAI_API_KEY não configurada",
        });
      }

      // ==========================================
      // VERIFICA PROMPT ID
      // ==========================================

      if (!OPENAI_PROMPT_ID) {
        console.error(
          "OPENAI_PROMPT_ID não configurado."
        );

        return res.status(500).json({
          error:
            "OPENAI_PROMPT_ID não configurado",
        });
      }

      // ==========================================
      // AVISA QUE A PESQUISA COMEÇOU
      // ==========================================

      await enviarMensagem(
        chatId,
        "🔎 *Pesquisando editais abertos...*\n\n" +
        "Estou verificando oportunidades atuais para OSCs e projetos do terceiro setor.\n\n" +
        "Só vou enviar oportunidades com inscrição aberta e prazo de submissão confirmado."
      );

      // ==========================================
      // CONSULTA O PROMPT PUBLICADO DA OPENAI
      // ==========================================

      const openAIResponse = await fetch(
        OPENAI_URL,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${OPENAI_API_KEY}`,
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            prompt: {
              id: OPENAI_PROMPT_ID,
            },

            input:
              "Execute agora a pesquisa geral e nacional de oportunidades para o Clube de Captação de Recursos. Pesquise na web neste momento e retorne somente oportunidades com inscrições comprovadamente abertas e prazo de submissão confirmado.",

            max_output_tokens: 2200,
          }),
        }
      );

      const openAIResult =
        await openAIResponse.json();

      // ==========================================
      // LOGS DA OPENAI
      // ==========================================

      console.log(
        "Status OpenAI:",
        openAIResponse.status
      );

      console.log(
        "Resposta completa da OpenAI:",
        JSON.stringify(
          openAIResult,
          null,
          2
        )
      );

      // ==========================================
      // ERRO NA OPENAI
      // ==========================================

      if (!openAIResponse.ok) {
        console.error(
          "Erro na OpenAI:",
          openAIResult
        );

        await enviarMensagem(
          chatId,
          "⚠️ Tive um problema ao consultar os editais agora.\n\n" +
          "Nenhuma oportunidade foi publicada sem verificação."
        );

        continue;
      }

      // ==========================================
      // EXTRAI O TEXTO DA RESPOSTA
      // ==========================================

      let resultado = "";

      // Primeiro tenta output_text
      if (
        typeof openAIResult?.output_text ===
        "string"
      ) {
        resultado =
          openAIResult.output_text.trim();
      }

      // Se não encontrou, percorre output[].content[]
      if (
        !resultado &&
        Array.isArray(openAIResult?.output)
      ) {
        const partesTexto =
          openAIResult.output.flatMap(
            (item: any) => {
              if (
                !Array.isArray(
                  item?.content
                )
              ) {
                return [];
              }

              return item.content
                .filter(
                  (content: any) =>
                    content?.type ===
                      "output_text" &&
                    typeof content?.text ===
                      "string"
                )
                .map(
                  (content: any) =>
                    content.text
                );
            }
          );

        resultado =
          partesTexto
            .join("\n")
            .trim();
      }

      console.log(
        "Texto final extraído da OpenAI:",
        resultado
      );

      // ==========================================
      // NENHUM RESULTADO
      // ==========================================

      if (!resultado) {
        console.error(
          "A OpenAI respondeu, mas nenhum texto foi encontrado."
        );

        await enviarMensagem(
          chatId,
          "📚 *Nenhum edital confirmado neste momento.*\n\n" +
          "Não encontrei uma oportunidade com inscrição comprovadamente aberta e prazo de submissão confirmado."
        );

        continue;
      }

      // ==========================================
      // MENSAGEM FINAL
      // ==========================================

      const mensagemFinal =
        "📚 *EDITAIS ABERTOS — CLUBE*\n\n" +
        resultado +
        "\n\n" +
        "⚠️ *Importante:* os prazos devem ser conferidos na fonte oficial antes da submissão.";

      const envioFinal =
        await enviarMensagem(
          chatId,
          mensagemFinal
        );

      // ==========================================
      // ERRO NO ENVIO FINAL
      // ==========================================

      if (!envioFinal.response.ok) {
        console.error(
          "Erro ao enviar resultado:",
          envioFinal.result
        );

        return res.status(500).json({
          error:
            "Erro ao enviar os editais pelo Whapi",

          details:
            envioFinal.result,
        });
      }
    }

    // ==========================================
    // FINALIZADO
    // ==========================================

    return res.status(200).json({
      received: true,
    });

  } catch (error: any) {
    console.error(
      "Erro no webhook Whapi:",
      error
    );

    return res.status(500).json({
      error:
        "Erro interno no webhook Whapi",

      details:
        error?.message ||
        "Erro desconhecido",
    });
  }
}