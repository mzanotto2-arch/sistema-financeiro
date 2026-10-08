const WHAPI_TOKEN =
  (globalThis as any).process?.env?.WHAPI_TOKEN || "";

const OPENAI_API_KEY =
  (globalThis as any).process?.env?.OPENAI_API_KEY || "";

const WHAPI_URL =
  "https://gate.whapi.cloud/messages/text";

const OPENAI_URL =
  "https://api.openai.com/v1/responses";

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
    const messages = Array.isArray(req.body?.messages)
      ? req.body.messages
      : [];

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

      // Trabalhamos somente com texto
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
      // SÓ RESPONDE AO COMANDO NO GRUPO
      // ==========================================
      if (
        !chatId ||
        !chatId.endsWith("@g.us") ||
        texto !== "@editalcultura"
      ) {
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
      // AVISA QUE A PESQUISA COMEÇOU
      // ==========================================
      const avisoResponse = await fetch(
        WHAPI_URL,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${WHAPI_TOKEN}`,
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            to: chatId,
            body:
              "🔎 Pesquisando os editais abertos...\n\n" +
              "Aguarde um momento. Vou buscar oportunidades atuais para OSCs, cultura e terceiro setor.",
          }),
        }
      );

      const avisoResult =
        await avisoResponse.json();

      console.log(
        "Aviso enviado:",
        JSON.stringify(
          avisoResult,
          null,
          2
        )
      );

      // ==========================================
      // PESQUISA OS EDITAIS NA INTERNET
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
            model: "gpt-5",

            tools: [
              {
                type: "web_search",
                search_context_size:
                  "high",
              },
            ],

            input: `
Você é o pesquisador oficial de editais do Clube.

Sua função é pesquisar na internet, neste momento, oportunidades de editais e chamadas públicas que estejam ABERTAS para inscrição.

O público do Clube é formado principalmente por:
- OSCs;
- associações;
- institutos;
- fundações;
- organizações do terceiro setor;
- projetos culturais;
- projetos sociais;
- projetos esportivos;
- projetos de inclusão;
- projetos educacionais.

PRIORIDADE:
1. Brasil;
2. Editais nacionais;
3. Editais estaduais;
4. Editais municipais;
5. Oportunidades privadas de institutos, fundações e empresas;
6. Leis de incentivo e chamadas públicas quando houver inscrição aberta.

NÃO inclua:
- editais encerrados;
- editais com prazo vencido;
- notícias antigas sem inscrição aberta;
- oportunidades que sejam exclusivamente para pessoas físicas quando OSCs não puderem participar;
- informações sem fonte confiável;
- oportunidades que você não consiga confirmar como atuais.

Dê preferência às fontes oficiais do órgão, ministério, secretaria, instituto, fundação ou empresa responsável pelo edital.

Pesquise agora pelos editais abertos e relevantes.

Para cada oportunidade encontrada, informe:

📌 NOME DO EDITAL
🏛️ INSTITUIÇÃO
🎯 OBJETIVO
👥 QUEM PODE PARTICIPAR
💰 VALOR / PREMIAÇÃO, quando disponível
📅 PRAZO DE INSCRIÇÃO
🔗 LINK OFICIAL

Encontre de 3 a 5 oportunidades realmente relevantes.

IMPORTANTE:
- Não invente informações.
- Se uma informação não estiver disponível, diga "não informado".
- Confirme que o prazo ainda está aberto na data atual.
- Use somente oportunidades que façam sentido para OSCs, cultura, projetos sociais, terceiro setor ou áreas relacionadas.
- No final, coloque uma pequena observação dizendo que os prazos devem ser conferidos no edital oficial.

Escreva a resposta em português do Brasil.
Seja objetivo e organize a resposta para ser enviada em um grupo de WhatsApp.
            `,
          }),
        }
      );

      const openAIResult =
        await openAIResponse.json();

      console.log(
        "Resposta da OpenAI:",
        JSON.stringify(
          openAIResult,
          null,
          2
        )
      );

      // ==========================================
      // VERIFICA ERRO DA OPENAI
      // ==========================================
      if (!openAIResponse.ok) {
        console.error(
          "Erro na OpenAI:",
          openAIResult
        );

        const erroResponse =
          await fetch(
            WHAPI_URL,
            {
              method: "POST",

              headers: {
                Authorization:
                  `Bearer ${WHAPI_TOKEN}`,
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                to: chatId,
                body:
                  "⚠️ Não consegui concluir a pesquisa dos editais agora.\n\n" +
                  "Tente novamente em alguns instantes.",
              }),
            }
          );

        await erroResponse.json();

        continue;
      }

      // ==========================================
      // PEGA O TEXTO GERADO PELA OPENAI
      // ==========================================
      const resultado =
        openAIResult?.output_text ||
        "";

      // ==========================================
      // SE NÃO HOUVE RESULTADO
      // ==========================================
      if (!resultado.trim()) {
        const vazioResponse =
          await fetch(
            WHAPI_URL,
            {
              method: "POST",

              headers: {
                Authorization:
                  `Bearer ${WHAPI_TOKEN}`,
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                to: chatId,
                body:
                  "📚 Não encontrei editais abertos que atendam aos critérios neste momento.\n\n" +
                  "Tente novamente mais tarde.",
              }),
            }
          );

        await vazioResponse.json();

        continue;
      }

      // ==========================================
      // ENVIA OS EDITAIS PARA O MESMO GRUPO
      // ==========================================
      const mensagemFinal =
        "📚 *EDITAIS ABERTOS — CLUBE*\n\n" +
        resultado.trim() +
        "\n\n" +
        "⚠️ *Atenção:* confirme sempre o prazo, os requisitos e as condições diretamente no edital oficial antes de realizar a inscrição.";

      const respostaFinal =
        await fetch(
          WHAPI_URL,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${WHAPI_TOKEN}`,
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              to: chatId,
              body: mensagemFinal,
            }),
          }
        );

      const resultadoFinal =
        await respostaFinal.json();

      console.log(
        "Editais enviados para o grupo:",
        JSON.stringify(
          resultadoFinal,
          null,
          2
        )
      );

      // ==========================================
      // VERIFICA ERRO NO WHAPI
      // ==========================================
      if (!respostaFinal.ok) {
        console.error(
          "Erro ao enviar editais:",
          resultadoFinal
        );

        return res.status(500).json({
          error:
            "Erro ao enviar os editais pelo Whapi",
          details:
            resultadoFinal,
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