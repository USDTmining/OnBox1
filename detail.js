// ============================================
// ONBOX - Detail Page
// ============================================

const DetailPage = {
    async init(params = {}) {
        const { id, type = 'movie' } = params;
        if (!id) return;

        AppState.setDetail(id, type);

        const endpoint = type === 'tv' ? `/tv/${id}` : `/movie/${id}`;
        const data = await TMDB.fetch(endpoint, { 
            append_to_response: 'credits,recommendations,videos' 
        });

        if (!data) return;

        this.renderDetail(data, type);
    },

    renderDetail(data, type) {
        // Backdrop
        const backdrop = TMDB.backdrop(data.backdrop_path);
        document.getElementById('detail-backdrop').style.backgroundImage = `url(${backdrop})`;

        // Poster
        const poster = TMDB.image(data.poster_path, 'w500');
        document.getElementById('detail-poster-img').src = poster;

        // Type badge
        document.getElementById('detail-type').textContent = type === 'tv' ? 'TV Show' : 'Movie';

        // Title
        document.getElementById('detail-title').textContent = data.title || data.name || 'Untitled';

        // Meta
        document.getElementById('detail-rating').textContent = data.vote_average ? data.vote_average.toFixed(1) : '0.0';
        document.getElementById('detail-year').textContent = UI.getYear(data.release_date || data.first_air_date);
        document.getElementById('detail-runtime').textContent = UI.formatRuntime(data.runtime || (data.episode_run_time && data.episode_run_time[0]));

        // Episodes badge for TV
        const episodesBadge = document.getElementById('detail-episodes');
        if (type === 'tv' && data.number_of_episodes) {
            episodesBadge.textContent = `${data.number_of_episodes} Episodes`;
            episodesBadge.style.display = 'inline-flex';
        } else {
            episodesBadge.style.display = 'none';
        }

        // Genres
        const genres = (data.genres || []).map(g => Components.genreTag(g.name)).join('');
        document.getElementById('detail-genres').innerHTML = genres;

        // Overview
        document.getElementById('detail-overview').textContent = data.overview || 'No overview available.';

        // Stats
        document.getElementById('detail-status').textContent = data.status || 'Unknown';
        document.getElementById('detail-budget').textContent = UI.formatCurrency(data.budget);
        document.getElementById('detail-revenue').textContent = UI.formatCurrency(data.revenue);
        document.getElementById('detail-votes').textContent = UI.formatNumber(data.vote_count || 0);

        // Cast
        const cast = (data.credits && data.credits.cast) || [];
        document.getElementById('detail-cast').innerHTML = cast.slice(0, 8).map(p => Components.castCard(p)).join('');

        // Related
        const related = (data.recommendations && data.recommendations.results) || [];
        const relatedSection = document.getElementById('related-section');
        const relatedContainer = document.getElementById('related');

        if (related.length > 0 && relatedContainer) {
            relatedContainer.innerHTML = related.slice(0, 12).map(item => Components.movieCard(item, type)).join('');
            if (relatedSection) relatedSection.style.display = 'block';
        } else if (relatedSection) {
            relatedSection.style.display = 'none';
        }

        // Seasons for TV
        const seasonsSection = document.getElementById('seasons-section');
        const seasonsGrid = document.getElementById('seasons-grid');

        if (type === 'tv' && data.seasons && data.seasons.length > 0) {
            if (seasonsSection) seasonsSection.style.display = 'block';
            if (seasonsGrid) {
                seasonsGrid.innerHTML = data.seasons.map(season => 
                    `<button class="season-btn" onclick="DetailPage.showSeason(${season.season_number}, '${data.name.replace(/'/g, "\'")}')">${season.name}</button>`
                ).join('');
            }
        } else {
            if (seasonsSection) seasonsSection.style.display = 'none';
        }

        // Watchlist button
        this.updateWatchlistButton();
    },

    async showSeason(seasonNumber, tvTitle) {
        if (!AppState.currentDetail) return;
        const { id } = AppState.currentDetail;

        const data = await TMDB.fetch(`/tv/${id}/season/${seasonNumber}`);
        if (data) {
            SeasonManager.show(seasonNumber, data, id, tvTitle);
        }
    },

    updateWatchlistButton() {
        const btn = document.getElementById('detail-watchlist-btn');
        if (!btn || !AppState.currentDetail) return;

        const isSaved = AppState.isInWatchlist(AppState.currentDetail.id, AppState.currentDetail.type);

        if (isSaved) {
            btn.innerHTML = '<i class="fas fa-check"></i> In Watchlist';
            btn.classList.add('active');
        } else {
            btn.innerHTML = '<i class="fas fa-bookmark"></i> Add to Watchlist';
            btn.classList.remove('active');
        }
    },

    toggleWatchlist() {
        if (!AppState.currentDetail) return;

        const { id, type } = AppState.currentDetail;
        const title = document.getElementById('detail-title').textContent;

        if (AppState.isInWatchlist(id, type)) {
            AppState.removeFromWatchlist(id, type);
            UI.showToast('Removed from watchlist', 'info');
        } else {
            AppState.addToWatchlist({ id, type, title });
            UI.showToast('Added to watchlist', 'success');
        }

        this.updateWatchlistButton();
    },

    play() {
        if (!AppState.currentDetail) return;
        const title = document.getElementById('detail-title').textContent;
        const posterEl = document.getElementById('detail-poster-img');
        const poster = posterEl ? posterEl.src : null;
        PlayerManager.open(AppState.currentDetail.id, AppState.currentDetail.type, title, null, null, poster);
    },

    share() {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            UI.showToast('Link copied to clipboard!', 'success');
        });
    }
};

window.DetailPage = DetailPage;
