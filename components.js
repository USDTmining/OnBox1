// ============================================
// ONBOX - Components
// ============================================

const Components = {
    movieCard(movie, type = 'movie') {
        const poster = TMDB.image(movie.poster_path, 'w500');
        const title = movie.title || movie.name || 'Untitled';
        const date = movie.release_date || movie.first_air_date || '';
        const year = UI.getYear(date);
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '0.0';
        const id = movie.id;
        // Use media_type from API if available (search results), otherwise use passed type
        const mediaType = movie.media_type || type;

        return `
            <div class="movie-card" onclick="Router.go('detail', { id: ${id}, type: '${mediaType}' })" data-id="${id}" data-type="${mediaType}">
                <div class="movie-poster">
                    <img src="${poster}" alt="${title}" loading="lazy" 
                        onerror="this.onerror=null; UI.setImageFallback(this, 'poster')">
                    <div class="poster-overlay"></div>
                    <div class="play-btn"><i class="fas fa-play"></i></div>
                    <div class="movie-rating"><i class="fas fa-star"></i> ${rating}</div>
                </div>
                <div class="movie-info">
                    <h3>${title}</h3>
                    <div class="movie-meta">
                        <span>${year}</span>
                        <span class="dot"></span>
                        <span>${mediaType === 'tv' ? 'TV Show' : 'Movie'}</span>
                    </div>
                </div>
            </div>
        `;
    },

    castCard(person) {
        const image = person.profile_path 
            ? TMDB.image(person.profile_path, 'w200')
            : `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140"><circle cx="70" cy="70" r="70" fill="%231a1a28"/><text fill="%235a5a72" x="70" y="75" text-anchor="middle" font-family="Outfit" font-size="24" font-weight="700">${person.name.charAt(0)}</text></svg>`)}`;

        return `
            <div class="cast-card">
                <img src="${image}" alt="${person.name}" loading="lazy"
                    onerror="this.onerror=null; UI.setImageFallback(this, 'avatar')">
                <h4>${person.name}</h4>
                <p>${person.character || 'Unknown'}</p>
            </div>
        `;
    },

    skeletonCard() {
        return `
            <div class="movie-card">
                <div class="skeleton skeleton-poster"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text short"></div>
            </div>
        `;
    },

    pagination(current, total, onChange) {
        if (total <= 1) return '';

        let html = `<button class="page-btn" onclick="${onChange}(${current - 1})" ${current <= 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>`;

        const start = Math.max(1, current - 2);
        const end = Math.min(total, current + 2);

        if (start > 1) {
            html += `<button class="page-btn" onclick="${onChange}(1)">1</button>`;
            if (start > 2) html += `<span class="page-btn dots">...</span>`;
        }

        for (let i = start; i <= end; i++) {
            html += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="${onChange}(${i})">${i}</button>`;
        }

        if (end < total) {
            if (end < total - 1) html += `<span class="page-btn dots">...</span>`;
            html += `<button class="page-btn" onclick="${onChange}(${total})">${total}</button>`;
        }

        html += `<button class="page-btn" onclick="${onChange}(${current + 1})" ${current >= total ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>`;

        return html;
    },

    emptyState(icon, title, subtitle, action = null) {
        return `
            <div class="library-empty">
                <i class="fas ${icon}"></i>
                <h3>${title}</h3>
                <p>${subtitle}</p>
                ${action ? `<button class="btn btn-primary mt-4" onclick="${action}"><i class="fas fa-compass"></i> Discover</button>` : ''}
            </div>
        `;
    },

    noResults() {
        return `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No results found</h3>
                <p>Try searching with different keywords</p>
            </div>
        `;
    },

    genreTag(name) {
        return `<span class="genre-tag">${name}</span>`;
    },

    stat(value, label) {
        return `
            <div class="stat">
                <div class="stat-value">${value}</div>
                <div class="stat-label">${label}</div>
            </div>
        `;
    }
};

const Carousel = {
    scroll(id, direction) {
        const carousel = document.getElementById(id);
        if (!carousel) return;
        const scrollAmount = 220 * 3;
        carousel.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    }
};

window.Components = Components;
window.Carousel = Carousel;
