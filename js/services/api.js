// js/services/api.js

/**
 * Constrói o prompt detalhado para a API do Gemini com base na configuração do usuário.
 * @param {object} config - O objeto de configuração do quiz.
 * @returns {string} - O prompt finalizado.
 */
function construirPrompt(config) {
    const dificuldadeMap = {
        'Estudo Inicial': 'fáceis a intermediárias, focando em conceitos fundamentais.',
        'Meio Termo': 'de dificuldade intermediária a desafiadora, com aplicação prática de conceitos.',
        'Revisão': 'desafiadoras e complexas, no estilo de vestibulares de ponta.'
    };

    let focoTopico = '';
    if (config.topico && config.topico.trim() !== '') {
        focoTopico = `\nFOCO OBRIGATÓRIO: As questões DEVEM ser especificamente sobre o tópico "${config.topico}".`;
    }

    return `Você é um especialista em criar questões para vestibulares brasileiros.
Gere ${config.quantidade} questões de ${config.materia}.
As questões devem ser ${dificuldadeMap[config.nivel]}.${focoTopico}

REGRAS OBRIGATÓRIAS:
1. Formato: Retorne APENAS um array de objetos JSON. O array NUNCA deve estar vazio.
2. Alternativas: Sempre 5, com distratores plausíveis baseados em erros comuns.
3. Resposta Correta: O campo 'resposta_correta' deve ser o índice numérico (0-4).
4. Explicação: Deve ser didática.
5. Texto Limpo: Nenhum texto deve usar formatação markdown (como **negrito**).
6. Estrutura do Objeto: Cada objeto deve ter os campos: 'pergunta', 'alternativas' (array de 5 strings), 'resposta_correta' (number), 'explicacao_erro' (string), 'dica_estudo' (string), 'conceito_principal' (string).`;
}

/**
 * Chama a API do Google Gemini para gerar as questões do quiz.
 * @param {object} quizConfig - O objeto com as configurações do quiz (matéria, tópico, etc.).
 * @returns {Promise<Array>} - Uma promessa que resolve para um array de questões.
 */
async function gerarQuestoesComIA(quizConfig) {
    // 1. Pega a chave da API salva no localStorage
    const apiKey = localStorage.getItem('ysraelly_quiz_api_key');
    if (!apiKey) {
        throw new Error("Chave de API não encontrada. Por favor, faça o login novamente.");
    }

    // 2. Constrói o prompt
    const prompt = construirPrompt(quizConfig);
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    // 3. Define a estrutura de resposta que esperamos da IA (o "schema")
    const schema = {
        type: "ARRAY",
        items: {
            type: "OBJECT",
            properties: {
                pergunta: { type: "STRING" },
                alternativas: { type: "ARRAY", items: { type: "STRING" } },
                resposta_correta: { type: "NUMBER" },
                explicacao_erro: { type: "STRING" },
                dica_estudo: { type: "STRING" },
                conceito_principal: { type: "STRING" }
            },
            required: ["pergunta", "alternativas", "resposta_correta", "explicacao_erro", "dica_estudo", "conceito_principal"]
        }
    };
    
    // 4. Faz a chamada da API (fetch)
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        })
    });

    if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(`Erro na API: ${errorBody.error.message}`);
    }

    const result = await response.json();
    const questionsText = result.candidates[0].content.parts[0].text;
    return JSON.parse(questionsText);
}