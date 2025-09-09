// js/resultados.js

document.addEventListener('DOMContentLoaded', () => {
    // Pega os dados salvos no sessionStorage
    const score = sessionStorage.getItem('quizScore');
    const totalQuestions = sessionStorage.getItem('totalQuestions');

    // Seleciona os elementos da página
    const statsSummaryEl = document.getElementById('stats-summary');
    const statsPercentageEl = document.getElementById('stats-percentage');

    // Verifica se os dados existem
    if (score === null || totalQuestions === null) {
        statsSummaryEl.textContent = "Não foi possível carregar os resultados.";
        return;
    }

    // Calcula a porcentagem
    const percentage = (score / totalQuestions * 100).toFixed(1);

    // Exibe os resultados na tela
    statsSummaryEl.textContent = `Você acertou ${score} de ${totalQuestions} questões!`;
    statsPercentageEl.textContent = `Percentual de acerto: ${percentage}%`;

    // Limpa os dados para não serem reutilizados por engano
    sessionStorage.removeItem('quizScore');
    sessionStorage.removeItem('totalQuestions');
    sessionStorage.removeItem('currentQuiz');
});