// modules/home.js

/**
 * Inicializa a tela Home, configurando seus event listeners.
 * @param {HTMLElement} homeScreen O elemento da tela Home.
 * @param {HTMLElement} navGoToLoginButton O botão "Login" na navbar.
 * @param {HTMLElement} navbarToggle O botão de hambúrguer.
 * @param {HTMLElement} navbarMenu O menu a ser toggleado.
 * @param {Function} onGoToLogin Callback para quando o botão de login for clicado.
 */
export function initHomeScreen(homeScreen, navGoToLoginButton, navbarToggle, navbarMenu, onGoToLogin) {
    // Adiciona o event listener para o botão "Login" na navbar
    if (navGoToLoginButton) {
        navGoToLoginButton.addEventListener('click', () => {
            // Fecha o menu se estiver aberto antes de navegar
            navbarMenu.classList.remove('active');
            navbarToggle.classList.remove('active');
            onGoToLogin();
        });
    }

    // Adiciona event listener para o botão de hambúrguer
    if (navbarToggle && navbarMenu) {
        navbarToggle.addEventListener('click', () => {
            navbarMenu.classList.toggle('active');
            navbarToggle.classList.toggle('active'); // Para a animação do ícone
        });
    }

    // Fecha o menu se clicar fora dele (apenas para mobile)
    homeScreen.addEventListener('click', (event) => {
        if (!navbarMenu.contains(event.target) && !navbarToggle.contains(event.target)) {
            navbarMenu.classList.remove('active');
            navbarToggle.classList.remove('active');
        }
    });
}