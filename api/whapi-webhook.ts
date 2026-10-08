const WHAPI_TOKEN =
  (globalThis as any).process?.env?.WHAPI_TOKEN || "";

const OPENAI_API_KEY =
  (globalThis as any).process?.env?.OPENAI_API_KEY || "";

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
      // AVISA QUE A PESQUISA COMEÇOU
      // ==========================================
      await enviarMensagem(
        chatId,
        "🔎 *Pesquisando editais abertos...*\n\n" +
        "Estou verificando oportunidades atuais para OSCs e projetos do terceiro setor.\n\n" +
        "Só vou enviar oportunidades com inscrição aberta e prazo de submissão confirmado."
      );

      // ==========================================
      // PESQUISA ATUAL NA INTERNET
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
            model: "gpt-5.6-luna",

            tools: [
              {
                type: "web_search",
                search_context_size: "medium",
              },
            ],

            max_output_tokens: 2200,

            input: `
Você é o pesquisador oficial de oportunidades do Clube de Captação de Recursos.

DATA ATUAL:
Use a data atual da internet para verificar os prazos.

OBJETIVO DESTA PESQUISA:
Encontrar oportunidades de financiamento, editais, chamadas públicas, prêmios, patrocínios e oportunidades de apoio financeiro que estejam ABERTAS AGORA para organizações da sociedade civil e projetos do terceiro setor.

A busca inicial é GERAL e NACIONAL.

PRIORIZE:
- OSCs
- associações
- institutos
- fundações
- organizações do terceiro setor
- projetos sociais
- projetos culturais
- projetos esportivos
- projetos educacionais
- inclusão
- meio ambiente
- direitos humanos
- desenvolvimento social
- audiovisual
- leis de incentivo
- institutos e fundações privadas
- empresas com chamadas públicas

REGRA ABSOLUTA DE VALIDADE:

NÃO inclua uma oportunidade se:
- o prazo de inscrição já terminou;
- a chamada ainda não abriu;
- a página oficial não confirmar que as inscrições estão abertas;
- não for possível confirmar a data limite de submissão;
- for apenas uma notícia sobre uma oportunidade antiga;
- for resultado de edital;
- for uma oportunidade exclusivamente para pessoa física quando OSCs não puderem participar.

Só considere uma oportunidade como ABERTA se houver informação atual e verificável indicando que ela pode receber inscrições na data da pesquisa.

Dê preferência à fonte oficial do órgão, ministério, secretaria, instituto, fundação ou empresa responsável.

ENCONTRE NO MÁXIMO 3 OPORTUNIDADES.

É melhor encontrar 1 oportunidade excelente e confirmada do que enviar várias oportunidades duvidosas.

Para cada oportunidade, apresente exatamente neste formato:

📌 NOME DO EDITAL:
🏛️ INSTITUIÇÃO:
🎯 RESUMO:
👥 QUEM PODE PARTICIPAR:
💰 VALOR:
📍 ABRANGÊNCIA:
📅 ABERTURA DAS INSCRIÇÕES:
⏰ DATA LIMITE PARA SUBMISSÃO:
⭐ POR QUE PODE INTERESSAR:
🔗 LINK OFICIAL:

O RESUMO deve ser curto e muito claro.

A pessoa precisa conseguir entender rapidamente:
1. o que é;
2. quem pode participar;
3. quanto pode receber;
4. qual projeto pode apresentar;
5. até quando pode enviar.

IMPORTANTE:
- Não invente valores.
- Não invente datas.
- Não invente requisitos.
- Se uma informação não estiver disponível, não complete por suposição.
- Confirme o prazo na fonte oficial.
- O link deve ser o link oficial da oportunidade.
- Não envie links de páginas agregadoras quando houver página oficial disponível.

Se encontrar menos de 3 oportunidades válidas, envie somente as que conseguir confirmar.

Se não encontrar nenhuma oportunidade com inscrição comprovadamente aberta, responda:

"Neste momento não encontrei uma oportunidade com inscrição comprovadamente aberta e prazo confirmado que atenda ao perfil do Clube."

Não diga que encontrou uma oportunidade se não conseguiu confirmar o prazo.

Responda em português do Brasil.
            `,
          }),
        }
      );

      const openAIResult =
        await openAIResponse.json();

      console.log(
        "Status OpenAI:",
        openAIResponse.status
      );

      console.log(
        "Resposta da OpenAI:",
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
      // PEGA O TEXTO DA RESPOSTA
      // ==========================================
      const resultado =
        typeof openAIResult?.output_text ===
        "string"
          ? openAIResult.output_text.trim()
          : "";

      console.log(
        "Texto final da OpenAI:",
        resultado
      );

      // ==========================================
      // NENHUM RESULTADO
      // ==========================================
      if (!resultado) {
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