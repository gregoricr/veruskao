// js/resultados.js - VERSÃO COMPLETA E CONSOLIDADA

document.addEventListener('DOMContentLoaded', async () => {
    // --- OBTENÇÃO DOS DADOS DA SESSÃO ---
    const userAnswers = JSON.parse(sessionStorage.getItem('userAnswers'));
    const totalTime = parseFloat(sessionStorage.getItem('totalTime'));
    const questionTimes = JSON.parse(sessionStorage.getItem('questionTimes'));

    // Se não houver dados, exibe erro e para a execução
    if (!userAnswers) {
        document.body.innerHTML = '<main class="container"><div class="card"><h1>Erro</h1><p>Nenhum dado de resultado encontrado. Por favor, complete um quiz primeiro.</p><a href="home.html" class="btn">Voltar</a></div></main>';
        return;
    }

    // --- ELEMENTOS DO DOM ---
    const statsSummaryEl = document.getElementById('stats-summary');
    const statsPercentageEl = document.getElementById('stats-percentage');
    const statsTimeEl = document.getElementById('stats-time');
    const statsAverageTimeEl = document.getElementById('stats-average-time');
    const conceptsToReviewList = document.getElementById('concepts-to-review');
    const gerarAnaliseBtn = document.getElementById('gerar-analise-btn');
    const gerarPlanoBtn = document.getElementById('gerar-plano-btn');
    const analiseContainer = gerarAnaliseBtn.parentElement.parentElement;
    const planoContainer = gerarPlanoBtn.parentElement.parentElement;

    // --- CÁLCULOS DOS RESULTADOS ---
    const totalQuestions = userAnswers.length;
    const correctAnswers = userAnswers.filter(answer => answer.correta).length;
    const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions * 100).toFixed(1) : 0;
    const averageTime = totalQuestions > 0 ? (totalTime / totalQuestions).toFixed(1) : 0;

    // 1. PREENCHE O RESUMO NA TELA
    statsSummaryEl.textContent = `Acertos: ${correctAnswers} de ${totalQuestions}`;
    statsPercentageEl.textContent = `Percentual: ${percentage}%`;
    statsTimeEl.textContent = `Tempo Total: ${totalTime.toFixed(1)} segundos`;
    statsAverageTimeEl.textContent = `Tempo Médio / Questão: ${averageTime}s`;

    // 2. RENDERIZA O GRÁFICO
    renderResultsChart(correctAnswers, totalQuestions - correctAnswers);

    // 3. PREENCHE OS "CONCEITOS PARA REVER"
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

    // 4. SALVA OS DADOS NO FIREBASE (EM SEGUNDO PLANO)
    try {
        // Supondo que você tenha um arquivo firestore.js com esta função
        // await salvarQuizNoFirestore({
        //     respostas: userAnswers,
        //     tempo_total: totalTime,
        //     acertos: correctAnswers,
        //     total_questoes: totalQuestions
        // });
        console.log("Resultados prontos para serem salvos no Firestore (funcionalidade a ser conectada).");
    } catch (error) {
        console.error("Não foi possível salvar os resultados:", error);
    }

    // 5. ADICIONA EVENTOS AOS BOTÕES DE IA
    gerarAnaliseBtn.addEventListener('click', async () => { /* ... lógica do botão de análise ... */ });
    gerarPlanoBtn.addEventListener('click', async () => { /* ... lógica do botão de plano de estudos ... */ });

    // Limpa a sessão para não recarregar os mesmos resultados
    sessionStorage.removeItem('userAnswers');
    sessionStorage.removeItem('totalTime');
    sessionStorage.removeItem('questionTimes');
    sessionStorage.removeItem('currentQuiz');
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