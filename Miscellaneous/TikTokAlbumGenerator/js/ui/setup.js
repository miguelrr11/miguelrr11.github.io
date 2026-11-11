// Setup tab: library management (profiles, page types, genre descriptions),
// the raw JSON editor, shortcuts and data reset.
'use strict';

const SHORTCUTS = [
    ['⌘Z / ⇧⌘Z', 'Undo / redo'], ['⌘E', 'Export images'], ['⌘S', 'Save review as JSON'], ['⌥N', 'New review'],
    ['⌥1 … ⌥9', 'Go to page 1 … 9'], ['Arrows', 'Nudge selection (⇧ = 10 px)'], ['⌘D', 'Duplicate selected elements'],
    ['⌫', 'Delete selected elements'], ['Esc', 'Deselect'], ['⇧ drag', 'Move along one axis'], ['⇧ click', 'Add to selection'],
    ['Double-click', 'Edit a textbox · rename a page tab'], ['Enter / ↑ ↓', 'Next / previous track']
];

const Setup = {
    build(body) {
        // profiles
        const prof = UI.section('Profiles', { key: 'su:profiles', open: true, extra: UI.h('span.section-extra.count', String(App.profileNames().length)) });
        prof.body.appendChild(UI.h('p.field-hint', 'A profile is a set of pages (each with its page type) plus colours, glitch and export settings. "New review" starts from the one selected in the top bar.'));
        for (const name of App.profileNames()) {
            const p = App.getProfile(name);
            prof.body.appendChild(UI.h('div.lib-row', UI.h('div.lib-main', UI.h('strong', name), UI.h('small', p.pages.map(pg => pg.name).join(' → '))),
                name === 'Default' ? UI.h('span.badge', 'built-in') : UI.h('button.icon-btn.small.ghost.danger', { type: 'button', title: 'Delete profile', onclick: async () => {
                    if (!await UI.confirm('Delete profile "' + name + '"?', '', 'Delete', true)) return;
                    delete App.profiles[name]; App.saveProfiles(); App.emit('profiles'); Design.show('setup');
                } }, UI.icon('trash'))));
        }
        prof.body.appendChild(UI.h('div.btn-row',
            UI.h('button.btn.btn-small', { type: 'button', onclick: () => TopBar.saveAs().then(() => Design.show('setup')) }, UI.icon('floppy-disk'), 'Save'),
            UI.h('button.btn.btn-small', { type: 'button', onclick: () => this.exportLibrary() }, UI.icon('file-export'), 'Export'),
            UI.h('button.btn.btn-small', { type: 'button', onclick: () => this.importLibrary() }, UI.icon('file-import'), 'Import')));
        body.appendChild(prof.el);

        // page types
        const types = UI.section('Page types', { key: 'su:types', extra: UI.h('span.section-extra.count', String(Object.keys(Model.BUILTIN_TYPES).length + Object.keys(App.types).length)) });
        types.body.appendChild(UI.h('p.field-hint', 'Templates for a single page — add one with the + next to the page tabs. Save your own from a page\'s ⋯ menu.'));
        for (const id of Object.keys(Model.BUILTIN_TYPES)) types.body.appendChild(UI.h('div.lib-row', UI.h('div.lib-main', UI.h('strong', Model.BUILTIN_TYPES[id].name), UI.h('small', Model.BUILTIN_TYPES[id].hint)), UI.h('span.badge', 'built-in')));
        for (const id of Object.keys(App.types)) {
            types.body.appendChild(UI.h('div.lib-row', UI.h('div.lib-main', UI.h('strong', App.types[id].name), UI.h('small', 'Custom page type')),
                UI.h('button.icon-btn.small.ghost.danger', { type: 'button', title: 'Delete page type', onclick: () => { delete App.types[id]; Storage.write(KEYS.types, App.types); Design.show('setup'); } }, UI.icon('trash'))));
        }
        body.appendChild(types.el);

        // genres
        const custom = Genres.getCustom();
        const gen = UI.section('Genre descriptions', { key: 'su:genres', extra: UI.h('span.section-extra.count', String(Genres.names().length)) });
        gen.body.appendChild(UI.h('p.field-hint', 'Shown on the Context page. Matching ignores case, spaces and hyphens.'));
        for (const name of Object.keys(custom)) {
            gen.body.appendChild(UI.h('div.lib-row', UI.h('div.lib-main', UI.h('strong', name), UI.h('small', custom[name])),
                UI.h('button.icon-btn.small.ghost', { type: 'button', title: 'Edit', onclick: () => this.editGenre(name) }, UI.icon('pen'))));
        }
        gen.body.appendChild(UI.h('div.btn-row', UI.h('button.btn.btn-small', { type: 'button', onclick: () => this.editGenre('') }, UI.icon('plus'), 'Add / override a genre')));
        body.appendChild(gen.el);

        // json + shortcuts + data
        const adv = UI.section('Advanced', { key: 'su:adv' });
        UI.append(adv.body, [
            UI.h('div.btn-col',
                UI.h('button.btn', { type: 'button', onclick: () => JsonEditor.toggle() }, UI.icon('code'), 'Edit review as JSON'),
                UI.h('button.btn.btn-danger', { type: 'button', onclick: () => this.resetAll() }, UI.icon('triangle-exclamation'), 'Reset all app data')),
            UI.h('p.field-hint', 'Your data lives only in this browser. Export the profiles and save reviews as JSON to back them up.')
        ]);
        body.appendChild(adv.el);

        const keys = UI.section('Keyboard shortcuts', { key: 'su:keys' });
        keys.body.appendChild(UI.h('div.shortcut-list', SHORTCUTS.map(([k, d]) => UI.h('div.shortcut', UI.h('kbd', k), UI.h('span', d)))));
        body.appendChild(keys.el);
    },

    async editGenre(name) {
        const nameIn = UI.h('input.input', { type: 'text', value: name, placeholder: 'Genre name' });
        const area = UI.h('textarea.input', { rows: 5, placeholder: 'One or two sentences describing the genre…' });
        area.value = Genres.describe(name) || '';
        const ok = await UI.dialog(name ? 'Description for "' + name + '"' : 'Add a genre description', UI.h('div.dialog-form', nameIn, area),
            [{ label: 'Cancel', value: () => false }, { label: 'Save', primary: true, value: () => true }]);
        const key = nameIn.value.trim();
        if (!ok || !key) return;
        const custom = Object.assign({}, Genres.getCustom());
        if (area.value.trim()) custom[key] = area.value.trim(); else delete custom[key];
        Genres.setCustom(custom);
        Storage.write(KEYS.genres, custom);
        App.changed({ history: false, what: 'album' });
        Content.genreHint();
        if (App.prefs.tab === 'setup') Design.show('setup');
    },

    // profiles + page types + genres + glitch presets in one file
    exportLibrary() {
        const data = { app: 'album-rating-generator-library', version: Model.DOC_VERSION, profiles: App.profiles, types: App.types, genres: Genres.getCustom(), presets: App.presets, assets: {} };
        for (const p of Object.values(App.profiles)) Object.assign(data.assets, Assets.bundle(p));
        UI.download(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), 'album-rating-generator-library.json');
    },
    importLibrary() {
        const input = UI.h('input', { type: 'file', accept: '.json,application/json' });
        input.addEventListener('change', () => {
            const reader = new FileReader();
            reader.onload = ev => { try { this.absorbLibrary(JSON.parse(ev.target.result)); } catch (err) { UI.toast('That file could not be read', true); } };
            if (input.files[0]) reader.readAsText(input.files[0]);
        });
        input.click();
    },
    absorbLibrary(data) {
        if (!data || data.app !== 'album-rating-generator-library') { UI.toast('Not a library file', true); return; }
        Assets.absorb(data.assets);
        let n = 0;
        for (const name of Object.keys(data.profiles || {})) { App.profiles[name] = Model.normalizeProfile(data.profiles[name]); n++; }
        Object.assign(App.types, data.types || {});
        Object.assign(App.presets, data.presets || {});
        const genres = Object.assign({}, Genres.getCustom(), data.genres || {});
        Genres.setCustom(genres);
        App.saveProfiles(); Storage.write(KEYS.types, App.types); Storage.write(KEYS.presets, App.presets); Storage.write(KEYS.genres, genres);
        App.emit('profiles');
        if (App.prefs.tab === 'setup') Design.show('setup');
        UI.toast('Library imported (' + n + ' profile' + (n === 1 ? '' : 's') + ')');
    },

    async resetAll() {
        if (!await UI.confirm('Reset all app data?', 'Deletes the current review, saved profiles, page types, presets and custom genres from this browser. This cannot be undone.', 'Delete everything', true)) return;
        for (const k of ['doc', 'profiles', 'lastProfile', 'types', 'genres', 'prefs', 'presets']) localStorage.removeItem(KEYS[k]);
        location.reload();
    }
};

// ─── raw JSON editor (Monaco, loaded on first use) ────────────────────────────
const JsonEditor = {
    MONACO: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs',
    editor: null, loading: null, applying: false, open: false,

    load() {
        if (this.loading) return this.loading;
        this.loading = new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = this.MONACO + '/loader.js';
            s.onload = () => {
                window.require.config({ paths: { vs: this.MONACO } });
                window.require(['vs/editor/editor.main'], () => resolve(), reject);
            };
            s.onerror = () => reject(new Error('Could not load the editor'));
            document.head.appendChild(s);
        });
        return this.loading;
    },

    async toggle() {
        const host = document.getElementById('json-panel');
        this.open = !this.open;
        document.getElementById('columns').classList.toggle('json-open', this.open);
        if (!this.open) return;
        try { await this.load(); } catch (err) { UI.toast(err.message, true); this.open = false; document.getElementById('columns').classList.remove('json-open'); return; }
        if (!this.editor) {
            UI.clear(host);
            host.appendChild(UI.h('div.json-head', UI.h('span', 'Review JSON — edits apply as soon as the JSON is valid'), UI.h('span.spacer'),
                UI.h('button.btn.btn-small', { type: 'button', onclick: () => this.toggle() }, UI.icon('xmark'), 'Close')));
            const mount = UI.h('div.json-mount');
            host.appendChild(mount);
            this.editor = monaco.editor.create(mount, { value: '{}', language: 'json', theme: 'vs-dark', automaticLayout: true, minimap: { enabled: false }, fontSize: 12 });
            this.editor.onDidChangeModelContent(() => {
                if (this.applying) return;
                let data;
                try { data = JSON.parse(this.editor.getValue()); } catch (e) { return; }   // mid-typing
                this.applying = true;
                try { App.replaceDoc(Model.migrate(data, App.doc.colors)); } catch (e) { /* not a doc yet */ }
                this.applying = false;
            });
            App.on(() => { if (this.open && !this.applying) this.syncSoon(); });
        }
        this.sync();
    },

    syncSoon() { clearTimeout(this.timer); this.timer = setTimeout(() => this.sync(), 400); },
    sync() {
        if (!this.editor || this.editor.hasTextFocus()) return;
        this.applying = true;
        this.editor.setValue(JSON.stringify(App.doc, null, 2));
        this.applying = false;
    }
};
