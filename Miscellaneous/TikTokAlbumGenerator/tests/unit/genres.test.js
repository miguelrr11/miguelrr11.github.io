const test = require('node:test');
const assert = require('node:assert');
const G = require('../../js/core/genres.js');

test('lookups ignore case, spaces and hyphens', () => {
    const text = G.describe('Post-Rock');
    assert.ok(text && text.length > 20);
    for (const v of ['post rock', 'POST-ROCK', ' postrock ', 'Post Rock']) assert.strictEqual(G.describe(v), text, v);
    assert.strictEqual(G.describe('Not A Genre'), undefined);
    assert.strictEqual(G.describe(''), undefined);
});

test('the template object behaves like the old plain object', () => {
    assert.strictEqual(G.proxy['Art Rock'], G.describe('Art Rock'));
    assert.strictEqual(G.proxy['art rock'], G.describe('Art Rock'));
    assert.strictEqual(G.proxy.Nope ?? '', '');
    assert.ok('Shoegaze' in G.proxy);
    assert.ok(Object.keys(G.proxy).length >= 100);
});

test('old misspelled names still resolve', () => {
    assert.ok(G.describe('Techincal Death Metal'));
    assert.strictEqual(G.describe('Techincal Death Metal'), G.describe('Technical Death Metal'));
    assert.ok(G.describe('Neo-Psyhedelia') && G.describe('Electropop:') && G.describe('Electropop'));
});

test('suggestions put prefix matches first', () => {
    assert.deepStrictEqual(G.suggest('prog', 3), ['Progressive Electronic', 'Progressive Metal', 'Progressive Rock']);
    assert.ok(G.suggest('metal', 20).includes('Death Metal'));
    assert.deepStrictEqual(G.suggest('', 5), []);
});

test('custom descriptions add to and override the built-in ones', () => {
    G.setCustom({ 'Zeuhl': 'Magma and friends.', 'post rock': 'Mine.' });
    assert.strictEqual(G.describe('zeuhl'), 'Magma and friends.');
    assert.strictEqual(G.describe('Post-Rock'), 'Mine.');
    assert.ok(G.names().includes('Zeuhl'));
    G.setCustom({});
    assert.strictEqual(G.describe('Zeuhl'), undefined);
    assert.notStrictEqual(G.describe('Post-Rock'), 'Mine.');
});
