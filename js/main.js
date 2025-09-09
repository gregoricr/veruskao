// js/main.js

document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('login-btn');
    const apiKeyInput = document.getElementById('api-key');
    const clearApiBtn = document.getElementById('clear-api-btn');

    // Carrega a chave de API salva, se existir
    const savedApiKey = localStorage.getItem('ysraelly_quiz_api_key');
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
        clearApiBtn.style.display = 'block';
    }

    // Adiciona os eventos aos elementos
    loginBtn.addEventListener('click', handleLogin);
    clearApiBtn.addEventListener('click', clearSession);

    apiKeyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });

    apiKeyInput.addEventListener('input', () => {
        document.getElementById('api-key-error').style.display = 'none';
        apiKeyInput.classList.remove('invalid');
    });
});