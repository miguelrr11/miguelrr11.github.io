// Glitch tab: the stretch effect of the album art ("Image") and of glitched
// text ("Title"). Presets and Randomize up top, the raw parameters below.
'use strict';

const GLITCH_PRESETS = {
    'Default': () => { const g = Model.defaultGlitch(); return { image: g.image, title: g.title }; },
    'Clean': () => ({
        image: { sides: { left: true, right: true, top: false, bottom: false }, type: 'none', amp: 0, scale: 0.005, symmetrical: true, blur: 0, color: { mode: 'fade', amount: 0.75 }, warp: {}, edges: {} },
        title: { sides: { left: false, right: false, top: false, bottom: false }, type: 'none', amp: 0, scale: 0.005, symmetrical: true, blur: 0, color: { mode: 'none', amount: 1 }, warp: {}, edges: {} }
    }),
    'Melt': () => ({
        image: { sides: { left: true, right: true, top: false, bottom: false }, type: 'sine', amp: 170, scale: 0.008, symmetrical: true, blur: 0, color: { mode: 'glow', amount: 0.2 }, warp: { haze: 12 }, edges: { mode: 'noise', sample: true, scale: 0.03 } },
        title: { sides: { left: true, right: true, top: false, bottom: false }, type: 'sine', amp: 40, scale: 0.02, symmetrical: true, blur: 0, color: { mode: 'fade', amount: 0.9 }, warp: {}, edges: {} }
    }),
    'VHS': () => ({
        image: { sides: { left: true, right: true, top: false, bottom: false }, type: 'noise', amp: 40, scale: 0.02, symmetrical: false, blur: 0, color: { mode: 'chromatic+scanlines+bands', amount: 0.55, shift: 40, bandScale: 0.06, bandSeed: 3 }, warp: { shear: 34, band: 18 }, edges: { mode: 'noise', sample: true, sampleFactor: 0.35, scale: 0.08 } },
        title: { sides: { left: true, right: true, top: false, bottom: false }, type: 'none', amp: 0, scale: 0.005, symmetrical: false, blur: 0, color: { mode: 'fade+scanlines+bands', amount: 0.8, bandScale: 0.09, bandSeed: 22 }, warp: { shear: 12, band: 10 }, edges: {} }
    }),
    'Neon': () => ({
        image: { sides: { left: true, right: true, top: false, bottom: false }, type: 'sine', amp: 60, scale: 0.006, symmetrical: false, blur: 0, color: { mode: 'tint+glow', amount: 0.45, tint: [255, 60, 180] }, warp: {}, edges: { mode: 'noise', sample: true, scale: 0.04 } },
        title: { sides: { left: true, right: true, top: false, bottom: false }, type: 'none', amp: 0, scale: 0.005, symmetrical: false, blur: 0, color: { mode: 'tint+fade', amount: 0.85, tint: [255, 60, 180] }, warp: {}, edges: {} }
    }),
    'Shatter': () => ({
        image: { sides: { left: true, right: true, top: false, bottom: false }, type: 'square', amp: 120, scale: 0.03, symmetrical: false, blur: 0, color: { mode: 'posterize+fade', amount: 0.5, levels: 6 }, warp: { mosaic: 22 }, edges: { mode: 'random', sample: true, sampleFactor: 0.4 } },
        title: { sides: { left: true, right: true, top: false, bottom: false }, type: 'square', amp: 26, scale: 0.05, symmetrical: false, blur: 0, color: { mode: 'fade', amount: 0.9 }, warp: { mosaic: 8 }, edges: {} }
    }),
    'Dream': () => ({
        image: { sides: { left: true, right: true, top: true, bottom: true }, type: 'noise', amp: 90, scale: 0.006, symmetrical: true, blur: 6, color: { mode: 'bloom+fade', amount: 0.5 }, warp: { echo: 30 }, edges: { mode: 'noise', sample: true, sampleFactor: 0.3, scale: 0.02 } },
        title: { sides: { left: true, right: true, top: false, bottom: false }, type: 'none', amp: 0, scale: 0.005, symmetrical: true, blur: 2, color: { mode: 'fade', amount: 1 }, warp: {}, edges: {} }
    })
};

const GlitchPanel = {
    target: 'image',

    opts() { return App.doc.glitch[this.target]; },
    touch(mode) { App.changed({ render: mode || 'interactive', what: 'glitch' }); },

    build(body) {
        this.body = body;
        const g = App.doc.glitch;
        if (!g[this.target]) this.target = 'image';
        const o = this.opts();
        const rebuild = () => Design.show('glitch');
        const T = () => this.opts();

        // target + quick actions
        body.appendChild(UI.h('div.glitch-top',
            UI.segmented({ options: [['image', 'Album art'], ['title', 'Title & text']], value: this.target, onChange: v => { this.target = v; rebuild(); } }).el,
            UI.h('button.btn.btn-small', { type: 'button', title: 'Random look for the ' + (this.target === 'image' ? 'album art' : 'title') + ' (undo with ⌘Z)', onclick: () => this.randomize() }, UI.icon('dice'), 'Random')));

        // presets
        const chipRow = UI.h('div.preset-row');
        const mk = (name, get, custom) => {
            const b = UI.h('button.chip', { type: 'button', title: custom ? 'Right-click to delete' : 'Sets both the album art and the title look', onclick: () => this.applyPreset(get()) }, name);
            if (custom) b.addEventListener('contextmenu', e => { e.preventDefault(); UI.menu(b, [{ label: 'Delete preset "' + name + '"', icon: 'trash', danger: true, run: () => { delete App.presets[name]; Storage.write(KEYS.presets, App.presets); rebuild(); } }]); });
            chipRow.appendChild(b);
        };
        for (const name of Object.keys(GLITCH_PRESETS)) mk(name, GLITCH_PRESETS[name], false);
        for (const name of Object.keys(App.presets)) mk(name, () => Model.clone(App.presets[name]), true);
        chipRow.appendChild(UI.h('button.chip.chip-add', { type: 'button', title: 'Save the current look as a preset', onclick: () => this.savePreset() }, UI.icon('plus')));
        body.appendChild(UI.h('div.card', UI.h('div.card-head', 'Presets'), chipRow));

        const sec = (title, key, open) => { const s = UI.section(title, { key: 'gl:' + key, open }); body.appendChild(s.el); return s.body; };
        const fields = (container, list) => UI.fields(container, list, T, (f, mode) => { this.touch(mode); all.forEach(s => s.sync()); });
        const all = [];

        // ── stretch ──
        const st = sec('Stretch', 'stretch', true);
        const side = (k, icon, label) => {
            const b = UI.h('button.side-btn.side-' + k, { type: 'button', class: o.sides[k] ? 'active' : '', title: 'Stretch to the ' + label, onclick: () => { T().sides[k] = !T().sides[k]; b.classList.toggle('active', T().sides[k]); this.touch('request'); } }, UI.icon(icon));
            return b;
        };
        st.appendChild(UI.h('div.row', UI.h('span.row-label', 'Directions'),
            UI.h('div.side-pad', side('top', 'arrow-up', 'top'), side('left', 'arrow-left', 'left'), UI.h('span.side-core'), side('right', 'arrow-right', 'right'), side('bottom', 'arrow-down', 'bottom'))));
        all.push(fields(st, [
            { k: 'blur', label: 'Blur', type: 'range', min: 0, max: 20, step: 0.5, def: 0, fmt: v => v.toFixed(1) },
            { k: 'edges.offset', label: 'Sample from', type: 'range', min: 0, max: 1, step: 0.01, def: 0, fmt: pct, adv: true, hint: 'Which column of the image is stretched: 0% = the very edge' }
        ]));

        // ── wave ──
        const wv = sec('Wave', 'wave', true);
        all.push(fields(wv, [
            { k: 'type', label: 'Shape', type: 'seg', options: [['none', 'Off'], ['sine', 'Sine'], ['noise', 'Noise'], ['square', 'Square'], ['sawtooth', 'Saw']] },
            { k: 'amp', label: 'Amplitude', type: 'range', min: 0, max: 300, step: 1, def: 50, when: t => t.type !== 'none' },
            { k: 'scale', label: 'Frequency', type: 'range', min: 0, max: 0.1, step: 0.001, def: 0.005, fmt: v => v.toFixed(3), when: t => t.type !== 'none' },
            { k: 'symmetrical', label: 'Mirror left / right', type: 'toggle', when: t => t.type !== 'none' }
        ]));

        // ── colour fx ──
        const cf = sec('Colour effects', 'color', true);
        const active = String(o.color.mode || '').split(/[+,\s|]+/).filter(m => Model.COLOR_MODES.includes(m));
        const modes = UI.chips({ options: Model.COLOR_MODES.map(m => [m, m.charAt(0).toUpperCase() + m.slice(1)]), value: active,
            onChange: v => { T().color.mode = v.length ? Model.COLOR_MODES.filter(m => v.includes(m)).join('+') : 'none'; this.touch('request'); all.forEach(s => s.sync()); } });
        cf.appendChild(modes.el);
        const has = m => t => String(t.color.mode || '').split('+').includes(m);
        const colorFields = fields(cf, [
            { k: 'color.amount', label: 'Strength', type: 'range', min: 0, max: 1, step: 0.01, def: 0.15, fmt: v => v.toFixed(2) },
            { k: 'color.shift', label: 'Chromatic split', type: 'range', min: 0, max: 120, step: 1, def: 60, when: has('chromatic') },
            { k: 'color.levels', label: 'Posterize levels', type: 'range', min: 2, max: 20, step: 1, def: 10, when: has('posterize') },
            { k: 'color.bandScale', label: 'Band thickness', type: 'range', min: 0.001, max: 0.2, step: 0.001, def: 0.05, fmt: v => v.toFixed(3), when: has('bands') },
            { k: 'color.bandSeed', label: 'Band pattern', type: 'range', min: 0, max: 100, step: 0.1, def: 10, fmt: v => v.toFixed(1), when: has('bands') }
        ]);
        all.push(colorFields);
        const tint = UI.color({ label: 'Tint colour', value: rgbToHex(o.color.tint || [255, 60, 180]), onInput: v => { T().color.tint = hexToRgbArr(v); this.touch(); } });
        cf.appendChild(tint.el);
        all.push({ sync: () => { tint.el.style.display = has('tint')(T()) ? '' : 'none'; } });
        const order = UI.more('Effect order');
        UI.append(order.body, [UI.h('p.field-hint', 'Effects stack in order — shuffling it changes how they mix.'), UI.h('div.btn-row',
            UI.h('button.btn.btn-small', { type: 'button', onclick: () => { const a = T().colEffOr = (T().colEffOr || Model.EFFECT_ORDER).slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } this.touch('request'); } }, UI.icon('shuffle'), 'Shuffle'),
            UI.h('button.btn.btn-small', { type: 'button', onclick: () => { T().colEffOr = Model.EFFECT_ORDER.slice(); this.touch('request'); } }, UI.icon('rotate-left'), 'Default'))]);
        cf.appendChild(order.el);

        // ── warp ──
        const wp = sec('Warp', 'warp', false);
        all.push(fields(wp, [
            { k: 'warp.mosaic', label: 'Mosaic', type: 'range', min: 0, max: 50, step: 1, def: 0, hint: 'Pixelates more the further out' },
            { k: 'warp.shear', label: 'Tearing', type: 'range', min: 0, max: 100, step: 1, def: 0, hint: 'Bands jump like a torn signal' },
            { k: 'warp.echo', label: 'Echo', type: 'range', min: 0, max: 100, step: 1, def: 0, hint: 'Motion-trail smear' },
            { k: 'warp.haze', label: 'Haze', type: 'range', min: 0, max: 50, step: 1, def: 0, hint: 'Fine shimmer' },
            { k: 'warp.band', label: 'Tear band size', type: 'range', min: 8, max: 64, step: 2, def: 24, when: t => !!t.warp.shear }
        ]));

        // ── edges ──
        const ed = sec('Edge source', 'edges', false);
        const edgeMode = () => (T().edges.auto ? 'auto' : (T().edges.colors && T().edges.colors.length ? 'custom' : 'image'));
        const srcSeg = UI.segmented({ label: 'Stretch', options: [['image', 'The image'], ['auto', 'Its main colours']], value: edgeMode() === 'custom' ? 'auto' : edgeMode(),
            onChange: v => { const e = T().edges; delete e.colors; if (v === 'auto') e.auto = true; else delete e.auto; this.touch('request'); all.forEach(s => s.sync()); } });
        ed.appendChild(srcSeg.el);
        all.push(fields(ed, [
            { k: 'edges.sample', label: 'Vary brightness', type: 'toggle', hint: 'Streaks keep their hue but get lighter / darker', when: t => !t.edges.auto },
            { k: 'edges.sampleFactor', label: 'Variation', type: 'range', min: 0, max: 1, step: 0.01, def: 0.5, fmt: v => v.toFixed(2), when: t => t.edges.sample && !t.edges.auto },
            { k: 'edges.mode', label: 'Pattern', type: 'seg', options: [['noise', 'Smooth'], ['random', 'Random']], when: t => t.edges.sample || t.edges.auto },
            { k: 'edges.scale', label: 'Pattern size', type: 'range', min: 0, max: 0.2, step: 0.001, def: 0.04, fmt: v => v.toFixed(3), when: t => (t.edges.sample || t.edges.auto) && t.edges.mode === 'noise' },
            { k: 'edges.seed', label: 'Pattern shift', type: 'range', min: 0, max: 100, step: 0.1, def: 0, fmt: v => v.toFixed(1), when: t => (t.edges.sample || t.edges.auto) && t.edges.mode === 'noise' }
        ]));

        // ── seed ──
        const sd = sec('Pattern seed', 'seed', false);
        const seedIn = UI.text({ label: 'Seed', type: 'number', min: 1, value: g.seed, hint: 'Same seed = same noise pattern', onInput: v => { g.seed = Math.max(1, Math.floor(Number(v) || 1)); this.touch('request'); } });
        UI.append(sd, [seedIn.el, UI.h('div.btn-row', UI.h('button.btn.btn-small', { type: 'button', onclick: () => { g.seed = 1 + Math.floor(Math.random() * 99999); seedIn.input.value = g.seed; this.touch('request'); } }, UI.icon('dice'), 'Re-roll pattern')),
            UI.h('p.field-hint', 'Noise-based options (noise wave, bands, brightness variation) follow this seed, so the look stays identical after a reload and in the export.')]);

        this.timing = UI.h('p.field-hint.timing');
        body.appendChild(this.timing);
        all.forEach(s => s.sync());
    },

    showTiming() {
        if (this.timing && this.timing.isConnected && Glitch.lastMs) this.timing.textContent = 'Last glitch pass: ' + Glitch.lastMs.toFixed(0) + ' ms';
    },

    applyPreset(p) {
        const g = App.doc.glitch;
        if (p.image) g.image = Model.clone(p.image);
        if (p.title) g.title = Model.clone(p.title);
        Model.normalizeGlitch(g);
        this.touch('request');
        Design.show('glitch');
    },

    async savePreset() {
        const name = await UI.prompt('Save glitch preset', '', 'Preset name');
        if (!name) return;
        App.presets[name] = { image: Model.clone(App.doc.glitch.image), title: Model.clone(App.doc.glitch.title) };
        Storage.write(KEYS.presets, App.presets);
        Design.show('glitch');
        UI.toast('Preset "' + name + '" saved');
    },

    randomize() {
        History.flush();
        const g = App.doc.glitch;
        g[this.target] = Model.randomGlitchOpts(Math.random, this.target);
        Model.normalizeGlitch(g);
        g.seed = 1 + Math.floor(Math.random() * 99999);
        this.touch('request');
        Design.show('glitch');
    }
};
