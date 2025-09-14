// js/resultados.js - VERSÃO FINAL CONSOLIDADA

document.addEventListener('DOMContentLoaded', () => {
    const userAnswers = JSON.parse(sessionStorage.getItem('userAnswers'));

    if (!userAnswers) {
        document.body.innerHTML = '<main class="container"><div class="card"><h1>Erro</h1><p>Nenhum dado de resultado encontrado. Por favor, complete um quiz primeiro.</p><a href="home.html" class="btn">Voltar</a></div></main>';
        return;
    }

    // --- ELEMENTOS DO DOM ---
    const gerarAnaliseBtn = document.getElementById('gerar-analise-btn');
    const gerarPlanoBtn = document.getElementById('gerar-plano-btn');
    const analiseContainer = gerarAnaliseBtn.parentElement.parentElement;
    const planoContainer = gerarPlanoBtn.parentElement.parentElement;
    const statsSummaryEl = document.getElementById('stats-summary');
    const statsPercentageEl = document.getElementById('stats-percentage');
    const conceptsToReviewList = document.getElementById('concepts-to-review');
    
    // --- CÁLCULOS INICIAIS ---
    const totalQuestions = userAnswers.length;
    const correctAnswers = userAnswers.filter(answer => answer.correta).length;
    const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions * 100).toFixed(1) : 0;

    // 1. Preenche o Resumo
    statsSummaryEl.textContent = `Acertos: ${correctAnswers} de ${totalQuestions}`;
    statsPercentageEl.textContent = `Percentual: ${percentage}%`;

    // 2. Renderiza o Gráfico
    renderResultsChart(correctAnswers, totalQuestions - correctAnswers);

    // 3. Preenche os "Conceitos para Rever"
    const wrongAnswers = userAnswers.filter(answer => !answer.correta);
    const uniqueWrongConcepts = [...new Set(wrongAnswers.map(answer => answer.conceito_principal))];
    conceptsToReviewList.innerHTML = '';
    if (uniqueWrongConcepts.length > 0) {
        uniqueWrongConcepts.forEach(concept => {
            const li = document.createElement('li');
            li.textContent = concept;
            conceptsToReviewList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = "Parabéns, você acertou tudo! Nenhum conceito para rever.";
        conceptsToReviewList.appendChild(li);
    }

    // 4. EVENT LISTENER PARA O BOTÃO DE ANÁLISE
    gerarAnaliseBtn.addEventListener('click', async () => {
        const container = analiseContainer.querySelector('.ia-actions');
        gerarAnaliseBtn.disabled = true;
        gerarAnaliseBtn.innerHTML = '<div class="spinner"></div> <span>Analisando...</span>';
        
        try {
            if (wrongAnswers.length === 0) {
                container.innerHTML = '<p>Parabéns, você acertou tudo! Não há o que analisar aqui. ✨</p>';
                return;
            }
            const prompt = `Aja como um tutor especialista. Um estudante realizou um quiz e estes foram os seus erros: ${JSON.stringify(wrongAnswers)}. Forneça uma análise concisa (um parágrafo), encorajadora e perspicaz, identificando possíveis padrões de erro e sugerindo uma abordagem geral para melhorar. Fale diretamente com o estudante.`;
            const analiseResult = await callGenericGemini(prompt);
            container.innerHTML = `<p>${analiseResult}</p>`;
        } catch (error) {
            console.error("Erro ao gerar análise:", error);
            container.innerHTML = `<p style="color: var(--error);">Erro ao gerar análise: ${error.message}</p>`;
        }
    });

    // 5. EVENT LISTENER PARA O BOTÃO DE PLANO DE ESTUDOS
    gerarPlanoBtn.addEventListener('click', async () => {
        const container = planoContainer.querySelector('.ia-actions');
        gerarPlanoBtn.disabled = true;
        gerarPlanoBtn.innerHTML = '<div class="spinner"></div> <span>Gerando plano...</span>';

        try {
            if (uniqueWrongConcepts.length === 0) {
                container.innerHTML = '<p>Você acertou tudo! Sugestão: pratique um tópico novo ou aumente a dificuldade. 🚀</p>';
                return;
            }
            const prompt = `Aja como um tutor experiente. Baseado nos seguintes conceitos em que o aluno errou: ${uniqueWrongConcepts.join(', ')}. Crie um "Micro Plano de Estudo" com exatamente 3 passos acionáveis e específicos para ele melhorar nesses pontos. Formate a resposta de forma clara, usando quebras de linha.`;
            const planoResult = await callGenericGemini(prompt);
            // Substitui quebras de linha (\n) do texto por tags <br> para funcionar no HTML
            container.innerHTML = `<p>${planoResult.replace(/\n/g, '<br>')}</p>`;
        } catch (error) {
            console.error("Erro ao gerar plano:", error);
            container.innerHTML = `<p style="color: var(--error);">Erro ao gerar plano: ${error.message}</p>`;
        }
    });
});

/**
 * Renderiza o gráfico de pizza (doughnut) com os resultados.
 * @param {number} correct - O número de respostas corretas.
 * @param {number} incorrect - O número de respostas incorretas.
 */
function renderResultsChart(correct, incorrect) {
    const ctx = document.getElementById('results-chart').getContext('2d');
    if (window.myResultsChart) {
        window.myResultsChart.destroy();
    }
    window.myResultsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Acertos', 'Erros'],
            datasets: [{
                data: [correct, incorrect],
                backgroundColor: ['#00C896', '#FF6B6B'],
                borderColor: '#1A1A1A',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top', labels: { color: '#E0E0E0' } } },
            cutout: '70%'
        }
    });
}