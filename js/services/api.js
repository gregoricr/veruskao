// js/services/api.js - VERSÃO COM MELHOR DEBUG

/**
 * Constrói o prompt para GERAR QUESTÕES com base na configuração do usuário.
 * @param {object} config - O objeto de configuração do quiz.
 * @returns {string}
 */
function construirPromptDeQuestoes(config) {
    const dificuldadeMap = {
        'Estudo Inicial': 'fáceis a intermediárias, focando em conceitos fundamentais.',
        'Meio Termo': 'de dificuldade intermediária a desafiadora, com aplicação prática de conceitos.',
        'Revisão': 'desafiadoras e complexas, no estilo de vestibulares de ponta.'
    };
    let focoTopico = '';
    if (config.topico && config.topico.trim() !== '') {
        focoTopico = `\nFOCO OBRIGÁTORIO: As questões DEVEM ser especificamente sobre o tópico "${config.topico}".`;
    }
    return `Você é um especialista em criar questões para vestibulares brasileiros.
Gere ${config.quantidade} questões de ${config.materia}.
As questões devem ser ${dificuldadeMap[config.nivel]}.${focoTopico}
REGRAS OBRIGATÓRIAS:
1. Formato: Retorne APENAS um array de objetos JSON. O array NUNCA deve estar vazio.
2. Alternativas: Sempre 5.
3. Resposta Correta: O campo 'resposta_correta' deve ser o índice numérico (0-4).
4. Explicação: Deve ser didática.
5. Texto Limpo: Nenhum texto deve usar formatação markdown.
6. Estrutura do Objeto: 'pergunta', 'alternativas', 'resposta_correta', 'explicacao_erro', 'dica_estudo', 'conceito_principal'.`;
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
        // MUDANÇA AQUI: Adicionamos o response.status
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
        // MUDANÇA AQUI: Adicionamos o response.status
        throw new Error(`Erro na API (Status: ${response.status}): ${errorBody.error.message}`);
    }
    const result = await response.json();
    return result.candidates[0].content.parts[0].text;
}