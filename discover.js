// ============================================
// ONBOX - Discover Page
// ============================================

const DiscoverPage = {
    initialized: false,

    init() {
        if (!this.initialized) {
            this.initialized = true;
            this.setupFilters();
        }
        this.loadData();
    },

    setupFilters() {
        document.querySelectorAll('.content-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.type === AppState.currentContentType);
        });
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.filter === AppState.currentFilter);
        });
    },

    async loadData() {
        const grid = document.getElementById('discover-grid');
        if (!grid) return;

        UI.showLoading('discover-grid', 12);

        let endpoint = '';
        const params = { page: AppState.discoverPage };

        if (AppState.currentContentType === 'movie') {
            switch(AppState.currentFilter) {
                case 'discover': endpoint = '/discover/movie'; break;
                case 'todayTrending': endpoint = '/trending/movie/day'; break;
                case 'thisWeekTrending': endpoint = '/trending/movie/week'; break;
                case 'popular': endpoint = '/movie/popular'; break;
                case 'nowPlaying': endpoint = '/movie/now_playing'; break;
                case 'upcoming': endpoint = '/movie/upcoming'; break;
                case 'topRated': endpoint = '/movie/top_rated'; break;
                default: endpoint = '/discover/movie';
            }
        } else {
            switch(AppState.currentFilter) {
                case 'discover': endpoint = '/discover/tv'; break;
                case 'todayTrending': endpoint = '/trending/tv/day'; break;
                case 'thisWeekTrending': endpoint = '/trending/tv/week'; break;
                case 'popular': endpoint = '/tv/popular'; break;
                case 'nowPlaying': endpoint = '/tv/on_the_air'; break;
                case 'upcoming': endpoint = '/tv/airing_today'; break;
                case 'topRated': endpoint = '/tv/top_rated'; break;
                default: endpoint = '/discover/tv';
            }
        }

        const data = await TMDB.fetch(endpoint, params);
        if (data && data.results) {
            grid.innerHTML = data.results.map(item => 
                Components.movieCard(item, AppState.currentContentType)
            ).join('');
            this.renderPagination(data.page, data.total_pages);
        }
    },

    renderPagination(current, total) {
        const container = document.getElementById('discover-pagination');
        if (!container) return;

        if (total <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = `<button class="page-btn" onclick="DiscoverPage.changePage(${current - 1})" ${current <= 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>`;

        const start = Math.max(1, current - 2);
        const end = Math.min(total, current + 2);

        if (start > 1) {
            html += `<button class="page-btn" onclick="DiscoverPage.changePage(1)">1</button>`;
            if (start > 2) html += `<span class="page-btn dots">...</span>`;
        }

        for (let i = start; i <= end; i++) {
            html += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="DiscoverPage.changePage(${i})">${i}</button>`;
        }

        if (end < total) {
            if (end < total - 1) html += `<span class="page-btn dots">...</span>`;
            html += `<button class="page-btn" onclick="DiscoverPage.changePage(${total})">${total}</button>`;
        }

        html += `<button class="page-btn" onclick="DiscoverPage.changePage(${current + 1})" ${current >= total ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>`;

        container.innerHTML = html;
    },

    changePage(page) {
        AppState.discoverPage = page;
        this.loadData();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    setContentType(type) {
        AppState.setContentType(type);
        AppState.discoverPage = 1;

        document.querySelectorAll('.content-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.type === type);
        });

        this.updateFilterLabels(type);
        this.loadData();
    },

    updateFilterLabels(type) {
        const container = document.getElementById('discover-filters');
        const tvFilters = ['discover', 'todayTrending', 'thisWeekTrending', 'popular', 'nowPlaying', 'upcoming', 'topRated'];
        const movieFilters = ['discover', 'todayTrending', 'thisWeekTrending', 'popular', 'nowPlaying', 'upcoming', 'topRated'];
        const tvLabels = ['Discover', 'Trending Today', 'Trending Week', 'Popular', 'On The Air', 'Airing Today', 'Top Rated'];
        const movieLabels = ['Discover', 'Trending Today', 'Trending Week', 'Popular', 'Now Playing', 'Upcoming', 'Top Rated'];

        const keys = type === 'tv' ? tvFilters : movieFilters;
        const labels = type === 'tv' ? tvLabels : movieLabels;

        container.innerHTML = keys.map((key, i) => 
            `<button class="filter-chip ${key === 'discover' ? 'active' : ''}" data-filter="${key}" onclick="DiscoverPage.setFilter('${key}')">${labels[i]}</button>`
        ).join('');

        AppState.setFilter('discover');
    },

    setFilter(filter) {
        AppState.setFilter(filter);
        AppState.discoverPage = 1;

        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.filter === filter);
        });

        this.loadData();
    }
};

window.DiscoverPage = DiscoverPage;
