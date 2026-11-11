// Tracks column: the track list editor (album list, or the page's own list)
// and the playlist-note controls.
'use strict';

const Tracks = {
    el: null, listEl: null, rows: [], dragIndex: null,

    init() {
        this.el = document.getElementById('col-tracks');
        App.on(what => {
            if (what === 'doc' || what === 'page' || what === 'tracks-structure') this.build();
            else if (what === 'tracks' || what === 'change' || what === 'album') { this.summary(); this.noteStatus(); }
        });
        this.build();
    },

    list() { return App.trackList(); },
    changed(structure) { App.changed({ what: structure ? 'tracks-structure' : 'tracks' }); },

    build() {
        const page = App.page(), own = page.tracks.source === 'own';
        UI.clear(this.el);
        this.summaryEl = UI.h('span.track-summary');
        this.el.appendChild(UI.h('div.col-title', UI.h('span', 'Tracks'), this.summaryEl, UI.h('span.spacer'),
            UI.h('button.icon-btn.small', { type: 'button', title: 'Track list options', onclick: e => this.menu(e.currentTarget) }, UI.icon('ellipsis'))));

        if (own) this.el.appendChild(UI.h('div.banner', UI.icon('layer-group'), UI.h('span', 'Own list — only "' + page.name + '" shows these tracks.'),
            UI.h('button.link', { type: 'button', onclick: () => { page.tracks.source = 'album'; this.changed(true); } }, 'Use album list')));

        this.listEl = UI.h('div.track-list');
        this.el.appendChild(this.listEl);
        this.rows = [];
        this.list().forEach((t, i) => this.listEl.appendChild(this.row(t, i)));

        this.el.appendChild(UI.h('div.btn-row',
            UI.h('button.btn', { type: 'button', onclick: () => this.add() }, UI.icon('plus'), 'Add track'),
            UI.h('button.btn', { type: 'button', title: 'One track per line, score at the end — e.g. "Nude 10"', onclick: () => this.pasteFromClipboard() }, UI.icon('paste'), 'Paste list')));
        this.buildNote();
        this.summary();
    },

    row(track, index) {
        const list = this.list();
        const num = UI.h('span.track-num', { title: 'Double-click to set a custom number' }, track.customNumber || (index + 1) + '.');
        const title = UI.h('input.track-title', { type: 'text', placeholder: 'Track title', value: track.title });
        const grade = UI.h('select.track-grade', Model.TRACK_GRADES.map(g => UI.h('option', { value: g }, g === 'None' ? '—' : g)));
        grade.value = track.grade;
        const label = UI.h('input.track-mini', { type: 'text', placeholder: 'Pill label', value: track.customText, title: 'Small text inside the grade pill (e.g. 8.5)' });
        const note = UI.h('input.track-mini.grow', { type: 'text', placeholder: 'Note under the track…', value: track.customTextLarge });
        const inter = UI.h('button.track-int', { type: 'button', class: track.interlude ? 'active' : '', title: 'Interlude: grey pill, grade shown as a dot' }, 'INT');
        const marks = UI.h('span.track-marks');
        const handle = UI.h('span.track-handle', { draggable: true, title: 'Drag to reorder' }, UI.icon('grip-vertical'));
        const row = UI.h('div.track-row', handle, num, title, marks, grade,
            UI.h('div.track-extra', inter, label, note,
                UI.h('button.icon-btn.small.ghost.danger', { type: 'button', title: 'Remove track', onclick: () => this.remove(list.indexOf(track)) }, UI.icon('xmark'))));

        const paint = () => {
            const col = track.interlude ? App.doc.colors.map.INTERLUDE : (App.doc.colors.map[track.grade] || '#5c5c5c');
            grade.style.background = col; grade.style.color = getContrastYIQ(col);
            UI.clear(marks);
            if (track.interlude) marks.appendChild(UI.h('span.mark', 'INT'));
            if (track.customText) marks.appendChild(UI.h('span.mark', track.customText));
            if (track.customTextLarge) marks.appendChild(UI.h('span.mark', { title: track.customTextLarge }, UI.icon('comment')));
        };
        paint();

        title.addEventListener('input', () => { track.title = title.value; this.changed(); });
        title.addEventListener('keydown', e => this.navigate(e, list.indexOf(track)));
        title.addEventListener('paste', e => this.onPaste(e, list.indexOf(track)));
        grade.addEventListener('change', () => { track.grade = grade.value; paint(); this.changed(); });
        label.addEventListener('input', () => { track.customText = label.value; paint(); this.changed(); });
        note.addEventListener('input', () => { track.customTextLarge = note.value; paint(); this.changed(); });
        inter.addEventListener('click', () => { track.interlude = !track.interlude; inter.classList.toggle('active', track.interlude); paint(); this.changed(); });
        num.addEventListener('dblclick', async () => {
            const v = await UI.prompt('Track number', track.customNumber || '', 'Leave empty for automatic numbering');
            track.customNumber = v || null;
            this.changed(true);
        });
        row.addEventListener('focusin', () => this.activate(row));
        row.addEventListener('pointerdown', () => this.activate(row));

        handle.addEventListener('dragstart', e => { this.dragIndex = list.indexOf(track); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/x-track', '1'); row.classList.add('dragging'); });
        handle.addEventListener('dragend', () => { this.dragIndex = null; this.rows.forEach(r => r.classList.remove('dragging', 'drag-over')); });
        row.addEventListener('dragover', e => { if (this.dragIndex === null) return; e.preventDefault(); row.classList.toggle('drag-over', list.indexOf(track) !== this.dragIndex); });
        row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
        row.addEventListener('drop', e => {
            if (this.dragIndex === null) return;
            e.preventDefault();
            const to = list.indexOf(track), from = this.dragIndex;
            this.dragIndex = null;
            if (to === from || to === -1) return;
            const [moved] = list.splice(from, 1);
            list.splice(to, 0, moved);
            this.changed(true);
        });

        row.titleInput = title;
        this.rows.push(row);
        return row;
    },

    activate(row) { for (const r of this.rows) r.classList.toggle('active', r === row); },

    focus(index) {
        const row = this.rows[Math.max(0, Math.min(this.rows.length - 1, index))];
        if (row) { row.titleInput.focus(); row.titleInput.select(); }
    },

    navigate(e, index) {
        if (e.key === 'Enter' || e.key === 'ArrowDown') {
            e.preventDefault();
            if (index < this.rows.length - 1) this.focus(index + 1);
            else if (e.key === 'Enter') { this.add(); }
        } else if (e.key === 'ArrowUp') { e.preventDefault(); if (index > 0) this.focus(index - 1); }
        else if (e.key === 'Backspace' && e.target.value === '' && this.rows.length > 1) { e.preventDefault(); this.remove(index); this.focus(Math.max(0, index - 1)); }
    },

    add() {
        this.list().push(Model.emptyTrack());
        this.changed(true);
        this.focus(this.rows.length - 1);
    },

    remove(index) {
        const list = this.list();
        if (index < 0) return;
        if (list.length <= 1) { list[0] = Model.emptyTrack(); } else list.splice(index, 1);
        this.changed(true);
    },

    // Replace the list with parsed text ("Title 8.5" per line).
    setFromText(text, insertAt) {
        const parsed = Model.parseTracksText(text);
        if (!parsed.length) { UI.toast('No tracks found in the pasted text', true); return; }
        const list = this.list();
        const blank = list.every(t => !t.title.trim());
        if (insertAt == null || blank) list.splice(0, list.length, ...parsed);
        else { const replace = !list[insertAt].title.trim() ? 1 : 0; list.splice(insertAt + (replace ? 0 : 1), replace, ...parsed); }
        this.changed(true);
        UI.toast(parsed.length + ' track' + (parsed.length === 1 ? '' : 's') + ' added');
    },

    onPaste(e, index) {
        const text = (e.clipboardData || window.clipboardData).getData('text');
        if (!/\r?\n/.test(text.trim())) return;       // single line: a normal paste into the field
        e.preventDefault();
        this.setFromText(text, index);
    },

    async pasteFromClipboard() {
        let text = null;
        try { text = await navigator.clipboard.readText(); } catch (err) { /* blocked: fall back to a dialog */ }
        if (text == null || !text.trim()) {
            const area = UI.h('textarea.input', { rows: 12, placeholder: 'One track per line, score at the end:\n\n15 Step 9\nBodysnatchers 8.5\nNude 10\nFaust Arp' });
            text = await UI.dialog('Paste track list', area, [{ label: 'Cancel', value: () => null }, { label: 'Use these tracks', primary: true, value: () => area.value }]);
            if (!text) return;
        }
        this.setFromText(text, null);
    },

    menu(anchor) {
        const page = App.page(), list = this.list();
        UI.menu(anchor, [
            { label: 'Paste list (replace all)', icon: 'paste', run: () => this.pasteFromClipboard() },
            { label: 'Copy list as text', icon: 'copy', run: () => {
                const text = Model.usableTracks(list).map(t => t.title + (t.customText ? ' ' + t.customText : '')).join('\n');
                navigator.clipboard.writeText(text).then(() => UI.toast('Track list copied'), () => UI.toast('Could not copy', true));
            } },
            { label: 'Clear all tracks', icon: 'eraser', danger: true, run: () => { list.splice(0, list.length, Model.emptyTrack()); this.changed(true); } },
            page.base === 'sheet' ? '-' : null,
            page.base === 'sheet' ? { label: 'Own track list for this page', hint: 'different tracks than the album list', checked: page.tracks.source === 'own', icon: 'layer-group', run: () => {
                page.tracks.source = page.tracks.source === 'own' ? 'album' : 'own';
                if (page.tracks.source === 'own' && !page.tracks.list.length) page.tracks.list = [Model.emptyTrack()];
                if (page.tracks.source === 'own') page.show.tracks = true;
                this.changed(true);
            } } : null,
            page.tracks.source === 'own' ? { label: 'Copy album list into this page', icon: 'clone', run: () => { page.tracks.list = Model.clone(App.doc.tracks); this.changed(true); } } : null
        ], { alignRight: true });
    },

    summary() {
        if (!this.summaryEl) return;
        const counts = Model.gradeSummary(this.list());
        UI.clear(this.summaryEl);
        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        if (!total) return;
        this.summaryEl.appendChild(UI.h('span.count', String(total)));
        for (const g of Model.LEGEND_GRADES.concat(['INTERLUDE'])) {
            if (!counts[g]) continue;
            this.summaryEl.appendChild(UI.h('span.dot', { title: counts[g] + ' × ' + g, style: { background: App.doc.colors.map[g] } }, String(counts[g])));
        }
    },

    // ── playlist note ──
    notePage() {
        const cur = App.page();
        if (cur.base === 'sheet' && cur.show.note) return cur;
        return App.doc.pages.find(p => p.base === 'sheet' && p.show.note) || null;
    },

    buildNote() {
        const page = this.notePage();
        if (!page) return;
        const n = page.note;
        const mode = UI.segmented({ options: [['auto', 'Auto'], ['on', 'Always'], ['off', 'Off']], value: n.mode, onChange: v => { n.mode = v; App.changed({ what: 'tracks' }); } });
        const text = UI.text({ value: n.text, placeholder: Model.NOTE_TEXT, onInput: v => { n.text = v; App.changed({ what: 'tracks' }); } });
        text.input.title = '{n} = number of songs · {s} = plural "s"';
        this.noteStatusEl = UI.h('div.note-status');
        this.el.appendChild(UI.h('div.card.note-card',
            UI.h('div.card-head', { title: 'Shown on the "' + page.name + '" page, just above the album grade' }, UI.h('span.spotify-dot'), UI.h('span.card-title', 'Playlist note'), UI.h('span.spacer'), mode.el),
            text.el, this.noteStatusEl));
        this.noteStatus();
    },

    noteStatus() {
        const page = this.notePage();
        if (!page || !this.noteStatusEl || !this.noteStatusEl.isConnected) return;
        const all = Model.resolveTracks(App.doc, page).all;
        const count = Model.countGrades(all, page.note.grades);
        const info = Model.noteFor(page, all);
        const names = page.note.grades.map(g => (g === 'PEAK' ? '10' : g)).join(' / ');
        UI.clear(this.noteStatusEl);
        this.noteStatusEl.classList.toggle('off', !info);
        if (info) UI.append(this.noteStatusEl, [UI.icon('circle-check'), ' Shown: “' + info.text + '”']);
        else if (page.note.mode === 'off') UI.append(this.noteStatusEl, [UI.icon('circle-minus'), ' Turned off']);
        else UI.append(this.noteStatusEl, [UI.icon('circle-minus'), ' Hidden — no ' + names + ' songs (' + count + ')']);
    }
};
