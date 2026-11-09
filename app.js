// ============================================
// ONBOX - Main App Controller
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    FirebaseManager.init();
    Router.init();
    setupGlobalEvents();
    console.log('🎬 OnBox initialized');
});

function setupGlobalEvents() {
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
        searchInput.addEventListener('input', UI.debounce((e) => {
            const query = e.target.value.trim();
            if (query.length > 2) {
                AppState.searchQuery = query;
                Router.go('search');
                SearchPage.performSearch(query);
            }
        }, 500));

        searchInput.addEventListener('focus', () => {
            const shortcut = document.querySelector('.search-shortcut');
            if (shortcut) shortcut.style.display = 'none';
        });
    }

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('global-search');
            if (searchInput) searchInput.focus();
        }

        if (e.key === 'Escape') {
            AuthManager.hide();
            PlayerManager.close();
            SeasonManager.hide();
        }
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                if (overlay.id === 'auth-modal') AuthManager.hide();
                if (overlay.id === 'season-modal') SeasonManager.hide();
            }
        });
    });

    const authForm = document.getElementById('auth-form');
    if (authForm) {
        authForm.addEventListener('submit', (e) => AuthManager.handleSubmit(e));
    }

    // Handle visibility change to pause hero slider
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            HomePage.stopHeroSlider();
        } else {
            HomePage.startHeroSlider();
        }
    });
}

// Global helper functions
window.navigateTo = (page) => Router.go(page);
window.toggleTheme = () => ThemeManager.toggle();
window.showAuthModal = () => AuthManager.show();
window.closeAuthModal = () => AuthManager.hide();
window.toggleAuthMode = () => AuthManager.toggleMode();
window.handleAuth = (e) => AuthManager.handleSubmit(e);
window.scrollCarousel = (id, dir) => Carousel.scroll(id, dir);
window.setContentType = (type) => DiscoverPage.setContentType(type);
window.setFilter = (filter) => DiscoverPage.setFilter(filter);
window.changePage = (page) => DiscoverPage.changePage(page);
window.showDetail = (id, type) => Router.toDetail(id, type);
window.playFeatured = () => HomePage.playFeatured();
window.showFeaturedDetail = () => HomePage.showFeaturedDetail();
window.playCurrent = () => DetailPage.play();
window.toggleWatchlistCurrent = () => DetailPage.toggleWatchlist();
window.shareCurrent = () => DetailPage.share();
window.closePlayer = () => PlayerManager.close();
window.closeSeasonModal = () => SeasonManager.hide();
window.toggleFullscreen = () => PlayerManager.toggleFullscreen();
window.switchVideoSource = () => PlayerManager.switchSource();

