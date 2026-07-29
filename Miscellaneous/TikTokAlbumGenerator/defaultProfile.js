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
            "year": 6,
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
    "text": "$(js: albumData.genre.split(/,s*/g)[0])$",
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
    "text": "<genre_1>",
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
    "text": "<info on genre_1>",
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
    "text": "<genre_2>",
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
    "text": "<info on genre_2>",
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