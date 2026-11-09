// ============================================
// ONBOX - Search Page
// ============================================

const SearchPage = {
    searchTimeout: null,

    init() {
        this.setupSearchInput();

        if (AppState.searchQuery) {
            this.performSearch(AppState.searchQuery);
            this.updateSearchInput(AppState.searchQuery);
        } else {
            this.showEmpty();
        }
    },

    setupSearchInput() {
        // Desktop global search
        const globalSearch = document.getElementById('global-search');
        if (globalSearch) {
            globalSearch.addEventListener('input', UI.debounce((e) => {
                const query = e.target.value.trim();
                if (query.length > 2) {
                    AppState.searchQuery = query;
                    Router.go('search');
                    this.performSearch(query);
                } else if (query.length === 0) {
                    AppState.searchQuery = '';
                    this.showEmpty();
                }
            }, 500));
        }

        // Mobile/page search input
        const pageSearchInput = document.getElementById('page-search-input');
        const clearBtn = document.getElementById('search-clear');

        if (pageSearchInput) {
            pageSearchInput.addEventListener('input', UI.debounce((e) => {
                const query = e.target.value.trim();

                // Show/hide clear button
                if (clearBtn) {
                    clearBtn.style.display = query.length > 0 ? 'flex' : 'none';
                }

                if (query.length > 2) {
                    AppState.searchQuery = query;
                    this.performSearch(query);
                } else if (query.length === 0) {
                    AppState.searchQuery = '';
                    this.showEmpty();
                }
            }, 500));

            // Focus the input when search page loads
            if (AppState.searchQuery) {
                pageSearchInput.value = AppState.searchQuery;
                if (clearBtn) clearBtn.style.display = 'flex';
            }
        }
    },

    updateSearchInput(query) {
        const pageSearchInput = document.getElementById('page-search-input');
        const globalSearch = document.getElementById('global-search');
        const clearBtn = document.getElementById('search-clear');

        if (pageSearchInput) pageSearchInput.value = query;
        if (globalSearch) globalSearch.value = query;
        if (clearBtn && query) clearBtn.style.display = 'flex';
    },

    showEmpty() {
        const grid = document.getElementById('search-grid');
        const empty = document.getElementById('search-empty');
        if (grid) grid.innerHTML = '';
        if (empty) empty.style.display = 'none';

        const subtitle = document.getElementById('search-subtitle');
        if (subtitle) subtitle.textContent = 'Find your favorite movies and TV shows';
    },

    clearSearch() {
        AppState.searchQuery = '';
        const pageSearchInput = document.getElementById('page-search-input');
        const globalSearch = document.getElementById('global-search');
        const clearBtn = document.getElementById('search-clear');

        if (pageSearchInput) pageSearchInput.value = '';
        if (globalSearch) globalSearch.value = '';
        if (clearBtn) clearBtn.style.display = 'none';

        this.showEmpty();

        // Focus back on input
        if (pageSearchInput) pageSearchInput.focus();
    },

    async performSearch(query) {
        const grid = document.getElementById('search-grid');
        const empty = document.getElementById('search-empty');
        if (!grid) return;

        UI.showLoading('search-grid', 8);
        if (empty) empty.style.display = 'none';

        const subtitle = document.getElementById('search-subtitle');
        if (subtitle) subtitle.textContent = `Results for "${query}"`;

        const data = await TMDB.fetch('/search/multi', { query, page: 1 });
        if (data && data.results) {
            const results = data.results.filter(r => r.media_type === 'movie' || r.media_type === 'tv');
            if (results.length === 0) {
                grid.innerHTML = '';
                if (empty) empty.style.display = 'block';
            } else {
                grid.innerHTML = results.map(item => 
                    Components.movieCard(item, item.media_type)
                ).join('');
            }
        }
    }
};

window.SearchPage = SearchPage;
