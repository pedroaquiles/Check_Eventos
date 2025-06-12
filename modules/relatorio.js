// modules/relatorio.js

/**
 * Formata uma string de data ISO para um formato mais legível.
 * (Função auxiliar, duplicada para autossuficiência do módulo)
 * @param {string} isoString A string de data no formato ISO.
 * @returns {string} A data formatada.
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
 * Inicializa a tela de Relatório, exibindo os detalhes do evento.
 * @param {HTMLElement} relatorioScreen O elemento da tela de relatório.
 * @param {HTMLElement} relatorioDetails O contêiner para exibir os detalhes.
 * @param {HTMLElement} backToEventsButton O botão para voltar à tela de eventos.
 * @param {Function} onBackToEvents Callback para quando o botão de voltar é clicado.
 */
export function initRelatorioScreen(relatorioScreen, relatorioDetails, backToEventsButton, onBackToEvents) {
    /**
     * Renderiza os detalhes de um evento específico.
     * @param {Object} event O objeto do evento a ser exibido.
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

    // Adiciona o event listener para o botão "Voltar aos Eventos"
    if (backToEventsButton) {
        backToEventsButton.addEventListener('click', onBackToEvents);
    }

    // Retorna a função para renderizar detalhes, para que o App.js possa chamá-la
    return {
        renderEventDetails: renderEventDetails
    };
}