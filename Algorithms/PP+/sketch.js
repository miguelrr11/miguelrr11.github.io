//PP+ Programming Language + UI
//Miguel Rodríguez
//06-03-2026 

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
let isShowingHelp = false

const originalLog = console.log;

const buttonPlay = document.getElementById("buttonPlay");
const buttonStop = document.getElementById("buttonStop");
buttonPlay.addEventListener("click", play);
buttonStop.addEventListener("click", stop);
buttonStop.classList.toggle("active", true);

const buttonAutomaticCompiling = document.getElementById("buttonAutomaticCompiling");
buttonAutomaticCompiling.addEventListener("click", toggleAutomaticCompiling);

const buttonShowHelp = document.getElementById("buttonShowHelp");
buttonShowHelp.addEventListener("click", toggleShowHelp)

const buttonLoadExample = document.getElementById("buttonLoadExample");
buttonLoadExample.addEventListener("click", loadExample)

let savedCode = ""

function toggleShowHelp(){
    if(!isShowingHelp){
        savedCode = window.monacoEditor.getValue()
        isShowingHelp = true
        buttonShowHelp.classList.toggle("active", true)
        showHelp()
    }
    else{
        isShowingHelp = false
        buttonShowHelp.classList.toggle("active", false)
        showCode()
    }
}

function loadExample(){
    window.monacoEditor.setValue(gameoflife)
}

function showHelp(){
    window.monacoEditor.setValue(guide)
}

function showCode(){
    window.monacoEditor.setValue(savedCode)
}

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

let lastlLogged = ""
let nRepetitions = 0
console.log = (...args) => {
  const formatted = typeof args == "object" ? args.map(arg => {
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
  }).join(" ") : args

  if(formatted === lastlLogged){
    nRepetitions++
  }
  else{
    nRepetitions = 0
  }
  lastlLogged = formatted

  let reps = nRepetitions > 0 ? ` (x${nRepetitions + 1})` : ""
  writeConsole(reps + formatted + "\n");
  originalLog(...args);
};

let p5Obj = new p5((p) => {
   
    p.setup = function () {
        const container = document.getElementById("canvas-container");

        p.frameRate(60)

        let savedCode = p.getItem('PP+SavedCode') ? p.getItem('PP+SavedCode') : sourceCode

        it = new Interpreter()
        it.set(savedCode)

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


});

function updateCodeAndRun(){
    if(isShowingHelp || !isPlaying) return
    try {
        const data = window.monacoEditor.getValue()
        p5Obj.storeItem('PP+SavedCode', data)
        it = new Interpreter()
        it.set(data)
        it.prepare()
        it.run()
        noErrors = true
    } 
    catch (e) {
        if(!e.cause || e.cause !== "expect") console.log(e);
        noErrors = false
    }
}

function runDraw(){
    if(noErrors && isPlaying){
        if(it.funcExisits("draw")){
            try{
                it.callFunc("draw", true)
                noErrors = true
            }
            catch(e){
                if(!e.cause || e.cause !== "expect") console.log(e);
                noErrors = false
            }
        }
        else{
            p5Obj.push()
            p5Obj.fill(255)
            p5Obj.noStroke()
            p5Obj.textSize(20)
            p5Obj.text("Call the function draw() to see something here!", 10, 20)
            p5Obj.pop()
        }
    }
}

let guide = `

## ==============================
##  Welcome to PP+ !!
## ==============================

## --- VARIABLES ---
## Declare with the "var" keyword, assign with =
var x = 10
var y = 3.14
var name = "Alice"
var flag = true

## Reassign anytime
x = 99

## --- OPERATORS ---
## Arithmetic: + - * / %
## Compound:   += -= *= /=
## Increment/Decrement: ++ --
x += 5
x++

## Comparison (use in conditions): == != < > <= >=
## Logical negation: !

## --- FUNCTIONS ---
func greet(name) {
    say("Hello, " + name)
}

greet("Alice")

## Return a value
func add(a, b) {
    ret a + b
}

var result = add(2, 3)

## --- IF / ELSE ---
if (x > 5) {
    say("big")
} else if (x == 5) {
    say("five")
} else {
    say("small")
}

## --- WHILE ---
while (x > 0) {
    x--
}

## --- FOR ---
## for(iterator start : end)  — iterator goes from start up to end
## Optional: step N
for(i 0 : 10) {
    say(i)
}

for(i 0 : 100 step 5) say(i)


## break and continue work inside loops

## --- ARRAYS ---
var nums = [1, 2, 3, 4]

## Access / assign by index
say(nums[0])
nums[0] = 99

## Push to end, pop from end
nums->(5)          ## push 5
var last = nums->  ## pop

## Unshift to front, shift from front
nums<-(0)          ## unshift 0
var first = <-nums  ## shift

## Length with pipes
say(|nums|)        ## prints 4

## Multidimensional
var grid = [[1,2],[3,4]]
say(grid[0][1])    ## 2

## --- MATCH (like switch) ---
## _ is the default case
match (x) {
    1 -> say("one")
    2 -> say("two")
    _ -> say("other")
}

## ==============================
##  BUILT-IN FUNCTIONS
## ==============================

## --- OUTPUT ---
say("Hello!")                  ## print to console

## ==============================
## P5js Wrapper Functions
## ==============================

## The function draw() is called internally 60 times a second, 
## make sure to include it in your program

func draw(){
    ## ...
}

## --- CANVAS / ENVIRONMENT ---
var w = width()
var h = height()
var f = frameCount()
frameRate(60)

## --- DRAWING: SHAPES --- 
rect(x, y, w, h)                    ## rectangle
ellipse(x, y, w, h)                 ## ellipse
circle(x, y, diameter)              ## circle
square(x, y, s, tl, tr, br, bl)     ## square (with optional corner radii)
triangle(x1, y1, x2, y2, x3, y3)
quad(x1, y1, x2, y2, x3, y3, x4, y4)
line(x1, y1, x2, y2)
point(x, y)
arc(x, y, w, h, start, stop)

## Custom shapes
beginShape()
vertex(x, y)
curveVertex(x, y)
endShape()

## --- DRAWING: COLOR & STROKE ---
fill(r, g, b)
noFill()
stroke(r, g, b, a)
strokeWeight(w)
noStroke()
background(r, g, b)
clear()                        ## resets background to default

## Color helpers
var c = color(r, g, b, a)
var c2 = lerpColor(c1, c2, 0.5)
colorMode(mode, max1, max2, max3, maxA)

## --- DRAWING: TRANSFORM ---
translate(x, y)
rotate(angle)                  ## angle in radians
scale(x, y)
push()                         ## save transform state
pop()                          ## restore transform state
resetMatrix()

## --- TEXT ---
text("hello", x, y)
textSize(24)
textAlign(LEFT, CENTER)
textFont("Arial")

## --- INPUT ---
var mx = mouseX()
var my = mouseY()
var held = keyIsDown(65)            ## 65 = key code for 'A'

## --- MATH ---
var r = random(0, 100)
var n = noise(x, y, z)              ## Perlin noise
var d = dist(x1, y1, x2, y2)
var m = map(value, 0, 100, 0, 1)    ## remap a value to a new range
var c = constrain(n, 0, 255)
var l = lerp(start, stop, 0.5)
radians(degrees)
sin(angle)
cos(angle)
abs(n)
floor(n)
ceil(n)
round(n)
sqrt(n)
pow(n, e)
min(a, b)
max(a, b)


`