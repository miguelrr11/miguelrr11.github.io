//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 1000
const HEIGHT = 800
let static
let angle
let len

let axiom = 'F++F++F'
let nGen = 4
let rules
let skip

let panel

let xOff = 0
let yOff = 0
let prevMouseX, prevMouseY

function mouseReleased(){
    prevMouseX = undefined
    prevMouseY = undefined
}

function mouseDragged(){
    if(inBoundsMIGUI(mouseX, mouseY, WIDTH, 0, WIDTH+310, HEIGHT)) return
    if(!prevMouseX) prevMouseX = mouseX
    if(!prevMouseY) prevMouseY = mouseY
    let dx = mouseX - prevMouseX; // Change in mouse X
    let dy = mouseY - prevMouseY; // Change in mouse Y
    xOff += dx;
    yOff += dy;
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    drawTree()
}

function setup(){
    createCanvas(WIDTH + 310, HEIGHT)
    static = createGraphics(WIDTH + 310, HEIGHT)
    static.background(0)

    //if(!getItem('Axiom')) storeItem('Axiom', 'X')

    panel = new Panel({
        x: WIDTH, 
        w: 310,
        title: "L-SYSTEM RENDERER",
        automaticHeight: false
    })
    panel.addText("Axiom:")         //0
    panel.addInput("", setVars, false)
    panel.addText("Rules:")         //1
    panel.addInput("", setVars, false)
    panel.addText("Angle:")         //2
    panel.addInput("", setVars, false)
    panel.addText("Length:")        //3
    panel.addInput("", setVars, false)
    panel.addText("Iterations:")    //4
    panel.addInput("", setVars, false)
    panel.addButton("Generate", setVars)

    panel.addSlider(0, 5, 1, "Scale", true, drawTree)
    panel.addColorPicker("Stroke color", drawTree)

    // panel.addColorPicker("Background color")
    // panel.addColorPicker("Accent color")

    panel.addText("\nExamples:")
    panel.addButton("Binary Tree", (f) => setVars({
        axiom: 'X',
        rules: 'X=F[-X][+X]',
        angle: 30,
        len: 20,
        nGen: 5
    }))
    panel.addButton("Wavy Tree", (f) => setVars({
        axiom: 'F',
        rules: 'F=FF+[+F-F-F]-[-F+F+F]',
        angle: 25,
        len: 4,
        nGen: 5
    }))
    panel.addButton("Arrow weed", (f) => setVars({
        axiom: 'X',
        rules: 'F=FF;X=F[+X][-X]FX',
        angle: 30,
        len: 5,
        nGen: 5
    }))
    panel.addButton("Koch Snowflake", (f) => setVars({
        axiom: 'F++F++F',
        rules: 'F=F-F++F-F',
        angle: 60,
        len: 5,
        nGen: 4
    }))
    panel.addButton("Dragon Curve", (f) => setVars({
        axiom: 'FX',
        rules: 'Y=-FX-Y;X=X+YF+',
        angle: 90,
        len: 5,
        nGen: 9
    }))
    panel.addButton("Sierpinski's Triangle", (f) => setVars({
        axiom: 'A',
        rules: 'B=-A+B+A-;A=+B-A-B+',
        angle: 60,
        len: 3,
        nGen: 7
    }))
    panel.addButton("Tail seaweed", (f) => setVars({
        axiom: 'F',
        rules: 'F=F[+F]F[-F]F',
        angle: 25,
        len: 5,
        nGen: 4
    }))
    panel.addButton("Gosper Curve", (f) => setVars({
        axiom: 'AB',
        rules: 'A=A-B--B+A++AA+B-;B=+A-BB--B-A++A+B',
        angle: 60,
        len: 5,
        nGen: 4
    }))
    panel.addButton("Island Curve", (f) => setVars({
        axiom: 'F-F-F-F',
        rules: 'F=F-b+FF-F-FF-Fb-FF+b-FF+F+FF+Fb+FFF;b= ',
        angle: 90,
        len: 5,
        nGen: 2
    }))
    panel.addButton("Penrose Tiling", (f) => setVars({
        axiom: '[7]++[7]++[7]++[7]++[7]',
        rules: '6=8!++9!----7![-8!----6!]++;7=+8!--9![---6!--7!]+;8=-6!++7![+++8!++9!]-;9=--8!++++6![+9!++++7!]--7!;!= ',
        angle: 36,
        len: 10,
        nGen: 5
    }))

    
    panel.addText("'!' Skips a character")
    panel.addText("'_' Moves without drawing")
    panel.addText("'[' Push()")
    panel.addText("']' Pop()")
    panel.addText("'+' Rotates to the right")
    panel.addText("'-' Rotates to the left")
    panel.addText("';' Separates a rule from another")
    panel.addText("Any other character draws a line")
    panel.addText("")

    setVars({
        axiom: 'X',
        rules: 'X=F[-X][+X]',
        angle: 30,
        len: 20,
        nGen: 5
    })

    
}



function setVars(properties = null) {
    if (properties) {
        axiom = properties.axiom;
        rules = createRulesFromString(properties.rules);
        angle = properties.angle;
        len = properties.len;
        nGen = properties.nGen;
        
        panel.setInputText(0, axiom);
        panel.setInputText(1, properties.rules);
        panel.setInputText(2, properties.angle.toString());
        panel.setInputText(3, len.toString());
        panel.setInputText(4, nGen.toString());

        panel.setSliderValue(0, 1)
    }

    else {
        axiom = panel.getInput(0);
        rules = createRulesFromString(panel.getInput(1));
        angle = +panel.getInput(2);
        len = +panel.getInput(3);
        nGen = +panel.getInput(4);
    }
    
    for (let i = 0; i < nGen; i++) {
        generate(axiom);
    }
    
    xOff = 0
    yOff = 0

    drawTree();
}


function createRulesFromString(str) {
    let rules = {};
    let pairs = str.split(';');
    
    pairs.forEach(pair => {
        let [key, value] = pair.split('=');
        if (key && value) {
            rules[key.trim()] = value.trim();
            panel.setText(14, "")
        }
        else panel.setText(14, "Rule: Syntax Error")
    });
    
    return rules;
}

function drawTree(){
    static.push()
    static.translate(WIDTH/2 + xOff, HEIGHT + yOff)
    //static.background(panel.getColor(0))
    //static.stroke(panel.getColor(1))
    static.background(0)
    static.stroke(panel.getColor(0))
    static.strokeWeight(1/panel.getValue(0))
    static.scale(panel.getValue(0))
    drawTreeFromRules(radians(angle), len)
    static.pop()
}

function draw(){
    image(static, 0, 0)

    panel.update()
    panel.show()
}

function drawTreeFromRules(angle, len){
    static.rotate(radians(-90))
    for(let i = 0; i < axiom.length; i++){
        let c = axiom.charAt(i)

        switch (c){
            case '!':
                break
            case '_':
                static.translate(len, 0)
                break
            case '+':
                static.rotate(angle)
                break
            case '-':
                static.rotate(-angle)
                break
            case '[':
                static.push()
                break
            case ']':
                static.pop()
                break
            default:
                static.line(0, 0, len, 0)
                static.translate(len, 0)
                break
        }
    }
}


function generate(){
    let next = ''
    for(let i = 0; i < axiom.length; i++){
        let c = axiom.charAt(i)
        if (rules[c]) {
            next += rules[c];
        }
        else next += c;
    }
    axiom = next
}