const VERIFY_TOKEN =
  (globalThis as any).process?.env?.WHATSAPP_VERIFY_TOKEN || "";

export default async function handler(req: any, res: any) {
  // VERIFICAÇÃO DA META
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

  // RECEBIMENTO DE EVENTOS DO WHATSAPP
  if (req.method === "POST") {
    console.log(
      "Webhook WhatsApp recebido:",
      JSON.stringify(req.body, null, 2)
    );

    return res.status(200).json({
      received: true,
    });
  }

  return res.status(405).json({
    error: "Método não permitido",
  });
}