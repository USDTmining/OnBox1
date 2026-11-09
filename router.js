// ============================================
// ONBOX - Router
// ============================================

const Router = {
    routes: {
        'home': { page: 'home', init: () => HomePage.init() },
        'discover': { page: 'discover', init: () => DiscoverPage.init() },
        'tv': { page: 'tv', init: () => TVPage.init() },
        'search': { page: 'search', init: () => SearchPage.init() },
        'library': { page: 'library', init: () => LibraryPage.init() },
        'ai': { page: 'ai', init: () => AIPage.init() },
        'detail': { page: 'detail', init: (params) => DetailPage.init(params) },
        'movie': { page: 'detail', init: (params) => DetailPage.init({ ...params, type: 'movie' }) },
        'tvshow': { page: 'detail', init: (params) => DetailPage.init({ ...params, type: 'tv' }) }
    },

    currentRoute: null,

    init() {
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.route) {
                this.navigate(e.state.route, e.state.params, false);
            }
        });

        const hash = window.location.hash.slice(1) || 'home';
        this.navigate(hash, {}, false);
    },

    go(route, params = {}, pushState = true) {
        this.navigate(route, params, pushState);
    },

    navigate(route, params = {}, pushState = true) {
        const routeConfig = this.routes[route];
        if (!routeConfig) {
            console.error(`Route "${route}" not found`);
            return;
        }

        if (pushState) {
            const url = route === 'home' ? '#' : `#${route}`;
            window.history.pushState({ route, params }, '', url);
        }

        AppState.setPage(routeConfig.page);
        this.currentRoute = route;

        // Update desktop nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === routeConfig.page) {
                item.classList.add('active');
            }
        });

        // Update mobile bottom nav
        document.querySelectorAll('.bottom-nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === routeConfig.page) {
                item.classList.add('active');
            }
        });

        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

        const targetPage = document.getElementById(`page-${routeConfig.page}`);
        if (targetPage) {
            targetPage.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        routeConfig.init(params);

        AuthManager.hide();
        PlayerManager.close();
        SeasonManager.hide();
    },

    toDetail(id, type = 'movie') {
        this.go('detail', { id, type });
    }
};

window.Router = Router;
