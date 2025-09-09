// js/auth.js

/**
 * Valida a chave de API do Gemini fazendo uma chamada de teste.
 * @param {string} apiKey - A chave de API a ser validada.
 * @returns {Promise<object>} - Um objeto com a propriedade 'valid' (boolean) e 'error' (string, se houver).
 */
async function validateApiKey(apiKey) {
    try {
        const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        const response = await fetch(testUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: " " }] }] })
        });
        
        if (response.ok) return { valid: true };

        const errorBody = await response.json();
        const errorMessage = errorBody.error?.message || `Erro HTTP ${response.status}`;
        return { valid: false, error: `Chave de API inválida ou com permissões incorretas. (${errorMessage})` };

    } catch (error) {
        return { valid: false, error: 'Erro de rede. Verifique a sua ligação à internet.' };
    }
}

/**
 * Salva a chave de API e o estado de "logado" no localStorage.
 * @param {string} apiKey - A chave de API a ser salva.
 */
function saveSession(apiKey) {
    localStorage.setItem('ysraelly_quiz_api_key', apiKey);
    localStorage.setItem('ysraelly_quiz_is_logged_in', 'true');
}

/**
 * Limpa a chave de API e o estado de "logado" do localStorage.
 */
function clearSession() {
    localStorage.removeItem('ysraelly_quiz_api_key');
    localStorage.removeItem('ysraelly_quiz_is_logged_in');
    
    // Atualiza a interface
    document.getElementById('api-key').value = '';
    document.getElementById('clear-api-btn').style.display = 'none';
}

/**
 * Lida com o processo de login quando o botão é clicado.
 */
async function handleLogin() {
    const apiKeyInput = document.getElementById('api-key');
    const errorP = document.getElementById('api-key-error');
    const loginBtn = document.getElementById('login-btn');
    const apiKey = apiKeyInput.value.trim();

    if (apiKey === '') {
        apiKeyInput.classList.add('invalid');
        errorP.textContent = 'A chave de API é obrigatória.';
        errorP.style.display = 'block';
        return;
    }
    
    setLoadingState(loginBtn, true);
    
    const validationResult = await validateApiKey(apiKey);
    
    if (validationResult.valid) {
        saveSession(apiKey);
        // A MUDANÇA PRINCIPAL: Redirecionar para a página home!
        window.location.href = 'pages/home.html';
    } else {
        apiKeyInput.classList.add('invalid');
        errorP.textContent = validationResult.error;
        errorP.style.display = 'block';
        setLoadingState(loginBtn, false, 'Validar e Entrar');
    }
}

/**
 * Controla o estado de carregamento de um botão.
 * @param {HTMLElement} button - O elemento do botão.
 * @param {boolean} isLoading - Se deve mostrar o estado de carregamento.
 * @param {string} [text] - O texto para exibir quando não está carregando.
 */
function setLoadingState(button, isLoading, text = '') {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = `<div class="spinner"></div>`;
    } else {
        button.disabled = false;
        button.innerHTML = `<span>${text}</span>`;
    }
}