// ============================================
// ONBOX - Liquid Glass colour matcher
// Samples each poster / hero backdrop and sets --lg-rgb, --lg-rgb2, --lg-rgb3
// on that element so the CSS glass picks up the movie's own colours.
// ============================================
(function () {
    'use strict';
    const cache = new Map();
    const DEFAULT = null;

    function rgb2hsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
        let h = 0, s = 0;
        if (mx !== mn) {
            const d = mx - mn;
            s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
            h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
            h /= 6;
        }
        return [h, s, l];
    }
    function hsl2rgb(h, s, l) {
        h = ((h % 1) + 1) % 1;
        const f = (p, q, t) => {
            t = ((t % 1) + 1) % 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < .5) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
        return [f(p, q, h + 1 / 3), f(p, q, h), f(p, q, h - 1 / 3)].map(v => Math.round(v * 255));
    }

    function extract(src) {
        if (!src) return Promise.resolve(DEFAULT);
        if (cache.has(src)) return cache.get(src);
        const p = new Promise(resolve => {
            const im = new Image();
            im.crossOrigin = 'anonymous';
            im.onload = () => {
                try {
                    const c = document.createElement('canvas');
                    c.width = c.height = 24;
                    const x = c.getContext('2d', { willReadFrequently: true });
                    x.drawImage(im, 0, 0, 24, 24);
                    const d = x.getImageData(0, 0, 24, 24).data;
                    let R = 0, G = 0, B = 0, W = 0;
                    for (let i = 0; i < d.length; i += 4) {
                        const [, s, l] = rgb2hsl(d[i], d[i + 1], d[i + 2]);
                        const w = s * (1 - Math.abs(l - .5) * 1.6) + .02;   // favour vivid, mid-tone pixels
                        R += d[i] * w; G += d[i + 1] * w; B += d[i + 2] * w; W += w;
                    }
                    let [h, s] = rgb2hsl(R / W, G / W, B / W);
                    s = Math.min(1, Math.max(s * 1.25, .45));
                    resolve({
                        a: hsl2rgb(h, s, .5).join(','),          // main tint
                        b: hsl2rgb(h, s * .8, .76).join(','),    // light refracted tint
                        c: hsl2rgb(h + .1, s, .58).join(',')     // neighbouring hue for the iridescent rim
                    });
                } catch (e) { resolve(DEFAULT); }
            };
            im.onerror = () => resolve(DEFAULT);
            im.src = src;
        });
        cache.set(src, p);
        return p;
    }

    function paint(el, pal) {
        if (!pal) return;
        el.style.setProperty('--lg-rgb', pal.a);
        el.style.setProperty('--lg-rgb2', pal.b);
        el.style.setProperty('--lg-rgb3', pal.c);
    }
    function bgUrl(el) {
        const m = /url\(["']?(.*?)["']?\)/.exec(getComputedStyle(el).backgroundImage || '');
        return m ? m[1] : '';
    }
    function tint(el, src, alsoRoot) {
        if (!el || !src || el.dataset.lgSrc === src) return;
        el.dataset.lgSrc = src;
        extract(src).then(pal => {
            if (el.dataset.lgSrc !== src) return;
            paint(el, pal);
            if (alsoRoot) paint(document.documentElement, pal);
        });
    }

    function scan() {
        // Only cards are tinted now: the colour feeds the play buttons.
        document.querySelectorAll('.movie-card, .continue-card').forEach(card => {
            const img = card.querySelector('img');
            if (img) tint(card, img.currentSrc || img.src);
        });
    }

    let queued = false;
    function schedule() {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => { queued = false; scan(); });
    }

    function start() {
        scan();
        new MutationObserver(schedule).observe(document.body, {
            childList: true, subtree: true,
            attributes: true, attributeFilter: ['src', 'style', 'class']
        });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
})();
