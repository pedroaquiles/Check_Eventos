import { initHomeScreen } from './modules/home.js';
import { initLoginScreen } from './modules/login.js';
import { initAppScreen, formatDateTimeForDisplay } from './modules/events.js';

document.addEventListener('DOMContentLoaded', () => {
    const homeScreen = document.getElementById('home-screen');
    const loginScreen = document.getElementById('login-screen');
    const appScreen = document.getElementById('app-screen');
    const relatorioScreen = document.getElementById('relatorio-screen');
    const detailsScreen = document.getElementById('details-screen');
    const navbarToggle = document.getElementById('navbar-toggle');
    const sidebarMenu = document.getElementById('sidebar-menu');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const navGoToLoginButtonDesktop = document.getElementById('nav-go-to-login-button-desktop');
    const sidebarGoToLoginButtonMobile = document.getElementById('sidebar-go-to-login-button-mobile');
    const viewReportButton = document.getElementById('view-report-button');
    const reportEventsList = document.getElementById('report-events-list');
    const reportMessage = document.getElementById('report-message');
    const filterOrderSelect = document.getElementById('filter-order');
    const backToEventsFromReportButton = document.getElementById('back-to-events-from-report-button');
    const eventDetailsContent = document.getElementById('event-details-content');
    const backFromDetailsButton = document.getElementById('back-from-details-button');
    const API_BASE_URL = 'http://localhost:3000/api';
    const AUTH_TOKEN_KEY = 'authToken';
    const SEEN_EVENTS_LOCAL_STORAGE_KEY = 'seenEvents';
    let allFetchedEvents = [];
    let seenEventsSet = new Set();
    let appScreenModule = null;

    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId)?.classList.add('active');
    }

    function displayMessage(element, message, type) {
        element.textContent = message;
        element.className = `message ${type} active`;
        setTimeout(() => {
            element.classList.remove('active');
        }, 3000);
    }

    function toggleLoading(show) {
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = show ? 'block' : 'none';
        }
    }

    function loadSeenEventsState() {
        const seenEventsJson = localStorage.getItem(SEEN_EVENTS_LOCAL_STORAGE_KEY);
        seenEventsSet = new Set(seenEventsJson ? JSON.parse(seenEventsJson) : []);
    }

    function saveSeenEventsState() {
        localStorage.setItem(SEEN_EVENTS_LOCAL_STORAGE_KEY, JSON.stringify(Array.from(seenEventsSet)));
    }

    function handleEventSeenChange(eventId, isChecked) {
        if (isChecked) {
            seenEventsSet.add(String(eventId));
        } else {
            seenEventsSet.delete(String(eventId));
        }
        saveSeenEventsState();
    }

    function handleGoToLogin() {
        showScreen('login-screen');
        document.getElementById('login-input').value = '';
        document.getElementById('password-input').value = '';
        document.getElementById('login-message').classList.remove('active');
    }

    function handleBackToHome() {
        showScreen('home-screen');
    }

    function onEventsFetchedFromApi(events) {
        allFetchedEvents = events;
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
        document.getElementById('login-input').value = '';
        document.getElementById('password-input').value = '';
        document.getElementById('events-list').innerHTML = '';
        document.getElementById('events-message').classList.remove('active');
        allFetchedEvents = [];
        seenEventsSet.clear();
        saveSeenEventsState();
    }

    function handleEventDetailsSelect(event) {
        renderDetailsScreen(event);
    }

    function handleViewReport() {
        showScreen('relatorio-screen');
        renderReportScreen();
    }

    function handleBackToEventsFromReport() {
        showScreen('app-screen');
    }

    function handleBackFromDetails() {
        showScreen('app-screen');
    }

    function renderDetailsScreen(event) {
        if (!eventDetailsContent) return;
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
        eventDetailsContent.innerHTML = `
            <p><strong>ID do Evento:</strong> ${eventId}</p>
            <p><strong>Local (Market):</strong> ${marketName}</p>
            <p><strong>Início do Evento:</strong> ${startTime}</p>
            <p><strong>Fim do Evento:</strong> ${endTime}</p>
            <p><strong>Data de Importação:</strong> ${dateImport}</p>
            ${videosHtml}
        `;
        showScreen('details-screen');
    }

    function renderReportScreen() {
        if (!reportEventsList || !reportMessage) return;
        const seenEventsArray = allFetchedEvents.filter(event => seenEventsSet.has(String(event.idEvent)));
        const orderBy = filterOrderSelect?.value || 'market_asc';
        const sortedEvents = [...seenEventsArray].sort((a, b) => {
            if (orderBy === 'market_asc') {
                return (a.market?.nome || '').localeCompare(b.market?.nome || '');
            } else if (orderBy === 'market_desc') {
                return (b.market?.nome || '').localeCompare(a.market?.nome || '');
            } else if (orderBy === 'date_asc') {
                return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
            } else if (orderBy === 'date_desc') {
                return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
            }
            return 0;
        });
        reportEventsList.innerHTML = '';
        if (sortedEvents.length === 0) {
            displayMessage(reportMessage, 'Nenhum evento visto para exibir no relatório.', 'info');
            return;
        }
        sortedEvents.forEach(event => {
            const li = document.createElement('li');
            li.classList.add('report-event-item');
            const marketName = event.market?.nome || 'Local desconhecido';
            const camNames = event.videos?.map(v => v.camName || 'Desconhecida').join(', ') || 'N/A';
            li.innerHTML = `
                <strong>Local: ${marketName}</strong>
                <span>Câmeras: ${camNames}</span>
                <span>Data: ${formatDateTimeForDisplay(event.startTime)}</span>
            `;
            li.addEventListener('click', () => renderDetailsScreen(event));
            reportEventsList.appendChild(li);
        });
        reportMessage.classList.remove('active');
    }

    function initializeModules() {
        loadSeenEventsState();
        initHomeScreen(
            homeScreen,
            navGoToLoginButtonDesktop,
            sidebarGoToLoginButtonMobile,
            navbarToggle,
            sidebarMenu,
            sidebarOverlay,
            handleGoToLogin
        );
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
        appScreenModule = initAppScreen(
            appScreen,
            document.getElementById('logout-button'),
            document.getElementById('start-date-input'),
            document.getElementById('end-date-input'),
            document.getElementById('fetch-events-button'),
            document.getElementById('events-message'),
            document.getElementById('loading-indicator'),
            document.getElementById('events-list'),
            viewReportButton,
            API_BASE_URL,
            AUTH_TOKEN_KEY,
            handleLogout,
            handleEventDetailsSelect,
            handleEventSeenChange,
            displayMessage,
            toggleLoading,
            onEventsFetchedFromApi
        );
        viewReportButton?.addEventListener('click', handleViewReport);
        backToEventsFromReportButton?.addEventListener('click', handleBackToEventsFromReport);
        backFromDetailsButton?.addEventListener('click', handleBackFromDetails);
        filterOrderSelect?.addEventListener('change', renderReportScreen);
    }

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
