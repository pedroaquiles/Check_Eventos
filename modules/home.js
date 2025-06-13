/** 
* @param {HTMLElement} homeScreen
* @param {HTMLElement} navGoToLoginButtonDesktop
* @param {HTMLElement} sidebarGoToLoginButtonMobile
* @param {HTMLElement} navbarToggle
* @param {HTMLElement} sidebarMenu
* @param {HTMLElement} sidebarOverlay
* @param {Function} onGoToLogin
 */
export function initHomeScreen(
    homeScreen,
    navGoToLoginButtonDesktop,
    sidebarGoToLoginButtonMobile,
    navbarToggle,
    sidebarMenu,
    sidebarOverlay,
    onGoToLogin
) {
    if (navGoToLoginButtonDesktop) {
        navGoToLoginButtonDesktop.addEventListener('click', onGoToLogin);
    }

    if (sidebarGoToLoginButtonMobile) {
        sidebarGoToLoginButtonMobile.addEventListener('click', () => {
            closeSidebar();
            onGoToLogin();
        });
    }

    if (navbarToggle && sidebarMenu && sidebarOverlay) {
        navbarToggle.addEventListener('click', toggleSidebar);
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    function toggleSidebar() {
        if (sidebarMenu && sidebarOverlay && navbarToggle) {
            sidebarMenu.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
            navbarToggle.classList.toggle('active');
        }
    }

    function closeSidebar() {
        if (sidebarMenu && sidebarOverlay && navbarToggle) {
            sidebarMenu.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            navbarToggle.classList.remove('active');
        }
    }
}