//PP+ Programming Language + UI
//Miguel Rodríguez
//06-03-2026

// 

const consoleEl = document.getElementById("console");

function writeConsole(text) {
  consoleEl.textContent += text + "\n";
  consoleEl.scrollTop = consoleEl.scrollHeight;
}

function clearConsole() {
  consoleEl.textContent = "";
}

let it
let noErrors = true
let isPlaying = false
let automaticCompiling = true

const originalLog = console.log;

const buttonPlay = document.getElementById("buttonPlay");
const buttonStop = document.getElementById("buttonStop");
buttonPlay.addEventListener("click", play);
buttonStop.addEventListener("click", stop);
buttonStop.classList.toggle("active", true);

const buttonAutomaticCompiling = document.getElementById("buttonAutomaticCompiling");
buttonAutomaticCompiling.addEventListener("click", toggleAutomaticCompiling);

function play(){
    isPlaying = true
    updateCodeAndRun()
    buttonPlay.classList.toggle("active", true);
    buttonStop.classList.toggle("active", false);
}

function stop(){
    isPlaying = false
    buttonPlay.classList.toggle("active", false);
    buttonStop.classList.toggle("active", true);
}

function toggleAutomaticCompiling(){
    automaticCompiling = !automaticCompiling
    buttonAutomaticCompiling.textContent = automaticCompiling ? "Auto-refresh: On" : "Auto-refresh: Off"
    if(automaticCompiling){
        isPlaying = true
        updateCodeAndRun()
    }
}


console.log = (...args) => {
  const formatted = args.map(arg => {
    if (typeof arg === "array") {
      try {
        // pretty-print objects/arrays
        return JSON.stringify(arg, null, 2);
      } catch (e) {
        return String(arg); // fallback for circular refs
      }
    } 
    else {
      return String(arg);
    }
  }).join(" ");

  writeConsole(formatted + "\n");
  originalLog(...args);
};

let p5Obj = new p5((p) => {
   
    p.setup = function () {
        const container = document.getElementById("canvas-container");

        let savedCode = p.getItem('PP+SavedCode') ? p.getItem('PP+SavedCode') : sourceCode

        const canvas = p.createCanvas(
            container.clientWidth,
            container.clientHeight
        );

        canvas.parent("canvas-container");

        require(['vs/editor/editor.main'], function() {

            // Editor theme made with Claude Code
            monaco.languages.register({ id: "mylang" });

            monaco.languages.setLanguageConfiguration("mylang", {
                comments: {
                    lineComment: "##"
                },
                brackets: [
                    ["{", "}"],
                    ["(", ")"],
                    ["[", "]"]
                ],
                autoClosingPairs: [
                    { open: "{", close: "}" },
                    { open: "(", close: ")" },
                    { open: '"', close: '"' },
                    { open: "[", close: "]" }
                ],
                surroundingPairs: [
                    { open: "{", close: "}" },
                    { open: "(", close: ")" },
                    { open: '"', close: '"' },
                    { open: "[", close: "]" }
                ],
                indentationRules: {
                    // Indent after opening {
                    increaseIndentPattern: /^\s*.*\{\s*$/,
                    // Dedent on closing }
                    decreaseIndentPattern: /^\s*\}/
                },
                folding: {
                    markers: {
                        start: /\{/,
                        end: /\}/
                    }
                },
                onEnterRules: [
                    {
                        // When pressing Enter after {, auto-indent and place closing }
                        beforeText: /^\s*.*\{\s*$/,
                        afterText: /^\s*\}/,
                        action: { indentAction: monaco.languages.IndentAction.IndentOutdent }
                    },
                    {
                        // When pressing Enter after { with nothing after
                        beforeText: /^\s*.*\{\s*$/,
                        action: { indentAction: monaco.languages.IndentAction.Indent }
                    }
                ],
                wordPattern: /[a-zA-Z_][a-zA-Z0-9_]*/
            });

            monaco.languages.setMonarchTokensProvider("mylang", {
                keywords: [
                    "if", "else", "while", "for", "step",
                    "func", "ret", "break", "continue",
                    "match", "var", "boolean"
                ],

                builtins: Object.keys(ownFunctions),

                constants: [
                    "true", "false"
                ],

                operators: [
                    "+", "-", "*", "/", "%",
                    "=", "+=", "-=", "*=", "/=",
                    "++", "--",
                    "==", "!=", ">=", "<=", "<", ">",
                    "&&", "||", "!",
                    "->", "<-",
                    "|"
                ],

                tokenizer: {
                    root: [
                        // Whitespace
                        [/[ \t]+/, "white"],

                        // Comments
                        [/##.*$/, "comment"],

                        // Strings
                        [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],

                        // Numbers (int and float)
                        [/\d+\.\d*/, "number.float"],
                        [/\d+/, "number"],

                        // Arrow operators (before identifier rules)
                        [/->/, "operator.arrow"],
                        [/<-/, "operator.arrow"],

                        // Compound assignment operators
                        [/\+=/, "operator"],
                        [/-=/, "operator"],
                        [/\*=/, "operator"],
                        [/\/=/, "operator"],

                        // Increment / decrement
                        [/\+\+/, "operator"],
                        [/--/, "operator"],

                        // Comparison operators
                        [/==/, "operator.comparison"],
                        [/!=/, "operator.comparison"],
                        [/>=/, "operator.comparison"],
                        [/<=/, "operator.comparison"],
                        [/&&/, "operator.logical"],
                        [/\|\|/, "operator.logical"],

                        // Single-char operators
                        [/[+\-*/%]/, "operator"],
                        [/=/, "operator"],
                        [/[<>]/, "operator.comparison"],
                        [/!/, "operator.logical"],
                        [/\|/, "operator.pipe"],

                        // Underscore wildcard (used in match)
                        [/_\b/, "keyword.wildcard"],

                        // Keywords, builtins, constants, identifiers
                        [/[a-zA-Z][a-zA-Z0-9]*(\[\])?/, {
                            cases: {
                                "@keywords":  "keyword",
                                "@builtins":  "builtin",
                                "@constants": "constant",
                                "@default":   "identifier"
                            }
                        }],

                        // Brackets and delimiters
                        [/[{}]/, "delimiter.curly"],
                        [/[()]/, "delimiter.paren"],
                        [/[\[\]]/, "delimiter.square"],
                        [/,/, "delimiter"],
                        [/\./, "delimiter"],
                        [/:/, "delimiter"],
                    ],

                    string: [
                        [/[^"]+/, "string"],
                        [/"/,     { token: "string.quote", bracket: "@close", next: "@pop" }]
                    ]
                }
            });

            // Define a custom dark theme with distinct colours per token type
            monaco.editor.defineTheme("mylang-dark", {
                base: "vs-dark",
                inherit: true,
                rules: [
                    { token: "keyword",           foreground: "c792ea", fontStyle: "bold" },
                    { token: "keyword.wildcard",  foreground: "c792ea", fontStyle: "italic bold" },
                    { token: "builtin",           foreground: "82aaff" },
                    { token: "constant",          foreground: "ff9d55" },
                    { token: "identifier",        foreground: "eeffff" },
                    { token: "number",            foreground: "f78c6c" },
                    { token: "number.float",      foreground: "f78c6c" },
                    { token: "string",            foreground: "c3e88d" },
                    { token: "string.quote",      foreground: "c3e88d" },
                    { token: "comment",           foreground: "546e7a", fontStyle: "italic" },
                    { token: "operator",          foreground: "89ddff" },
                    { token: "operator.arrow",    foreground: "ffcb6b", fontStyle: "bold" },
                    { token: "operator.comparison", foreground: "89ddff" },
                    { token: "operator.logical",  foreground: "ff5370" },
                    { token: "operator.pipe",     foreground: "ffcb6b" },
                    { token: "delimiter.curly",   foreground: "ffffff" },
                    { token: "delimiter.paren",   foreground: "ffcb6b" },
                    { token: "delimiter.square",  foreground: "80cbc4" },
                    { token: "delimiter",         foreground: "89ddff" },
                ],
                colors: {
                    "editor.background":             "#0f1117",
                    "editor.foreground":             "#eeffff",
                    "editorLineNumber.foreground":   "#3a3f58",
                    "editorLineNumber.activeForeground": "#636d97",
                    "editor.lineHighlightBackground": "#1a1e2e",
                    "editorCursor.foreground":       "#c792ea",
                    "editor.selectionBackground":    "#2d3561",
                    "editor.inactiveSelectionBackground": "#1e2340",
                    "editorIndentGuide.background":  "#1e2340",
                    "editorIndentGuide.activeBackground": "#3a3f58",
                    "editorBracketMatch.background": "#2d3561",
                    "editorBracketMatch.border":     "#c792ea",
                }
            });

            window.monacoEditor = monaco.editor.create(
                document.getElementById("editor"),
                {
                    value: savedCode,
                    language: "mylang",
                    theme: "mylang-dark",
                    automaticLayout: true,
                    tabSize: 4,
                    insertSpaces: true,
                    detectIndentation: false,
                    trimAutoWhitespace: true,

                    // Quality-of-life improvements
                    fontSize: 14,
                    lineHeight: 22,
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                    fontLigatures: true,
                    minimap: { enabled: false},
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                    cursorBlinking: "phase",
                    cursorSmoothCaretAnimation: "on",
                    bracketPairColorization: { enabled: true },
                    guides: {
                        bracketPairs: true,
                        indentation: true
                    },
                    renderWhitespace: "selection",
                    wordWrap: "off",
                    folding: true,
                    foldingStrategy: "indentation",
                    showFoldingControls: "mouseover",
                    matchBrackets: "always",
                    suggest: {
                        showKeywords: true,
                        showSnippets: true,
                    },
                    quickSuggestions: {
                        other: true,
                        comments: false,
                        strings: false,
                    },
                    parameterHints: { enabled: true },
                    formatOnPaste: false,
                    formatOnType: false,
                    autoIndent: "full",
                    padding: { top: 16, bottom: 16 },
                    lineNumbers: "on",
                    glyphMargin: false,
                    contextmenu: true,
                    mouseWheelZoom: true,
                }
            );

            // Keyword + snippet completions
            monaco.languages.registerCompletionItemProvider("mylang", {
                provideCompletionItems(model, position) {
                    const word = model.getWordUntilPosition(position);
                    const range = {
                        startLineNumber: position.lineNumber,
                        endLineNumber:   position.lineNumber,
                        startColumn:     word.startColumn,
                        endColumn:       word.endColumn,
                    };

                    const kw = (label) => ({
                        label,
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: label,
                        range,
                    });

                    const snippet = (label, insertText, detail) => ({
                        label,
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText,
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        detail,
                        range,
                    });

                    let suggestions = [
                            // Plain keywords
                            kw("var"), kw("boolean"), kw("if"), kw("else"), kw("while"),
                            kw("for"), kw("step"), kw("func"), kw("ret"), kw("break"),
                            kw("continue"), kw("match"), kw("say"), kw("true"), kw("false"),

                            // Snippets
                            snippet("if",
                                "if (${1:condition}) {\n\t$0\n}",
                                "if statement"),

                            snippet("ifelse",
                                "if (${1:condition}) {\n\t$2\n} else {\n\t$0\n}",
                                "if / else statement"),

                            snippet("while",
                                "while (${1:condition}) {\n\t$0\n}",
                                "while loop"),

                            snippet("for",
                                "for ${1:i} = ${2:0} -> ${3:10} {\n\t$0\n}",
                                "for loop"),

                            snippet("forstep",
                                "for ${1:i} = ${2:0} -> ${3:10} step ${4:2} {\n\t$0\n}",
                                "for loop with step"),

                            snippet("func",
                                "func ${1:name}(${2:params}) {\n\t$0\n}",
                                "function declaration"),

                            snippet("match",
                                "match ${1:value} {\n\t${2:case}: $3\n\t_: $0\n}",
                                "match statement"),

                            snippet("say",
                                'say(${1:"Hello"})',
                                "print output"),
                    ]

                    for(let key of Object.keys(ownFunctions)) suggestions.push(kw(key))

                    return {
                        suggestions
                    };
                }
            });

            window.monacoEditor.onDidChangeModelContent(() => {
                if(automaticCompiling) updateCodeAndRun()
            });
        });

        updateCodeAndRun()
    };

    p.draw = function () {
        runDraw()
    };

    p.windowResized = function () {
        const container = document.getElementById("canvas-container");
        p.resizeCanvas(container.clientWidth, container.clientHeight);
        window.monacoEditor.layout();
    };

    function clearConsole() {
        consoleEl.textContent = "";
    }

});

function updateCodeAndRun(){
    try {
        clearConsole()
        const data = window.monacoEditor.getValue()
        p5Obj.storeItem('PP+SavedCode', data)
        it = new Interpreter()
        it.set(data)
        it.prepare()
        it.run()
        noErrors = true
    } 
    catch (e) {
        clearConsole()
        if(!e.cause || e.cause !== "expect") console.log(e);
        noErrors = false
    }
}

function runDraw(){
    if(noErrors && isPlaying){
        try{
            clearConsole()
            it.callFunc("draw")
            noErrors = true
        }
        catch(e){
            clearConsole()
            if(!e.cause || e.cause !== "expect") console.log(e);
            noErrors = false
        }
    }
}