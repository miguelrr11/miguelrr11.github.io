// Preview column: page tabs, the scaled canvas, the selection overlay and all
// pointer interaction with the canvas (select, rubber band, drag).
'use strict';

const MOBILE_QUERY = '(max-width: 768px)';
const MOBILE_TABBAR_H = 60;      // keep in sync with --mtabbar-h in style.css
function isMobile() { return window.matchMedia(MOBILE_QUERY).matches; }

const Stage = {
    scale: 0.5, viewH: Model.HEIGHT,
    el: {}, drag: null, marquee: null, hoverId: null,
    DRAG_THRESHOLD: 3,

    init() {
        this.el.preview = document.getElementById('preview');
        this.el.tabs = document.getElementById('page-tabs');
        this.el.clip = document.getElementById('canvas-container');
        this.el.scaler = document.getElementById('canvas-scaler');
        this.el.overlay = UI.h('div#overlay');
        this.el.marquee = UI.h('div#selection-marquee');
        this.el.guide = UI.h('div#export-guide');
        this.el.scaler.append(this.el.overlay, this.el.guide, this.el.marquee);

        const c = this.el.clip;
        c.addEventListener('pointerdown', e => this.onDown(e));
        c.addEventListener('pointermove', e => this.onMove(e));
        c.addEventListener('pointerup', e => this.onUp(e));
        c.addEventListener('pointercancel', e => this.onUp(e));
        c.addEventListener('pointerleave', () => this.setHover(null));
        c.addEventListener('dblclick', e => this.onDouble(e));

        window.addEventListener('resize', () => this.layout());
        window.matchMedia(MOBILE_QUERY).addEventListener('change', () => this.layout());
        App.on(what => {
            if (what === 'doc' || what === 'page') { this.buildTabs(); this.layout(); }
            if (what === 'selection' || what === 'doc' || what === 'page') this.drawOverlay();
        });
        Render.onAfter = () => this.drawOverlay();
        this.buildTabs();
        this.layout();
    },

    // Fit the visible part of the canvas (the export area, or the whole 9:16
    // canvas in "full canvas" view) into the preview column.
    layout() {
        if (!App.doc) return;
        const page = App.page();
        this.viewH = App.prefs.fullCanvas ? Model.HEIGHT : Model.exportHeight(page);
        let availW, availH;
        if (isMobile()) {
            availW = window.innerWidth - 16;
            availH = window.innerHeight - MOBILE_TABBAR_H - 24 - 52;
        } else {
            availW = Math.max(260, Math.min(window.innerWidth * 0.36, window.innerWidth - 760));
            availH = window.innerHeight - 24 - this.el.tabs.offsetHeight - 14;
        }
        this.scale = Math.max(0.1, Math.min(1, availW / Model.WIDTH, availH / this.viewH));
        const s = this.scale;
        document.documentElement.style.setProperty('--canvas-scale', s);
        this.el.clip.style.width = Math.round(Model.WIDTH * s) + 'px';
        this.el.clip.style.height = Math.round(this.viewH * s) + 'px';
        this.el.scaler.style.transform = 'scale(' + s + ')';
        this.el.preview.style.width = isMobile() ? '' : Math.round(Model.WIDTH * s) + 'px';
        const exportH = Model.exportHeight(page);
        this.el.guide.style.display = App.prefs.fullCanvas && exportH < Model.HEIGHT ? 'block' : 'none';
        this.el.guide.style.top = exportH + 'px';
        this.el.guide.style.height = (Model.HEIGHT - exportH) + 'px';
    },

    // ── page tabs ──
    buildTabs() {
        const bar = UI.clear(this.el.tabs);
        const doc = App.doc;
        doc.pages.forEach((p, index) => {
            const tab = UI.h('div.page-tab', { class: (p.id === doc.currentPageId ? 'active ' : '') + (p.export === false ? 'excluded' : ''), draggable: true, title: Model.typeName(p.type, App.types) + ' page · ' + p.aspectRatio + (p.export === false ? ' · not exported' : '') },
                UI.h('span.page-tab-label', p.name));
            tab.addEventListener('click', () => Actions.switchPage(p.id));
            tab.addEventListener('dblclick', e => { e.stopPropagation(); this.renameTab(p, tab); });
            tab.addEventListener('contextmenu', e => { e.preventDefault(); this.pageMenu(p, tab); });
            tab.addEventListener('dragstart', e => { e.dataTransfer.setData('text/x-page', p.id); e.dataTransfer.effectAllowed = 'move'; });
            tab.addEventListener('dragover', e => { if (e.dataTransfer.types.includes('text/x-page')) { e.preventDefault(); tab.classList.add('drop'); } });
            tab.addEventListener('dragleave', () => tab.classList.remove('drop'));
            tab.addEventListener('drop', e => { e.preventDefault(); tab.classList.remove('drop'); const id = e.dataTransfer.getData('text/x-page'); if (id) Actions.movePage(id, index); });
            if (p.id === doc.currentPageId) {
                tab.appendChild(UI.h('button.page-tab-more', { type: 'button', title: 'Page options', onclick: e => { e.stopPropagation(); this.pageMenu(p, tab); } }, UI.icon('ellipsis')));
            }
            bar.appendChild(tab);
        });
        bar.appendChild(UI.h('button.page-tab.page-tab-add', { type: 'button', title: 'Add a page', onclick: e => this.addMenu(e.currentTarget) }, UI.icon('plus')));
        bar.appendChild(UI.h('span.tabs-spacer'));
        bar.appendChild(UI.h('button.icon-btn.small', { type: 'button', class: App.prefs.fullCanvas ? 'active' : '', title: 'Show the whole 9:16 canvas (area outside the export is dimmed)',
            onclick: () => { App.prefs.fullCanvas = !App.prefs.fullCanvas; App.savePrefs(); this.buildTabs(); this.layout(); } }, UI.icon('expand')));
    },

    addMenu(anchor) {
        const items = [{ title: 'Add a page' }];
        for (const id of Object.keys(Model.BUILTIN_TYPES)) {
            const t = Model.BUILTIN_TYPES[id];
            items.push({ label: t.name, hint: t.hint, icon: { cover: 'compact-disc', context: 'book-open', ratings: 'list-ol', tracks: 'bars', slide: 'align-left', blank: 'square' }[id], run: () => Actions.addPage(id) });
        }
        const custom = Object.keys(App.types);
        if (custom.length) {
            items.push('-', { title: 'Your page types' });
            for (const id of custom) items.push({ label: App.types[id].name, icon: 'bookmark', run: () => Actions.addPage(id) });
        }
        UI.menu(anchor, items);
    },

    pageMenu(p, anchor) {
        UI.menu(anchor, [
            { title: Model.typeName(p.type, App.types) + ' page' },
            { label: 'Rename', icon: 'pen', run: () => { Actions.switchPage(p.id); const t = [...this.el.tabs.querySelectorAll('.page-tab')][App.doc.pages.indexOf(p)]; if (t) this.renameTab(p, t); } },
            { label: 'Duplicate', icon: 'clone', run: () => Actions.duplicatePage(p.id) },
            { label: 'Include in export', checked: p.export !== false, icon: 'file-export', run: () => { p.export = p.export === false; App.changed({ what: 'page' }); } },
            '-',
            { label: 'Save as page type…', icon: 'bookmark', run: () => Actions.savePageAsType(p.id) },
            { label: 'Reset to page type', icon: 'rotate-left', run: () => Actions.resetPageToType(p.id) },
            '-',
            { label: 'Delete page', icon: 'trash', danger: true, disabled: App.doc.pages.length <= 1, run: () => Actions.deletePage(p.id) }
        ]);
    },

    renameTab(page, tab) {
        const label = tab.querySelector('.page-tab-label');
        if (!label) return;
        const input = UI.h('input.page-tab-rename', { type: 'text', value: page.name });
        label.replaceWith(input);
        input.focus(); input.select();
        let done = false;
        const finish = commit => {
            if (done) return; done = true;
            const v = input.value.trim();
            if (commit && v && v !== page.name) { page.name = v; App.changed({ what: 'page' }); }
            else this.buildTabs();
        };
        input.addEventListener('blur', () => finish(true));
        input.addEventListener('click', e => e.stopPropagation());
        input.addEventListener('dblclick', e => e.stopPropagation());
        input.addEventListener('keydown', e => {
            e.stopPropagation();
            if (e.key === 'Enter') { e.preventDefault(); finish(true); } else if (e.key === 'Escape') { e.preventDefault(); finish(false); }
        });
    },

    // ── overlay (selection + hover outlines; DOM, so it never ends up in an export) ──
    drawOverlay() {
        const ov = UI.clear(this.el.overlay), pad = 5;
        const add = (b, cls) => ov.appendChild(UI.h('div.' + cls, { style: { left: (b.x - pad) + 'px', top: (b.y - pad) + 'px', width: (b.w + pad * 2) + 'px', height: (b.h + pad * 2) + 'px' } }));
        for (const b of App.boxes) {
            if (App.selection.includes(b.id)) add(b, 'sel-box');
            else if (b.id === this.hoverId && !this.drag && !this.marquee) add(b, 'hover-box');
        }
    },

    setHover(id) {
        if (id === this.hoverId) return;
        this.hoverId = id;
        this.drawOverlay();
    },

    // ── pointer input ──
    interactive() { return !isMobile() || document.body.getAttribute('data-mtab') === 'preview'; },

    point(e) {
        const r = this.el.scaler.getBoundingClientRect();
        return { x: (e.clientX - r.left) / this.scale, y: (e.clientY - r.top) / this.scale };
    },

    // Topmost box under a point. A selected box wins (so it can be dragged even when
    // something overlaps it); otherwise the smallest one — the inner element aimed at.
    boxAt(x, y) {
        const hits = App.boxes.filter(b => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h && !this.isLocked(b.id));
        if (!hits.length) return null;
        const selected = hits.filter(b => Actions.isSelected(b.id));
        return (selected.length ? selected : hits).reduce((best, b) => (b.w * b.h < best.w * best.h ? b : best));
    },
    isLocked(id) { const el = Model.findElement(App.page(), id); return !!(el && el.locked); },

    onDown(e) {
        if (!this.interactive() || e.button > 0 || (typeof Anim !== 'undefined' && Anim.playing)) return;
        if (document.activeElement && UI.isTyping()) document.activeElement.blur();
        const { x, y } = this.point(e);
        const box = this.boxAt(x, y);
        const shift = e.shiftKey;
        this.pendingClick = null;
        try { this.el.clip.setPointerCapture(e.pointerId); } catch (err) { /* synthetic events */ }

        if (!box) {
            // empty canvas: rubber band (Shift adds to the selection)
            const base = shift ? App.selection.slice() : [];
            if (!shift) Actions.select([]);
            this.marquee = { x0: x, y0: y, x1: x, y1: y, base };
            this.updateMarquee(x, y);
            this.el.marquee.style.display = 'block';
            return;
        }

        if (shift) {
            // Shift+click toggles; removal waits for the release so Shift+drag still constrains the axis
            if (Actions.isSelected(box.id)) this.pendingClick = { toggleOff: box.id };
            else Actions.select(App.selection.concat([box.id]));
        } else if (Actions.isSelected(box.id)) {
            if (App.selection.length > 1) this.pendingClick = { only: box.id };   // a plain click narrows the group
        } else Actions.select([box.id]);

        const starts = {};
        for (const id of App.selection) if (Actions.canMove(id)) starts[id] = Actions.getPos(id);
        this.drag = { x, y, starts, moved: false, axis: null };
    },

    onMove(e) {
        const { x, y } = this.point(e);
        if (this.marquee) {
            this.updateMarquee(Math.max(0, Math.min(Model.WIDTH, x)), Math.max(0, Math.min(Model.HEIGHT, y)));
            return;
        }
        const d = this.drag;
        if (!d) { if (this.interactive() && !isMobile()) { const b = this.boxAt(x, y); this.setHover(b ? b.id : null); } return; }

        let dx = x - d.x, dy = y - d.y;
        if (!d.moved) {
            if (Math.abs(dx) < this.DRAG_THRESHOLD && Math.abs(dy) < this.DRAG_THRESHOLD) return;
            d.moved = true;
            this.pendingClick = null;
        }
        if (e.shiftKey) {     // constrain to the axis of the first significant movement
            if (d.axis === null && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) d.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
            if (d.axis === 'x') dy = 0; else if (d.axis === 'y') dx = 0;
        } else d.axis = null;

        for (const id in d.starts) Actions.setPos(id, d.starts[id].x + dx, d.starts[id].y + dy);
        App.changed({ render: 'interactive', history: false, what: 'move' });
    },

    onUp() {
        if (this.marquee) {
            this.marquee = null;
            this.el.marquee.style.display = 'none';
            App.emit('selection');
            return;
        }
        const d = this.drag;
        if (!d) return;
        this.drag = null;
        if (d.moved) {
            Actions.restack(Object.keys(d.starts));
            App.changed({ what: 'move' });
        } else if (this.pendingClick) {
            if (this.pendingClick.only) Actions.select([this.pendingClick.only]);
            else Actions.select(App.selection.filter(id => id !== this.pendingClick.toggleOff));
        }
        this.pendingClick = null;
    },

    // Double-click a custom textbox / field to jump to its editor.
    onDouble(e) {
        const { x, y } = this.point(e);
        const box = this.boxAt(x, y);
        if (box) Content.focusEditor(box.id);
    },

    updateMarquee(x, y) {
        const m = this.marquee;
        m.x1 = x; m.y1 = y;
        const r = { x: Math.min(m.x0, m.x1), y: Math.min(m.y0, m.y1), w: Math.abs(m.x1 - m.x0), h: Math.abs(m.y1 - m.y0) };
        Object.assign(this.el.marquee.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' });
        const hits = App.boxes.filter(b => !this.isLocked(b.id) && b.x <= r.x + r.w && b.x + b.w >= r.x && b.y <= r.y + r.h && b.y + b.h >= r.y).map(b => b.id);
        const ids = [...new Set(m.base.concat(hits))];
        if (ids.length !== App.selection.length || !ids.every(id => App.selection.includes(id))) {
            App.selection = ids;
            this.drawOverlay();
        }
    }
};
