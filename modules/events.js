const SEEN_EVENTS_KEY = 'seenEvents';

function loadSeenEvents() {
    const seenEventsJson = localStorage.getItem(SEEN_EVENTS_KEY);
    return new Set(seenEventsJson ? JSON.parse(seenEventsJson) : []);
}

function saveSeenEvents(seenEventsSet) {
    localStorage.setItem(SEEN_EVENTS_KEY, JSON.stringify(Array.from(seenEventsSet)));
}

function formatDateTimeForDisplay(dateString) {
    if (!dateString) return 'Data não disponível';
    const parsed = dateString.includes(' ') ? dateString.replace(' ', 'T') : dateString;
    const date = new Date(parsed);
    if (isNaN(date.getTime())) return 'Data inválida';
    return date.toLocaleString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}
export { formatDateTimeForDisplay };

function formatDateTimeForAPI(dateObj) {
    const pad = n => n.toString().padStart(2, '0');
    return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())} ${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:${pad(dateObj.getSeconds())}`;
}

function setDefaultDateFilters(startInput, endInput) {
    const now = new Date();
    const past = new Date();
    past.setDate(now.getDate() - 30);

    const format = date => {
        const pad = n => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    if (startInput) startInput.value = format(past);
    if (endInput) endInput.value = format(now);
}

function renderEvents(events, eventsList, eventsMessage, displayMessageFn, onEventDetailsSelect, onEventSeenChange) {
    if (eventsList) eventsList.innerHTML = '';

    if (!events || events.length === 0) {
        displayMessageFn(eventsMessage, 'Nenhum evento encontrado para o período selecionado.', 'success');
        return;
    }

    const seenEvents = loadSeenEvents();

    events.forEach(event => {
        const li = document.createElement('li');
        li.classList.add('event-item-card');
        li.dataset.eventId = event.idEvent;

        const marketName = event.market?.nome || 'Local desconhecido';
        const camHtml = event.videos?.length
            ? event.videos.map(v => `<span>Câmera: ${v.camName || 'Desconhecida'}</span>`).join('')
            : '<span>Nenhuma câmera associada.</span>';
        
        const isSeen = seenEvents.has(String(event.idEvent));

        li.innerHTML = `
            <div>
                <strong>Local: ${marketName}</strong>
                <span>Início: ${formatDateTimeForDisplay(event.startTime)}</span>
                <span>Fim: ${formatDateTimeForDisplay(event.endTime)}</span>
                ${camHtml}
            </div>
            <div class="event-actions">
                <label class="event-status-checkbox">
                    <input type="checkbox" ${isSeen ? 'checked' : ''}> Evento Visto
                </label>
                <button class="btn-primary event-details-button">Ver Detalhes</button>
            </div>
        `;
        
        const checkbox = li.querySelector('.event-status-checkbox input[type="checkbox"]');
        if (checkbox) {
            checkbox.addEventListener('change', (e) => {
                const eventId = event.idEvent;
                const isChecked = e.target.checked;
                onEventSeenChange(eventId, isChecked);
            });
        }

        const detailsButton = li.querySelector('.event-details-button');
        if (detailsButton) {
            detailsButton.addEventListener('click', () => {
                onEventDetailsSelect(event);
            });
        }

        eventsList.appendChild(li);
    });
}

export function initAppScreen(
    appScreen,
    logoutButton,
    startDateInput,
    endDateInput,
    fetchEventsButton,
    eventsMessage,
    loadingIndicator,
    eventsList,
    viewReportButton,
    apiBaseUrl,
    authTokenKey,
    onLogout,
    onEventDetailsSelect,
    onEventSeenChange,
    displayMessage,
    toggleLoading,
    onEventsFetched
) {
    async function fetchEvents() {
        const token = localStorage.getItem(authTokenKey);
        if (!token) {
            displayMessage(eventsMessage, 'Você não está logado. Faça login novamente.', 'error');
            onLogout();
            return;
        }

        const startVal = startDateInput.value;
        const endVal = endDateInput.value;

        if (!startVal || !endVal) {
            displayMessage(eventsMessage, 'Selecione datas válidas.', 'error');
            return;
        }

        const startFormatted = formatDateTimeForAPI(new Date(startVal));
        const endFormatted = formatDateTimeForAPI(new Date(endVal));

        toggleLoading(true);
        eventsList.innerHTML = '';
        eventsMessage.classList.remove('active');

        try {
            const url = `http://localhost:3000/api/public/events/getEvents?startDate=${encodeURIComponent(startFormatted)}&endDate=${encodeURIComponent(endFormatted)}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 401 || response.status === 403) {
                displayMessage(eventsMessage, 'Sessão expirada. Faça login novamente.', 'error');
                onLogout();
                return;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                displayMessage(eventsMessage, errorData.message || 'Erro ao buscar eventos.', 'error');
                console.error('Erro da API:', errorData);
                return;
            }

            const result = await response.json();
            const events = result.content || [];

            if (onEventsFetched) {
                onEventsFetched(events); 
            }
            renderEvents(events, eventsList, eventsMessage, displayMessage, onEventDetailsSelect, onEventSeenChange);
        } catch (err) {
            displayMessage(eventsMessage, 'Erro de rede ao buscar eventos.', 'error');
            console.error('Erro na requisição:', err);
        } finally {
            toggleLoading(false);
        }
    }

    logoutButton?.addEventListener('click', () => {
        localStorage.removeItem(authTokenKey);
        onLogout();
    });

    fetchEventsButton?.addEventListener('click', fetchEvents);

    viewReportButton?.addEventListener('click', () => {
        console.log("Botão 'Ver Relatório' clicado.");
    });

    return {
        setDefaultDateFilters: () => setDefaultDateFilters(startDateInput, endDateInput),
        fetchEvents,
    };
}
