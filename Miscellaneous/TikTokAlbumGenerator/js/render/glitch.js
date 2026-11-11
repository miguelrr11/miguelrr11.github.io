// p5 glue around GlitchCore: prepares the source pixels, caches results per call
// site ("slot") and offers a low-resolution draft so sliders stay responsive.
'use strict';

const Glitch = {
    slots: {},                 // slot id → { key, quality, canvas, x, y, w, h, pd }
    sources: new WeakMap(),    // p5.Image → { k → prepared source }
    draft: false,              // true while the user is dragging a control
    lastMs: 0,

    // Deterministic 0..1 generator so 'random' edges survive a re-render / export.
    rng(seed) {
        let a = (seed * 2654435761) >>> 0;
        return () => {
            a = (a + 0x6D2B79F5) >>> 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    },

    // Source pixels, pre-upscaled (smoothly) so the stretched bands are not blocky.
    // Cached per image + scale, so tweaking options never re-reads the image.
    prepare(img, imgW, imgH, pdOut, cacheable) {
        const srcPd0 = img.pixelDensity ? img.pixelDensity() : 1;
        let k = Math.max((imgW * pdOut) / (img.width * srcPd0), (imgH * pdOut) / (img.height * srcPd0));
        k = k > 1.01 ? Math.min(k, 4) : 1;
        const kKey = k.toFixed(4);
        let perImg = cacheable ? this.sources.get(img) : null;
        if (perImg && perImg[kKey]) return perImg[kKey];

        let source = img, geoScale = 1;
        if (k > 1) {
            source = img.get();
            source.resize(Math.round(img.width * k), Math.round(img.height * k));
            geoScale = k;
        }
        source.loadPixels();
        const pd = source.pixelDensity ? source.pixelDensity() : 1;
        const prepared = {
            src: source.pixels, ipw: source.width * pd, iph: source.height * pd, pd,
            geoPd: geoScale > 1 ? geoScale : pd
        };
        if (cacheable) {
            if (!perImg) { perImg = {}; this.sources.set(img, perImg); }
            perImg[kKey] = prepared;
        }
        return prepared;
    },

    // Returns a drawable for `slot`, recomputing only when an input changed.
    //   getImg   lazy factory for the source (p5.Image / p5.Graphics)
    //   imgW/H   display size, pos = center of the image on the canvas
    //   srcKey   identifies the source content (url, or text + font + size)
    //   opts.cacheSource  keep the prepared pixels (album art); false for throwaway buffers
    get(slot, getImg, imgW, imgH, pos, opts, srcKey, extra = {}) {
        const fullPd = pixelDensity();
        const seed = extra.seed || 1;
        const key = srcKey + '|' + imgW + '|' + imgH + '|' + pos.x + '|' + pos.y + '|' + seed + '|' + JSON.stringify(opts);
        const cur = this.slots[slot];
        const wantDraft = this.draft && fullPd > 1;
        if (cur && cur.key === key && (cur.quality === 'full' || wantDraft)) return cur;

        const t0 = performance.now();
        const pdOut = wantDraft ? 1 : fullPd;
        const img = getImg();
        const prepared = this.prepare(img, imgW, imgH, pdOut, extra.cacheSource !== false);
        noiseSeed(seed);
        const out = GlitchCore.compute({
            src: prepared.src, ipw: prepared.ipw, iph: prepared.iph, pd: prepared.pd, geoPd: prepared.geoPd,
            imgW, imgH, cx: pos.x, cy: pos.y, width, height, pdOut, opts,
            noise, random: this.rng(seed),
            blurPx: (opts.blur || 0) * (pdOut / fullPd)
        });
        if (extra.dispose) extra.dispose(img);

        if (cur && cur.canvas) { cur.canvas.width = 0; cur.canvas.height = 0; }
        let res = { key, quality: wantDraft ? 'draft' : 'full', canvas: null, x: 0, y: 0, w: 0, h: 0, pd: pdOut };
        if (out && out.w > 0 && out.h > 0) {
            const c = document.createElement('canvas');
            c.width = out.w; c.height = out.h;
            c.getContext('2d').putImageData(new ImageData(out.data, out.w, out.h), 0, 0);
            res = { key, quality: res.quality, canvas: c, x: out.x, y: out.y, w: out.w, h: out.h, pd: pdOut };
        }
        this.slots[slot] = res;
        this.lastMs = performance.now() - t0;
        return res;
    },

    // Paint a result at its place on the main canvas (honours the current shadow).
    draw(res) {
        if (!res || !res.canvas) return;
        drawingContext.drawImage(res.canvas, 0, 0, res.w, res.h, res.x / res.pd, res.y / res.pd, res.w / res.pd, res.h / res.pd);
    },

    // True when some slot only holds a draft and a full-quality pass is still owed.
    hasDrafts() { return Object.values(this.slots).some(s => s.quality === 'draft'); },

    drop(prefix) {
        for (const k of Object.keys(this.slots)) {
            if (prefix && !k.startsWith(prefix)) continue;
            const s = this.slots[k];
            if (s.canvas) { s.canvas.width = 0; s.canvas.height = 0; }
            delete this.slots[k];
        }
    }
};

// ─── Dominant colors of an image (for "edge colours from the album art") ──────
const popularColorCache = new WeakMap();

function getPopularColors(img, count = 3, bucketSize = 32, step = 1) {
    if (popularColorCache.has(img)) return popularColorCache.get(img);
    img.loadPixels();
    const px = img.pixels, levels = Math.ceil(256 / bucketSize), buckets = {};
    const stride = 4 * Math.max(1, Math.floor(step));
    for (let i = 0; i < px.length; i += stride) {
        if (px[i + 3] < 128) continue;
        const r = px[i], g = px[i + 1], b = px[i + 2];
        const key = (Math.floor(r / bucketSize) * levels + Math.floor(g / bucketSize)) * levels + Math.floor(b / bucketSize);
        const bk = buckets[key] || (buckets[key] = { count: 0, r: 0, g: 0, b: 0 });
        bk.count++; bk.r += r; bk.g += g; bk.b += b;
    }
    const sorted = Object.values(buckets).sort((a, b) => b.count - a.count)
        .map(bk => [Math.round(bk.r / bk.count), Math.round(bk.g / bk.count), Math.round(bk.b / bk.count)]);
    const minDist = bucketSize * 1.5, result = [];
    const far = c => result.every(o => Math.hypot(o[0] - c[0], o[1] - c[1], o[2] - c[2]) >= minDist);
    for (const c of sorted) { if (far(c)) result.push(c); if (result.length === count) break; }
    for (const c of sorted) {
        if (result.length >= count) break;
        if (!result.some(o => o[0] === c[0] && o[1] === c[1] && o[2] === c[2])) result.push(c);
    }
    popularColorCache.set(img, result);
    return result;
}

// Glitch options with `edges.auto` resolved against the current album art.
function resolveGlitchOpts(opts, albumImg) {
    if (!opts.edges || !opts.edges.auto) return opts;
    return Object.assign({}, opts, { edges: Object.assign({}, opts.edges, { colors: albumImg ? getPopularColors(albumImg, 3) : [] }) });
}
