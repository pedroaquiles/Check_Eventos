// app.js

import { initHomeScreen } from './modules/home.js';
import { initLoginScreen } from './modules/login.js';
import { initAppScreen } from './modules/events.js';
// Importa a função de formatação para uso em renderRelatorio aqui no app.js
import { formatDateTimeForDisplay } from './modules/events.js'; // NOVO: Importa a função de formatação

document.addEventListener('DOMContentLoaded', () => {
    // --- Referências aos Elementos DOM Globais ---
    const homeScreen = document.getElementById('home-screen');
    const loginScreen = document.getElementById('login-screen');
    const appScreen = document.getElementById('app-screen');
    const relatorioScreen = document.getElementById('relatorio-screen');

    // Elementos da Navbar (na Home Screen)
    const navGoToLoginButton = document.getElementById('nav-go-to-login-button');
    const navbarToggle = document.getElementById('navbar-toggle');
    const navbarMenu = document.getElementById('navbar-menu');

    // Elementos da tela de Relatório
    const relatorioDetails = document.getElementById('relatorio-details');
    const backToEventsButton = document.getElementById('back-to-events-button');

    // --- Variáveis de Configuração Global ---
    const API_BASE_URL = 'https://segmarket-dash-sandbox-api.azuremicroservices.io';
    const AUTH_TOKEN_KEY = 'authToken';

    // --- Funções de Navegação de Tela ---

    /**
     * Alterna a visibilidade das telas.
     * @param {string} screenId O ID da tela a ser ativada ('home-screen', 'login-screen', 'app-screen', 'relatorio-screen').
     */
    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId)?.classList.add('active');
    }

    // --- Funções Auxiliares de UI (Globalmente Acessíveis) ---

    /**
     * Exibe uma mensagem de feedback na tela.
     * @param {HTMLElement} element O elemento HTML onde a mensagem será exibida.
     * @param {string} message O texto da mensagem.
     * @param {string} type O tipo da mensagem ('success', 'error').
     */
    function displayMessage(element, message, type) {
        element.textContent = message;
        element.className = `message ${type} active`;
        setTimeout(() => {
            element.classList.remove('active');
        }, 3000);
    }

    /**
     * Mostra/Esconde o indicador de carregamento.
     * @param {boolean} show True para mostrar, false para esconder.
     */
    function toggleLoading(show) {
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = show ? 'block' : 'none';
        }
    }

    // --- Callbacks para Comunicação entre Módulos e App.js ---

    let appScreenModule = null; // Referência para o módulo da tela de eventos

    function handleGoToLogin() {
        showScreen('login-screen');
        const loginInput = document.getElementById('login-input');
        const passwordInput = document.getElementById('password-input');
        const loginMessage = document.getElementById('login-message');

        if (loginInput) loginInput.value = '';
        if (passwordInput) passwordInput.value = '';
        if (loginMessage) loginMessage.classList.remove('active');
    }

    function handleBackToHome() {
        showScreen('home-screen');
    }

    function handleLoginSuccess() {
        showScreen('app-screen');
        if (appScreenModule) {
            appScreenModule.setDefaultDateFilters();
            appScreenModule.fetchEvents();
        }
    }

    function handleLogout() {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        showScreen('login-screen');
        const loginInput = document.getElementById('login-input');
        const passwordInput = document.getElementById('password-input');
        const eventsList = document.getElementById('events-list');
        const eventsMessage = document.getElementById('events-message');

        if (loginInput) loginInput.value = '';
        if (passwordInput) passwordInput.value = '';
        if (eventsList) eventsList.innerHTML = '';
        if (eventsMessage) eventsMessage.classList.remove('active');
    }

    /**
     * Função para renderizar os detalhes do relatório e mostrar a tela de relatório.
     * Esta função é definida no App.js e passada como callback para events.js.
     * @param {Object} event O objeto do evento selecionado.
     */
    function renderRelatorio(event) {
        // Agora formatDateTimeForDisplay é importada e usada aqui
        const marketName = event.market?.nome || 'Local desconhecido';
        const eventId = event.idEvent || 'Não especificado';
        const startTime = formatDateTimeForDisplay(event.startTime);
        const endTime = formatDateTimeForDisplay(event.endTime);
        const dateImport = formatDateTimeForDisplay(event.dateImport);

        let videosHtml = '';
        if (event.videos?.length) {
            videosHtml = `
                <h3>Vídeos Associados:</h3>
                <ul>
                    ${event.videos.map(video => `
                        <li>
                            <strong>Câmera:</strong> ${video.camName || 'Nome Desconhecido'}<br>
                            <strong>Link:</strong> <a class="video-link" href="${video.linkVideo}" target="_blank">${video.linkVideo || 'Link não disponível'}</a>
                        </li>
                    `).join('')}
                </ul>
            `;
        } else {
            videosHtml = '<p>Nenhum vídeo associado a este evento.</p>';
        }

        if (relatorioDetails) {
            relatorioDetails.innerHTML = `
                <p><strong>ID do Evento:</strong> ${eventId}</p>
                <p><strong>Local (Market):</strong> ${marketName}</p>
                <p><strong>Início do Evento:</strong> ${startTime}</p>
                <p><strong>Fim do Evento:</strong> ${endTime}</p>
                <p><strong>Data de Importação:</strong> ${dateImport}</p>
                ${videosHtml}
            `;
        }
        showScreen('relatorio-screen'); // Mostra a tela de relatório
    }

    /**
     * Callback para voltar da tela de relatório para a tela de eventos.
     */
    function handleBackToEvents() {
        showScreen('app-screen');
    }

    // --- Inicialização dos Módulos ---
    function initializeModules() {
        // Inicializa a tela Home
        initHomeScreen(
            homeScreen,
            navGoToLoginButton,
            navbarToggle,
            navbarMenu,
            handleGoToLogin
        );

        // Inicializa a tela de Login
        initLoginScreen(
            loginScreen,
            document.getElementById('login-input'),
            document.getElementById('password-input'),
            document.getElementById('login-button'),
            document.getElementById('login-message'),
            document.getElementById('back-to-home-from-login'),
            API_BASE_URL,
            AUTH_TOKEN_KEY,
            handleLoginSuccess,
            handleBackToHome,
            displayMessage
        );

        // Inicializa a tela da Aplicação (Eventos)
        appScreenModule = initAppScreen(
            appScreen,
            document.getElementById('logout-button'),
            document.getElementById('start-date-input'),
            document.getElementById('end-date-input'),
            document.getElementById('fetch-events-button'),
            document.getElementById('events-message'),
            document.getElementById('loading-indicator'),
            document.getElementById('events-list'),
            API_BASE_URL,
            authTokenKey,
            handleLogout,
            renderRelatorio, // Passar o callback para renderizar o relatório
            displayMessage,
            toggleLoading
        );

        // Event listener para o botão de voltar da tela de relatório
        backToEventsButton?.addEventListener('click', handleBackToEvents);
    }

    // --- Lógica de Inicialização da Aplicação ---
    const authTokenKey = 'authToken';

    function initializeApp() {
        initializeModules();

        const authToken = localStorage.getItem(AUTH_TOKEN_KEY);
        if (authToken) {
            showScreen('app-screen');
            if (appScreenModule) {
                appScreenModule.setDefaultDateFilters();
                appScreenModule.fetchEvents();
            }
        } else {
            showScreen('home-screen');
        }
    }

    initializeApp();
});