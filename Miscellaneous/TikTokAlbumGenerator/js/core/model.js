// Album Rating Generator — document model (pure logic, no DOM / p5).
// Loaded as a classic script in the browser (exposes `Model`) and with
// require() from the unit tests.
//
// A document ("doc") is everything needed to redraw a review:
//   album   – the metadata shared by every page
//   tracks  – the album track list
//   pages   – ordered pages; each one remembers the page TYPE it was created
//             from and carries its own layout, blocks and custom elements
//   colors / glitch / export – styling + output settings
//
// A PROFILE is the reusable part of a doc: the list of pages (with their
// types) plus colors / glitch / export. A PAGE TYPE is a single page template.
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.Model = api;
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const DOC_VERSION = 3;
    const WIDTH = 1080;
    const HEIGHT = 1920;

    const ASPECT_RATIOS = {
        '9:16': { width: 1080, height: 1920 },
        '3:5': { width: 1080, height: 1800 },
        '8:13': { width: 1080, height: 1755 },
        '2:3': { width: 1080, height: 1620 },
        '3:4': { width: 1080, height: 1440 },
        '4:5': { width: 1080, height: 1350 },
        '5:6': { width: 1080, height: 1296 },
        '1:1': { width: 1080, height: 1080 }
    };

    // Every key of the color map (INTERLUDE / None are not selectable grades).
    const COLOR_KEYS = ['GOAT', 'PEAK', 'EXCEPTIONAL', 'STRONG', 'DECENT', 'OKAY', 'FLOP', 'SHIT', 'INTERLUDE', 'None'];
    const ALBUM_GRADES = ['GOAT', 'PEAK', 'EXCEPTIONAL +', 'EXCEPTIONAL', 'STRONG +', 'STRONG', 'DECENT +', 'DECENT', 'OKAY +', 'OKAY', 'FLOP', 'SHIT', 'None'];
    const LEGEND_GRADES = ['GOAT', 'PEAK', 'EXCEPTIONAL', 'STRONG', 'DECENT', 'OKAY', 'FLOP', 'SHIT'];
    const TRACK_GRADES = LEGEND_GRADES.concat(['None']);
    const LEGEND_LABELS = ['GOAT', '10', '9', '8', '7', '<7', '<5', '<2'];
    const PLUS_NEXT = { OKAY: 'DECENT', DECENT: 'STRONG', STRONG: 'EXCEPTIONAL', EXCEPTIONAL: 'PEAK' };

    const DEFAULT_COLORS = {
        GOAT: '#05668d', PEAK: '#ffd21f', EXCEPTIONAL: '#ff1fa9', STRONG: '#bc3fde', DECENT: '#38b6ff',
        OKAY: '#14b60b', FLOP: '#CC0000', SHIT: '#7a4900', INTERLUDE: '#b2b2b2', None: '#5c5c5c'
    };
    const DEFAULT_GOAT_GRADIENT = ['#05668d', '#028090', '#00a896', '#02c39a', '#f0f3bd'];

    const FONTS = {
        fontHeavy: 'Heavy', fontLight: 'Light', fontRegular: 'Serif', fontRegularCondensed: 'Medium',
        fontRegularItalic: 'Italic', fontRegularCrammed: 'Crammed'
    };

    const TEXT_IDS = ['title', 'artist', 'year', 'genre', 'funfact'];
    const BUILTIN_IDS = TEXT_IDS.concat(['tracks', 'image']);
    const DEFAULT_MAX_W = { title: 980, artist: 480, year: 480, genre: 480, funfact: 490 };
    const EFFECT_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const COLOR_MODES = ['invert', 'tint', 'rainbow', 'chromatic', 'posterize', 'fade', 'glow', 'bloom', 'scanlines', 'bands'];
    const NOTE_TEXT = 'Songs added to GOAT Playlist: {n} (link in bio)';

    // ───────────────────────── helpers ─────────────────────────

    function clone(o) { return o === undefined ? undefined : JSON.parse(JSON.stringify(o)); }

    let uidCounter = 0;
    function uid(prefix) {
        uidCounter = (uidCounter + 1) % 1e6;
        return prefix + '_' + Date.now().toString(36) + uidCounter.toString(36) + Math.floor(Math.random() * 1296).toString(36);
    }

    function isObj(v) { return v && typeof v === 'object' && !Array.isArray(v); }

    // Fill every key missing from `target` with the value from `defaults` (recursively).
    function fillDefaults(target, defaults) {
        for (const k of Object.keys(defaults)) {
            const d = defaults[k];
            if (target[k] === undefined || target[k] === null) target[k] = clone(d);
            else if (isObj(d) && isObj(target[k])) fillDefaults(target[k], d);
        }
        return target;
    }

    function num(v, fallback) { v = Number(v); return Number.isFinite(v) ? v : fallback; }

    // ───────────────────────── glitch ─────────────────────────

    function defaultGlitch() {
        return {
            seed: 1,
            image: {
                sides: { left: true, right: true, top: false, bottom: false },
                type: 'sine', amp: 50, scale: 0.005, symmetrical: false, blur: 0,
                color: { mode: 'bloom+glow', amount: 0.15, tint: [255, 60, 180], levels: 10, shift: 60, bandScale: 0.05, bandSeed: 0 },
                warp: {},
                edges: { mode: 'noise', sample: true, scale: 0.04 },
                colEffOr: EFFECT_ORDER.slice()
            },
            title: {
                sides: { left: true, right: true, top: false, bottom: false },
                type: 'none', amp: 60, scale: 0.005, symmetrical: false, blur: 0,
                color: { mode: 'fade+bands', amount: 0.85, bandScale: 0.05, bandSeed: 10, tint: [255, 60, 180], levels: 10, shift: 60 },
                warp: {},
                edges: {},
                colEffOr: EFFECT_ORDER.slice()
            }
        };
    }

    // Fills every option with the value the renderer would assume anyway, so the
    // panels can bind to plain properties. Never changes how existing options look.
    function normalizeGlitchOpts(o, base) {
        o = isObj(o) ? o : {};
        fillDefaults(o, { sides: base.sides, type: base.type, amp: base.amp, scale: base.scale, symmetrical: base.symmetrical, blur: 0, color: {}, warp: {}, edges: {} });
        fillDefaults(o.sides, { left: false, right: false, top: false, bottom: false });
        fillDefaults(o.color, { mode: 'none', amount: 1, tint: [255, 60, 180], levels: 4, shift: 10, bandScale: 0.05, bandSeed: 0 });
        fillDefaults(o.warp, { mosaic: 0, shear: 0, echo: 0, haze: 0, band: 24 });
        const e = o.edges;
        const edgesInUse = !!e.sample || !!e.auto || (Array.isArray(e.colors) && e.colors.length > 0);
        if (e.mode === undefined) e.mode = edgesInUse ? 'random' : 'noise';     // the renderer treats "no mode" as random
        fillDefaults(e, { sample: false, sampleFactor: 0.5, scale: 0.05, seed: 0, offset: 0 });
        if (!Array.isArray(o.colEffOr) || o.colEffOr.length !== EFFECT_ORDER.length) o.colEffOr = EFFECT_ORDER.slice();
        return o;
    }

    function normalizeGlitch(g) {
        const d = defaultGlitch();
        g = isObj(g) ? g : {};
        g.image = normalizeGlitchOpts(g.image, d.image);
        g.title = normalizeGlitchOpts(g.title, d.title);
        g.seed = num(g.seed, 1);
        return g;
    }

    // A fresh random look: valid, bounded option values (used by the 🎲 button).
    function randomGlitchOpts(rand, target) {
        const pick = a => a[Math.floor(rand() * a.length)];
        const r = (a, b) => a + rand() * (b - a);
        const modes = COLOR_MODES.filter(() => rand() < 0.28);
        if (target === 'title') {
            if (!modes.includes('fade')) modes.push('fade');
            return {
                sides: { left: true, right: true, top: false, bottom: false },
                type: pick(['none', 'none', 'sine', 'noise', 'square', 'sawtooth']),
                amp: Math.round(r(10, 120)), scale: +r(0.002, 0.05).toFixed(3), symmetrical: rand() < 0.5, blur: 0,
                color: { mode: modes.join('+'), amount: +r(0.5, 1).toFixed(2), tint: [255, 60, 180], levels: 10, shift: 60, bandScale: +r(0.02, 0.15).toFixed(3), bandSeed: +r(0, 100).toFixed(1) },
                warp: rand() < 0.3 ? { shear: Math.round(r(5, 40)) } : {},
                edges: {}, colEffOr: EFFECT_ORDER.slice()
            };
        }
        const warp = {};
        if (rand() < 0.25) warp.mosaic = Math.round(r(4, 30));
        if (rand() < 0.25) warp.shear = Math.round(r(10, 80));
        if (rand() < 0.2) warp.echo = Math.round(r(10, 60));
        if (rand() < 0.2) warp.haze = Math.round(r(4, 30));
        return {
            sides: { left: true, right: true, top: rand() < 0.15, bottom: rand() < 0.15 },
            type: pick(['sine', 'sine', 'noise', 'noise', 'square', 'sawtooth', 'none']),
            amp: Math.round(r(20, 220)), scale: +r(0.002, 0.03).toFixed(3), symmetrical: rand() < 0.5, blur: rand() < 0.2 ? Math.round(r(1, 6)) : 0,
            color: {
                mode: modes.length ? modes.join('+') : 'none', amount: +r(0.1, 0.7).toFixed(2),
                tint: [Math.round(r(0, 255)), Math.round(r(0, 255)), Math.round(r(0, 255))],
                levels: Math.round(r(3, 12)), shift: Math.round(r(10, 100)), bandScale: +r(0.01, 0.12).toFixed(3), bandSeed: +r(0, 100).toFixed(1)
            },
            warp,
            edges: { mode: pick(['noise', 'noise', 'random']), sample: rand() < 0.7, sampleFactor: +r(0.2, 0.8).toFixed(2), scale: +r(0.01, 0.12).toFixed(3), seed: +r(0, 100).toFixed(1), offset: rand() < 0.2 ? +r(0, 0.3).toFixed(2) : 0 },
            colEffOr: EFFECT_ORDER.slice()
        };
    }

    // ───────────────────────── pages ─────────────────────────

    // Which built-in blocks each base layout owns.
    const BLOCKS = {
        cover: ['hero', 'title', 'artist'],
        sheet: ['art', 'title', 'artist', 'year', 'genre', 'funfact', 'tracks', 'legend', 'gradeBar', 'note']
    };

    function pageDefaults(base) {
        return {
            id: '', type: base === 'cover' ? 'cover' : 'blank', base, name: 'Page', aspectRatio: '9:16', export: true,
            pos: {}, align: {}, sizeOff: {}, leadOff: {}, maxW: clone(DEFAULT_MAX_W),
            show: {},
            backdrop: { mode: 'art', gray: true, blur: 2, erode: true, dim: 190, zoom: 1, color: '#323232' },
            hero: { size: 0.65, posY: 0.5, shadow: 40, glitch: true, boost: 3, radius: 0 },
            art: { scale: 1, shadow: 50, radius: 0 },
            title: { glitch: true, maxSize: 100 },
            header: { autoAlign: true, shadow: 20 },
            tracks: {
                source: 'album', list: [], from: 0, to: 0,
                textSize: 60, spacing: 0, rectHeight: 40, twoColumns: false, showNumbers: true,
                split: 0, glow: true, font: 'fontRegular', pillScale: 1
            },
            legend: { labels: LEGEND_LABELS.join(','), minGrades: 5 },
            gradeBar: { height: 115, fontSize: 85, radius: 20, glow: 30, text: '' },
            note: { mode: 'off', text: NOTE_TEXT, grades: ['GOAT', 'PEAK'], style: 'bar', icon: 'spotify', height: 54, fontSize: 25, tone: 'grade', color: '#1db954' },
            texts: [], images: [], stack: null
        };
    }

    function textDefaults() {
        return {
            id: '', name: '', field: false, text: '', x: 100, y: 100, fontSize: 40, fontType: 'fontHeavy', color: '#ffffff',
            glitch: false, textAlign: 'left', leading: 0, maxWidth: WIDTH - 100,
            opacity: 1, shadow: 20, uppercase: false, hidden: false, locked: false,
            bg: { on: false, color: '#000000', alpha: 0.55, pad: 14, radius: 14 }
        };
    }

    function imageDefaults() {
        return { id: '', name: '', field: false, url: '', x: 100, y: 100, w: 400, glitch: false, opacity: 1, shadow: 30, radius: 0, hidden: false, locked: false };
    }

    function normalizePage(p) {
        const base = p.base === 'cover' ? 'cover' : 'sheet';
        p.base = base;
        fillDefaults(p, pageDefaults(base));
        if (!p.id) p.id = uid('p');
        if (!ASPECT_RATIOS[p.aspectRatio]) p.aspectRatio = '9:16';
        for (const b of BLOCKS[base]) if (typeof p.show[b] !== 'boolean') p.show[b] = base === 'cover';
        const defAlign = base === 'cover' ? 'center' : 'left';
        for (const id of TEXT_IDS) {
            if (!p.align[id]) p.align[id] = defAlign;
            if (typeof p.sizeOff[id] !== 'number') p.sizeOff[id] = 0;
        }
        if (typeof p.leadOff.funfact !== 'number') p.leadOff.funfact = 0;
        for (const id of BUILTIN_IDS) {
            const q = p.pos[id];
            p.pos[id] = { x: num(q && q.x, 0), y: num(q && q.y, 0) };
        }
        p.texts = (Array.isArray(p.texts) ? p.texts : []).map(t => { fillDefaults(t, textDefaults()); if (!t.id) t.id = uid('t'); return t; });
        p.images = (Array.isArray(p.images) ? p.images : []).map(i => { fillDefaults(i, imageDefaults()); if (!i.id) i.id = uid('i'); return i; });
        if (!Array.isArray(p.tracks.list)) p.tracks.list = [];
        p.tracks.list = p.tracks.list.map(normalizeTrack);
        if (p.stack && (!Array.isArray(p.stack.ids) || !Array.isArray(p.stack.gaps))) p.stack = null;
        if (p.stack) p.stack.start = num(p.stack.start, 0);
        return p;
    }

    function exportHeight(page) { return (ASPECT_RATIOS[page.aspectRatio] || ASPECT_RATIOS['9:16']).height; }

    function findElement(page, id) {
        return page.texts.find(t => t.id === id) || page.images.find(t => t.id === id) || null;
    }

    function isBuiltinId(id) { return BUILTIN_IDS.includes(id); }

    // Give a page a fresh id so it can live next to the one it was copied from.
    // Element ids only need to be unique inside their page, so they are kept.
    function reidPage(page) {
        page.id = uid('p');
        return page;
    }

    // ───────────────────────── built-in page types ─────────────────────────

    function T(o) { return Object.assign(textDefaults(), o); }

    const BUILTIN_TYPES = {
        cover: {
            name: 'Cover', hint: 'Big glitched album art with the title',
            make: () => ({
                type: 'cover', base: 'cover', name: 'Cover', aspectRatio: '3:4',
                pos: { title: { x: 0, y: 23 } },
                sizeOff: { artist: 4, funfact: -6 }, leadOff: { funfact: -6 },
                maxW: { title: 980, artist: 480, year: 480, genre: 520, funfact: 490 },
                show: { hero: true, title: true, artist: false },
                texts: [
                    T({ id: 'album_review', name: 'Review number', text: 'Album Review #$number$', x: 49, y: 292, fontSize: 48, fontType: 'fontRegularCondensed', color: '#f2f2f2', textAlign: 'center', maxWidth: 980 }),
                    T({ id: 'genreInCover', name: 'First genre', text: '$(js: albumData.genre.split(/,\\s*/g)[0])$', x: 55.02164222708063, y: 1266.3363191721955, fontSize: 30, fontType: 'fontLight', color: '#cccccc', textAlign: 'center', maxWidth: 980 }),
                    T({ id: 'artistAndYearInCover', name: 'Artist, year', text: '$artist$, $year$', x: 50.7153196622437, y: 1209.336460532268, fontSize: 36, fontType: 'fontRegularCondensed', color: '#ededed', textAlign: 'center', maxWidth: 980 })
                ]
            })
        },
        context: {
            name: 'Context', hint: 'Band info + genre descriptions + a photo',
            make: () => ({
                type: 'context', base: 'sheet', name: 'Context', aspectRatio: '3:4',
                texts: [
                    T({ id: 'ctx_heading', name: 'Heading', text: 'Some context', x: 70.0083623892076, y: 142.25235637708548, fontSize: 90, fontType: 'fontHeavy', glitch: true, maxWidth: 980 }),
                    T({ id: 'ctx_sub', name: 'Subheading', text: 'for a deeper dive', x: 70.12409777437438, y: 218.2272895757299, fontSize: 38, fontType: 'fontRegularCondensed', maxWidth: 980 }),
                    T({ id: 'ctx_band_h', name: 'Band heading', text: 'the band', x: 70, y: 302.4608662180658, fontSize: 42, fontType: 'fontHeavy', maxWidth: 980 }),
                    T({ id: 'ctx_band', name: 'Band info', field: true, text: '', x: 70.18252248435874, y: 351.4598132820646, fontSize: 24, fontType: 'fontRegularCondensed', leading: 2, maxWidth: 920, textAlign: 'justify' }),
                    T({ id: 'ctx_genres_h', name: 'Genres heading', text: 'the genres', x: 69.7392914168405, y: 389.7914697927529, fontSize: 42, fontType: 'fontHeavy', maxWidth: 980 }),
                    T({ id: 'ctx_g1', name: 'Genre 1', text: "$(js: albumData.genre.split(/,\\s*/g)[0] ?? '')$", x: 70.29196061978621, y: 445.5579033335506, fontSize: 30, fontType: 'fontHeavy', color: '#dedede', maxWidth: 980 }),
                    T({ id: 'ctx_g1_desc', name: 'Genre 1 description', text: "$(js: genreDescriptions[albumData.genre.split(/,\\s*/g)[0]] ?? '')$", x: 70, y: 489.6793326834321, fontSize: 24, fontType: 'fontLight', maxWidth: 920, textAlign: 'justify' }),
                    T({ id: 'ctx_g2', name: 'Genre 2', text: "$(js: albumData.genre.split(/,\\s*/g)[1] ?? '')$", x: 70.22735067453073, y: 553.2269887973919, fontSize: 30, fontType: 'fontHeavy', color: '#dedede', maxWidth: 980 }),
                    T({ id: 'ctx_g2_desc', name: 'Genre 2 description', text: "$(js: genreDescriptions[albumData.genre.split(/,\\s*/g)[1]] ?? '')$", x: 69.97184567257568, y: 595.437065585935, fontSize: 24, fontType: 'fontLight', maxWidth: 920, textAlign: 'justify' })
                ],
                images: [Object.assign(imageDefaults(), { id: 'ctx_image', name: 'Photo', field: true, x: 95.16164706074034, y: 1041.7622828955944, w: 890 })],
                stack: {
                    ids: ['ctx_heading', 'ctx_sub', 'ctx_band_h', 'ctx_band', 'ctx_genres_h', 'ctx_g1', 'ctx_g1_desc', 'ctx_g2', 'ctx_g2_desc'],
                    gaps: [7.034923127843655, 55.08757482653999, 17.582942883090595, 19.923655564643354, 15.950431648707877, 11.201427366238931, 44.79565339789531, 17.75007579672183],
                    start: 3      // the headings above the band info are fixed
                }
            })
        },
        ratings: {
            name: 'Ratings', hint: 'Art, description, graded track list and album grade',
            make: () => ({
                type: 'ratings', base: 'sheet', name: 'Ratings', aspectRatio: '3:4',
                pos: {
                    title: { x: 0, y: 100 }, artist: { x: -46, y: 0 }, year: { x: -46, y: -10 }, genre: { x: -46, y: -16 },
                    funfact: { x: -46, y: -28 }, tracks: { x: -29, y: -22 }
                },
                align: { title: 'left', artist: 'left', year: 'left', genre: 'left', funfact: 'justify' },
                sizeOff: { artist: 4, funfact: -6 }, leadOff: { funfact: -6 },
                maxW: { title: 980, artist: 480, year: 480, genre: 520, funfact: 490 },
                show: { art: true, title: true, artist: true, year: true, genre: true, funfact: true, tracks: true, legend: true, gradeBar: true, note: true },
                art: { scale: 0.95 },
                tracks: { textSize: 36, spacing: -31, rectHeight: 28 },
                note: { mode: 'auto' }
            })
        },
        tracks: {
            name: 'Track list', hint: 'Only the graded track list (continue a long album)',
            make: () => ({
                type: 'tracks', base: 'sheet', name: 'Tracks', aspectRatio: '3:4',
                pos: { title: { x: 0, y: 100 }, tracks: { x: -29, y: -480 } },
                show: { title: true, tracks: true, gradeBar: true },
                tracks: { textSize: 36, spacing: -31, rectHeight: 28 }
            })
        },
        slide: {
            name: 'Text slide', hint: 'Heading + body text for info posts',
            make: () => ({
                type: 'slide', base: 'sheet', name: 'Slide', aspectRatio: '3:4',
                texts: [
                    T({ id: 'slide_heading', name: 'Heading', field: true, text: 'Heading', x: 70, y: 142, fontSize: 90, fontType: 'fontHeavy', glitch: true, maxWidth: 940 }),
                    T({ id: 'slide_body', name: 'Body', field: true, text: '', x: 70, y: 260, fontSize: 30, fontType: 'fontRegularCondensed', leading: 4, maxWidth: 940, textAlign: 'justify' })
                ],
                stack: { ids: ['slide_heading', 'slide_body'], gaps: [40], start: 0 }
            })
        },
        blank: {
            name: 'Blank', hint: 'Just the backdrop — add your own text and images',
            make: () => ({ type: 'blank', base: 'sheet', name: 'Page', aspectRatio: '3:4' })
        }
    };

    // Build a page from a type id. `customTypes` is the user's saved-type library.
    function createPage(typeId, customTypes) {
        let page;
        if (BUILTIN_TYPES[typeId]) page = BUILTIN_TYPES[typeId].make();
        else if (customTypes && customTypes[typeId]) page = clone(customTypes[typeId].page);
        else page = BUILTIN_TYPES.blank.make();
        normalizePage(page);
        return reidPage(page);
    }

    function typeName(typeId, customTypes) {
        if (BUILTIN_TYPES[typeId]) return BUILTIN_TYPES[typeId].name;
        if (customTypes && customTypes[typeId]) return customTypes[typeId].name;
        return 'Custom';
    }

    // ───────────────────────── tracks ─────────────────────────

    function normalizeTrack(t) {
        t = isObj(t) ? t : {};
        let grade = t.grade || 'STRONG';
        let interlude = !!t.interlude;
        if (grade === 'INTERLUDE') { interlude = true; grade = 'None'; }   // legacy: interlude used to be a grade
        if (!TRACK_GRADES.includes(grade)) grade = 'STRONG';
        return {
            title: String(t.title == null ? '' : t.title), grade, interlude,
            customNumber: t.customNumber || null,
            customText: t.customText == null ? '' : String(t.customText),
            customTextLarge: t.customTextLarge == null ? '' : String(t.customTextLarge)
        };
    }

    function emptyTrack() { return normalizeTrack({ grade: 'STRONG' }); }

    function gradeFromScore(score) {
        if (score == null) return 'None';
        if (score >= 10.5) return 'GOAT';
        if (score >= 10) return 'PEAK';
        if (score >= 9) return 'EXCEPTIONAL';
        if (score >= 8) return 'STRONG';
        if (score >= 7) return 'DECENT';
        if (score >= 5) return 'OKAY';
        if (score >= 2) return 'FLOP';
        return 'SHIT';
    }

    // "Title 8.5" per line → tracks. A line without a trailing number is an interlude.
    // Decimal scores below 10 are kept as the small label inside the pill.
    function parseTracksText(text) {
        let lines = String(text || '').split(/\r?\n/).map(l => l.trim()).filter(l => l !== '');
        // Drop "1. " / "02 - " style numbering only when every line has it.
        const numbered = /^\d{1,3}\s*[.)\-–]\s+/;
        if (lines.length > 1 && lines.every(l => numbered.test(l))) lines = lines.map(l => l.replace(numbered, ''));
        return lines.map(line => {
            const m = line.match(/(\d+(?:[.,]\d+)?)\s*$/);
            let score = null, title = line;
            if (m && m.index > 0) {
                score = parseFloat(m[1].replace(',', '.'));
                title = line.slice(0, m.index).replace(/[\s\-–—:|]+$/, '');
                if (title === '') { title = line; score = null; }
            }
            const hasDecimal = score != null && !Number.isInteger(score);
            return normalizeTrack({
                title, grade: gradeFromScore(score), interlude: score == null,
                customText: (score && score < 10 && hasDecimal) ? String(score) : ''
            });
        });
    }

    function usableTracks(list) {
        return (list || []).map(normalizeTrack).map(t => Object.assign(t, { title: t.title.trim(), customText: t.customText.trim(), customTextLarge: t.customTextLarge.trim() })).filter(t => t.title);
    }

    // The list a page edits/draws: the album list or the page's own.
    function trackSource(doc, page) {
        return page && page.tracks.source === 'own' ? page.tracks.list : doc.tracks;
    }

    // Tracks a page draws: non-empty rows, optionally a from–to slice. `offset`
    // keeps the numbering continuous across pages.
    function resolveTracks(doc, page) {
        const all = usableTracks(trackSource(doc, page));
        const from = Math.max(0, Math.floor(num(page.tracks.from, 0)) - 1);
        const to = Math.floor(num(page.tracks.to, 0));
        const end = to > 0 ? Math.min(all.length, to) : all.length;
        const start = Math.min(Math.max(0, from), end);
        return { all, list: all.slice(start, end), offset: start };
    }

    function countGrades(tracks, grades) {
        return tracks.filter(t => !t.interlude && grades.includes(t.grade)).length;
    }

    // Playlist note: null when it should not be drawn.
    function noteFor(page, tracks) {
        const n = page.note;
        if (!page.show.note || n.mode === 'off') return null;
        const countGoat = countGrades(tracks, ['GOAT']);
        const countPeak = countGrades(tracks, ['PEAK']);
        let count = countGoat > 0 ? countGoat : countPeak
        if (n.mode === 'auto' && count === 0) return null;
        const text = String(n.text || NOTE_TEXT).replace(/\{n\}/g, String(count)).replace(/\{s\}/g, count === 1 ? '' : 's');
        return { text, count };
    }

    // Legend pills: every grade from GOAT down to the worst one used.
    function legendFor(tracks, minGrades) {
        let maxIndex = Math.max(0, (minGrades || 5) - 1);
        for (const t of tracks) {
            const idx = LEGEND_GRADES.indexOf(t.grade);
            if (idx > maxIndex) maxIndex = idx;
        }
        return LEGEND_GRADES.slice(0, maxIndex + 1);
    }

    function gradeSummary(tracks) {
        const out = {};
        for (const t of usableTracks(tracks)) {
            const k = t.interlude ? 'INTERLUDE' : t.grade;
            out[k] = (out[k] || 0) + 1;
        }
        return out;
    }

    // ───────────────────────── auto-stack ─────────────────────────
    // A page can keep its textboxes vertically chained: each box sits a fixed gap
    // below the previous one, so a paragraph growing pushes everything under it.

    function captureStack(page, heights) {
        const tbs = page.texts.filter(t => !t.hidden).slice().sort((a, b) => a.y - b.y);
        if (tbs.length < 2) return (page.stack = null);
        const gaps = [];
        for (let i = 0; i < tbs.length - 1; i++) gaps.push(tbs[i + 1].y - (tbs[i].y + (heights[tbs[i].id] || 0)));
        return (page.stack = { ids: tbs.map(t => t.id), gaps, start: 0 });
    }

    // Boxes before `stack.start` are anchors that never move; the chain is applied
    // from there down. Editing a box above the start extends the chain up to it.
    function stackTouch(page, id) {
        const st = page.stack;
        if (!st) return;
        const i = st.ids.indexOf(id);
        if (i !== -1 && i < (st.start || 0)) st.start = i;
    }

    function reflowStack(page, heights) {
        const st = page.stack;
        if (!st) return false;
        // drop ids whose element is gone; the previous gap is kept (legacy behaviour)
        for (let i = st.ids.length - 1; i >= 0; i--) {
            if (!page.texts.some(t => t.id === st.ids[i])) {
                st.ids.splice(i, 1);
                st.gaps.splice(Math.min(i, st.gaps.length - 1), 1);
                if (i < (st.start || 0)) st.start--;
            }
        }
        if (st.ids.length < 2) { page.stack = null; return false; }
        st.gaps.length = st.ids.length - 1;
        st.start = Math.max(0, Math.min(st.ids.length - 1, Math.floor(num(st.start, 0))));
        let prev = page.texts.find(t => t.id === st.ids[st.start]);
        let moved = false;
        for (let i = st.start + 1; i < st.ids.length; i++) {
            const cur = page.texts.find(t => t.id === st.ids[i]);
            const y = prev.y + (heights[prev.id] || 0) + (st.gaps[i - 1] || 0);
            if (cur.y !== y) { cur.y = y; moved = true; }
            prev = cur;
        }
        return moved;
    }

    // ───────────────────────── layout helpers ─────────────────────────

    // X offset that lines the right-hand text column up with the album art.
    function autoAlignX(page) {
        const imageX = WIDTH * 0.05 + page.pos.image.x;
        const imageSize = WIDTH * 0.425 * page.art.scale;
        return Math.round(imageX + imageSize - WIDTH * 0.475 - 20);
    }

    function applyAutoAlign(page) {
        if (page.base !== 'sheet' || !page.header.autoAlign) return false;
        const x = autoAlignX(page);
        for (const id of ['artist', 'year', 'genre', 'funfact']) page.pos[id].x = x;
        return true;
    }

    // ───────────────────────── documents & profiles ─────────────────────────

    function emptyAlbum() {
        return { number: '', title: '', artist: '', year: '', genre: '', funfact: '', imageUrl: '', albumGrade: 'GOAT' };
    }

    function defaultExport() {
        return { format: 'jpg', quality: 0.92, scale: 2, scope: 'all', transparent: false, filename: '{artist} - {album} - {page}' };
    }

    function defaultProfile() {
        return {
            version: DOC_VERSION, name: 'Default',
            pages: ['cover', 'context', 'ratings'].map(t => createPage(t)),
            colors: { map: clone(DEFAULT_COLORS), goat: DEFAULT_GOAT_GRADIENT.slice() },
            glitch: defaultGlitch(),
            export: defaultExport()
        };
    }

    function normalizeProfile(p) {
        p = isObj(p) ? p : {};
        p.version = DOC_VERSION;
        p.pages = (Array.isArray(p.pages) ? p.pages : []).map(normalizePage);
        if (!p.pages.length) p.pages = defaultProfile().pages;
        p.colors = isObj(p.colors) ? p.colors : {};
        p.colors.map = Object.assign(clone(DEFAULT_COLORS), isObj(p.colors.map) ? p.colors.map : {});
        if (!Array.isArray(p.colors.goat) || p.colors.goat.length !== 5) p.colors.goat = DEFAULT_GOAT_GRADIENT.slice();
        p.glitch = normalizeGlitch(p.glitch);
        p.export = fillDefaults(isObj(p.export) ? p.export : {}, defaultExport());
        return p;
    }

    function normalizeDoc(doc) {
        normalizeProfile(doc);
        doc.album = fillDefaults(isObj(doc.album) ? doc.album : {}, emptyAlbum());
        if (!ALBUM_GRADES.includes(doc.album.albumGrade)) doc.album.albumGrade = 'STRONG';
        doc.tracks = (Array.isArray(doc.tracks) ? doc.tracks : []).map(normalizeTrack);
        if (!doc.tracks.length) doc.tracks = [emptyTrack()];
        if (!doc.pages.some(p => p.id === doc.currentPageId)) doc.currentPageId = doc.pages[0].id;
        doc.profileName = doc.profileName || 'Default';
        delete doc.name;
        return doc;
    }

    // Fresh review from a profile: blank album, the profile's pages and styling.
    function createDoc(profile, opts) {
        opts = opts || {};
        const p = normalizeProfile(clone(profile || defaultProfile()));
        const doc = {
            version: DOC_VERSION, album: emptyAlbum(), tracks: [emptyTrack()],
            pages: p.pages.map(reidPage), colors: p.colors, glitch: p.glitch, export: p.export,
            profileName: (profile && profile.name) || 'Default'
        };
        if (opts.number != null) doc.album.number = String(opts.number);
        if (opts.seed != null) doc.glitch.seed = opts.seed;
        doc.currentPageId = doc.pages[0].id;
        return normalizeDoc(doc);
    }

    // The reusable part of a doc. Page-specific content typed into "field"
    // elements and own track lists is cleared so a profile is a clean template.
    function profileFromDoc(doc, name) {
        const pages = clone(doc.pages);
        for (const p of pages) {
            p.tracks.list = [];
            for (const t of p.texts) if (t.field) t.text = '';
            for (const i of p.images) if (i.field) i.url = '';
        }
        return normalizeProfile({ name, pages, colors: clone(doc.colors), glitch: clone(doc.glitch), export: clone(doc.export) });
    }

    // Swap the layout of an existing doc for a profile's, keeping album + tracks.
    function applyProfile(doc, profile) {
        const p = normalizeProfile(clone(profile));
        doc.pages = p.pages.map(reidPage);
        doc.colors = p.colors;
        const seed = doc.glitch ? doc.glitch.seed : 1;
        doc.glitch = p.glitch;
        doc.glitch.seed = seed;
        doc.export = p.export;
        doc.profileName = profile.name || doc.profileName;
        doc.currentPageId = doc.pages[0].id;
        return normalizeDoc(doc);
    }

    // ───────────────────────── legacy migration (v1 / v2 → v3) ─────────────────────────

    // v1 → v2 (the old app's own migration, kept verbatim in behaviour).
    function legacyUpgrade(d) {
        if (!Array.isArray(d.pages) || !d.pages.length) {
            d.pages = [
                { id: 'cover', name: 'Cover', type: 'cover', aspectRatio: '3:4' },
                { id: 'ratings', name: 'Ratings', type: 'ratings', aspectRatio: '9:16' }
            ];
            if (ASPECT_RATIOS[d.aspectRatio]) d.pages[1].aspectRatio = d.aspectRatio;
            if (ASPECT_RATIOS[d.aspectRatioCover]) d.pages[0].aspectRatio = d.aspectRatioCover;
        }
        if (!d.pages.find(p => p.id === 'cover')) d.pages.unshift({ id: 'cover', name: 'Cover', type: 'cover', aspectRatio: '3:4' });
        if (!d.pages.find(p => p.id === 'ratings')) d.pages.splice(1, 0, { id: 'ratings', name: 'Ratings', type: 'ratings', aspectRatio: '9:16' });

        if (!d.verticalOffsets && (d.verticalOffsetsRatings || d.verticalOffsetsCover))
            d.verticalOffsets = { ratings: d.verticalOffsetsRatings || {}, cover: d.verticalOffsetsCover || {} };
        if (!d.horizontalOffsets && (d.horizontalOffsetsRatings || d.horizontalOffsetsCover))
            d.horizontalOffsets = { ratings: d.horizontalOffsetsRatings || {}, cover: d.horizontalOffsetsCover || {} };
        if (!d.textAligns && (d.textAlignRatings || d.textAlignCover))
            d.textAligns = { ratings: d.textAlignRatings || {}, cover: d.textAlignCover || {} };
        if (d.tracksVerticalOffset !== undefined) {
            d.verticalOffsets = d.verticalOffsets || {};
            d.verticalOffsets.ratings = d.verticalOffsets.ratings || {};
            if (d.verticalOffsets.ratings.tracks === undefined) d.verticalOffsets.ratings.tracks = d.tracksVerticalOffset;
        }
        if (d.downloadImageOption === 'both') d.downloadImageOption = 'all';
        else if (d.downloadImageOption === 'cover' || d.downloadImageOption === 'ratings') d.downloadImageOption = 'current';

        d.customTextboxes = (d.customTextboxes || []).flatMap(tb => {
            if (tb.pageId) return [tb];
            const vt = tb.viewType || 'both';
            if (vt === 'both') return [Object.assign({}, tb, { pageId: 'ratings' }), Object.assign({}, tb, { pageId: 'cover', id: (tb.id || 'tb') + '_cover' })];
            return [Object.assign({}, tb, { pageId: vt })];
        });
        d.customImages = d.customImages || [];
        return d;
    }

    function legacyStack(distances) {
        if (!distances) return null;
        const entries = new Map();
        if (Array.isArray(distances.array)) distances.array.forEach(e => entries.set(e.key, e.val));
        else if (distances.map instanceof Map) distances.map.forEach((v, k) => entries.set(k, v));
        const ids = [], gaps = [];
        let id = distances.head, guard = 0;
        while (id !== -1 && id != null && entries.has(id) && guard++ < 1000) {
            const e = entries.get(id);
            ids.push(id);
            if (e.nextID !== -1 && e.nextID != null && entries.has(e.nextID)) gaps.push(e.distance);
            id = e.nextID;
        }
        return ids.length > 1 ? { ids, gaps: gaps.slice(0, ids.length - 1), start: ids.length - 1 } : null;
    }

    function legacyPage(lp, d) {
        const isCover = lp.type === 'cover';
        const isRatings = lp.type === 'ratings';
        const v = (d.verticalOffsets || {})[lp.id] || {};
        const h = (d.horizontalOffsets || {})[lp.id] || {};
        const pos = {};
        for (const id of new Set(Object.keys(v).concat(Object.keys(h)))) pos[id] = { x: num(h[id], 0), y: num(v[id], 0) };
        const on = isRatings;
        const page = {
            id: lp.id, name: lp.name || 'Page', aspectRatio: lp.aspectRatio,
            type: isCover ? 'cover' : isRatings ? 'ratings' : (/context/i.test(lp.name || '') ? 'context' : 'blank'),
            base: isCover ? 'cover' : 'sheet',
            pos,
            align: Object.assign({}, (d.textAligns || {})[lp.id] || {}),
            sizeOff: Object.assign({}, d.textSizeOffsets || {}),
            leadOff: Object.assign({}, d.textLeadingOffsets || {}),
            maxW: Object.assign(clone(DEFAULT_MAX_W), d.maxTextboxWidths || {}),
            show: isCover ? { hero: true, title: true, artist: true }
                : { art: on, title: on, artist: on, year: on, genre: on, funfact: on, tracks: on, legend: on && d.showGradeLegend !== false, gradeBar: on, note: false },
            art: { scale: num(d.imageSizeMultiplier, 1) },
            tracks: {
                textSize: num(d.tracksTextSize, 60), spacing: num(d.tracksSpacing, 0),
                rectHeight: num(d.tracksRectHeight, 40), twoColumns: !!d.tracksTwoColumns
            },
            note: { mode: 'off' },
            texts: d.customTextboxes.filter(t => t.pageId === lp.id).map(t => {
                const o = Object.assign({}, t); delete o.pageId; delete o.viewType; return o;
            }),
            images: d.customImages.filter(t => t.pageId === lp.id).map(t => { const o = Object.assign({}, t); delete o.pageId; return o; }),
            stack: legacyStack(lp.distances)
        };
        // The old app only re-flowed the boxes below the one being typed in, so saved
        // positions above it can be out of step with the saved gaps. Keep those as
        // they are: the chain starts at the first template-driven box.
        if (page.stack) {
            const dyn = page.stack.ids.findIndex(id => { const t = page.texts.find(x => x.id === id); return t && /\$/.test(t.text || ''); });
            if (dyn !== -1) page.stack.start = dyn;
        }
        return page;
    }

    function legacyGlitch(d) {
        const g = defaultGlitch();
        if (isObj(d.glitchOpts)) g.image = clone(d.glitchOpts);
        if (isObj(d.glitchOptsTitle)) g.title = clone(d.glitchOptsTitle);
        return g;
    }

    function fromLegacyLayout(d) {
        d = legacyUpgrade(clone(d));
        return {
            pages: d.pages.map(lp => legacyPage(lp, d)),
            colors: { map: Object.assign(clone(DEFAULT_COLORS), d.colorMap || {}), goat: DEFAULT_GOAT_GRADIENT.slice() },
            glitch: legacyGlitch(d),
            export: {
                format: ['png', 'jpg', 'jpeg', 'webp'].includes(d.imageFormat) ? d.imageFormat : 'png',
                scope: d.downloadImageOption === 'current' ? 'current' : 'all',
                transparent: !!d.transparentBackground
            },
            currentPageId: d.currentPageId
        };
    }

    function migrateLegacyProfile(profile, name) {
        const p = fromLegacyLayout(profile);
        delete p.currentPageId;
        p.name = name;
        return normalizeProfile(p);
    }

    function isLegacy(data) { return !(data && data.version >= DOC_VERSION && data.album && Array.isArray(data.pages)); }

    // Accepts anything the app ever saved: v1/v2 objects (optionally wrapped in
    // `{album: {...}}` by the old JSON export) or a v3 doc. `colors` are the
    // colors to use for legacy docs, which never stored their own.
    function migrate(data, colors) {
        if (!isObj(data)) throw new Error('Not a review file');
        if (!isLegacy(data)) return normalizeDoc(clone(data));
        const d = (isObj(data.album) && (data.album.tracks || data.album.pages || data.album.title !== undefined)) ? data.album : data;
        const doc = fromLegacyLayout(d);
        if (colors && !d.colorMap) doc.colors = clone(colors);
        doc.version = DOC_VERSION;
        doc.album = {
            number: '', title: d.title || '', artist: d.artist || '', year: d.year || '', genre: d.genre || '',
            funfact: d.funfact || '', imageUrl: d.imageUrl || '', albumGrade: d.albumGrade || 'STRONG'
        };
        doc.tracks = (d.tracks || []).map(normalizeTrack);
        doc.profileName = d.currentProfileName || 'Default';
        return normalizeDoc(doc);
    }

    // ───────────────────────── export helpers ─────────────────────────

    function sanitizeFileName(s) { return String(s).replace(/[\/\\:*?"<>|]/g, '').replace(/\s+/g, ' ').trim(); }

    function fileName(template, doc, page, index) {
        const a = doc.album;
        const out = String(template || '{artist} - {album} - {page}')
            .replace(/\{artist\}/g, a.artist || '').replace(/\{album\}/g, a.title || '')
            .replace(/\{year\}/g, a.year || '').replace(/\{number\}/g, a.number || '')
            .replace(/\{page\}/g, page ? page.name : '').replace(/\{index\}/g, index != null ? String(index + 1) : '');
        return sanitizeFileName(out) || 'album';
    }

    function baseFileName(doc) { return sanitizeFileName((doc.album.artist || '') + ' - ' + (doc.album.title || '')) || 'album'; }

    function pagesToExport(doc, scope) {
        if ((scope || doc.export.scope) === 'current') return doc.pages.filter(p => p.id === doc.currentPageId);
        return doc.pages.filter(p => p.export !== false);
    }

    // Things worth a second look before posting.
    function preflight(doc, hasGenreDescription) {
        const w = [];
        const a = doc.album;
        if (!a.imageUrl) w.push('No album image');
        if (!a.title.trim()) w.push('Album title is empty');
        if (!a.artist.trim()) w.push('Artist is empty');
        const usesNumber = doc.pages.some(p => p.texts.some(t => !t.hidden && /\$number\$/.test(t.text)));
        if (usesNumber && !String(a.number).trim()) w.push('Review number is empty');
        for (const p of doc.pages) {
            if (p.export === false) continue;
            for (const t of p.texts) if (t.field && !t.hidden && !t.text.trim()) w.push('"' + (t.name || 'Text') + '" is empty on ' + p.name);
            if (p.base === 'sheet' && p.show.tracks && !resolveTracks(doc, p).list.length) w.push('No tracks on ' + p.name);
        }
        if (hasGenreDescription && doc.pages.some(p => p.texts.some(t => /genreDescriptions/.test(t.text)))) {
            a.genre.split(/,\s*/g).slice(0, 2).filter(Boolean).forEach(g => { if (!hasGenreDescription(g)) w.push('No description for genre "' + g + '"'); });
        }
        return w;
    }

    return {
        DOC_VERSION, WIDTH, HEIGHT, ASPECT_RATIOS, COLOR_KEYS, ALBUM_GRADES, LEGEND_GRADES, TRACK_GRADES, LEGEND_LABELS, PLUS_NEXT,
        DEFAULT_COLORS, DEFAULT_GOAT_GRADIENT, FONTS, TEXT_IDS, BUILTIN_IDS, DEFAULT_MAX_W, EFFECT_ORDER, COLOR_MODES, NOTE_TEXT,
        BLOCKS, BUILTIN_TYPES,
        clone, uid, fillDefaults,
        defaultGlitch, normalizeGlitch, randomGlitchOpts,
        pageDefaults, textDefaults, imageDefaults, normalizePage, exportHeight, findElement, isBuiltinId, reidPage, createPage, typeName,
        normalizeTrack, emptyTrack, gradeFromScore, parseTracksText, usableTracks, trackSource, resolveTracks, countGrades, noteFor, legendFor, gradeSummary,
        captureStack, reflowStack, stackTouch, autoAlignX, applyAutoAlign,
        emptyAlbum, defaultExport, defaultProfile, normalizeProfile, normalizeDoc, createDoc, profileFromDoc, applyProfile,
        isLegacy, migrate, migrateLegacyProfile,
        sanitizeFileName, fileName, baseFileName, pagesToExport, preflight
    };
});
