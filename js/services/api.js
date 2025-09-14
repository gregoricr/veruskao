// js/services/api.js - VERSÃO CONSOLIDADA COM PROMPT DETALHADO

/**
 * Constrói o prompt DETALHADO para GERAR QUESTÕES, usando a lógica do arquivo original.
 * @param {object} config - O objeto de configuração do quiz (materia, quantidade, nivel, topico).
 * @returns {string}
 */
function construirPromptDeQuestoes(config) {
    const dificuldadeMap = {
        'Estudo Inicial': 'fáceis a intermediárias (nível 6-7/10), focando em conceitos fundamentais.',
        'Meio Termo': 'de dificuldade intermediária a desafiadora (nível 7-8/10), com aplicação prática de conceitos.',
        'Revisão': 'desafiadoras e complexas (nível 8-9/10), no estilo de vestibulares de ponta, podendo ser interdisciplinares.'
    };

    let focoTopico = '';
    if (config.topico && config.topico.trim() !== '') {
        focoTopico = `\nFOCO OBRIGATÓRIO: As questões DEVEM ser especificamente sobre o tópico "${config.topico}".`;
    }

    const basePrompt = `Você é um especialista em criar questões para vestibulares brasileiros de alto nível (ENEM, FUVEST).
Gere ${config.quantidade} questões de ${config.materia} para um estudante do ensino médio.
As questões devem ser ${dificuldadeMap[config.nivel]}.${focoTopico}

REGRAS GERAIS OBRIGATÓRIAS:
1. Formato: Retorne APENAS um array de objetos JSON. O array NUNCA deve estar vazio.
2. Alternativas: Sempre 5, com distratores plausíveis baseados em erros comuns.
3. Resposta Correta: O campo 'resposta_correta' deve ser o índice numérico (0-4).
4. Explicação: Deve ser didática e, ao referenciar a alternativa correta, usar a LETRA (A, B, C...).
5. Texto Limpo: Nenhum texto deve usar formatação markdown (negrito "**", itálico "*" etc.). O texto deve ser plano.
6. Conteúdo do Objeto: Cada objeto JSON deve ter os seguintes campos: 'pergunta' (string), 'alternativas' (array de 5 strings), 'resposta_correta' (number), 'explicacao_erro' (string), 'dica_estudo' (string), 'conceito_principal' (string).
`;

    let promptEspecifico = '';
    switch (config.materia) {
        case 'Matemática':
            promptEspecifico = `
REGRAS ESPECÍFICAS PARA MATEMÁTICA:
Crie um problema de múltipla escolha que descreva uma situação prática e cotidiana. A resolução deve exigir a interpretação do texto e a aplicação de conceitos matemáticos fundamentais. As alternativas incorretas (distratores) devem ser resultados de erros de cálculo plausíveis ou de uma interpretação equivocada do enunciado.`;
            break;
        case 'História':
            promptEspecifico = `
REGRAS ESPECÍFICAS PARA HISTÓRIA:
A questão deve apresentar um texto-fonte (um trecho de documento, uma citação, uma descrição de imagem de época). O comando deve solicitar a conexão entre o conteúdo específico do texto e um processo histórico mais amplo, como uma estrutura social, um movimento político ou uma característica cultural do período em questão. As alternativas devem apresentar contextos históricos diferentes, sendo apenas um o correto.`;
            break;
        case 'Geografia':
            promptEspecifico = `
REGRAS ESPECÍFICAS PARA GEOGRAFIA:
Formule uma questão que utilize um texto-base (notícia, descrição de mapa ou gráfico) descrevendo um fenômeno ou processo espacial. O comando deve exigir a aplicação de um conceito geográfico chave para explicar a situação apresentada. Os distratores devem ser outros conceitos geográficos que não se aplicam corretamente ao contexto.`;
            break;
        case 'Biologia':
            promptEspecifico = `
REGRAS ESPECÍFICAS PARA BIOLOGIA:
Crie uma questão baseada em um cenário biológico (um processo fisiológico, uma relação ecológica, um problema ambiental). A pergunta deve requerer que o aluno utilize um conceito fundamental da Biologia para explicar a causa, a consequência ou o mecanismo do fenômeno descrito.`;
            break;
        case 'Física':
            promptEspecifico = `
REGRAS ESPECÍFICAS PARA FÍSICA:
Elabore um problema que descreva um fenômeno do cotidiano. A questão deve exigir que o aluno identifique os princípios físicos envolvidos, monte o problema com as fórmulas corretas e chegue a um resultado quantitativo ou a uma conclusão conceitual. Os distratores devem ser baseados em aplicações incorretas de fórmulas ou em conceitos físicos mal interpretados.`;
            break;
        case 'Química':
            promptEspecifico = `
REGRAS ESPECÍFICAS PARA QUÍMICA:
Apresente uma questão contextualizada em uma aplicação prática da Química (indústria, meio ambiente, saúde). O enunciado deve conter dados ou um esquema que precise ser interpretado. A resolução deve exigir a aplicação de um conceito químico central, como estequiometria, termoquímica, reações orgânicas ou equilíbrio químico.`;
            break;
        case 'Literatura':
            promptEspecifico = `
REGRAS ESPECÍFICAS PARA LITERATURA:
A questão deve conter um fragmento de um texto literário (prosa ou verso). O comando deve solicitar a análise do trecho, focando em um destes aspectos: 1) características do estilo do autor; 2) elementos que o conectam ao seu respectivo movimento literário; 3) interpretação de um tema central da obra a partir do trecho; ou 4) a função de um recurso expressivo utilizado.`;
            break;
        case 'Português':
            promptEspecifico = `
REGRAS ESPECÍFICAS PARA PORTUGUÊS:
Crie uma questão de múltipla escolha com 5 alternativas, baseada em um texto-base (pode ser crônica, notícia, charge, poema, etc.). O comando da questão deve focar em um dos seguintes eixos de análise: 1) Identificação da tese principal; 2) Função de um conector ou expressão específica para a progressão do texto; 3) Análise da estratégia argumentativa utilizada pelo autor; 4) Relação entre o texto e as características de seu gênero; 5) Reconhecimento e interpretação de um fenômeno de variação linguística. As alternativas devem ser plausíveis e a correta deve ser inequivocamente sustentada pelo texto. É OBRIGATÓRIO formatar textos mais longos de forma clara, utilizando '\\n' para quebras de linha entre parágrafos ou versos.`;
            break;
    }

    return basePrompt + promptEspecifico;
}


/**
 * Chama a API do Google Gemini para GERAR QUESTÕES, esperando um JSON estruturado.
 * @param {object} quizConfig - O objeto com as configurações do quiz.
 * @returns {Promise<Array>}
 */
async function gerarQuestoesComIA(quizConfig) {
    const apiKey = localStorage.getItem('ysraelly_quiz_api_key');
    if (!apiKey) throw new Error("Chave de API não encontrada.");

    const prompt = construirPromptDeQuestoes(quizConfig);
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    const schema = { type: "ARRAY", items: { type: "OBJECT", properties: { pergunta: { type: "STRING" }, alternativas: { type: "ARRAY", items: { type: "STRING" } }, resposta_correta: { type: "NUMBER" }, explicacao_erro: { type: "STRING" }, dica_estudo: { type: "STRING" }, conceito_principal: { type: "STRING" } }, required: ["pergunta", "alternativas", "resposta_correta", "explicacao_erro", "dica_estudo", "conceito_principal"] } };
    
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", responseSchema: schema } })
    });

    if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(`Erro na API (Status: ${response.status}): ${errorBody.error.message}`);
    }
    const result = await response.json();
    const questionsText = result.candidates[0].content.parts[0].text;
    return JSON.parse(questionsText);
}


/**
 * FUNÇÃO GENÉRICA
 * Chama a API do Google Gemini com um prompt qualquer e retorna a resposta em texto.
 * @param {string} prompt - O prompt a ser enviado para a IA.
 * @returns {Promise<string>} - A resposta em texto da IA.
 */
async function callGenericGemini(prompt) {
    const apiKey = localStorage.getItem('ysraelly_quiz_api_key');
    if (!apiKey) throw new Error("Chave de API não encontrada.");

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(`Erro na API (Status: ${response.status}): ${errorBody.error.message}`);
    }
    const result = await response.json();
    return result.candidates[0].content.parts[0].text;
}