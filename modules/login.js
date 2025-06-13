/**
 * @param {HTMLElement} loginScreen
 * @param {HTMLElement} loginInput
 * @param {HTMLElement} passwordInput
 * @param {HTMLElement} loginButton
 * @param {HTMLElement} loginMessage
 * @param {HTMLElement} backToHomeButton
 * @param {string} apiBaseUrl
 * @param {string} authTokenKey
 * @param {Function} onLoginSuccess
 * @param {Function} onBackToHome
 * @param {Function} displayMessageFn
 */
export function initLoginScreen(
    loginScreen,
    loginInput,
    passwordInput,
    loginButton,
    loginMessage,
    backToHomeButton,
    apiBaseUrl,
    authTokenKey,
    onLoginSuccess,
    onBackToHome,
    displayMessageFn
) {
    async function handleLogin() {
        const login = loginInput.value.trim();
        const password = passwordInput.value.trim();

        if (!login || !password) {
            displayMessageFn(loginMessage, 'Por favor, preencha todos os campos.', 'error');
            return;
        }

        loginButton.disabled = true;
        displayMessageFn(loginMessage, 'Tentando fazer login...', 'success');

        try {
            const response = await fetch(`${apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ login, password })
            });

            const data = await response.json();

            if (response.ok) {
                const token = data.access_token;

                if (!token) {
                    displayMessageFn(loginMessage, 'Token de acesso não recebido da API.', 'error');
                    return;
                }

                localStorage.setItem(authTokenKey, token);

                displayMessageFn(loginMessage, 'Login realizado com sucesso!', 'success');
                onLoginSuccess();
            } else {
                const errorMessage = data.message || 'Credenciais inválidas. Tente novamente.';
                displayMessageFn(loginMessage, errorMessage, 'error');
                console.error('Erro de login:', data);
            }
        } catch (error) {
            displayMessageFn(loginMessage, 'Erro ao conectar ao servidor. Verifique sua conexão.', 'error');
            console.error('Erro na requisição de login:', error);
        } finally {
            loginButton.disabled = false;
        }
    }

    if (loginButton) {
        loginButton.addEventListener('click', handleLogin);
    }
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }
    if (backToHomeButton) {
        backToHomeButton.addEventListener('click', onBackToHome);
    }

}