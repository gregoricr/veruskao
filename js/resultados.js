// js/resultados.js

document.addEventListener('DOMContentLoaded', () => {
    // Pega os dados salvos no sessionStorage
    const userAnswers = JSON.parse(sessionStorage.getItem('userAnswers'));

    // Se não houver dados, impede a execução
    if (!userAnswers) {
        document.body.innerHTML = '<main class="container"><div class="card"><h1>Erro</h1><p>Nenhum dado de resultado encontrado. Por favor, complete um quiz primeiro.</p><a href="home.html" class="btn">Voltar</a></div></main>';
        return;
    }

    const totalQuestions = userAnswers.length;
    const correctAnswers = userAnswers.filter(answer => answer.correta).length;
    const incorrectAnswers = totalQuestions - correctAnswers;
    const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions * 100).toFixed(1) : 0;

    // 1. Preenche o Resumo
    document.getElementById('stats-summary').textContent = `Acertos: ${correctAnswers} de ${totalQuestions}`;
    document.getElementById('stats-percentage').textContent = `Percentual: ${percentage}%`;

    // 2. Renderiza o Gráfico
    renderResultsChart(correctAnswers, incorrectAnswers);

    // 3. Preenche os "Conceitos para Rever"
    const conceptsToReviewList = document.getElementById('concepts-to-review');
    const wrongConcepts = userAnswers
        .filter(answer => !answer.correta)
        .map(answer => answer.conceito_principal);
    
    // Pega conceitos únicos
    const uniqueWrongConcepts = [...new Set(wrongConcepts)];

    conceptsToReviewList.innerHTML = ''; // Limpa a lista
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
    
    // 4. Adiciona eventos aos botões de IA (por enquanto, com alertas)
    document.getElementById('gerar-analise-btn').addEventListener('click', () => {
        alert('Funcionalidade de análise com IA será implementada em breve!');
    });
    document.getElementById('gerar-plano-btn').addEventListener('click', () => {
        alert('Funcionalidade de plano de estudos com IA será implementada em breve!');
    });


    // Limpa os dados para não serem reutilizados por engano
    sessionStorage.removeItem('userAnswers');
    sessionStorage.removeItem('currentQuiz');
});

/**
 * Renderiza o gráfico de pizza (doughnut) com os resultados.
 * @param {number} correct - O número de respostas corretas.
 * @param {number} incorrect - O número de respostas incorretas.
 */
function renderResultsChart(correct, incorrect) {
    const ctx = document.getElementById('results-chart').getContext('2d');
    
    // Estas cores são do nosso style.css
    const successColor = '#00C896';
    const errorColor = '#FF6B6B';
    const textColor = '#E0E0E0';
    const bgColor = '#1A1A1A';

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Acertos', 'Erros'],
            datasets: [{
                data: [correct, incorrect],
                backgroundColor: [successColor, errorColor],
                borderColor: bgColor,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { 
                    position: 'top', 
                    labels: { color: textColor } 
                } 
            },
            cutout: '70%'
        }
    });
}