// Floating toolbar for whatever is selected on the canvas. One bar for every
// kind of box; only the controls that apply are shown, rarely used ones live in
// its "⋯" popover.
'use strict';

const SelBar = {
    el: null, pop: null, posX: null, posY: null, popOpen: false,

    init() {
        this.el = UI.h('div#selection-bar');
        this.pop = UI.h('div#selection-pop');
        document.body.append(this.pop, this.el);
        App.on(what => {
            if (what === 'selection' || what === 'doc' || what === 'page' || what === 'elements') this.build();
            else if (what === 'pageopt' && !this.busy) this.build();     // changed from the Design column
            else if (what === 'move') this.syncPos();
        });
        this.build();
    },

    changed(mode) { this.busy = true; App.changed({ render: mode || 'request', what: 'pageopt' }); this.busy = false; },

    stepper(label, get, set, step, fmt) {
        const out = UI.h('span.sb-value', (fmt || String)(get()));
        const mk = dir => UI.h('button.sb-btn', { type: 'button', onclick: () => { set(get() + dir * step); out.textContent = (fmt || String)(get()); this.changed(); } }, dir < 0 ? '−' : '+');
        return UI.h('div.sb-group', UI.h('span.sb-label', label), mk(-1), out, mk(1));
    },

    slider(label, min, max, step, get, set, fmt) {
        const out = UI.h('span.sb-value', (fmt || String)(get()));
        const input = UI.h('input.slider', { type: 'range', min, max, step, value: get() });
        input.addEventListener('input', () => { set(Number(input.value)); out.textContent = (fmt || String)(get()); this.changed('interactive'); });
        return UI.h('div.sb-group', UI.h('span.sb-label', label), input, out);
    },

    check(label, get, set) {
        const input = UI.h('input', { type: 'checkbox', checked: !!get() });
        input.addEventListener('change', () => { set(input.checked); this.changed(); });
        return UI.h('label.sb-group.sb-check', UI.h('span.switch', input, UI.h('span.switch-knob')), UI.h('span.sb-label', label));
    },

    align(get, set) {
        const seg = UI.segmented({ options: [['left', 'Left', 'align-left'], ['center', 'Center', 'align-center'], ['right', 'Right', 'align-right'], ['justify', 'Justify', 'align-justify']], value: get(), onChange: v => { set(v); this.changed(); } });
        return UI.h('div.sb-group', seg.el);
    },

    position(id) {
        if (!Actions.canMove(id)) return null;
        const p = Actions.getPos(id);
        const mk = axis => {
            const input = UI.h('input.sb-num', { type: 'number', value: Math.round(p[axis]), title: axis.toUpperCase() + ' position (arrow keys nudge the selection)' });
            input.addEventListener('input', () => { const cur = Actions.getPos(id); const v = Number(input.value) || 0; Actions.setPos(id, axis === 'x' ? v : cur.x, axis === 'y' ? v : cur.y); Actions.restack([id]); App.changed({ what: 'pos' }); });
            return input;
        };
        this.posX = mk('x'); this.posY = mk('y');
        return UI.h('div.sb-group', UI.h('span.sb-label', 'X'), this.posX, UI.h('span.sb-label', 'Y'), this.posY);
    },

    syncPos() {
        if (App.selection.length !== 1 || !this.posX || !this.posX.isConnected) return;
        const p = Actions.getPos(App.selection[0]);
        if (document.activeElement !== this.posX) this.posX.value = Math.round(p.x);
        if (document.activeElement !== this.posY) this.posY.value = Math.round(p.y);
    },

    iconBtn(icon, title, run, cls) { return UI.h('button.sb-btn', { type: 'button', title, class: cls || '', onclick: run }, UI.icon(icon)); },

    build() {
        const bar = UI.clear(this.el), page = App.doc ? App.page() : null;
        this.posX = this.posY = null;
        this.closePop();
        const sel = App.selection;
        const open = !!page && sel.length > 0;
        bar.classList.toggle('open', open);
        document.body.classList.toggle('has-selection', open);
        if (!open) return;
        const close = this.iconBtn('xmark', 'Deselect (Esc)', () => Actions.select([]), 'sb-close');

        if (sel.length > 1) {
            const custom = sel.filter(id => Model.findElement(page, id));
            UI.append(bar, [UI.h('div.sb-group', UI.h('span.sb-name', sel.length + ' selected')),
                custom.length ? UI.h('div.sb-group.sb-actions', this.iconBtn('clone', 'Duplicate (⌘D)', () => Actions.duplicate(custom)), this.iconBtn('trash', 'Delete', () => Actions.removeElements(custom), 'sb-danger')) : null,
                UI.h('div.sb-group.sb-actions', close)]);
            return;
        }

        const id = sel[0], el = Model.findElement(page, id);
        const isText = el && page.texts.includes(el), isImage = el && !isText;
        const groups = [];
        const name = el ? (el.name || (isText ? 'Text' : 'Image')) : ({ title: 'Title', artist: 'Artist', year: 'Year', genre: 'Genre', funfact: 'Description', tracks: 'Tracks', image: 'Album art' }[id] || id);
        groups.push(UI.h('div.sb-group', UI.h('span.sb-name', name)));

        if (isText) {
            groups.push(this.stepper('Size', () => el.fontSize, v => { el.fontSize = Math.max(8, Math.min(300, v)); }, 2));
            groups.push(this.stepper('Leading', () => el.leading || 0, v => { el.leading = v; }, 2));
            groups.push(this.slider('Width', 100, 1080, 10, () => el.maxWidth || 500, v => { el.maxWidth = v; }));
            const font = UI.select({ options: Object.keys(Model.FONTS).map(k => [k, Model.FONTS[k]]), value: el.fontType, onChange: v => { el.fontType = v; this.changed(); } });
            font.input.title = 'Font';
            const col = UI.color({ value: el.color, onInput: v => { el.color = v; this.changed('interactive'); } });
            groups.push(UI.h('div.sb-group', font.el, col.el));
            groups.push(this.align(() => el.textAlign || 'left', v => { el.textAlign = v; }));
            groups.push(this.check('Glitch', () => el.glitch, v => { el.glitch = v; }));
        } else if (isImage) {
            groups.push(this.slider('Width', 60, 1080, 10, () => el.w || 400, v => { el.w = v; }));
            groups.push(this.check('Glitch', () => el.glitch, v => { el.glitch = v; }));
        } else if (id === 'tracks') {
            const T = page.tracks;
            groups.push(this.slider('Text', 22, 60, 2, () => T.textSize, v => { T.textSize = v; }));
            groups.push(this.slider('Spacing', -45, 40, 1, () => T.spacing, v => { T.spacing = v; }));
            groups.push(this.slider('Pill', 20, 80, 2, () => T.rectHeight, v => { T.rectHeight = v; }));
            groups.push(this.check('2 columns', () => T.twoColumns, v => { T.twoColumns = v; }));
        } else if (id === 'image') {
            if (page.base === 'cover') {
                groups.push(this.slider('Size', 0.3, 1, 0.01, () => page.hero.size, v => { page.hero.size = v; }, pct));
                groups.push(this.slider('Height', 0.2, 0.8, 0.01, () => page.hero.posY, v => { page.hero.posY = v; }, pct));
            } else groups.push(this.slider('Size', 0.5, 2, 0.05, () => page.art.scale, v => { page.art.scale = v; Model.applyAutoAlign(page); }, v => v.toFixed(2) + '×'));
        } else if (Model.TEXT_IDS.includes(id)) {
            const sign = v => (v >= 0 ? '+' + v : String(v));
            groups.push(this.stepper('Size', () => page.sizeOff[id] || 0, v => { page.sizeOff[id] = v; }, 2, sign));
            if (id === 'funfact') groups.push(this.stepper('Leading', () => page.leadOff.funfact || 0, v => { page.leadOff.funfact = v; }, 2, sign));
            if (page.base === 'sheet' || id === 'title') groups.push(this.slider('Width', 100, 1080, 10, () => page.maxW[id] || Model.DEFAULT_MAX_W[id], v => { page.maxW[id] = v; }));
            if (page.base === 'sheet') groups.push(this.align(() => page.align[id] || 'left', v => { page.align[id] = v; }));
        }

        const pos = this.position(id);
        if (pos) groups.push(pos);

        const actions = [];
        if (isText || Model.TEXT_IDS.includes(id)) {
            actions.push(this.iconBtn('copy', 'Copy format', () => Actions.copyFormat()));
            actions.push(this.iconBtn('paste', 'Paste format', () => Actions.pasteFormat()));
        }
        if (el) {
            actions.push(this.iconBtn('ellipsis', 'More options', () => this.togglePop(el, isText)));
            actions.push(this.iconBtn('clone', 'Duplicate (⌘D)', () => Actions.duplicate([id])));
            actions.push(this.iconBtn('trash', 'Delete (⌫)', () => Actions.removeElements([id]), 'sb-danger'));
        } else actions.push(this.iconBtn('rotate-left', 'Reset size & position', () => this.resetBuiltin(page, id)));
        actions.push(close);
        groups.push(UI.h('div.sb-group.sb-actions', actions));
        UI.append(bar, groups);
    },

    resetBuiltin(page, id) {
        const fresh = Model.createPage(page.type, App.types);
        page.pos[id] = Model.clone(fresh.pos[id] || { x: 0, y: 0 });
        if (Model.TEXT_IDS.includes(id)) {
            page.sizeOff[id] = fresh.sizeOff[id] || 0;
            page.maxW[id] = fresh.maxW[id] || Model.DEFAULT_MAX_W[id];
            page.align[id] = fresh.align[id];
            if (id === 'funfact') page.leadOff.funfact = fresh.leadOff.funfact || 0;
        } else if (id === 'tracks') Object.assign(page.tracks, { textSize: fresh.tracks.textSize, spacing: fresh.tracks.spacing, rectHeight: fresh.tracks.rectHeight, twoColumns: fresh.tracks.twoColumns });
        else if (id === 'image') { page.art.scale = fresh.art.scale; Model.applyAutoAlign(page); }
        this.changed();
        this.build();
    },

    // ── "more options" popover for custom elements ──
    togglePop(el, isText) {
        if (this.popOpen) { this.closePop(); return; }
        const pop = UI.clear(this.pop);
        const fields = isText ? [
            { k: 'opacity', label: 'Opacity', type: 'range', min: 0.05, max: 1, step: 0.05, def: 1, fmt: pct },
            { k: 'shadow', label: 'Shadow', type: 'range', min: 0, max: 80, step: 2, def: 20 },
            { k: 'uppercase', label: 'UPPERCASE', type: 'toggle' },
            { k: 'bg.on', label: 'Background box', type: 'toggle' },
            { k: 'bg.color', label: 'Box colour', type: 'color', when: e => e.bg.on },
            { k: 'bg.alpha', label: 'Box opacity', type: 'range', min: 0.05, max: 1, step: 0.05, def: 0.55, fmt: pct, when: e => e.bg.on },
            { k: 'bg.pad', label: 'Box padding', type: 'range', min: 0, max: 60, step: 1, def: 14, when: e => e.bg.on },
            { k: 'bg.radius', label: 'Box corners', type: 'range', min: 0, max: 60, step: 1, def: 14, when: e => e.bg.on },
            { k: 'locked', label: 'Lock position', type: 'toggle' }
        ] : [
            { k: 'opacity', label: 'Opacity', type: 'range', min: 0.05, max: 1, step: 0.05, def: 1, fmt: pct },
            { k: 'shadow', label: 'Shadow', type: 'range', min: 0, max: 80, step: 2, def: 30 },
            { k: 'radius', label: 'Rounded corners', type: 'range', min: 0, max: 300, step: 2, def: 0 },
            { k: 'locked', label: 'Lock position', type: 'toggle' }
        ];
        const s = UI.fields(pop, fields, () => el, (f, mode) => { this.changed(mode); s.sync(); });
        const r = this.el.getBoundingClientRect();
        pop.classList.add('open');
        pop.style.left = Math.max(8, Math.min(innerWidth - pop.offsetWidth - 8, r.right - pop.offsetWidth)) + 'px';
        pop.style.bottom = (innerHeight - r.top + 8) + 'px';
        this.popOpen = true;
    },
    closePop() { this.pop.classList.remove('open'); this.popOpen = false; }
};
