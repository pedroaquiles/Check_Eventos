/**
 * Inicializa a tela de Login, configurando seus event listeners e lógica.
 *
 * @param {HTMLElement} loginScreen O elemento da tela de Login.
 * @param {HTMLElement} loginInput O campo de input para o login.
 * @param {HTMLElement} passwordInput O campo de input para a senha.
 * @param {HTMLElement} loginButton O botão de login.
 * @param {HTMLElement} loginMessage O elemento para exibir mensagens de feedback.
 * @param {HTMLElement} backToHomeButton O botão para voltar à tela Home.
 * @param {string} apiBaseUrl A URL base da API.
 * @param {string} authTokenKey A chave para armazenar o token no localStorage.
 * @param {Function} onLoginSuccess Callback para quando o login for bem-sucedido.
 * @param {Function} onBackToHome Callback para quando o botão de voltar for clicado.
 * @param {Function} displayMessageFn Função auxiliar para exibir mensagens.
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
    /**
     * Lida com a tentativa de login.
     */
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

                // 🔍 Debug opcional:
                console.log('Token salvo:', token);
                alert(`Token JWT:\n${token}`);

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

    // Listeners
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