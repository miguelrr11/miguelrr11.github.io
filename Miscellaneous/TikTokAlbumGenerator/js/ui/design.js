// Design column: a tabbed inspector — Page · Glitch · Colors · Export · AI · Setup.
// Each tab keeps the common controls visible and tucks the rest under
// "More options".
'use strict';

const pct = v => Math.round(v * 100) + '%';
const px = v => v + ' px';

const BLOCK_LABELS = {
    hero: 'Album art', art: 'Album art', title: 'Title', artist: 'Artist', year: 'Year', genre: 'Genre', funfact: 'Description',
    tracks: 'Tracks', legend: 'Legend', gradeBar: 'Grade bar', note: 'Playlist note'
};
const FONT_OPTIONS = Object.keys(Model.FONTS).map(k => [k, Model.FONTS[k]]);

// Field descriptors (see UI.fields). `adv` = lives under "More options".
const PAGE_FIELDS = {
    backdrop: [
        { k: 'backdrop.mode', label: 'Background', type: 'seg', options: [['art', 'Album art'], ['color', 'Colour']] },
        { k: 'backdrop.color', label: 'Colour', type: 'color', when: p => p.backdrop.mode === 'color' },
        { k: 'backdrop.dim', label: 'Darken', type: 'range', min: 0, max: 255, step: 5, def: 190, when: p => p.backdrop.mode === 'art' },
        { k: 'backdrop.blur', label: 'Blur', type: 'range', min: 0, max: 12, step: 1, def: 2, adv: true },
        { k: 'backdrop.zoom', label: 'Zoom', type: 'range', min: 1, max: 2.5, step: 0.05, def: 1, fmt: v => v.toFixed(2) + '×', adv: true },
        { k: 'backdrop.gray', label: 'Black & white', type: 'toggle', adv: true },
        { k: 'backdrop.erode', label: 'Soften details', type: 'toggle', adv: true }
    ],
    hero: [
        { k: 'hero.size', label: 'Size', type: 'range', min: 0.3, max: 1, step: 0.01, def: 0.65, fmt: pct },
        { k: 'hero.posY', label: 'Vertical position', type: 'range', min: 0.2, max: 0.8, step: 0.01, def: 0.5, fmt: pct },
        { k: 'hero.glitch', label: 'Glitch stretch', type: 'toggle' },
        { k: 'hero.radius', label: 'Rounded corners', type: 'range', min: 0, max: 200, step: 2, def: 0, adv: true },
        { k: 'hero.shadow', label: 'Shadow size', type: 'range', min: 0, max: 120, step: 2, def: 40, adv: true },
        { k: 'hero.boost', label: 'Shadow strength', type: 'range', min: 1, max: 5, step: 1, def: 3, adv: true }
    ],
    art: [
        { k: 'art.scale', label: 'Size', type: 'range', min: 0.5, max: 2, step: 0.05, def: 1, fmt: v => v.toFixed(2) + '×', after: p => Model.applyAutoAlign(p) },
        { k: 'header.autoAlign', label: 'Keep text aligned to the art', type: 'toggle', hint: 'Artist, year, genre and description follow the right edge of the art', after: p => Model.applyAutoAlign(p) },
        { k: 'art.radius', label: 'Rounded corners', type: 'range', min: 0, max: 200, step: 2, def: 0, adv: true },
        { k: 'art.shadow', label: 'Shadow size', type: 'range', min: 0, max: 120, step: 2, def: 50, adv: true }
    ],
    title: [
        { k: 'title.glitch', label: 'Glitch effect', type: 'toggle' },
        { k: 'title.maxSize', label: 'Largest size', type: 'range', min: 40, max: 160, step: 2, def: 100, fmt: px },
        { k: 'header.shadow', label: 'Text shadow', type: 'range', min: 0, max: 60, step: 2, def: 20, adv: true, when: p => p.base === 'sheet' }
    ],
    tracks: [
        { k: 'tracks.textSize', label: 'Text size', type: 'range', min: 22, max: 60, step: 2, def: 36 },
        { k: 'tracks.spacing', label: 'Row spacing', type: 'range', min: -45, max: 40, step: 1, def: -31 },
        { k: 'tracks.rectHeight', label: 'Pill height', type: 'range', min: 20, max: 80, step: 2, def: 28 },
        { k: 'tracks.twoColumns', label: 'Two columns', type: 'toggle' },
        { k: 'tracks.showNumbers', label: 'Track numbers', type: 'toggle' },
        { k: 'tracks.source', label: 'List', type: 'seg', options: [['album', 'Album'], ['own', 'Own']], adv: true, hint: 'A page can show its own, different track list', after: p => { if (p.tracks.source === 'own' && !p.tracks.list.length) p.tracks.list = [Model.emptyTrack()]; }, emit: 'tracks-structure' },
        { k: 'tracks.from', label: 'From track #', type: 'number', min: 0, adv: true, placeholder: 'first', hint: 'Show only part of the list (0 = from the start)' },
        { k: 'tracks.to', label: 'To track #', type: 'number', min: 0, adv: true, placeholder: 'last', hint: '0 = to the end' },
        { k: 'tracks.split', label: 'Second column starts after', type: 'number', min: 0, adv: true, placeholder: 'auto', when: p => p.tracks.twoColumns, hint: '0 = balance both columns automatically' },
        { k: 'tracks.glow', label: 'Glow on GOAT / 10', type: 'toggle', adv: true },
        { k: 'tracks.font', label: 'Title font', type: 'select', options: FONT_OPTIONS, adv: true },
        { k: 'tracks.pillScale', label: 'Pill width', type: 'range', min: 0.4, max: 1.4, step: 0.05, def: 1, fmt: pct, adv: true }
    ],
    legend: [
        { k: 'legend.minGrades', label: 'Always show', type: 'range', min: 1, max: 8, step: 1, def: 5, fmt: v => v + ' grades' },
        { k: 'legend.labels', label: 'Labels', type: 'text', adv: true, hint: 'Comma separated, best grade first' }
    ],
    gradeBar: [
        { k: 'gradeBar.text', label: 'Custom text', type: 'text', placeholder: 'grade name' },
        { k: 'gradeBar.height', label: 'Height', type: 'range', min: 60, max: 220, step: 1, def: 115, adv: true },
        { k: 'gradeBar.fontSize', label: 'Text size', type: 'range', min: 40, max: 140, step: 1, def: 85, adv: true },
        { k: 'gradeBar.radius', label: 'Rounded corners', type: 'range', min: 0, max: 60, step: 1, def: 20, adv: true },
        { k: 'gradeBar.glow', label: 'Text glow', type: 'range', min: 0, max: 80, step: 1, def: 30, adv: true }
    ],
    note: [
        { k: 'note.mode', label: 'Show', type: 'seg', options: [['auto', 'Auto'], ['on', 'Always'], ['off', 'Off']], hint: 'Auto: only when a song is graded GOAT or 10', emit: 'tracks-structure' },
        { k: 'note.style', label: 'Style', type: 'seg', options: [['bar', 'Bar'], ['pill', 'Pill'], ['text', 'Text']] },
        { k: 'note.tone', label: 'Colour', type: 'select', options: [['grade', 'Album grade (darker)'], ['dark', 'Dark'], ['spotify', 'Spotify green'], ['custom', 'Custom']], when: p => p.note.style !== 'text' },
        { k: 'note.color', label: 'Custom colour', type: 'color', when: p => p.note.tone === 'custom' && p.note.style !== 'text' },
        { k: 'note.icon', label: 'Spotify logo', type: 'seg', options: [['spotify', 'On'], ['none', 'Off']] },
        { k: 'note.text', label: 'Text', type: 'text', adv: true, hint: '{n} = number of songs, {s} = plural "s"', emit: 'tracks-structure' },
        { k: 'note.height', label: 'Height', type: 'range', min: 36, max: 100, step: 1, def: 54, adv: true },
        { k: 'note.fontSize', label: 'Text size', type: 'range', min: 14, max: 44, step: 1, def: 25, adv: true }
    ]
};

const EXPORT_FIELDS = [
    { k: 'format', label: 'Format', type: 'seg', options: [['jpg', 'JPG'], ['png', 'PNG'], ['webp', 'WebP']] },
    { k: 'scope', label: 'Pages', type: 'seg', options: [['all', 'All'], ['current', 'Current']] },
    { k: 'scale', label: 'Resolution', type: 'select', options: [[1, '1080 px wide'], [2, '2160 px wide (sharp)'], [3, '3240 px wide']], after: () => applyExportScale() },
    { k: 'quality', label: 'Quality', type: 'range', min: 0.5, max: 1, step: 0.01, def: 0.92, fmt: pct, when: e => e.format !== 'png', adv: true },
    { k: 'transparent', label: 'Transparent background', type: 'toggle', hint: 'Skips the backdrop — use PNG or WebP', adv: true },
    { k: 'filename', label: 'File name', type: 'text', hint: '{artist} {album} {page} {year} {number} {index}', adv: true }
];

const Design = {
    TABS: [['page', 'Page', 'file-lines'], ['glitch', 'Glitch', 'bolt'], ['colors', 'Colors', 'palette'], ['export', 'Export', 'file-export'], ['ai', 'AI', 'wand-magic-sparkles'], ['setup', 'Setup', 'gear']],
    el: null, body: null, syncers: [],

    init() {
        this.el = document.getElementById('col-design');
        this.tabBar = UI.h('div.tabs', { role: 'tablist' });
        this.body = UI.h('div.tab-body');
        this.aiHost = UI.h('div.tab-pane-ai');
        UI.append(this.el, [this.tabBar, this.body, this.aiHost]);
        // the AI panel is built once (it keeps its own state) and only shown / hidden
        createIASection(this.aiHost);
        const aiContent = this.aiHost.querySelector('.color-content');
        if (aiContent) aiContent.classList.remove('collapsed');
        const aiToggle = this.aiHost.querySelector('.color-toggle');
        if (aiToggle) aiToggle.textContent = '▼';

        App.on(what => {
            const tab = App.prefs.tab;
            if (what === 'doc' || what === 'page') this.show(tab);
            else if (what === 'selection' && tab === 'page') { /* page tab is selection independent */ }
            else if ((what === 'move' || what === 'pageopt') && tab === 'page') this.syncAll();
            else if (tab === 'export' && this.updatePreflight) this.updatePreflight();
        });
        this.show(App.prefs.tab || 'page');
    },

    show(tab) {
        if (!this.TABS.some(t => t[0] === tab)) tab = 'page';
        App.prefs.tab = tab; App.savePrefs();
        UI.clear(this.tabBar);
        for (const [id, label, icon] of this.TABS) {
            this.tabBar.appendChild(UI.h('button.tab', { type: 'button', class: id === tab ? 'active' : '', title: label, role: 'tab', onclick: () => this.show(id) }, UI.icon(icon), UI.h('span', label)));
        }
        UI.clear(this.body);
        this.syncers = [];
        this.updatePreflight = null;
        this.aiHost.style.display = tab === 'ai' ? '' : 'none';
        this.body.style.display = tab === 'ai' ? 'none' : '';
        if (tab === 'page') this.buildPage();
        else if (tab === 'glitch') GlitchPanel.build(this.body);
        else if (tab === 'colors') this.buildColors();
        else if (tab === 'export') this.buildExport();
        else if (tab === 'setup') Setup.build(this.body);
    },

    syncAll() { for (const s of this.syncers) s.sync(); },

    // Controls bound to the current page.
    pageFields(container, fields) {
        const s = UI.fields(container, fields, () => App.page(), (f, mode) => {
            App.changed({ render: mode, what: f.emit || 'pageopt' });
            this.syncAll();
        });
        this.syncers.push(s);
        return s;
    },

    // ── Page tab ──
    buildPage() {
        const page = App.page(), body = this.body, isCover = page.base === 'cover';

        const name = UI.text({ label: 'Name', value: page.name, onInput: v => { page.name = v || 'Page'; App.changed({ what: 'pageopt' }); Stage.buildTabs(); } });
        const ratio = UI.select({ label: 'Aspect ratio', options: Object.keys(Model.ASPECT_RATIOS).map(r => [r, r + '  ·  1080 × ' + Model.ASPECT_RATIOS[r].height]), value: page.aspectRatio,
            onChange: v => { page.aspectRatio = v; App.changed({ what: 'pageopt' }); Stage.layout(); Stage.buildTabs(); } });
        const exp = UI.toggle({ label: 'Include in export', value: page.export !== false, onChange: v => { page.export = v; App.changed({ what: 'pageopt' }); Stage.buildTabs(); } });
        const sec = UI.section('Page', { key: 'pg:page', open: true, extra: UI.h('span.section-extra.badge', Model.typeName(page.type, App.types)) });
        const more = UI.more('Page type');
        UI.append(more.body, UI.h('div.btn-row',
            UI.h('button.btn.btn-small', { type: 'button', onclick: () => Actions.savePageAsType(page.id) }, UI.icon('bookmark'), 'Save as type'),
            UI.h('button.btn.btn-small', { type: 'button', onclick: () => Actions.resetPageToType(page.id) }, UI.icon('rotate-left'), 'Reset to type')));
        UI.append(sec.body, [name.el, ratio.el, exp.el, more.el]);
        body.appendChild(sec.el);

        // blocks
        const blocks = UI.section('Blocks', { key: 'pg:blocks', open: true });
        const keys = Model.BLOCKS[page.base];
        const chips = UI.chips({ options: keys.map(k => [k, BLOCK_LABELS[k]]), value: keys.filter(k => page.show[k]),
            onChange: (value, key) => {
                page.show[key] = value.includes(key);
                if (key === 'tracks' || key === 'note') App.changed({ what: 'page' }); else { App.changed({ what: 'pageopt' }); this.show('page'); }
            } });
        UI.append(blocks.body, [chips.el, UI.h('p.field-hint', isCover ? 'Built-in parts of the cover layout.' : 'Any block can be switched on for any page — e.g. the track list on a second page.')]);
        body.appendChild(blocks.el);

        const group = (title, key, fields, open) => {
            const s = UI.section(title, { key: 'pg:' + key, open: !!open });
            this.pageFields(s.body, fields);
            body.appendChild(s.el);
            return s;
        };

        group('Backdrop', 'backdrop', PAGE_FIELDS.backdrop);
        if (isCover) {
            if (page.show.hero) group('Album art', 'hero', PAGE_FIELDS.hero, true);
            if (page.show.title) group('Title', 'title', PAGE_FIELDS.title);
        } else {
            if (page.show.art) group('Album art', 'art', PAGE_FIELDS.art);
            if (page.show.title) group('Title', 'title', PAGE_FIELDS.title);
            if (page.show.tracks) group('Tracks', 'tracks', PAGE_FIELDS.tracks, true);
            if (page.show.legend) group('Legend', 'legend', PAGE_FIELDS.legend);
            if (page.show.gradeBar) group('Grade bar', 'gradeBar', PAGE_FIELDS.gradeBar);
            if (page.show.note) {
                const s = group('Playlist note', 'note', PAGE_FIELDS.note, true);
                const grades = UI.chips({ options: [['GOAT', 'GOAT'], ['PEAK', '10'], ['EXCEPTIONAL', '9'], ['STRONG', '8']], value: page.note.grades,
                    onChange: v => { page.note.grades = v; App.changed({ what: 'tracks-structure' }); } });
                s.body.querySelector('.more-body').appendChild(UI.h('div.row', UI.h('span.row-label', 'Counts songs graded'), grades.el));
            }
        }

        // text flow
        const flow = UI.section('Text flow', { key: 'pg:flow' });
        const stackOn = UI.toggle({ label: 'Auto-stack textboxes', value: !!page.stack, hint: 'Textboxes keep their vertical gaps: when one grows, everything below moves down',
            onChange: v => {
                if (v) { const heights = {}; for (const t of page.texts) heights[t.id] = t.hidden ? 0 : measureTextElement(t); Model.captureStack(page, heights); if (!page.stack) UI.toast('Needs at least two textboxes', true); }
                else page.stack = null;
                App.changed({ what: 'pageopt' }); this.show('page');
            } });
        UI.append(flow.body, [stackOn.el, UI.h('p.field-hint', page.stack ? page.stack.ids.length + ' textboxes are chained top to bottom. Drag one to change its gap.' : 'Off: every textbox stays exactly where you put it.')]);
        body.appendChild(flow.el);
    },

    // ── Colors tab ──
    buildColors() {
        const colors = App.doc.colors, body = this.body;
        const changed = mode => App.changed({ render: mode, what: 'colors' });
        const sec = UI.section('Grade colours', { key: 'col:grades', open: true });
        const grid = UI.h('div.color-grid');
        for (const g of Model.COLOR_KEYS) {
            const c = UI.color({ value: colors.map[g], onInput: v => { colors.map[g] = v; changed('interactive'); } });
            const idx = Model.LEGEND_GRADES.indexOf(g);
            grid.appendChild(UI.h('label.color-cell', c.el, UI.h('span', g === 'None' ? 'No grade' : g.charAt(0) + g.slice(1).toLowerCase()), idx > 0 ? UI.h('small', Model.LEGEND_LABELS[idx]) : null));
        }
        sec.body.appendChild(grid);
        body.appendChild(sec.el);

        const goat = UI.section('GOAT gradient', { key: 'col:goat', open: true });
        const strip = UI.h('div.goat-strip');
        colors.goat.forEach((col, i) => strip.appendChild(UI.color({ value: col, onInput: v => { colors.goat[i] = v; changed('interactive'); } }).el));
        UI.append(goat.body, [strip, UI.h('p.field-hint', 'Used by GOAT pills, the legend and a GOAT album grade.')]);
        body.appendChild(goat.el);

        body.appendChild(UI.h('div.btn-row', UI.h('button.btn', { type: 'button', onclick: () => {
            colors.map = Model.clone(Model.DEFAULT_COLORS); colors.goat = Model.DEFAULT_GOAT_GRADIENT.slice();
            changed(); this.show('colors');
        } }, UI.icon('rotate-left'), 'Reset colours')));
    },

    // ── Export tab ──
    buildExport() {
        const body = this.body;
        const sec = UI.section('Images', { key: 'ex:images', open: true });
        const s = UI.fields(sec.body, EXPORT_FIELDS, () => App.doc.export, () => { App.changed({ what: 'export' }); s.sync(); });
        this.syncers.push(s);
        body.appendChild(sec.el);

        const warn = UI.h('div.preflight');
        this.updatePreflight = () => {
            const list = Model.preflight(App.doc, g => Genres.has(g));
            UI.clear(warn);
            warn.classList.toggle('ok', !list.length);
            if (!list.length) UI.append(warn, [UI.icon('circle-check'), ' Ready to export']);
            else UI.append(warn, [UI.h('div.preflight-title', UI.icon('triangle-exclamation'), ' Check before posting'), UI.h('ul', list.map(w => UI.h('li', w)))]);
        };
        this.updatePreflight();
        body.appendChild(warn);

        body.appendChild(UI.h('div.btn-col',
            UI.h('button.btn.btn-accent', { type: 'button', onclick: () => Exporter.images() }, UI.icon('download'), 'Download images'),
            UI.h('button.btn', { type: 'button', onclick: () => Exporter.copyPage() }, UI.icon('copy'), 'Copy current page'),
            UI.h('div.btn-row',
                UI.h('button.btn', { type: 'button', title: 'Save the whole review as a file you can drop back in later', onclick: () => Exporter.json() }, UI.icon('file-code'), 'Save JSON'),
                UI.h('button.btn', { type: 'button', onclick: () => Exporter.openJson() }, UI.icon('folder-open'), 'Open JSON')),
            UI.h('button.btn', { type: 'button', id: 'record-video-btn', title: 'Records the intro animation of the current page (needs a page with album art, title and tracks)', onclick: () => Anim.record() }, UI.icon('video'), 'Record animation')));
    }
};
