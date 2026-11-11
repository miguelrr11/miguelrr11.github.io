// Small DOM toolkit used by every panel: element builder, toasts, menus,
// dialogs and the form controls (all controls share one look and one API).
'use strict';

const UI = {};

// h('div.cls#id', {attr / onclick / style}, ...children)
UI.h = function (spec, attrs, ...children) {
    const m = spec.match(/^([a-z0-9]+)?((?:[.#][\w-]+)*)$/i);
    const el = document.createElement((m && m[1]) || 'div');
    if (m && m[2]) for (const part of m[2].match(/[.#][\w-]+/g) || []) {
        if (part[0] === '.') el.classList.add(part.slice(1)); else el.id = part.slice(1);
    }
    if (attrs && (attrs instanceof Node || typeof attrs !== 'object' || Array.isArray(attrs))) { children.unshift(attrs); attrs = null; }
    if (attrs) for (const k of Object.keys(attrs)) {
        const v = attrs[k];
        if (v == null || v === false) continue;
        if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
        else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
        else if (k === 'class') el.className += (el.className ? ' ' : '') + v;
        else if (k === 'html') el.innerHTML = v;
        else if (k in el && k !== 'list') { try { el[k] = v; } catch (e) { el.setAttribute(k, v); } }
        else el.setAttribute(k, v === true ? '' : v);
    }
    UI.append(el, children);
    return el;
};

UI.append = function (el, children) {
    for (const c of [].concat(children).flat(Infinity)) {
        if (c == null || c === false) continue;
        el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
    }
    return el;
};

UI.icon = name => UI.h('i', { class: 'fa-solid fa-' + name, 'aria-hidden': 'true' });

UI.clear = el => { while (el.firstChild) el.removeChild(el.firstChild); return el; };

// path helpers for "a.b.c" bindings
UI.get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
UI.set = (obj, path, value) => {
    const keys = path.split('.');
    let o = obj;
    for (let i = 0; i < keys.length - 1; i++) { if (o[keys[i]] == null || typeof o[keys[i]] !== 'object') o[keys[i]] = {}; o = o[keys[i]]; }
    o[keys[keys.length - 1]] = value;
};

// ─── toast ────────────────────────────────────────────────────────────────────
// UI.toast('Saved') · UI.toast('Failed', true) · UI.toast('Cleared', false, { label: 'Undo', run })
UI.toast = function (message, isError = false, action = null) {
    const old = document.getElementById('toast-notification');
    if (old) old.remove();
    const toast = UI.h('div#toast-notification.toast', { class: isError ? 'toast-error' : '', role: 'status' }, UI.h('span', message));
    if (action) toast.appendChild(UI.h('button.toast-action', { onclick: () => { toast.remove(); action.run(); } }, action.label));
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    clearTimeout(UI.toastTimer);
    UI.toastTimer = setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, action ? 6000 : 3500);
};

// ─── popup menu ───────────────────────────────────────────────────────────────
// items: { label, icon, run, danger, disabled, checked, hint } | '-' | { title }
UI.menu = function (anchor, items, opts = {}) {
    UI.closeMenu();
    const menu = UI.h('div.menu', { role: 'menu' });
    for (const it of items) {
        if (!it) continue;
        if (it === '-') { menu.appendChild(UI.h('div.menu-sep')); continue; }
        if (it.title) { menu.appendChild(UI.h('div.menu-title', it.title)); continue; }
        const row = UI.h('button.menu-item', { class: (it.danger ? 'danger ' : '') + (it.checked ? 'checked' : ''), disabled: !!it.disabled, role: 'menuitem' },
            UI.h('span.menu-icon', it.checked ? UI.icon('check') : (it.icon ? UI.icon(it.icon) : null)),
            UI.h('span.menu-label', it.label), it.hint ? UI.h('span.menu-hint', it.hint) : null);
        row.addEventListener('click', () => { UI.closeMenu(); it.run && it.run(); });
        menu.appendChild(row);
    }
    document.body.appendChild(menu);
    const r = anchor.getBoundingClientRect ? anchor.getBoundingClientRect() : { left: anchor.x, right: anchor.x, top: anchor.y, bottom: anchor.y };
    const mw = menu.offsetWidth, mh = menu.offsetHeight;
    let x = opts.alignRight ? r.right - mw : r.left, y = r.bottom + 6;
    if (x + mw > innerWidth - 8) x = innerWidth - mw - 8;
    if (y + mh > innerHeight - 8) y = Math.max(8, r.top - mh - 6);
    menu.style.left = Math.max(8, x) + 'px'; menu.style.top = y + 'px';
    UI.openMenu = menu;
    setTimeout(() => document.addEventListener('pointerdown', UI.menuAway, true), 0);
    return menu;
};
UI.menuAway = e => { if (UI.openMenu && !UI.openMenu.contains(e.target)) UI.closeMenu(); };
UI.closeMenu = function () {
    if (UI.openMenu) { UI.openMenu.remove(); UI.openMenu = null; }
    document.removeEventListener('pointerdown', UI.menuAway, true);
};

// ─── dialogs ──────────────────────────────────────────────────────────────────
UI.dialog = function (title, body, buttons) {
    return new Promise(resolve => {
        const close = v => { back.remove(); document.removeEventListener('keydown', onKey, true); resolve(v); };
        const onKey = e => {
            if (e.key === 'Escape') { e.stopPropagation(); close(null); }
            else if (e.key === 'Enter' && !(e.target && e.target.tagName === 'TEXTAREA')) { e.preventDefault(); e.stopPropagation(); const b = buttons.find(b => b.primary); close(b ? b.value() : null); }
        };
        const back = UI.h('div.dialog-back', { onpointerdown: e => { if (e.target === back) close(null); } },
            UI.h('div.dialog', { role: 'dialog' }, UI.h('h3', title), body,
                UI.h('div.dialog-buttons', buttons.map(b => UI.h('button.btn', { class: b.primary ? 'btn-accent' : (b.danger ? 'btn-danger' : ''), onclick: () => close(b.value()) }, b.label)))));
        document.body.appendChild(back);
        document.addEventListener('keydown', onKey, true);
        const focusEl = back.querySelector('input, textarea, select') || back.querySelector('.btn-accent');
        if (focusEl) { focusEl.focus(); if (focusEl.select) focusEl.select(); }
    });
};

UI.prompt = function (title, value = '', placeholder = '') {
    const input = UI.h('input.input', { type: 'text', value, placeholder });
    return UI.dialog(title, input, [{ label: 'Cancel', value: () => null }, { label: 'OK', primary: true, value: () => input.value.trim() || null }]);
};

UI.confirm = function (title, message, okLabel = 'OK', danger = false) {
    return UI.dialog(title, message ? UI.h('p.dialog-text', message) : null,
        [{ label: 'Cancel', value: () => false }, { label: okLabel, primary: !danger, danger, value: () => true }]).then(v => !!v);
};

// ─── controls ─────────────────────────────────────────────────────────────────
// Every control returns { el, set(value) } so panels can re-sync without rebuilding.

UI.row = (label, control, hint) => UI.h('label.row', { title: hint || null }, UI.h('span.row-label', label), control);

UI.slider = function (o) {
    const fmt = o.fmt || (v => String(v));
    const input = UI.h('input.slider', { type: 'range', min: o.min, max: o.max, step: o.step || 1, value: o.value });
    const out = UI.h('span.row-value', fmt(Number(o.value)));
    const fire = (commit) => { const v = Number(input.value); out.textContent = fmt(v); o.onInput && o.onInput(v, commit); };
    input.addEventListener('input', () => fire(false));
    input.addEventListener('change', () => { o.onChange && o.onChange(Number(input.value)); });
    const el = UI.h('div.row', { title: o.hint || null }, UI.h('span.row-label', o.label), input, out);
    if (o.def !== undefined) {
        el.querySelector('.row-label').addEventListener('dblclick', () => { input.value = o.def; fire(true); o.onChange && o.onChange(Number(input.value)); });
        el.querySelector('.row-label').title = (o.hint ? o.hint + ' — ' : '') + 'double-click to reset';
    }
    return { el, input, set(v) { input.value = v; out.textContent = fmt(Number(v)); } };
};

UI.toggle = function (o) {
    const input = UI.h('input', { type: 'checkbox', checked: !!o.value });
    input.addEventListener('change', () => o.onChange(input.checked));
    const el = UI.h('label.row.row-toggle', { title: o.hint || null }, UI.h('span.row-label', o.label), UI.h('span.switch', input, UI.h('span.switch-knob')));
    return { el, input, set(v) { input.checked = !!v; } };
};

UI.select = function (o) {
    const sel = UI.h('select.input', o.options.map(op => {
        const [value, label] = Array.isArray(op) ? op : [op, op];
        return UI.h('option', { value }, label);
    }));
    sel.value = o.value;
    sel.addEventListener('change', () => o.onChange(sel.value));
    const el = o.label ? UI.row(o.label, sel, o.hint) : sel;
    return { el, input: sel, set(v) { sel.value = v; } };
};

UI.segmented = function (o) {
    const wrap = UI.h('div.segmented', { role: 'radiogroup' });
    let current = o.value;
    const btns = o.options.map(op => {
        const [value, label, icon] = Array.isArray(op) ? op : [op, op];
        const b = UI.h('button.seg', { type: 'button', title: icon ? label : null, onclick: () => { if (current !== value) { set(value); o.onChange(value); } } },
            icon ? UI.icon(icon) : label);
        b.dataset.value = value;
        return b;
    });
    function set(v) { current = v; btns.forEach(b => b.classList.toggle('active', b.dataset.value === String(v))); }
    UI.append(wrap, btns);
    set(current);
    const el = o.label ? UI.h('div.row', { class: o.options.length > 3 ? 'stack' : '', title: o.hint || null }, UI.h('span.row-label', o.label), wrap) : wrap;
    return { el, set };
};

UI.color = function (o) {
    const input = UI.h('input.swatch', { type: 'color', value: o.value || '#ffffff' });
    input.addEventListener('input', () => o.onInput && o.onInput(input.value));
    input.addEventListener('change', () => o.onChange && o.onChange(input.value));
    const el = o.label ? UI.row(o.label, input, o.hint) : input;
    return { el, input, set(v) { input.value = v; } };
};

UI.text = function (o) {
    const input = UI.h(o.multiline ? 'textarea.input' : 'input.input', { type: o.type || 'text', placeholder: o.placeholder || '', value: o.value == null ? '' : o.value });
    if (o.min !== undefined) input.min = o.min;
    if (o.max !== undefined) input.max = o.max;
    input.addEventListener('input', () => o.onInput && o.onInput(input.value));
    if (o.onFocus) input.addEventListener('focus', o.onFocus);
    const el = o.label ? UI.row(o.label, input, o.hint) : input;
    return { el, input, set(v) { if (document.activeElement !== input) input.value = v == null ? '' : v; } };
};

UI.chips = function (o) {   // multi-select chips; value = array of keys
    const wrap = UI.h('div.chips');
    let value = (o.value || []).slice();
    const btns = o.options.map(op => {
        const [key, label] = Array.isArray(op) ? op : [op, op];
        const b = UI.h('button.chip', { type: 'button', onclick: () => {
            value = value.includes(key) ? value.filter(k => k !== key) : value.concat([key]);
            sync(); o.onChange(value.slice(), key);
        } }, label);
        b.dataset.key = key;
        return b;
    });
    function sync() { btns.forEach(b => b.classList.toggle('active', value.includes(b.dataset.key))); }
    UI.append(wrap, btns); sync();
    return { el: wrap, set(v) { value = (v || []).slice(); sync(); } };
};

// Collapsible section. Its open/closed state is remembered per `key`.
UI.section = function (title, o = {}) {
    const key = o.key || title;
    const saved = App.prefs.open[key];
    const open = saved === undefined ? !!o.open : saved;
    const body = UI.h('div.section-body');
    const head = UI.h('button.section-head', { type: 'button', 'aria-expanded': String(open) },
        UI.h('span.section-caret', UI.icon('chevron-right')), UI.h('span.section-title', title), o.extra || null);
    const el = UI.h('section.section', { class: open ? 'open' : '' }, head, body);
    head.addEventListener('click', e => {
        if (e.target.closest('.section-extra')) return;
        const now = !el.classList.contains('open');
        el.classList.toggle('open', now);
        head.setAttribute('aria-expanded', String(now));
        App.prefs.open[key] = now; App.savePrefs();
    });
    return { el, body, head };
};

// "More options" disclosure inside a section (never remembered: stays tidy).
UI.more = function (label = 'More options') {
    const body = UI.h('div.more-body');
    const btn = UI.h('button.more-toggle', { type: 'button' }, UI.icon('sliders'), UI.h('span', label));
    const el = UI.h('div.more', btn, body);
    btn.addEventListener('click', () => el.classList.toggle('open'));
    return { el, body };
};

// Build controls from descriptors and bind them to `target()`:
//   { k: 'tracks.textSize', label, type: 'range' | 'toggle' | 'select' | 'seg' | 'color' | 'text' | 'number',
//     min, max, step, options, fmt, def, adv: true, when: obj => bool, hint, after: (obj, value) => void }
// Fields with `adv` go under a "More options" disclosure. Returns { sync() }.
UI.fields = function (container, fields, target, onChange) {
    const controls = [];
    let more = null;
    for (const f of fields) {
        const write = (v, mode) => { const obj = target(); UI.set(obj, f.k, v); if (f.after) f.after(obj, v); onChange(f, mode || 'request'); };
        const val = () => UI.get(target(), f.k);
        let c;
        if (f.type === 'range') c = UI.slider({ label: f.label, min: f.min, max: f.max, step: f.step, value: val(), fmt: f.fmt, def: f.def, hint: f.hint, onInput: v => write(v, 'interactive') });
        else if (f.type === 'toggle') c = UI.toggle({ label: f.label, value: val(), hint: f.hint, onChange: v => write(v) });
        else if (f.type === 'select') c = UI.select({ label: f.label, options: f.options, value: val(), hint: f.hint, onChange: v => write(typeof f.options[0][0] === 'number' ? Number(v) : v) });
        else if (f.type === 'seg') c = UI.segmented({ label: f.label, options: f.options, value: val(), hint: f.hint, onChange: v => write(v) });
        else if (f.type === 'color') c = UI.color({ label: f.label, value: val(), hint: f.hint, onInput: v => write(v, 'interactive') });
        else if (f.type === 'number') c = UI.text({ label: f.label, type: 'number', min: f.min, max: f.max, value: val(), hint: f.hint, placeholder: f.placeholder, onInput: v => write(v === '' ? 0 : Number(v)) });
        else c = UI.text({ label: f.label, value: val(), hint: f.hint, placeholder: f.placeholder, onInput: v => write(v) });
        c.field = f;
        controls.push(c);
        if (f.adv) { if (!more) { more = UI.more(); container.appendChild(more.el); } more.body.appendChild(c.el); }
        else container.insertBefore(c.el, more ? more.el : null);
    }
    function sync() {
        const obj = target();
        for (const c of controls) {
            c.set(UI.get(obj, c.field.k));
            if (c.field.when) c.el.style.display = c.field.when(obj) ? '' : 'none';
        }
    }
    sync();
    return { sync, controls };
};

UI.isTyping = function (el) {
    el = el || document.activeElement;
    if (!el) return false;
    if (el.isContentEditable || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return true;
    return el.tagName === 'INPUT' && !['range', 'checkbox', 'radio', 'button', 'color'].includes(el.type);
};

UI.download = function (blob, name) {
    const url = URL.createObjectURL(blob);
    const link = UI.h('a', { href: url, download: name });
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
};

// Read a local image file into a data URL p5 can load. Common web formats pass
// through untouched; anything else (HEIC, huge photos) is decoded, downscaled and
// re-encoded.
UI.readImageFile = function (file) {
    return new Promise((resolve, reject) => {
        const PASSTHROUGH = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
        if (PASSTHROUGH.includes(file.type) && file.size <= 4 * 1024 * 1024) {
            const reader = new FileReader();
            reader.onload = ev => resolve(ev.target.result);
            reader.onerror = () => reject(new Error('Could not read that image.'));
            reader.readAsDataURL(file);
            return;
        }
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            const scale = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
            const c = document.createElement('canvas');
            c.width = Math.max(1, Math.round(img.naturalWidth * scale)); c.height = Math.max(1, Math.round(img.naturalHeight * scale));
            c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
            URL.revokeObjectURL(objectUrl);
            const outType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
            try { resolve(c.toDataURL(outType, outType === 'image/jpeg' ? 0.92 : undefined)); }
            catch (err) { reject(new Error('Could not process that image.')); }
        };
        img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Could not read that image format. Try a JPEG or PNG.')); };
        img.src = objectUrl;
    });
};

// URL input + upload button + clear, bound to get()/set(). Uploaded files become assets.
UI.imageInput = function (o) {
    const input = UI.h('input.input', { type: 'text', placeholder: 'Paste an image URL…' });
    const file = UI.h('input.visually-hidden', { type: 'file', accept: 'image/*', tabIndex: -1 });
    const chip = UI.h('div.asset-chip');
    const upload = UI.h('button.icon-btn', { type: 'button', title: 'Upload an image', onclick: () => file.click() }, UI.icon('upload'));
    async function take(f) {
        try { o.set(Assets.add(await UI.readImageFile(f))); sync(); }
        catch (err) { UI.toast(err.message, true); }
    }
    file.addEventListener('change', e => { if (e.target.files[0]) take(e.target.files[0]); file.value = ''; });
    input.addEventListener('input', () => o.set(input.value.trim()));
    if (o.onFocus) input.addEventListener('focus', o.onFocus);
    function sync() {
        const url = o.get() || '';
        const local = Assets.isRef(url);
        input.style.display = local ? 'none' : '';
        chip.style.display = local ? '' : 'none';
        if (local) {
            UI.clear(chip);
            UI.append(chip, [UI.h('img', { src: Assets.resolve(url), alt: '' }), UI.h('span', 'Uploaded image'),
                UI.h('button.icon-btn.small', { type: 'button', title: 'Remove image', onclick: () => { o.set(''); sync(); input.focus(); } }, UI.icon('xmark'))]);
        } else if (document.activeElement !== input) input.value = url;
    }
    const el = UI.h('div.image-input', input, chip, upload, file);
    sync();
    return { el, sync, take };
};
