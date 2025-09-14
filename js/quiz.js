// js/quiz.js - VERSÃO COM CONTADOR DE TEMPO

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DO DOM ---
    const questionTextEl = document.getElementById('question-text');
    const alternativesContainerEl = document.getElementById('alternatives-container');
    const answerBtn = document.getElementById('answer-btn');
    const currentQuestionNumEl = document.getElementById('current-question-num');
    const totalQuestionsNumEl = document.getElementById('total-questions-num');
    const progressBar = document.getElementById('quiz-progress-bar');
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
    let userAnswers = [];
    // Novas variáveis de tempo
    let quizStartTime = 0;
    let questionStartTime = 0;
    let questionTimes = [];

    // --- FUNÇÕES ---

    /** Carrega os dados do quiz e inicia o contador de tempo */
    function startQuiz() {
        const quizData = sessionStorage.getItem('currentQuiz');
        if (!quizData) { /* ... código de erro ... */ }

        try {
            currentQuiz = JSON.parse(quizData);
            if (!Array.isArray(currentQuiz) || currentQuiz.length === 0) {
                throw new Error("Os dados do quiz estão vazios ou em formato inválido.");
            }
            quizStartTime = Date.now(); // Inicia o cronômetro do quiz
            displayCurrentQuestion();
        } catch (error) { /* ... código de erro ... */ }
    }

    /** Exibe a pergunta e inicia o cronômetro da questão */
    function displayCurrentQuestion() {
        if (currentQuestionIndex >= currentQuiz.length) {
            const totalTime = (Date.now() - quizStartTime) / 1000; // Tempo total em segundos
            // Salva tudo na sessão para a página de resultados
            sessionStorage.setItem('userAnswers', JSON.stringify(userAnswers));
            sessionStorage.setItem('totalTime', totalTime.toString());
            sessionStorage.setItem('questionTimes', JSON.stringify(questionTimes));
            window.location.href = 'resultados.html';
            return;
        }
        
        questionStartTime = Date.now(); // Zera o cronômetro para a nova questão
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
        } else { /* ... código de erro ... */ }
    }
    
    /** Processa a resposta e registra o tempo gasto na questão */
    function handleAnswerSubmit() {
        if (selectedAlternativeIndex === null) return;
        
        const timeSpent = (Date.now() - questionStartTime) / 1000; // Tempo gasto na questão em segundos
        questionTimes.push(timeSpent);

        const question = currentQuiz[currentQuestionIndex];
        const isCorrect = selectedAlternativeIndex === question.resposta_correta;
        const allButtons = alternativesContainerEl.querySelectorAll('.alternative-btn');

        userAnswers.push({
            pergunta: question.pergunta,
            resposta_usuario: selectedAlternativeIndex,
            resposta_correta: question.resposta_correta,
            correta: isCorrect,
            conceito_principal: question.conceito_principal,
            tempo_gasto: timeSpent
        });

        allButtons.forEach(btn => btn.disabled = true);
        
        if (isCorrect) {
            score++;
            allButtons[selectedAlternativeIndex].classList.add('correct');
            setTimeout(goToNextQuestion, 1200);
        } else {
            allButtons[selectedAlternativeIndex].classList.add('incorrect');
            allButtons[question.resposta_correta].classList.add('correct');
            showFeedbackModal(question);
        }
    }

    // Funções handleSelectAlternative, showFeedbackModal, goToNextQuestion continuam as mesmas...
    function handleSelectAlternative(event) {
        const allButtons = alternativesContainerEl.querySelectorAll('.alternative-btn');
        allButtons.forEach(btn => btn.classList.remove('selected'));
        const selectedButton = event.currentTarget;
        selectedButton.classList.add('selected');
        selectedAlternativeIndex = parseInt(selectedButton.dataset.index, 10);
        answerBtn.disabled = false;
    }
    function showFeedbackModal(question) {
        feedbackExplanationEl.textContent = question.explicacao_erro || "Explicação não disponível.";
        feedbackTipEl.textContent = question.dica_estudo || "Dica não disponível.";
        feedbackMaterialEl.textContent = question.conceito_principal || "Conceito não disponível.";
        feedbackModal.style.display = 'flex';
    }
    function goToNextQuestion() {
        feedbackModal.style.display = 'none';
        currentQuestionIndex++;
        displayCurrentQuestion();
    }

    // --- INICIALIZAÇÃO ---
    answerBtn.addEventListener('click', handleAnswerSubmit);
    nextQuestionBtn.addEventListener('click', goToNextQuestion);
    startQuiz();
});