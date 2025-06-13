/**
 * @param {string} isoString
 * @returns {string}
 */
function formatDateTime(isoString) {
    if (!isoString) return 'Data não disponível';
    try {
        const date = new Date(isoString);
        const options = {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false
        };
        return date.toLocaleString('pt-BR', options);
    } catch (e) {
        console.error("Erro ao formatar data:", e);
        return 'Data inválida';
    }
}

/**
 * @param {HTMLElement} relatorioScreen
 * @param {HTMLElement} relatorioDetails
 * @param {HTMLElement} backToEventsButton
 * @param {Function} onBackToEvents
 */
export function initRelatorioScreen(relatorioScreen, relatorioDetails, backToEventsButton, onBackToEvents) {
    /**
     * @param {Object} event
     */
    function renderEventDetails(event) {
        if (!relatorioDetails) return;

        if (!event) {
            relatorioDetails.innerHTML = '<p>Nenhum evento selecionado para exibir.</p>';
            return;
        }

        const marketName = event.market ? event.market.nome : 'Não especificado';
        const eventId = event.idEvent || 'Não especificado';
        const startTime = formatDateTime(event.startTime);
        const endTime = formatDateTime(event.endTime);
        const dateImport = formatDateTime(event.dateImport);

        let videosHtml = '';
        if (event.videos && event.videos.length > 0) {
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

        relatorioDetails.innerHTML = `
            <p><strong>ID do Evento:</strong> ${eventId}</p>
            <p><strong>Local (Market):</strong> ${marketName}</p>
            <p><strong>Início do Evento:</strong> ${startTime}</p>
            <p><strong>Fim do Evento:</strong> ${endTime}</p>
            <p><strong>Data de Importação:</strong> ${dateImport}</p>
            ${videosHtml}
        `;
    }

    if (backToEventsButton) {
        backToEventsButton.addEventListener('click', onBackToEvents);
    }

    return {
        renderEventDetails: renderEventDetails
    };
}