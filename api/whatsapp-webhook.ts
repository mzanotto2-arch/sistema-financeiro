const VERIFY_TOKEN =
  (globalThis as any).process?.env?.WHATSAPP_VERIFY_TOKEN || "";

const ACCESS_TOKEN =
  (globalThis as any).process?.env?.WHATSAPP_ACCESS_TOKEN || "";

const PHONE_NUMBER_ID =
  (globalThis as any).process?.env?.WHATSAPP_PHONE_NUMBER_ID || "";

const GRAPH_API_VERSION = "v26.0";

export default async function handler(req: any, res: any) {
  // ==========================================
  // VERIFICAÇÃO DO WEBHOOK DA META
  // ==========================================
  if (req.method === "GET") {
    const mode = req.query?.["hub.mode"];
    const token = req.query?.["hub.verify_token"];
    const challenge = req.query?.["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }

    return res.status(403).json({
      error: "Token de verificação inválido",
    });
  }

  // ==========================================
  // RECEBIMENTO DE EVENTOS DO WHATSAPP
  // ==========================================
  if (req.method === "POST") {
    console.log(
      "Webhook WhatsApp recebido:",
      JSON.stringify(req.body, null, 2)
    );

    try {
      const message =
        req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

      // Se não for uma mensagem recebida, apenas confirma o recebimento.
      if (!message) {
        return res.status(200).json({
          received: true,
        });
      }

      const from = message.from;

      console.log("Mensagem recebida de:", from);

      // ==========================================
      // ENVIA RESPOSTA PELA WHATSAPP CLOUD API
      // ==========================================

      const response = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: from,
            type: "text",
            text: {
              body:
                "✅ Teste realizado com sucesso!\n\nO WhatsApp Cloud API está conectado ao nosso sistema.",
            },
          }),
        }
      );

      const result = await response.json();

      console.log(
        "Resposta da Meta:",
        JSON.stringify(result, null, 2)
      );

      if (!response.ok) {
        return res.status(500).json({
          error: "Erro ao enviar mensagem pela Meta",
          details: result,
        });
      }

      return res.status(200).json({
        received: true,
        sent: true,
        result,
      });
    } catch (error: any) {
      console.error("Erro no WhatsApp:", error);

      return res.status(500).json({
        error: "Erro interno ao processar WhatsApp",
        details: error?.message || "Erro desconhecido",
      });
    }
  }

  return res.status(405).json({
    error: "Método não permitido",
  });
}