//
//Miguel Rodríguez
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

const originalLog = console.log;


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

        
        it = new Interpreter()
        try{
            clearConsole()
            runTests()
            it.set(savedCode)
            it.prepare()
            it.run()
            noErrors = true
        }
        catch(e){
            if(!e.cause || e.cause !== "expect") console.log(e);
            noErrors = false
        }
        

        require(['vs/editor/editor.main'], function() {

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
                    { open: '[', close: ']' }
                ]
                });

            monaco.languages.setMonarchTokensProvider("mylang", {
                tokenizer: {
                    root: [
                        [/\b(say|var|if|else|for|while|func|ret|match|_)\b/, "keyword"],
                        [/\d+/, "number"],
                        [/".*?"/, "string"],
                        [/##.*/, "comment"]
                    ]
                }
            });

            window.monacoEditor = monaco.editor.create(
                document.getElementById("editor"),
                {
                    value: savedCode,
                    language: "mylang",
                    theme: "vs-dark",
                    automaticLayout: true,
                    tabSize: 4,             // number of spaces per tab
                    insertSpaces: true,     // use spaces instead of tab characters
                    detectIndentation: false, // disable automatic indentation detection
                    trimAutoWhitespace: true  // remove extra auto-added whitespace
                }
            );

            window.monacoEditor.onDidChangeModelContent(() => {
                try {
                    clearConsole()
                    const data = window.monacoEditor.getValue()
                    p.storeItem('PP+SavedCode', data)
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
            });
        });
    };

    p.draw = function () {

        if(noErrors){
            try{
                it.callFunc("draw")
                noErrors = true
            }
            catch(e){
                clearConsole()
                if(!e.cause || e.cause !== "expect") console.log(e);
                noErrors = false
            }
        }
        
    };

    p.windowResized = function () {
        const container = document.getElementById("canvas-container");
        p.resizeCanvas(container.clientWidth, container.clientHeight);
    };

    function clearConsole() {
        consoleEl.textContent = "";
    }

});