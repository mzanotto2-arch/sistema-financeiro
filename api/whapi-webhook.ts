const WHAPI_TOKEN =

  (globalThis as any).process?.env?.WHAPI_TOKEN || "";



const OPENAI_API_KEY =

  (globalThis as any).process?.env?.OPENAI_API_KEY || "";



const OPENAI_PROMPT_ID =

  (globalThis as any).process?.env?.OPENAI_PROMPT_ID || "";



const WHAPI_URL =

  "https\://gate.whapi.cloud/messages/text";



const OPENAI_URL =

  "https\://api.openai.com/v1/responses";



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



// ==========================================

// LIMPA E ORGANIZA A RESPOSTA DOS EDITAIS

// ==========================================



function limparResultadoEditais(

  texto: string

): string {

  const blocos = texto

    .split(/(?=📌\s\*)/)

    .filter((bloco) => bloco.trim());



  if (blocos.length === 0) {

    return texto.trim();

  }



  return blocos

    .map((bloco) => {

      // ==========================================

      // ENCONTRA TODOS OS LINKS

      // ==========================================



      const urls = [

        ...bloco.matchAll(

          /https?:\/\/[^\s)\]]+/g

        ),

      ].map((match) =>

        match[0].replace(/[),.;]+$/g, "")

      );



      // Prioriza fontes oficiais conhecidas

      const linkOficial =

        urls.find((url) =>

          /gov\.br|zurich\.com\.br/i.test(url)

        ) || urls[0];



      let textoLimpo = bloco;



      // ==========================================

      // REMOVE LINKS NO FORMATO:

      // [gov.br]\(https\://...)

      // ==========================================



      textoLimpo = textoLimpo.replace(

        /\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/g,

        ""

      );



      // ==========================================

      // REMOVE LINKS NO FORMATO:

      // (gov.br)(https\://...)

      // ==========================================



      textoLimpo = textoLimpo.replace(

        /\([^()\n]{0,100}\)\((https?:\/\/[^)\s]+)\)/g,

        ""

      );



      // ==========================================

      // REMOVE TODAS AS URLs DO TEXTO

      // ==========================================



      textoLimpo = textoLimpo.replace(

        /https?:\/\/[^\s)\]]+/g,

        ""

      );



      // ==========================================

      // REMOVE "Edital oficial" GERADO PELA OPENAI

      // PARA NÃO FICAR DUPLICADO

      // ==========================================



      textoLimpo = textoLimpo.replace(

        /🔗\s*\*{0,2}Edital oficial:?\*{0,2}\s*/gi,

        ""

      );



      textoLimpo = textoLimpo.replace(

        /\*{0,2}Edital oficial:?\*{0,2}\s*/gi,

        ""

      );



      // ==========================================

      // REMOVE REFERÊNCIAS SOLTAS COMO:

      // (gov.br)

      // (zurich.com.br)

      // ==========================================



      textoLimpo = textoLimpo.replace(

        /\(\s*(gov\.br|zurich\.com\.br)\s*\)/gi,

        ""

      );



      // ==========================================

      // REMOVE PARÊNTESES VAZIOS:

      // ()

      // ==========================================



      textoLimpo = textoLimpo.replace(

        /\(\s*\)/g,

        ""

      );



      // ==========================================

      // LIMPEZA DE ESPAÇOS

      // ==========================================



      textoLimpo = textoLimpo.replace(

        /[ \t]+\n/g,

        "\n"

      );



      textoLimpo = textoLimpo.replace(

        /\n{3,}/g,

        "\n\n"

      );



      textoLimpo = textoLimpo.trim();



      // ==========================================

      // COLOCA SOMENTE UM LINK OFICIAL NO FINAL

      // ==========================================



      if (linkOficial) {

        textoLimpo +=

          "\n\n🔗 \*Edital oficial:\*\n" +

          linkOficial;

      }



      return textoLimpo;

    })

    .join("\n\n");

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
      // COMANDOS DO CLUBE
      // ==========================================

      const comandos: Record<string, string> = {
        "@editalcultura":
          "pesquisa geral e nacional de oportunidades para OSCs e terceiro setor",

        "@esporte":
          "pesquisa de oportunidades e editais da área de esporte",
        "@mulheres":
          "pesquisa de oportunidades e editais voltados para mulheres",
        "@saude":
          "pesquisa de oportunidades e editais da área de saúde",
        "@ambiental":
          "pesquisa de oportunidades e editais de meio ambiente e sustentabilidade",
        "@cultura":
          "pesquisa de oportunidades e editais da área de cultura",
        "@educacao":
          "pesquisa de oportunidades e editais da área de educação",
        "@assistenciasocial":
          "pesquisa de oportunidades e editais de assistência social",
        "@inclusao":
          "pesquisa de oportunidades e editais de inclusão e pessoas com deficiência",
        "@direitoshumanos":
          "pesquisa de oportunidades e editais de direitos humanos",
        "@criancaseadolescentes":
          "pesquisa de oportunidades e editais voltados para crianças e adolescentes",

        "@norte":
          "pesquisa de oportunidades e editais com abrangência ou interesse na região Norte do Brasil",
        "@nordeste":
          "pesquisa de oportunidades e editais com abrangência ou interesse na região Nordeste do Brasil",
        "@sudeste":
          "pesquisa de oportunidades e editais com abrangência ou interesse na região Sudeste do Brasil",
        "@centrooeste":
          "pesquisa de oportunidades e editais com abrangência ou interesse na região Centro-Oeste do Brasil",
        "@sul":
          "pesquisa de oportunidades e editais com abrangência ou interesse na região Sul do Brasil",

        "@acre":
          "pesquisa de oportunidades e editais com abrangência ou interesse no Acre",
        "@alagoas":
          "pesquisa de oportunidades e editais com abrangência ou interesse em Alagoas",
        "@amapa":
          "pesquisa de oportunidades e editais com abrangência ou interesse no Amapá",
        "@amazonas":
          "pesquisa de oportunidades e editais com abrangência ou interesse no Amazonas",
        "@bahia":
          "pesquisa de oportunidades e editais com abrangência ou interesse na Bahia",
        "@ceara":
          "pesquisa de oportunidades e editais com abrangência ou interesse no Ceará",
        "@distritofederal":
          "pesquisa de oportunidades e editais com abrangência ou interesse no Distrito Federal",
        "@espiritosanto":
          "pesquisa de oportunidades e editais com abrangência ou interesse no Espírito Santo",
        "@goias":
          "pesquisa de oportunidades e editais com abrangência ou interesse em Goiás",
        "@maranhao":
          "pesquisa de oportunidades e editais com abrangência ou interesse no Maranhão",
        "@matogrosso":
          "pesquisa de oportunidades e editais com abrangência ou interesse em Mato Grosso",
        "@matogrossodosul":
          "pesquisa de oportunidades e editais com abrangência ou interesse em Mato Grosso do Sul",
        "@minasgerais":
          "pesquisa de oportunidades e editais com abrangência ou interesse em Minas Gerais",
        "@para":
          "pesquisa de oportunidades e editais com abrangência ou interesse no Pará",
        "@paraiba":
          "pesquisa de oportunidades e editais com abrangência ou interesse na Paraíba",
        "@parana":
          "pesquisa de oportunidades e editais com abrangência ou interesse no Paraná",
        "@pernambuco":
          "pesquisa de oportunidades e editais com abrangência ou interesse em Pernambuco",
        "@piaui":
          "pesquisa de oportunidades e editais com abrangência ou interesse no Piauí",
        "@riodejaneiro":
          "pesquisa de oportunidades e editais com abrangência ou interesse no Rio de Janeiro",
        "@riograndedonorte":
          "pesquisa de oportunidades e editais com abrangência ou interesse no Rio Grande do Norte",
        "@riograndedosul":
          "pesquisa de oportunidades e editais com abrangência ou interesse no Rio Grande do Sul",
        "@rondonia":
          "pesquisa de oportunidades e editais com abrangência ou interesse em Rondônia",
        "@roraima":
          "pesquisa de oportunidades e editais com abrangência ou interesse em Roraima",
        "@santacatarina":
          "pesquisa de oportunidades e editais com abrangência ou interesse em Santa Catarina",
        "@saopaulo":
          "pesquisa de oportunidades e editais com abrangência ou interesse em São Paulo",
        "@sergipe":
          "pesquisa de oportunidades e editais com abrangência ou interesse em Sergipe",
        "@tocantins":
          "pesquisa de oportunidades e editais com abrangência ou interesse no Tocantins",
      };

      const pesquisa = comandos[texto];

      if (!pesquisa) {
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

        "🔎 \*Pesquisando editais abertos...\*\n\n" +

        "Estou verificando " + pesquisa + ".\n\n" +
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

              "Execute agora uma " +
              pesquisa +
              " para o Clube de Captação de Recursos. Pesquise na web neste momento e retorne somente oportunidades com inscrições comprovadamente abertas e prazo de submissão confirmado.",



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

          "📚 \*Nenhum edital confirmado neste momento.\*\n\n" +

          "Não encontrei uma oportunidade com inscrição comprovadamente aberta e prazo de submissão confirmado."

        );



        continue;

      }



      // ==========================================

      // LIMPA E ORGANIZA O RESULTADO

      // ==========================================



      const resultadoLimpo =

        limparResultadoEditais(resultado);



      console.log(

        "Resultado após limpeza:",

        resultadoLimpo

      );



      // ==========================================

      // MENSAGEM FINAL

      // ==========================================



      const mensagemFinal =

        "📚 \*EDITAIS ABERTOS — CLUBE\*\n\n" +

        resultadoLimpo +

        "\n\n" +

        "⚠️ \*Importante:\* os prazos devem ser conferidos na fonte oficial antes da submissão.";



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
