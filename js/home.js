// js/home.js

document.addEventListener('DOMContentLoaded', () => {
    // ... (a verificação de segurança continua a mesma)
    const isLoggedIn = localStorage.getItem('ysraelly_quiz_is_logged_in');
    if (isLoggedIn !== 'true') {
        alert("Acesso negado. Por favor, faça o login primeiro.");
        window.location.replace('../index.html');
        return;
    }

    const gerarQuizBtn = document.getElementById('gerar-quiz-btn');
    const logoutBtn = document.getElementById('logout-btn');
    // ... (o listener de ver histórico continua o mesmo)
    
    logoutBtn.addEventListener('click', () => {
        // ... (a lógica de logout continua a mesma)
        localStorage.removeItem('ysraelly_quiz_api_key');
        localStorage.removeItem('ysraelly_quiz_is_logged_in');
        window.location.replace('../index.html');
    });

    // Modificamos o listener do botão para ser assíncrono (async)
    gerarQuizBtn.addEventListener('click', async () => {
        const quizConfig = {
            materia: document.getElementById('materia').value,
            topico: document.getElementById('topico-especifico').value,
            quantidade: document.getElementById('quantidade').value,
            nivel: document.querySelector('input[name="nivel"]:checked').value
        };

        console.log("Iniciando geração do Quiz com a configuração:", quizConfig);
        setLoadingState(gerarQuizBtn, true); // Ativa o estado de carregamento

        try {
            // Chama nossa nova função da API
            const questions = await gerarQuestoesComIA(quizConfig);
            
            // Se a API retornar com sucesso
            console.log("Questões recebidas da IA:", questions);

            // Armazenamos as questões no sessionStorage para a próxima página usar
            // sessionStorage é como o localStorage, mas os dados são apagados quando a aba é fechada.
            sessionStorage.setItem('currentQuiz', JSON.stringify(questions));

            // Redirecionamos para a página do quiz
            window.location.href = 'quiz.html';

        } catch (error) {
            console.error("Erro ao gerar quiz:", error);
            alert(`Ocorreu um erro ao gerar o quiz: ${error.message}`);
            setLoadingState(gerarQuizBtn, false, '✨ Gerar Quiz com IA'); // Desativa o carregamento em caso de erro
        }
    });
});

// Função utilitária para controlar o estado de carregamento do botão
function setLoadingState(button, isLoading, text = '') {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = `<div class="spinner"></div> <span>Gerando...</span>`;
    } else {
        button.disabled = false;
        button.innerHTML = `<span>${text}</span>`;
    }
}