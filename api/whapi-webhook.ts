const WHAPI_TOKEN =
  (globalThis as any).process?.env?.WHAPI_TOKEN || "";

const WHAPI_URL = "https://gate.whapi.cloud/messages/text";

export default async function handler(req: any, res: any) {
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
  // ACEITA SOMENTE POST PARA MENSAGENS
  // ==========================================
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método não permitido",
    });
  }

  try {
    // ==========================================
    // RECEBE AS MENSAGENS DA WHAPI
    // ==========================================
    const messages = Array.isArray(req.body?.messages)
      ? req.body.messages
      : [];

    // Nenhuma mensagem recebida
    if (messages.length === 0) {
      return res.status(200).json({
        received: true,
      });
    }

    // ==========================================
    // PROCESSA CADA MENSAGEM
    // ==========================================
    for (const message of messages) {
      // Ignora mensagens enviadas pelo próprio bot
      if (message?.from_me) {
        continue;
      }

      // Trabalhamos somente com mensagens de texto
      if (message?.type !== "text") {
        continue;
      }

      const chatId = message?.chat_id;

      const texto = (
        message?.text?.body || ""
      )
        .trim()
        .toLowerCase();

      console.log("Mensagem recebida:", {
        chatId,
        texto,
      });

      // ==========================================
      // SÓ RESPONDE:
      // 1. Se existir chatId
      // 2. Se for um grupo
      // 3. Se o comando for @editalcultura
      // ==========================================
      if (
        !chatId ||
        !chatId.endsWith("@g.us") ||
        texto !== "@editalcultura"
      ) {
        continue;
      }

      // ==========================================
      // VERIFICA TOKEN
      // ==========================================
      if (!WHAPI_TOKEN) {
        console.error("WHAPI_TOKEN não configurado.");

        return res.status(500).json({
          error: "WHAPI_TOKEN não configurado",
        });
      }

      // ==========================================
      // ENVIA RESPOSTA PARA O MESMO GRUPO
      // ==========================================
      const response = await fetch(WHAPI_URL, {
        method: "POST",

        headers: {
          Authorization: `Bearer ${WHAPI_TOKEN}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          to: chatId,

          body:
            "📚 @editalcultura recebido!\n\n" +
            "A conexão do Clube com o sistema de editais está funcionando.\n\n" +
            "Agora vamos conectar a busca dos editais abertos.",
        }),
      });

      const result = await response.json();

      console.log(
        "Resposta enviada pelo Whapi:",
        JSON.stringify(result, null, 2)
      );

      // ==========================================
      // VERIFICA ERRO NO ENVIO
      // ==========================================
      if (!response.ok) {
        return res.status(500).json({
          error: "Erro ao enviar mensagem pelo Whapi",
          details: result,
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
      error: "Erro interno no webhook Whapi",
      details:
        error?.message ||
        "Erro desconhecido",
    });
  }
}