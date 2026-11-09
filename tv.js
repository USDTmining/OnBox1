// ============================================
// ONBOX - TV Shows Page
// ============================================

const TVPage = {
    initialized: false,

    init() {
        if (!this.initialized) {
            this.initialized = true;
            this.setupFilters();
        }
        this.loadData();
    },

    setupFilters() {
        document.querySelectorAll('#tv-filters .filter-chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.filter === AppState.tvFilter);
        });
    },

    async loadData() {
        const grid = document.getElementById('tv-grid');
        if (!grid) return;

        UI.showLoading('tv-grid', 12);

        let endpoint = '';
        const params = { page: AppState.tvPage };

        switch(AppState.tvFilter) {
            case 'popular': endpoint = '/tv/popular'; break;
            case 'topRated': endpoint = '/tv/top_rated'; break;
            case 'onTheAir': endpoint = '/tv/on_the_air'; break;
            case 'airingToday': endpoint = '/tv/airing_today'; break;
            default: endpoint = '/tv/popular';
        }

        const data = await TMDB.fetch(endpoint, params);
        if (data && data.results) {
            grid.innerHTML = data.results.map(item => Components.movieCard(item, 'tv')).join('');
            this.renderPagination(data.page, data.total_pages);
        }
    },

    renderPagination(current, total) {
        const container = document.getElementById('tv-pagination');
        if (!container) return;

        if (total <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = `<button class="page-btn" onclick="TVPage.changePage(${current - 1})" ${current <= 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>`;

        const start = Math.max(1, current - 2);
        const end = Math.min(total, current + 2);

        if (start > 1) {
            html += `<button class="page-btn" onclick="TVPage.changePage(1)">1</button>`;
            if (start > 2) html += `<span class="page-btn dots">...</span>`;
        }

        for (let i = start; i <= end; i++) {
            html += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="TVPage.changePage(${i})">${i}</button>`;
        }

        if (end < total) {
            if (end < total - 1) html += `<span class="page-btn dots">...</span>`;
            html += `<button class="page-btn" onclick="TVPage.changePage(${total})">${total}</button>`;
        }

        html += `<button class="page-btn" onclick="TVPage.changePage(${current + 1})" ${current >= total ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>`;

        container.innerHTML = html;
    },

    changePage(page) {
        AppState.tvPage = page;
        this.loadData();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    setFilter(filter) {
        AppState.setTVFilter(filter);

        document.querySelectorAll('#tv-filters .filter-chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.filter === filter);
        });

        this.loadData();
    }
};

window.TVPage = TVPage;
