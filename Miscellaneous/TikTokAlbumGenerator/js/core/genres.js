// Genre descriptions used by the Context page (`genreDescriptions[...]` in text templates).
// Lookups are forgiving: case, spaces and hyphens are ignored, so "post rock",
// "Post-Rock" and "POST ROCK" all find the same entry. Descriptions added from the
// app (Setup → Genres) are layered on top and saved in the browser.
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else { root.Genres = api; root.genreDescriptions = api.proxy; }
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const BUILTIN = {
        "Progressive Rock": "Complex harmonies, instrumental virtuosity, and usually multi-section song structures featuring a broad range of instrumentation.",
        "Progressive Metal": "Fuses amplified, guitar-driven sound with technical proficiency, virtuosity, complex compositions, innovative arrangements, eclecticism, and additional instrumentation.",
        "Art Rock": "Attempts to expand the bounds of Rock within conventional structures, often using outside influences or experimentation for conceptual or thematic purpose.",
        "Art Pop": "Inventive, idiosyncratic, or artistically ambitious, often experimenting with unconventional musical elements and conceptual approaches while retaining accessibility.",
        "Alternative Rock": "Termed as an alternative to mainstream styles and associated with the combination of Punk Rock/Post-Punk-inspired instrumentation with more Pop-oriented songwriting.",
        "Alternative Metal": "Mid-tempo style emphasizing melodicism and rhythmic heaviness; branches outside of the stylistic conventions of Metal.",
        "Indie Rock": "Associated with a less mainstream-oriented and a DIY approach while often dabbling in Pop-informed melodic songwriting, eclecticism, and adopting an \"authentic\" or raw style.",
        "Indie Folk": "Combines the melodic sensibilities and production style of Indie Rock and Indie Pop with acoustic instrumentation and influences from Folk, Singer-Songwriter, and sometimes Country.",
        "Indie Pop": "Back-to-basics Rock approach combining a less mainstream and DIY ethos with melodic, lighthearted and straightforward songwriting.",
        "Death Metal": "Heavily distorted, down-tuned guitars, palm-muted, tremolo-picked riffs, double-kick and blast beat percussion, chromatic chord progressions, minor keys, abrupt changes in tempo, and guttural vocals.",
        "Melodic Death Metal": "Utilizes the guitar harmonies and melodic focus of Heavy Metal while generally retaining down-tuned, heavily distorted guitars and a harsh, aggressive sound.",
        "Brutal Death Metal": "Emphasizes abrasiveness, chunky rhythmic atonal riffs, and low guttural vocals.",
        "Technical Death Metal": "Focuses on challenging, demanding songwriting and instrumental skill.",
        "Post-Rock": "Emphasis on timbre, texture, and atmosphere over traditional conventions while often embracing influences from genres not usually associated with Rock.",
        "Post-Punk": "Emerged alongside the initial Punk Rock explosion in the mid-to-late 1970s, putting a greater emphasis on experimentation and atmosphere.",
        "Post-Metal": "Atmospheric and dense metallic riffs, unconventional songwriting, sonic experimentation, and adoption of eclectic influences.",
        "Pop-Rock": "Fuses conventional verse-chorus song structure and especially melodic songwriting with usage of guitars, drums, and propulsive rhythms.",
        "Garage Rock": "Raw and energetic, generally employing simple, sloppy, and fuzzbox-distorted guitar melodies in addition to frequent shouting or screaming.",
        "Noise Rock": "Explores dissonance and distortion through unconventional playing and guitar effects, commonly augmented by lo-fi production and bursts of feedback.",
        "Psychedelic Rock": "Often attempts to emulate or enhance the effects of psychedelic drugs, typically through a variety of instrumental and studio effects or eclectic influences.",
        "Math Rock": "Explores complex and unconventional rhythmic patterns through unusual syncopation, stop-start structures, polyrhythms and complex time signatures, angular melodies, and technical instrumental performances.",
        "Stoner Rock": "Psychedelic timbres, raw production, and stylistic influence from Doom Metal and Heavy Psych.",
        "Soft Rock": "Clean production and light instrumentation paired with harmonious, radio-friendly songwriting; gained huge commercial success in the 1970s.",
        "Hard Rock": "Originated in the mid-to-late 1960s from Psychedelic Rock and Blues Rock with a heavy sound characterized by distorted guitars and power chords.",
        "Jazz-Rock": "Strongly influenced by Jazz in structure and/or instrumentation.",
        "Space Rock": "Heavy use of synthesizers and guitar effects to create dense atmospheric soundscapes intended to evoke images of outer space and science fiction scenarios.",
        "Experimental Rock": "Eschews accessibility and convention, experimenting with song structures, time signatures, rhythm, dissonance, instrumentation, noise, electronics, studio manipulation, and other techniques not traditionally associated with Rock.",
        "Folk Rock": "Influenced by Folk, particularly in the use of acoustic instrumentation and relatively simple arrangements; has its origins in the American Contemporary Folk movement of the 1960s.",
        "IDM": "Emerged through the development of Electronic Dance Music idioms into a less club-oriented and more experimental direction, often incorporating unconventional sound design and complex rhythms.",
        "Shoegaze": "Dense, noisy, and ethereal washes of sound primarily created with electric guitars and heavy use of effects pedals, such as fuzz, reverb, chorus, and delay, with vocals serving as a dreamy, usually unintelligible melodic layer.",
        "Dream Pop": "Reverberated guitars, effects-laden vocals, and dense productions, creating a psychedelic, spacious, and dreamlike sound.",
        "Pop Rap": "Incorporates Pop elements such as melodious vocals, catchy tunes, verse-chorus structures and radio-friendly lyrics.",
        "Electronic": "Uses non-traditional electronic instrumentation and sound manipulation technology as the primary backbone of a composition.",
        "Thrash Metal": "Blistering tempos, palm-muted, technical riffing influenced by Speed Metal, aggressive drumming utilizing double-kick and skank beats, and diverse vocal styles ranging from harsh to clean techniques.",
        "Heavy Metal": "Heavier outgrowth of Hard Rock featuring greater distortion and intensity along with lesser Blues influences.",
        "Stoner Metal": "Combines elements of Doom Metal with elements of Psychedelic Rock and Blues Rock to create a melodic yet heavy sound.",
        "Sludge Metal": "Mixes Doom Metal's slow pacing, down-tuned riffing style and dark atmosphere with Hardcore Punk's aggression, abrasiveness and harsh vocals.",
        "Black Metal": "Highly distorted, treble-heavy guitars, tremolo-picked riffs, blast beats and double bass drumming, shrieked vocals, and raw, lo-fi production; often focuses on occult, dark imagery and atmosphere.",
        "Power Metal": "Developed from Heavy Metal and Speed Metal, emphasizing speed, vocal melody and harmonized lead guitars.",
        "Industrial Metal": "Incorporates the abrasive and heavy sound of Industrial into Metal, using elements like synthesizers and drum machines.",
        "Nu Metal": "Emphasizes bouncy, drop-tuned riffs, alternating vocal styles, and genre-bending, often incorporating Hip Hop and Funk Metal elements.",
        "Doom Metal": "Plodding tempos, repeated chords, and thick, distorted, down-tuned guitars in a style focused on foreboding, atmosphere, and tension.",
        "Rap Metal": "Features rapped vocals, typically formed around heavy, mid-tempo, and groove-oriented playing in addition to elements of Hip Hop beats such as record scratching.",
        "Drone Metal": "Extremely slow tempos, highly sustained, repetitive guitar notes, and minimalist song structures often omitting a traditional rhythm section and vocals.",
        "Folk Metal": "Features influences from various types of Traditional Folk Music expressed through melodies and/or traditional instrumentation, notably having a large scene in Europe.",
        "Groove Metal": "Midtempo riffs influenced by Thrash Metal but with a greater focus on rhythmic syncopation and heaviness over speed.",
        "Funk Metal": "Melds Funk Rock grooves with slap basslines and metallic guitarwork.",
        "Melodic Black Metal": "Stronger emphasis on melody, generally with cleaner production and more diverse arrangements.",
        "Atmospheric Black Metal": "Repetitive riffs and melodies, slower tempos, synthesized ambient textures, and guitar effects creating atmospheric soundscapes.",
        "Downtempo": "Atmospheric and groove-based with relaxed tempos and mellow beats.",
        "Trip Hop": "Evokes a surreal, trippy, dreamy, and sometimes dark atmosphere with offbeat turntable scratches, light vocal melodies, and Hip Hop-influenced beats.",
        "Conscious Hip Hop": "Features lyrics about social issues.",
        "Southern Hip Hop": "Hip Hop from artists based in the Southern region of the United States.",
        "Hardcore Hip Hop": "Confrontation and aggression, whether in the lyricism, vocal delivery, hard beats, heavy production, or any combination thereof.",
        "Ambient": "Emphasizes texture and tone over traditional musical structure, aimed at evoking a particular atmosphere or mood.",
        "Dark Ambient": "Emphasizes an ominous, gloomy, and dissonant atmosphere.",
        "Neo-Psychedelia": "Developments in Psychedelia since the early 1980s, building on the drug-inspired styles developed in the 1960s.",
        "Psychedelia": "Umbrella of styles intended to replicate or enhance the altered state of consciousness brought on by the use of psychedelic drugs, originating in the 1960s.",
        "Neo-Psychedelic": "Developments in Psychedelia since the early 1980s, building on the drug-inspired styles developed in the 1960s.",
        "Psychedelic": "Umbrella of styles intended to replicate or enhance the altered state of consciousness brought on by the use of psychedelic drugs, originating in the 1960s.",
        "Jazz Rap": "Incorporates elements of Jazz through the use of samples or live instrumentation.",
        "Jangle Pop": "Treble-heavy guitars with arpeggiated melodies, distinct basslines, and often propulsive, repetitive strum-rhythms; frequently influenced by Post-Punk.",
        "Electropop": "Dense, layered, and compressed production, usually coupled with a distinct fuzzy and \"warm\" low-frequency synthesizer style.",
        "Alt-Pop": "Emerged in the late 2000s and early 2010s, combining chart Pop conventions with alternative/indie sensibilities and sometimes more minimal and contemplative atmosphere, often extracted from Alternative R&B.",
        "Space Ambient": "Flowing and relaxing synthesizer-based music derived from Progressive Electronic, often oriented around imagery of outer space.",
        "Progressive Electronic": "Synthesizer-driven genre focusing on developing, often longform compositions and drawing inspiration from various sources such as Progressive Rock, Western Classical Music, and Ambient.",
        "Instrumental Hip Hop": "Can take the form of instrumental versions of songs that normally feature rapping, or hip hop originally released and always intended to be instrumental.",
        "Television Music": "Soundtrack or score that accompanies a televised program.",
        "Indietronica": "Leftfield or DIY approach characterised by simpler Pop-informed melodies, often incorporating vocals or live instrumentation alongside Electronic production.",
        "Contemporary Folk": "Generally acoustic and rooted in modernized Traditional Folk Music; originated with the 20th-century American folk revival.",
        "Singer-Songwriter": "Heavily focused on lyrics and songwriting, with musical accompaniment tending to take lower precedence.",
        "Blues Rock": "Relies on the chords/scales and instrumental improvisation of Blues.",
        "Power Pop": "Combines 1960s Pop melodies with loud power chords; characterized by prominent, sometimes jangly electric guitars, clear vocals, crisp harmonies, and economical arrangements.",
        "Metalcore": "Drop-tuned guitar riffs, constant double kick drumming with varying tempos and techniques, breakdown sections, and screaming or shouting vocals.",
        "Rock Opera": "Hybrid of rock and, sometimes, musical theatre stylings with heavily rock-tinged songs combining to tell a coherent story.",
        "Symphonic Prog": "Incorporates Classical Music elements that can manifest in longer form works that deviate from traditional popular song structures, and the use of lush keyboards to replicate Orchestral Music textures.",
        "Acoustic Rock": "Rock with acoustic instrumentation, as opposed to the typical electric instrumentation.",
        "Post-Punk Revival": "Incorporating the sounds and aesthetics of Post-Punk into Indie Rock, with jagged guitarwork, a dominant and danceable rhythm section, clean production, and poppy song structures.",
        "New Wave": "Broad term referring to a variety of styles that saw popularity in the wake of the Punk Rock explosion of 1976-77, initially strongly associated with more accessible and stylish offshoots of punk; developed alongside Post-Punk, similarly emphasising freshness and daring.",
        "Slowcore": "Characterized by its subdued, often sombre songwriting and slow tempos, while taking primarily from genres like Dream Pop and Folk Rock.",
        "Blackgaze": "Fuses tremolo-picked riffing, intense drumming and harsh vocal techniques with mellow, dreamy textures, major-key melodies and extended build-ups.",
        "Poetry": "Encompasses many forms of literature that use style and rhythm to evoke ideas and emotions further than the prosaic meaning of the literature itself.",
        "New Age": "Broad genre centered on peaceful, meditative melodies, using a wide variety of instrumentation.",
        "Atmospheric Drum and Bass": "Prominent in the mid-1990s, uses faster, de-emphasized breakbeats, and places a greater focus on melodic elements such as slow, warm basslines and atmospheric melodies inspired by Ambient and Ambient House.",
        "Contemporary R&B": "Soulful, passionate and melismatic vocals originally derived from popular Soul and Disco, as well as smooth, lush and often synthesized production variously influenced by Hip Hop, Funk, and related strands of Pop.",
        "Chamber Folk": "Gentle fingerpicked acoustic guitar or harp-led music that commonly includes a backing ensemble of harpsichords, strings, horns, or other orchestral instruments.",
        "Alternative Dance": "Incorporates rhythms and synthesizers from Electronic Dance Music within the context of Alternative Rock and related styles; predominantly popular in the 1990s.",
        "Synthpop": "Led by melodic synthesizer sounds, often with reverberating drum machine patterns; commonly associated with the 1980s.",
        "Chillwave": "Emulates vintage aesthetics and popular musical styles of the 1980s/1990s altered by modern recording technology to create a hazy dreamlike atmosphere.",
        "Ethereal Wave": "Atmospheric guitar and synthesizer soundscapes, effects like reverb and delay, and commonly soprano female vocals to create a surreal, otherworldly effect.",
        "Psychedelic Soul": "Soul which incorporates the effects and instrumentation of Psychedelic Rock.",
        "Funk": "Danceable, syncopated grooves carried by bass and drums alongside percussive guitar, keyboard, and/or horn parts, with rhythmic emphasis on the downbeat.",
        "Grindcore": "Brief and intense song structures featuring a plethora of blast beats, down-tuned and tremolo-picked guitars, and abrasive, usually raw production.",
        "Slacker Rock": "Raw, noisy, and melodic, with a loose, blasé approach to performances and typically low-fidelity production.",
        "Alt-Country": "Arose in the 1980s and 1990s, performed by artists with roots in Alternative Rock and Indie Rock who were disconnected from the mainstream Country industry.",
        "Country Rock": "Combination of contemporary Rock with more traditional American Country.",
        "Jazz-Funk": "Jazz highly influenced by Funk.",
        "Jazz Fusion": "Near-universal usage of electric guitars and keyboards coupled with influences from genres such as Rock, Rhythm & Blues, Funk, and Traditional Folk Music, and a relative degree of harmonic simplicity.",
        "Space Age Pop": "Inspired by the excitement and optimism of the Space Age during the 1950s and 1960s, frequently experimenting with futuristic sounds made possible by contemporary technology.",
        "Neo-Soul": "Emerged during the mid-to-late 1990s; defined by a combination of Soul with the rhythmic percussion and groove of Hip Hop.",
        "Hip Hop": "Emerged primarily on the United States East Coast in African-American communities in the late 1970s; emphasizes rhythmic beat patterns and a type of spoken vocal delivery known as rapping."
    };

    // Old misspelled keys keep working.
    const ALIASES = {"Techincal Death Metal":"Technical Death Metal","Neo-Psyhedelia":"Neo-Psychedelia","Neo-Psyhedelic":"Neo-Psychedelic","Electropop:":"Electropop"};

    let custom = {};
    let index = null;

    function norm(s) { return String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9]+/g, ''); }

    function buildIndex() {
        index = new Map();
        for (const k of Object.keys(BUILTIN)) index.set(norm(k), { name: k, text: BUILTIN[k], custom: false });
        for (const k of Object.keys(ALIASES)) index.set(norm(k), index.get(norm(ALIASES[k])));
        for (const k of Object.keys(custom)) if (custom[k]) index.set(norm(k), { name: k, text: custom[k], custom: true });
    }

    function entry(name) { if (!index) buildIndex(); return index.get(norm(name)) || null; }
    function describe(name) { const e = entry(name); return e ? e.text : undefined; }
    function has(name) { return !!entry(name); }
    function names() {
        if (!index) buildIndex();
        return [...new Set([...index.values()].map(e => e.name))].sort((a, b) => a.localeCompare(b));
    }
    function setCustom(map) { custom = map && typeof map === 'object' ? map : {}; index = null; }
    function getCustom() { return custom; }

    // Up to `limit` genre names matching what is being typed.
    function suggest(query, limit) {
        const q = norm(query);
        if (!q) return [];
        const all = names();
        const starts = all.filter(n => norm(n).startsWith(q));
        const contains = all.filter(n => !norm(n).startsWith(q) && norm(n).includes(q));
        return starts.concat(contains).slice(0, limit || 6);
    }

    // `genreDescriptions[name]` — what the text templates use.
    const proxy = new Proxy({}, {
        get: (_, key) => (typeof key === 'string' ? describe(key) : undefined),
        has: (_, key) => typeof key === 'string' && has(key),
        ownKeys: () => names(),
        getOwnPropertyDescriptor: (_, key) => (has(key) ? { value: describe(key), enumerable: true, configurable: true } : undefined)
    });

    return { BUILTIN, describe, has, names, suggest, setCustom, getCustom, norm, proxy };
});
