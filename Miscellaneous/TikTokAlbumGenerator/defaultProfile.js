let defaultProfileSaved = {
    "colorMap": {
        "GOAT": "#05668d",
        "PEAK": "#ffd21f",
        "EXCEPTIONAL": "#ff1fa9",
        "STRONG": "#bc3fde",
        "DECENT": "#38b6ff",
        "OKAY": "#14b60b",
        "FLOP": "#CC0000",
        "SHIT": "#7a4900",
        "INTERLUDE": "#b2b2b2",
        "None": "#5c5c5c"
    },
    "pages": [
                {
                    "id": "cover",
                    "name": "Cover",
                    "type": "cover",
                    "aspectRatio": "3:4"
                },
                {
                    "id": "page_1",
                    "name": "Context",
                    "type": "general",
                    "aspectRatio": "3:4",
                    "distances": {
                    "head": "custom_1785251657804",
                    "array": [
                        {
                        "key": "custom_1785251657804",
                        "val": {
                            "prevID": -1,
                            "nextID": "custom_1785251686697",
                            "distance": 7.034923127843655
                        }
                        },
                        {
                        "key": "custom_1785251686697",
                        "val": {
                            "prevID": "custom_1785251657804",
                            "nextID": "custom_1785251730029",
                            "distance": 55.08757482653999
                        }
                        },
                        {
                        "key": "custom_1785251730029",
                        "val": {
                            "prevID": "custom_1785251686697",
                            "nextID": "custom_1785251803030",
                            "distance": 17.582942883090595
                        }
                        },
                        {
                        "key": "custom_1785251803030",
                        "val": {
                            "prevID": "custom_1785251730029",
                            "nextID": "custom_1785251838428",
                            "distance": 19.923655564643354
                        }
                        },
                        {
                        "key": "custom_1785251838428",
                        "val": {
                            "prevID": "custom_1785251803030",
                            "nextID": "custom_1785251853712",
                            "distance": 15.950431648707877
                        }
                        },
                        {
                        "key": "custom_1785251853712",
                        "val": {
                            "prevID": "custom_1785251838428",
                            "nextID": "custom_1785251886944",
                            "distance": 15.201427366238931
                        }
                        },
                        {
                        "key": "custom_1785251886944",
                        "val": {
                            "prevID": "custom_1785251853712",
                            "nextID": "custom_1785251928912",
                            "distance": 40.79565339789531
                        }
                        },
                        {
                        "key": "custom_1785251928912",
                        "val": {
                            "prevID": "custom_1785251886944",
                            "nextID": "custom_1785251952709",
                            "distance": 12.75007579672183
                        }
                        },
                        {
                        "key": "custom_1785251952709",
                        "val": {
                            "prevID": "custom_1785251928912",
                            "nextID": -1,
                            "distance": -1
                        }
                        }
                    ]
                    }
                },
                {
                    "id": "ratings",
                    "name": "Ratings",
                    "type": "ratings",
                    "aspectRatio": "3:4"
                }
                ],
    "currentPageId": "page_1",
    "verticalOffsets": {
        "ratings": {
            "funfact": -28,
            "title": 100,
            "tracks": -22,
            "year": 3,
            "genre": 0
        },
        "cover": {
            "artist": -500,
            "title": 23
        }
    },
    "horizontalOffsets": {
        "ratings": {
            "artist": -46,
            "funfact": -46,
            "year": -46,
            "genre": -46,
            "tracks": -29
        },
        "cover": {
            "title": 0,
            "artist": 2597
        }
    },
    "textAligns": {
        "ratings": {
            "title": "left",
            "artist": "left",
            "year": "left",
            "genre": "left",
            "funfact": "justify"
        },
        "cover": {
            "title": "center",
            "artist": "center"
        }
    },
    "textSizeOffsets": {
        "title": 0,
        "artist": 4,
        "year": 0,
        "genre": 0,
        "funfact": -6
    },
    "textLeadingOffsets": {
        "funfact": -6
    },
    "maxTextboxWidths": {
        "title": 980,
        "artist": 480,
        "year": 480,
        "genre": 520,
        "funfact": 490
    },
    "imageSizeMultiplier": 0.95,
    "imageFormat": "jpg",
    "downloadImageOption": "all",
    "showGradeLegend": true,
    "transparentBackground": false,
    "tracksTextSize": 36,
    "tracksSpacing": -31,
    "tracksRectHeight": 28,
    "tracksTwoColumns": false,
    "customTextboxes": [
  {
    "color": "#f2f2f2",
    "fontSize": 48,
    "fontType": "fontRegularCondensed",
    "leading": 0,
    "maxWidth": 980,
    "text": "Album Review #nnn",
    "glitch": false,
    "pageId": "cover",
    "textAlign": "center",
    "x": 49,
    "y": 292,
    "id": "album_review"
  },
  {
    "color": "#ffffff",
    "fontSize": 24,
    "fontType": "fontRegularCondensed",
    "leading": 0,
    "maxWidth": 980,
    "text": "Songs added to GOAT Playlist: 1 (link in bio)",
    "glitch": false,
    "pageId": "ratings",
    "textAlign": "left",
    "x": 56.94990391440638,
    "y": 1284.4670669176778,
    "id": "songsAddedToGOATPlaylist"
  },
  {
    "color": "#cccccc",
    "fontSize": 30,
    "fontType": "fontLight",
    "leading": 0,
    "maxWidth": 980,
    "text": "$(js: albumData.genre.split(/,\\s*/g)[0])$",
    "glitch": false,
    "pageId": "cover",
    "textAlign": "center",
    "x": 55.02164222708063,
    "y": 1266.3363191721955,
    "id": "genreInCover"
  },
  {
    "color": "#ededed",
    "fontSize": 36,
    "fontType": "fontRegularCondensed",
    "leading": 0,
    "maxWidth": 980,
    "text": "$artist$, $year$",
    "glitch": false,
    "pageId": "cover",
    "textAlign": "center",
    "x": 50.7153196622437,
    "y": 1209.336460532268,
    "id": "artistAndYearInCover"
  },
  {
    "color": "#ffffff",
    "fontSize": 90,
    "fontType": "fontHeavy",
    "leading": 0,
    "maxWidth": 980,
    "text": "Some context",
    "glitch": true,
    "pageId": "page_1",
    "textAlign": "left",
    "x": 70.0083623892076,
    "y": 142.25235637708548,
    "id": "custom_1785251657804"
  },
  {
    "color": "#ffffff",
    "fontSize": 38,
    "fontType": "fontRegularCondensed",
    "leading": 0,
    "maxWidth": 980,
    "text": "before the review",
    "glitch": false,
    "pageId": "page_1",
    "textAlign": "left",
    "x": 70.12409777437438,
    "y": 218.2272895757299,
    "id": "custom_1785251686697"
  },
  {
    "color": "#ffffff",
    "fontSize": 42,
    "fontType": "fontHeavy",
    "leading": 0,
    "maxWidth": 980,
    "text": "the band",
    "glitch": false,
    "pageId": "page_1",
    "textAlign": "left",
    "x": 70,
    "y": 302.4608662180658,
    "id": "custom_1785251730029"
  },
  {
    "color": "#ffffff",
    "fontSize": 24,
    "fontType": "fontRegularCondensed",
    "leading": 2,
    "maxWidth": 920,
    "text": "<band info>",
    "glitch": false,
    "pageId": "page_1",
    "textAlign": "justify",
    "x": 70.18252248435874,
    "y": 351.4598132820646,
    "id": "custom_1785251803030"
  },
  {
    "color": "#ffffff",
    "fontSize": 42,
    "fontType": "fontHeavy",
    "leading": 0,
    "maxWidth": 980,
    "text": "the genres",
    "glitch": false,
    "pageId": "page_1",
    "textAlign": "left",
    "x": 69.7392914168405,
    "y": 389.7914697927529,
    "id": "custom_1785251838428"
  },
  {
    "color": "#dedede",
    "fontSize": 30,
    "fontType": "fontHeavy",
    "leading": 0,
    "maxWidth": 980,
    "text": "$(js: albumData.genre.split(/,\\s*/g)[0])$",
    "glitch": false,
    "pageId": "page_1",
    "textAlign": "left",
    "x": 70.29196061978621,
    "y": 445.5579033335506,
    "id": "custom_1785251853712"
  },
  {
    "color": "#ffffff",
    "fontSize": 24,
    "fontType": "fontLight",
    "leading": 0,
    "maxWidth": 920,
    "text": "$(js: genreDescriptions[albumData.genre.split(/,\\s*/g)[0]] ?? 'Sin descripción')$",
    "glitch": false,
    "pageId": "page_1",
    "textAlign": "justify",
    "x": 70,
    "y": 489.6793326834321,
    "id": "custom_1785251886944"
  },
  {
    "color": "#dedede",
    "fontSize": 30,
    "fontType": "fontHeavy",
    "leading": 0,
    "maxWidth": 980,
    "text": "$(js: albumData.genre.split(/,\\s*/g)[1])$",
    "glitch": false,
    "pageId": "page_1",
    "textAlign": "left",
    "x": 70.22735067453073,
    "y": 553.2269887973919,
    "id": "custom_1785251928912"
  },
  {
    "color": "#ffffff",
    "fontSize": 24,
    "fontType": "fontLight",
    "leading": 0,
    "maxWidth": 920,
    "text": "$(js: genreDescriptions[albumData.genre.split(/,\\s*/g)[1]] ?? 'Sin descripción')$",
    "glitch": false,
    "pageId": "page_1",
    "textAlign": "justify",
    "x": 69.97184567257568,
    "y": 595.437065585935,
    "id": "custom_1785251952709"
  }
],
    "customImages": [
        {
            "id": "img_1785251989928",
            "url": "",
            "x": 95.16164706074034,
            "y": 1041.7622828955944,
            "w": 890,
            "glitch": false,
            "pageId": "page_1"
        }
    ],
    "glitchOpts": {
            "sides": {"left": true, "right": true, "top": false, "bottom": false},
            "type": "sine",
            "amp": 50,
            "scale": 0.005,
            "symmetrical": false,
            "color": {"mode": "bloom+glow", "amount": 0.15, "tint": [255, 60, 180], "levels": 10, "shift": 60},
            "warp": {},
            "edges": {"mode": "noise", "sample": true, "scale": 0.04},
            "colEffOr": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        },
        "glitchOptsTitle": {
            "sides": {"left": true, "right": true, "top": false, "bottom": false},
            "type": "none",
            "amp": 60,
            "scale": 0.005,
            "symmetrical": false,
            "color": {"mode": "fade+bands", "amount": 0.85, "bandScale": 0.05, "bandSeed": 10, "tint": [255, 60, 180], "levels": 10, "shift": 60},
            "warp": {}
        }
}

let genreDescriptions = {
    "Progressive Rock": "Complex harmonies, instrumental virtuosity, and usually multi-section song structures featuring a broad range of instrumentation.",
    "Progressive Metal":  "Fuses amplified, guitar-driven sound with technical proficiency, virtuosity, complex compositions, innovative arrangements, eclecticism, and additional instrumentation.",
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
    "Techincal Death Metal": "Focuses on challenging, demanding songwriting and instrumental skill.",
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
    "Post-Metal": "Atmospheric and dense metallic riffs, unconventional songwriting, sonic experimentation, and adoption of eclectic influences.",
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
    "Brutal Death Metal": "Emphasizes abrasiveness, chunky rhythmic atonal riffs, and low guttural vocals.",
    "Downtempo": "Atmospheric and groove-based with relaxed tempos and mellow beats.",
    "Trip Hop": "Evokes a surreal, trippy, dreamy, and sometimes dark atmosphere with offbeat turntable scratches, light vocal melodies, and Hip Hop-influenced beats.",
    "Conscious Hip Hop": "Features lyrics about social issues.",
    "Southern Hip Hop": "Hip Hop from artists based in the Southern region of the United States.",
    "Hardcore Hip Hop": "Confrontation and aggression, whether in the lyricism, vocal delivery, hard beats, heavy production, or any combination thereof.",
    "Ambient": "Emphasizes texture and tone over traditional musical structure, aimed at evoking a particular atmosphere or mood.",
    "Dark Ambient": "Emphasizes an ominous, gloomy, and dissonant atmosphere.",
    "Neo-Psyhedelia": "Developments in Psychedelia since the early 1980s, building on the drug-inspired styles developed in the 1960s.",
    "Psychedelia": "Umbrella of styles intended to replicate or enhance the altered state of consciousness brought on by the use of psychedelic drugs, originating in the 1960s.",
    "Neo-Psyhedelic": "Developments in Psychedelia since the early 1980s, building on the drug-inspired styles developed in the 1960s.",
    "Psychedelic": "Umbrella of styles intended to replicate or enhance the altered state of consciousness brought on by the use of psychedelic drugs, originating in the 1960s.",
    "Jazz Rap": "Incorporates elements of Jazz through the use of samples or live instrumentation.",
    "Jangle Pop": "Treble-heavy guitars with arpeggiated melodies, distinct basslines, and often propulsive, repetitive strum-rhythms; frequently influenced by Post-Punk.",
    "Electropop:": "Dense, layered, and compressed production, usually coupled with a distinct fuzzy and \"warm\" low-frequency synthesizer style.",
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
    
}