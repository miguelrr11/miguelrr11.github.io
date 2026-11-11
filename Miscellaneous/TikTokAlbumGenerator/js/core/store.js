// Application state: the current document, undo history, persistence and the
// uploaded-image store. UI code mutates `App.doc` and calls `App.changed()`.
'use strict';

// Global the text templates and the AI panel read: album metadata + usable tracks.
let albumData = null;

const KEYS = {
    doc: 'arg3.doc', profiles: 'arg3.profiles', lastProfile: 'arg3.lastProfile', types: 'arg3.types',
    genres: 'arg3.genres', prefs: 'arg3.prefs', presets: 'arg3.glitchPresets',
    // keys written by the previous version of the app (read once, never modified)
    legacyDoc: 'albumGeneratorData', legacyProfiles: 'albumGeneratorProfiles',
    legacyLastProfile: 'albumGeneratorLastProfile', legacyColors: 'albumGeneratorColors'
};

const Storage = {
    read(key, fallback) {
        try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); }
        catch (e) { return fallback; }
    },
    write(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); return true; }
        catch (e) {
            if (!Storage.warned) { Storage.warned = true; UI.toast('Browser storage is full — changes are not being saved. Export a JSON backup.', true); }
            return false;
        }
    }
};

// ─── Uploaded images ──────────────────────────────────────────────────────────
// A local upload is stored once (IndexedDB) and referenced from the doc as
// "asset://<id>", so the doc, the undo history and the autosave stay small.
const Assets = {
    map: {}, db: null,

    isRef(url) { return typeof url === 'string' && url.startsWith('asset://'); },
    resolve(url) { return this.isRef(url) ? (this.map[url.slice(8)] || '') : url; },

    hash(str) {
        let h1 = 0x811c9dc5, h2 = 0x1b873593;
        const step = Math.max(1, Math.floor(str.length / 20000));
        for (let i = 0; i < str.length; i += step) {
            const c = str.charCodeAt(i);
            h1 = Math.imul(h1 ^ c, 0x01000193); h2 = Math.imul(h2 + c, 0x85ebca6b) ^ (h2 >>> 13);
        }
        return (h1 >>> 0).toString(36) + (h2 >>> 0).toString(36) + str.length.toString(36);
    },

    add(dataUrl) {
        const id = this.hash(dataUrl);
        if (!this.map[id]) { this.map[id] = dataUrl; this.put(id, dataUrl); }
        return 'asset://' + id;
    },

    open() {
        return new Promise(resolve => {
            if (!window.indexedDB) return resolve(null);
            let req;
            try { req = indexedDB.open('albumRatingGenerator', 1); } catch (e) { return resolve(null); }
            req.onupgradeneeded = () => req.result.createObjectStore('assets');
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(null);
        });
    },

    async init() {
        this.db = await this.open();
        if (!this.db) return;
        await new Promise(resolve => {
            const tx = this.db.transaction('assets', 'readonly'), store = tx.objectStore('assets');
            const cur = store.openCursor();
            cur.onsuccess = () => { const c = cur.result; if (c) { this.map[c.key] = c.value; c.continue(); } else resolve(); };
            cur.onerror = () => resolve();
        });
    },

    put(id, value) {
        if (!this.db) return;
        try { this.db.transaction('assets', 'readwrite').objectStore('assets').put(value, id); } catch (e) { /* memory only */ }
    },

    // Every asset url referenced by a doc / profile / page-type-like object.
    refs(obj) {
        const out = new Set();
        const pages = obj && obj.pages ? obj.pages : (obj && obj.page ? [obj.page] : []);
        if (obj && obj.album && this.isRef(obj.album.imageUrl)) out.add(obj.album.imageUrl.slice(8));
        for (const p of pages) for (const im of (p.images || [])) if (this.isRef(im.url)) out.add(im.url.slice(8));
        return out;
    },

    // Move inline data: URLs of a freshly loaded doc into the store.
    internalize(doc) {
        const fix = url => (typeof url === 'string' && url.startsWith('data:') ? this.add(url) : url);
        doc.album.imageUrl = fix(doc.album.imageUrl);
        for (const p of doc.pages) for (const im of p.images) im.url = fix(im.url);
        return doc;
    },

    // { id: dataUrl } for everything a doc uses (embedded in JSON exports).
    bundle(doc) {
        const out = {};
        for (const id of this.refs(doc)) if (this.map[id]) out[id] = this.map[id];
        return out;
    },

    absorb(bundle) {
        if (!bundle || typeof bundle !== 'object') return;
        for (const id of Object.keys(bundle)) if (!this.map[id]) { this.map[id] = bundle[id]; this.put(id, bundle[id]); }
    },

    // Drop stored images nothing points at any more (run once at startup).
    prune(keep) {
        if (!this.db) return;
        for (const id of Object.keys(this.map)) {
            if (keep.has(id)) continue;
            delete this.map[id];
            try { this.db.transaction('assets', 'readwrite').objectStore('assets').delete(id); } catch (e) { /* ignore */ }
        }
    }
};

// ─── Undo / redo ──────────────────────────────────────────────────────────────
// Snapshots of the whole doc. Changes are committed after a short pause, so a
// burst of typing or a slider drag becomes one step; identical states are skipped.
const History = {
    stack: [], index: -1, max: 200, timer: null,

    reset() { this.stack = []; this.index = -1; clearTimeout(this.timer); this.timer = null; this.commit(); },

    commit() {
        clearTimeout(this.timer); this.timer = null;
        const snap = JSON.stringify(App.doc);
        if (snap === this.stack[this.index]) return false;
        this.stack.length = this.index + 1;
        this.stack.push(snap);
        if (this.stack.length > this.max) this.stack.shift();
        this.index = this.stack.length - 1;
        return true;
    },

    schedule() { clearTimeout(this.timer); this.timer = setTimeout(() => this.commit(), 450); },
    flush() { if (this.timer) this.commit(); },
    canUndo() { return this.index > 0 || !!this.timer; },
    canRedo() { return this.index < this.stack.length - 1; },

    go(delta) {
        this.flush();
        const i = this.index + delta;
        if (i < 0 || i >= this.stack.length) return false;
        this.index = i;
        App.replaceDoc(JSON.parse(this.stack[i]), { history: false });
        return true;
    }
};

// ─── App ──────────────────────────────────────────────────────────────────────
const App = {
    doc: null,
    boxes: [],            // hit boxes of the page on screen (from the last render)
    lastRC: null,
    selection: [],        // ids of the selected boxes on the current page
    profiles: {},         // name → profile (user saved; "Default" is built in)
    types: {},            // id → { name, page } custom page types
    presets: {},          // name → { image, title } glitch presets
    prefs: { tab: 'page', fullCanvas: false, lastNumber: 0, open: {} },
    listeners: [],
    saveTimer: null,

    page() { return this.doc.pages.find(p => p.id === this.doc.currentPageId) || this.doc.pages[0]; },
    pageById(id) { return this.doc.pages.find(p => p.id === id); },
    trackList() { return Model.trackSource(this.doc, this.page()); },

    on(fn) { this.listeners.push(fn); },
    emit(what) { for (const fn of this.listeners) fn(what); },

    syncAlbumData() {
        albumData = Object.assign({}, this.doc.album, { tracks: Model.usableTracks(this.doc.tracks) });
    },

    // Call after mutating App.doc.
    //   render:  'request' (default) | 'interactive' (control being dragged) | 'none'
    //   history: false to keep the change out of the undo stack
    changed(opts) {
        opts = opts || {};
        this.syncAlbumData();
        if (opts.render === 'interactive') Render.interactive();
        else if (opts.render !== 'none') Render.request();
        if (opts.history !== false) History.schedule();
        this.saveSoon();
        this.emit(opts.what || 'change');
    },

    saveSoon() {
        clearTimeout(this.saveTimer);
        this.saveTimer = setTimeout(() => this.saveNow(), 500);
    },
    saveNow() {
        clearTimeout(this.saveTimer); this.saveTimer = null;
        if (this.doc) Storage.write(KEYS.doc, this.doc);
    },
    savePrefs() { Storage.write(KEYS.prefs, this.prefs); },

    // Swap in a whole new doc (load, undo, profile, new review) and refresh everything.
    replaceDoc(doc, opts) {
        opts = opts || {};
        const prevPage = this.doc ? this.doc.currentPageId : null;
        this.doc = Assets.internalize(Model.normalizeDoc(doc));
        if (this.doc.currentPageId !== prevPage) this.selection = [];
        else this.selection = this.selection.filter(id => Model.isBuiltinId(id) || Model.findElement(this.page(), id));
        this.syncAlbumData();
        if (typeof applyExportScale === 'function') applyExportScale();
        if (opts.history === 'reset') History.reset();
        else if (opts.history !== false) History.commit();
        this.saveSoon();
        this.emit('doc');
        Render.request();
    },

    // ── profiles ──
    profileNames() { return ['Default'].concat(Object.keys(this.profiles).sort((a, b) => a.localeCompare(b))); },
    getProfile(name) {
        if (name && name !== 'Default' && this.profiles[name]) return Model.clone(this.profiles[name]);
        return Model.defaultProfile();
    },
    saveProfiles() { Storage.write(KEYS.profiles, this.profiles); },
    setLastProfile(name) { Storage.write(KEYS.lastProfile, name); },
    lastProfile() { const n = Storage.read(KEYS.lastProfile, 'Default'); return this.profileNames().includes(n) ? n : 'Default'; },

    // "Clear all + apply profile" in one step: blank album, profile's pages, next review number.
    newReview(profileName) {
        History.flush();
        const profile = this.getProfile(profileName);
        profile.name = profileName || 'Default';
        const prevNumber = parseInt(this.doc && this.doc.album.number, 10);
        const last = Number.isFinite(prevNumber) ? prevNumber : (this.prefs.lastNumber || 0);
        const doc = Model.createDoc(profile, { number: last > 0 ? last + 1 : '', seed: 1 + Math.floor(Math.random() * 99999) });
        this.selection = [];
        this.replaceDoc(doc);
    },

    applyProfile(profileName) {
        History.flush();
        const profile = this.getProfile(profileName);
        profile.name = profileName || 'Default';
        const doc = Model.applyProfile(Model.clone(this.doc), profile);
        this.selection = [];
        this.replaceDoc(doc);
    },

    rememberNumber() {
        const n = parseInt(this.doc.album.number, 10);
        if (Number.isFinite(n) && n !== this.prefs.lastNumber) { this.prefs.lastNumber = n; this.savePrefs(); }
    },

    // ── startup ──
    async init() {
        await Assets.init();
        this.prefs = Object.assign(this.prefs, Storage.read(KEYS.prefs, {}));
        if (!this.prefs.open) this.prefs.open = {};
        this.types = Storage.read(KEYS.types, {}) || {};
        this.presets = Storage.read(KEYS.presets, {}) || {};
        Genres.setCustom(Storage.read(KEYS.genres, {}));

        // profiles: ours, or imported once from the previous version
        let profiles = Storage.read(KEYS.profiles, null);
        if (!profiles) {
            profiles = {};
            const legacy = Storage.read(KEYS.legacyProfiles, null);
            if (legacy) for (const name of Object.keys(legacy)) {
                try { profiles[name] = Model.migrateLegacyProfile(legacy[name], name); } catch (e) { console.warn('Could not import profile', name, e); }
            }
            Storage.write(KEYS.profiles, profiles);
            const lastLegacy = localStorage.getItem(KEYS.legacyLastProfile);
            if (lastLegacy && localStorage.getItem(KEYS.lastProfile) == null) Storage.write(KEYS.lastProfile, lastLegacy);
        }
        for (const name of Object.keys(profiles)) profiles[name] = Model.normalizeProfile(profiles[name]);
        this.profiles = profiles;

        // document: ours, the previous version's autosave, or a fresh review
        let doc = null;
        const saved = Storage.read(KEYS.doc, null);
        try {
            if (saved) doc = Model.migrate(saved);
            else {
                const legacy = Storage.read(KEYS.legacyDoc, null);
                if (legacy) {
                    const colors = Storage.read(KEYS.legacyColors, null);
                    doc = Model.migrate(legacy, colors ? { map: Object.assign({}, Model.DEFAULT_COLORS, colors), goat: Model.DEFAULT_GOAT_GRADIENT.slice() } : null);
                }
            }
        } catch (e) { console.warn('Saved review could not be read, starting fresh.', e); }
        if (!doc) {
            const name = this.lastProfile();
            const profile = this.getProfile(name); profile.name = name;
            doc = Model.createDoc(profile, { seed: 1 + Math.floor(Math.random() * 99999) });
        }
        this.doc = Assets.internalize(Model.normalizeDoc(doc));
        this.syncAlbumData();

        const keep = Assets.refs(this.doc);
        for (const p of Object.values(this.profiles)) Assets.refs(p).forEach(id => keep.add(id));
        for (const t of Object.values(this.types)) Assets.refs(t).forEach(id => keep.add(id));
        Assets.prune(keep);
        History.reset();
    },

    // ── files ──
    toFile() {
        return Object.assign({ app: 'album-rating-generator' }, Model.clone(this.doc), { assets: Assets.bundle(this.doc) });
    },

    loadFile(data) {
        Assets.absorb(data && data.assets);
        const doc = Model.migrate(data, this.doc ? Model.clone(this.doc.colors) : null);
        delete doc.assets; delete doc.app;
        this.selection = [];
        this.replaceDoc(doc);
    }
};
