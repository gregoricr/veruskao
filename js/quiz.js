// js/quiz.js

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DO DOM ---
    const questionTextEl = document.getElementById('question-text');
    const alternativesContainerEl = document.getElementById('alternatives-container');
    const answerBtn = document.getElementById('answer-btn');
    const currentQuestionNumEl = document.getElementById('current-question-num');
    const totalQuestionsNumEl = document.getElementById('total-questions-num');
    const progressBar = document.getElementById('quiz-progress-bar');

    // --- ESTADO DO QUIZ ---
    let currentQuiz = [];
    let currentQuestionIndex = 0;
    let selectedAlternativeIndex = null;
    let score = 0;

    // --- FUNÇÕES ---

    /** Carrega os dados do quiz do sessionStorage e inicia o quiz */
    function startQuiz() {
        const quizData = sessionStorage.getItem('currentQuiz');
        if (!quizData) {
            alert("Nenhum quiz encontrado! Redirecionando para a página inicial.");
            window.location.replace('home.html');
            return;
        }
        currentQuiz = JSON.parse(quizData);
        displayCurrentQuestion();
    }

    /** Exibe a pergunta atual e suas alternativas na tela */
    function displayCurrentQuestion() {
        if (currentQuestionIndex >= currentQuiz.length) {
            // Fim do quiz! Salva os resultados e redireciona.
            sessionStorage.setItem('quizScore', score);
            sessionStorage.setItem('totalQuestions', currentQuiz.length);
            window.location.href = 'resultados.html';
            return;
        }

        const question = currentQuiz[currentQuestionIndex];
        selectedAlternativeIndex = null;
        answerBtn.disabled = true;

        // Atualiza a UI
        questionTextEl.textContent = question.pergunta;
        currentQuestionNumEl.textContent = currentQuestionIndex + 1;
        totalQuestionsNumEl.textContent = currentQuiz.length;
        progressBar.style.width = `${((currentQuestionIndex + 1) / currentQuiz.length) * 100}%`;

        // Limpa as alternativas anteriores
        alternativesContainerEl.innerHTML = '';
        
        // Verificação defensiva dos dados da questão
        if (question && Array.isArray(question.alternativas) && question.alternativas.length > 0) {
            question.alternativas.forEach((alt, index) => {
                const button = document.createElement('button');
                button.classList.add('btn', 'alternative-btn');
                button.textContent = `${String.fromCharCode(65 + index)}) ${alt}`;
                button.dataset.index = index;
                button.addEventListener('click', handleSelectAlternative); // Esta linha causava o erro
                alternativesContainerEl.appendChild(button);
            });
        } else {
            console.error("Dados da questão inválidos. Faltam alternativas:", question);
            questionTextEl.textContent = "Ocorreu um erro ao carregar esta questão. As alternativas não foram fornecidas corretamente.";
        }
    }

    /** Lida com a seleção de uma alternativa */
    function handleSelectAlternative(event) {
        const allButtons = alternativesContainerEl.querySelectorAll('.alternative-btn');
        allButtons.forEach(btn => btn.classList.remove('selected'));

        const selectedButton = event.currentTarget;
        selectedButton.classList.add('selected');
        selectedAlternativeIndex = parseInt(selectedButton.dataset.index, 10);
        
        answerBtn.disabled = false;
    }
    
    /** Lida com o envio da resposta e o feedback visual */
    function handleAnswerSubmit() {
        if (selectedAlternativeIndex === null) return;

        const question = currentQuiz[currentQuestionIndex];
        const isCorrect = selectedAlternativeIndex === question.resposta_correta;
        const allButtons = alternativesContainerEl.querySelectorAll('.alternative-btn');

        allButtons.forEach(btn => {
            btn.disabled = true;
            btn.classList.add('answered');
        });

        if (isCorrect) {
            score++;
            allButtons[selectedAlternativeIndex].classList.add('correct');
        } else {
            allButtons[selectedAlternativeIndex].classList.add('incorrect');
            allButtons[question.resposta_correta].classList.add('correct');
        }

        setTimeout(() => {
            currentQuestionIndex++;
            displayCurrentQuestion();
        }, 1500);
    }

    // --- INICIALIZAÇÃO ---
    answerBtn.addEventListener('click', handleAnswerSubmit);
    startQuiz();
});