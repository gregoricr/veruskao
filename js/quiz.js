// js/quiz.js

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DO DOM ---
    const questionTextEl = document.getElementById('question-text');
    const alternativesContainerEl = document.getElementById('alternatives-container');
    const answerBtn = document.getElementById('answer-btn');
    const currentQuestionNumEl = document.getElementById('current-question-num');
    const totalQuestionsNumEl = document.getElementById('total-questions-num');
    const progressBar = document.getElementById('quiz-progress-bar');

    // --- ELEMENTOS DO MODAL ---
    const feedbackModal = document.getElementById('div-feedback-erro');
    const feedbackExplanationEl = document.getElementById('feedback-explanation');
    const feedbackTipEl = document.getElementById('feedback-tip');
    const feedbackMaterialEl = document.getElementById('feedback-material');
    const nextQuestionBtn = document.getElementById('next-question-btn');

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
        // ... (esta função continua a mesma de antes)
        if (currentQuestionIndex >= currentQuiz.length) {
            sessionStorage.setItem('quizScore', score);
            sessionStorage.setItem('totalQuestions', currentQuiz.length);
            window.location.href = 'resultados.html';
            return;
        }
        const question = currentQuiz[currentQuestionIndex];
        selectedAlternativeIndex = null;
        answerBtn.disabled = true;
        questionTextEl.textContent = question.pergunta;
        currentQuestionNumEl.textContent = currentQuestionIndex + 1;
        totalQuestionsNumEl.textContent = currentQuiz.length;
        progressBar.style.width = `${((currentQuestionIndex + 1) / currentQuiz.length) * 100}%`;
        alternativesContainerEl.innerHTML = '';
        if (question && Array.isArray(question.alternativas) && question.alternativas.length > 0) {
            question.alternativas.forEach((alt, index) => {
                const button = document.createElement('button');
                button.classList.add('btn', 'alternative-btn');
                button.textContent = `${String.fromCharCode(65 + index)}) ${alt}`;
                button.dataset.index = index;
                button.addEventListener('click', handleSelectAlternative);
                alternativesContainerEl.appendChild(button);
            });
        } else {
            console.error("Dados da questão inválidos. Faltam alternativas:", question);
            questionTextEl.textContent = "Ocorreu um erro ao carregar esta questão. As alternativas não foram fornecidas corretamente.";
        }
    }

    /** Lida com a seleção de uma alternativa */
    function handleSelectAlternative(event) {
        // ... (esta função continua a mesma de antes)
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

        allButtons.forEach(btn => btn.disabled = true);
        
        if (isCorrect) {
            score++;
            allButtons[selectedAlternativeIndex].classList.add('correct');
            // Se a resposta estiver correta, avançamos automaticamente após um breve momento
            setTimeout(goToNextQuestion, 1200);
        } else {
            allButtons[selectedAlternativeIndex].classList.add('incorrect');
            allButtons[question.resposta_correta].classList.add('correct');
            // Se a resposta estiver errada, mostramos o modal com os detalhes
            showFeedbackModal(question);
        }
    }

    /** Preenche o modal com os dados da questão e o exibe */
    function showFeedbackModal(question) {
        feedbackExplanationEl.textContent = question.explicacao_erro || "Explicação não disponível.";
        feedbackTipEl.textContent = question.dica_estudo || "Dica não disponível.";
        feedbackMaterialEl.textContent = question.conceito_principal || "Conceito não disponível.";
        feedbackModal.style.display = 'flex'; // A mágica acontece aqui!
    }

    /** Esconde o modal e avança para a próxima questão */
    function goToNextQuestion() {
        feedbackModal.style.display = 'none'; // Esconde o modal
        currentQuestionIndex++;
        displayCurrentQuestion();
    }

    // --- INICIALIZAÇÃO ---
    answerBtn.addEventListener('click', handleAnswerSubmit);
    nextQuestionBtn.addEventListener('click', goToNextQuestion); // Adicionamos o evento para o botão do modal
    startQuiz();
});