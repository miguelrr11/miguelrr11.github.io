

/*
Caminos de operaciones de arrays, porque son un poco lio

Operacion   Sintaxis	    Camino

push()      arr->(x)	    parsePrimary → identifier case → arrow → lparen → ArrayPushUnshift push
unshift()   arr<-(x)	    parsePrimary → identifier case → arrow → lparen → ArrayPushUnshift unshift
push()      arr[i]->(x) 	parseArrayAssignment → parseArrayPushPopShiftUnshift → lparen → ArrayPushUnshift push
unshift()   arr[i]<-(x)	    parseArrayAssignment → parseArrayPushPopShiftUnshift → lparen → ArrayPushUnshift unshift
pop()       arr->	        parsePrimary → identifier case → arrow → no lparen → PopOperation
pop()       arr[i]->	    parseArrayAssignment → parseArrayPushPopShiftUnshift → no lparen → PopOperation
shift()     <-arr	        parsePrimary → <- check → ShiftOperation
shift()     <-arr[i]	    parsePrimary → <- check → collect indices → ShiftOperation
*/



const ownFunctions = {
    say: (...args) => {
        console.log(...args)
    },
    rect: (x, y, w, h) => {
        p5Obj.rect(x, y, w, h)
    },
    fill: (r, g, b) => {
        p5Obj.fill(r, g, b)
    },
    translate: (x, y) => {
        p5Obj.translate(x, y)
    },
    rotate: (angle) => {
        p5Obj.rotate(angle)
    },
    radians: (angle) => {
        return p5Obj.radians(angle)
    },
    cos: (angle) => {
        return Math.cos(angle)
    },
    sin: (angle) => {
        return Math.sin(angle)
    },
    random: (min, max) => {
        return p5Obj.random(min, max)
    },
    clear: () => {
        p5Obj.background(50)
    },
    noise: (x, y = undefined, z = undefined) => {
        return p5Obj.noise(x, y, z)
    },
    noStroke: () => {
        p5Obj.noStroke()
    },
    ellipse: (x, y, w, h = undefined) => {
        p5Obj.ellipse(x, y, w, h)
    },
    // Drawing shapes
    line: (x1, y1, x2, y2) => {
        p5Obj.line(x1, y1, x2, y2)
    },
    point: (x, y) => {
        p5Obj.point(x, y)
    },
    triangle: (x1, y1, x2, y2, x3, y3) => {
        p5Obj.triangle(x1, y1, x2, y2, x3, y3)
    },
    quad: (x1, y1, x2, y2, x3, y3, x4, y4) => {
        p5Obj.quad(x1, y1, x2, y2, x3, y3, x4, y4)
    },
    arc: (x, y, w, h, start, stop, mode = undefined) => {
        p5Obj.arc(x, y, w, h, start, stop, mode)
    },
    circle: (x, y, d) => {
        p5Obj.circle(x, y, d)
    },
    square: (x, y, s, tl, tr, br, bl) => {
        p5Obj.square(x, y, s, tl, tr, br, bl)
    },

    // Custom shapes
    beginShape: () => {
        p5Obj.beginShape()
    },
    endShape: (close = undefined) => {
        p5Obj.endShape(close)
    },
    vertex: (x, y) => {
        p5Obj.vertex(x, y)
    },
    curveVertex: (x, y) => {
        p5Obj.curveVertex(x, y)
    },

    // Stroke & fill
    stroke: (r, g, b, a = undefined) => {
        p5Obj.stroke(r, g, b, a)
    },
    strokeWeight: (w) => {
        p5Obj.strokeWeight(w)
    },
    noFill: () => {
        p5Obj.noFill()
    },

    // Transform
    push: () => {
        p5Obj.push()
    },
    pop: () => {
        p5Obj.pop()
    },
    scale: (x, y = undefined) => {
        p5Obj.scale(x, y)
    },
    resetMatrix: () => {
        p5Obj.resetMatrix()
    },

    // Text
    text: (str, x, y, w = undefined, h = undefined) => {
        p5Obj.text(str, x, y, w, h)
    },
    textSize: (size) => {
        p5Obj.textSize(size)
    },
    textAlign: (horizAlign, vertAlign = undefined) => {
        p5Obj.textAlign(horizAlign, vertAlign)
    },
    textFont: (font) => {
        p5Obj.textFont(font)
    },

    // Math / utils
    map: (value, start1, stop1, start2, stop2) => {
        return p5Obj.map(value, start1, stop1, start2, stop2)
    },
    constrain: (n, low, high) => {
        return p5Obj.constrain(n, low, high)
    },
    dist: (x1, y1, x2, y2) => {
        return p5Obj.dist(x1, y1, x2, y2)
    },
    lerp: (start, stop, amt) => {
        return p5Obj.lerp(start, stop, amt)
    },
    abs: (n) => Math.abs(n),
    floor: (n) => Math.floor(n),
    ceil: (n) => Math.ceil(n),
    round: (n) => Math.round(n),
    sqrt: (n) => Math.sqrt(n),
    pow: (n, e) => Math.pow(n, e),
    min: (...args) => Math.min(...args),
    max: (...args) => Math.max(...args),

    // Color
    color: (r, g, b, a = undefined) => {
        return p5Obj.color(r, g, b, a)
    },
    lerpColor: (c1, c2, amt) => {
        return p5Obj.lerpColor(c1, c2, amt)
    },
    colorMode: (mode, max1, max2, max3, maxA) => {
        p5Obj.colorMode(mode, max1, max2, max3, maxA)
    },

    // Image
    image: (img, x, y, w = undefined, h = undefined) => {
        p5Obj.image(img, x, y, w, h)
    },
    loadImage: (path, callback) => {
        return p5Obj.loadImage(path, callback)
    },
    tint: (r, g, b, a = undefined) => {
        p5Obj.tint(r, g, b, a)
    },
    noTint: () => {
        p5Obj.noTint()
    },

    // Canvas / environment
    background: (r, g, b) => {
        p5Obj.background(r, g, b)
    },
    frameRate: (fps = undefined) => {
        return fps !== undefined ? p5Obj.frameRate(fps) : p5Obj.frameRate()
    },
    width: () => p5Obj.width,
    height: () => p5Obj.height,
    frameCount: () => p5Obj.frameCount,

    // Input
    mouseX: () => p5Obj.mouseX,
    mouseY: () => p5Obj.mouseY,
    keyIsDown: (code) => {
        return p5Obj.keyIsDown(code)
    },
}

class Interpreter {
    constructor(){
        this.env = {}
    }

    set(sourceCode){
        this.env = { }
        this.sourceCode = sourceCode
    }

    prepare(){
        this.tokens = this.lex(this.sourceCode)
        this.ast = this.parse(this.tokens)
    }

    run(){
        return this.execute(this.ast)
    }

    callFunc(nodeObj){
        if(!nodeObj) return
        let node = nodeObj
        if(typeof node == "string"){
            node = {
                arguments: [],
                type: "FunctionCall",
                name: nodeObj
            }
        }
        let func
        func = this.env[node.name]
        if (!func) {
            throw new Error("Undefined function: " + node.name)
        }

        const previousEnv = this.env

        // Create child scope (lexical environment)
        //this is wrong because it elimintes changes done to global variables, lets fix it by only creating a child scope for the function parameters, and keeping the rest of the environment intact
        this.env = Object.create(previousEnv)

        // Bind parameters
        for (let i = 0; i < func.params.length; i++) {

            const param = func.params[i]
            const argNode = node.arguments[i]

            this.env[param] = this.execute(argNode)

        }

        // Execute function body
        const functionResult = this.execute(func.body)

        // Restore environment
        this.env = previousEnv

        // Handle return propagation
        if (functionResult && functionResult.type === "return") {
            return functionResult.value
        }

        return null
    }

    lookupVariable(name){
        let scope = this.env

        while(scope){
            if(Object.prototype.hasOwnProperty.call(scope, name)){
                return scope[name]
            }
            scope = Object.getPrototypeOf(scope)
        }

        throw new Error("Undefined variable: " + name)
    }

    searchFunctionCall(funcName){
        //searches in the programs body for a function call with the given name, and returns the node of the first one it finds, or null if it doesn't find any
        function searchNode(node){
            if(node.type === "FunctionCall" && node.name === funcName){
                return node
            }

            for(let key in node){
                if(node[key] && typeof node[key] === "object"){
                    let result = searchNode(node[key])
                    if(result) return result
                }
            }

            return null
        }

        return searchNode(this.ast)
    }

    assignVariable(name, value){
        let scope = this.env

        while(scope){
            if(Object.prototype.hasOwnProperty.call(scope, name)){
                scope[name] = value
                return value
            }

            scope = Object.getPrototypeOf(scope)
        }

        throw new Error("Variable not declared: " + name)
    }

    /*
    types:
        - plus
        - minus
        - multiply
        - divide
        - equals
        - plusEquals
        - minusEquals
        - multiplyEquals
        - divideEquals
        - number
        - boolean
        - declaration
        - identifier
        - condition
    */

    lex(text){
        let tokens = []
        let curPos = 0
        let lineIndex = 1
        while(curPos < text.length){
            let tokenStartPos = curPos
            let lookAhead = text.charAt(curPos)
            let lookTwoAhead = text.charAt(curPos+1) || ''
            if(lookAhead == ' ') curPos++
            else if(lookAhead == "|" && lookTwoAhead != "|"){
                curPos++
                tokens.push({type: 'pipe', value: '|', pos: tokenStartPos, line: lineIndex})
            }
            else if(lookAhead == '#' && lookTwoAhead == '#'){
                curPos++
                while(curPos < text.length && text.charAt(curPos) != '\n'){
                    curPos++
                }
            }
            else if(lookAhead == '+' && lookTwoAhead != '=' && lookTwoAhead != '+'){
                curPos++
                tokens.push({type: 'plus', value: '+', pos: tokenStartPos, line: lineIndex})
            }
            else if(lookAhead == '-' && lookTwoAhead != '=' && lookTwoAhead != '-' && lookTwoAhead != '>'){
                curPos++
                tokens.push({type: 'minus', value: '-', pos: tokenStartPos, line: lineIndex})
            }
            else if(lookAhead == '*' && lookTwoAhead != '='){
                curPos++
                tokens.push({type: 'multiply', value: '*', pos: tokenStartPos, line: lineIndex})
            }
            else if(lookAhead == '/' && lookTwoAhead != '='){
                curPos++
                tokens.push({type: 'divide', value: '/', pos: tokenStartPos, line: lineIndex})
            }
            else if(lookAhead == '%'){
                curPos++
                tokens.push({type: 'remainder', value: '%', pos: tokenStartPos, line: lineIndex})
            }
            else if(lookAhead == '=' && lookTwoAhead != '='){
                curPos++
                tokens.push({type: 'equals', value: '=', pos: tokenStartPos, line: lineIndex})
            }
            else if(lookAhead == '+' && lookTwoAhead == '='){
                curPos += 2
                tokens.push({type: 'plusEquals', value: '+=', pos: tokenStartPos, line: lineIndex})
            }
            else if(lookAhead == '+' && lookTwoAhead == '+'){
                curPos += 2
                tokens.push({type: 'increment', value: '++', pos: tokenStartPos, line: lineIndex})
            }
            else if(lookAhead == '-' && lookTwoAhead == '='){
                curPos += 2
                tokens.push({type: 'minusEquals', value: '-=', pos: tokenStartPos, line: lineIndex})
            }
            else if(lookAhead == '-' && lookTwoAhead == '-'){
                curPos += 2
                tokens.push({type: 'decrement', value: '--', pos: tokenStartPos, line: lineIndex})
            }
            else if(lookAhead == '*' && lookTwoAhead == '='){
                curPos += 2
                tokens.push({type: 'multiplyEquals', value: '*=', pos: tokenStartPos, line: lineIndex})
            }
            else if(lookAhead == '/' && lookTwoAhead == '='){
                curPos += 2
                tokens.push({type: 'divideEquals', value: '/=', pos: tokenStartPos, line: lineIndex})
            }
            else if(lookAhead == '=' && lookTwoAhead == '='){
                curPos += 2
                tokens.push({type: 'condition', value: '==', pos: tokenStartPos, line: lineIndex})
            }
            else if(lookAhead == '!' && lookTwoAhead == '='){
                curPos += 2
                tokens.push({type: 'condition', value: '!=', pos: tokenStartPos, line: lineIndex})
            }
            else if(lookAhead == '>' && lookTwoAhead == '='){
                curPos += 2
                tokens.push({type: 'condition', value: '>=', pos: tokenStartPos, line: lineIndex})
            }
            else if(lookAhead == '<' && lookTwoAhead == '='){
                curPos += 2
                tokens.push({type: 'condition', value: '<=', pos: tokenStartPos, line: lineIndex})
            }
            else if(lookAhead == '<' && lookTwoAhead != '=' && lookTwoAhead != '-'){
                curPos++
                tokens.push({type: 'condition', value: '<', pos: tokenStartPos, line: lineIndex})
            }
            else if(lookAhead == '>'){
                curPos++
                tokens.push({type: 'condition', value: '>', pos: tokenStartPos, line: lineIndex})
            }
            else if(lookAhead == '-' && lookTwoAhead == '>'){
                curPos += 2
                tokens.push({type: 'arrow', value: '->', pos: tokenStartPos, line: lineIndex})
            }
            else if(lookAhead == '<' && lookTwoAhead == '-'){
                curPos += 2
                tokens.push({type: 'arrow', value: '<-', pos: tokenStartPos, line: lineIndex})
            }
            else if(lookAhead == '&' && lookTwoAhead == '&'){
                curPos += 2
                tokens.push({type: 'condition', value: '&&', pos: tokenStartPos, line: lineIndex})
            }
            else if(lookAhead == '|' && lookTwoAhead == '|'){
                curPos += 2
                tokens.push({type: 'condition', value: '||', pos: tokenStartPos, line: lineIndex})
            }
            else if(isDigit(lookAhead)){
                let str = lookAhead
                curPos++
                while(curPos < text.length && (isDigit(text.charAt(curPos)) || text.charAt(curPos) == '.')){
                    str += text.charAt(curPos)
                    curPos++
                }
                tokens.push({type: 'number', value: str, pos: tokenStartPos, line: lineIndex})
            }
            else if(isLetter(lookAhead)){
                let str = lookAhead
                curPos++
                while(curPos < text.length && isLetterOrDigit(text.charAt(curPos))){
                    str += text.charAt(curPos)
                    curPos++
                }
                if(text.charAt(curPos) == '[' && text.charAt(curPos+1) == ']') {str += '[]'; curPos += 2} // for array declarations
                let type = ''
                switch (str){
                    case 'true':
                        type = 'boolean'
                        break
                    case 'false':
                        type = 'boolean'
                        break
                    case 'var':
                        type = 'declaration'
                        break
                    case 'boolean':
                        type = 'declaration'
                        break
                    case 'if':
                        type = 'if'
                        break
                    case 'else':
                        type = 'else'
                        break
                    case 'while':
                        type = 'while'
                        break
                    case 'func':
                        type = 'functionDeclaration'
                        break
                    case 'ret':
                        type = 'return'
                        break
                    case 'break':
                        type = 'break'
                        break
                    case 'continue':
                        type = 'continue'
                        break
                    case 'for':
                        type = 'for'
                        break
                    case 'step':
                        type = 'step'
                        break
                    case 'match':
                        type = 'match'
                        break
                    default:
                        if(str in ownFunctions){
                            type = 'ownFunction'
                        }
                        else type = 'identifier'
                }
                tokens.push({type: type, value: str, pos: tokenStartPos, line: lineIndex})
            }
            else if(lookAhead == '"'){
                curPos++
                let string = ''
                while(curPos < text.length && text.charAt(curPos) != '"'){
                    string += text.charAt(curPos)
                    curPos++
                }
                if(text.charAt(curPos) != '"'){
                    console.log('Unterminated string at col: ' + tokenStartPos)
                    return
                }
                curPos++
                tokens.push({type: 'string', value: string, pos: tokenStartPos, line: lineIndex})
            }
            else if(lookAhead === '!'){
                curPos++
                tokens.push({type:'not', value:'!', pos: tokenStartPos, line: lineIndex})
            }
            else if(lookAhead === '('){
                curPos++
                tokens.push({type: 'lparen', value: '(', pos: tokenStartPos, line: lineIndex})
            }
            else if(lookAhead === ')'){
                curPos++
                tokens.push({type: 'rparen', value: ')', pos: tokenStartPos, line: lineIndex})
            }
            else if(lookAhead === '{'){
                curPos++
                tokens.push({type: 'lbrack', value: '{', pos: tokenStartPos, line: lineIndex})
            }
            else if(lookAhead === '}'){
                curPos++
                tokens.push({type: 'rbrack', value: '}', pos: tokenStartPos, line: lineIndex})
            }
            else if(lookAhead === ','){
                curPos++
                tokens.push({type: 'comma', value: ',', pos: tokenStartPos, line: lineIndex})
            }
            else if(lookAhead === '_'){
                curPos++
                tokens.push({type: 'underscore', value: '_', pos: tokenStartPos, line: lineIndex})
            }
            else if(lookAhead === '\n'){
                curPos++
                tokens.push({type: 'newline', value: '\n', pos: tokenStartPos, line: lineIndex})
                lineIndex++
            }
            else if (lookAhead === '[') {
                tokens.push({
                    type: 'lArr',
                    value: '[',
                    pos: tokenStartPos,
                    line: lineIndex,
                });

                curPos++;
            }
            else if (lookAhead === ']') {
                tokens.push({
                    type: 'rArr',
                    value: ']',
                    pos: tokenStartPos,
                    line: lineIndex,
                });

                curPos++;
            }
            else if (lookAhead === '.'){
                curPos++
                tokens.push({type: 'dot', value: '.', pos: tokenStartPos, line: lineIndex})
            }
            else if(lookAhead === ':'){
                curPos++
                tokens.push({type: 'colon', value: ':', pos: tokenStartPos, line: lineIndex})
            }
            else {
                console.log('Unknown character: ' + lookAhead + ' at col: ' + curPos)
                return
            }

        }
        tokens.push({type: 'EOF', value: '\n', pos: curPos, line: lineIndex})
        return tokens
    }

    parse(tokens){
        let current = 0;
        let loopDepth = 0

        function skipNewlines(){
            while(peek().type === "newline"){
                consume()
            }
        }

        function peek(overflow = 0){
            return tokens[current + overflow]
        }

        function consume(){
            return tokens[current++]
        }

        function expect(type){
            let token = peek()
            if(token.type !== type){
                throw new Error("Expected " + type + " but got " + token.type + " ln " + token.line + " col " + token.pos, {cause: 'expect'})
            }
            return consume()
        }

        function parseProgram(){
            let body = []

            skipNewlines()

            while(peek().type !== "EOF"){

                let stmt = parseStatement()
                body.push(stmt)

                skipNewlines()
            }

            return {
                type: "Program",
                body: body
            }
        }

        function parseStatement(){

            if(peek().type === "declaration"){
                return parseDeclaration()
            }

            //var num = 5
            if(peek().type === "identifier" && peek(1)?.type === "equals"){
                return parseAssignment()
            }

            //arr[i] = 5
            //arr[i]->(x) or arr[i]<-(x)
            if(peek().type === "identifier" && peek(1)?.type === "lArr"){
                return parseArrayAssignment()
            }

            if(peek().type === "if"){

                consume() // if
                expect("lparen") // (
                let condition = parseExpression()
                expect("rparen") // )

                let body = []

                if(peek().type === "lbrack"){ // {
                    consume()

                    

                    skipNewlines()

                    while(peek().type !== "rbrack"){
                        body.push(parseStatement())
                        skipNewlines()
                    }

                    expect("rbrack") // }
                }
                else {
                    // single statement body (no brackets)
                    body = [parseStatement()]
                }
                skipNewlines()


                // check for else if
                let alternate = null

                if (peek().type === "else") {

                    consume() // else

                    if (peek().type === "if") {

                        // else if → recursive parsing

                        alternate = parseStatement()

                    } 
                    else {
                        let elseBody = []

                        if(peek().type === "lbrack"){ // {
                            consume()

                            

                            skipNewlines()

                            while (peek().type !== "rbrack") {
                                elseBody.push(parseStatement())
                                skipNewlines()
                            }

                            expect("rbrack")
                        }
                        else {
                            // single statement body (no brackets)
                            elseBody = [parseStatement()]
                        }

                        alternate = {
                            type: "BlockStatement",
                            body: elseBody
                        }
                    }
                }
                skipNewlines()

                return {
                    type: "IfStatement",
                    condition: condition,
                    body: {
                        type: "BlockStatement",
                        body
                    },
                    alternate: alternate
                }
            }

            if(peek().type === "while"){

                consume() // while
                expect("lparen") // (
                let condition = parseExpression()
                expect("rparen") // )
                let body = []

                if(peek().type === "lbrack"){ // {
                    consume()
                    loopDepth++

                    

                    skipNewlines()

                    while (peek().type !== "rbrack") {
                        body.push(parseStatement())
                        skipNewlines()
                    }

                    expect("rbrack")
                }
                else{
                    // single statement body (no brackets)
                    loopDepth++
                    body = [parseStatement()]
                }

                loopDepth--

                return {
                    type: "WhileStatement",
                    condition: condition,
                    body: {
                        type: "BlockStatement",
                        body  
                    }
                }
            }

            if(peek().type === "for"){
                consume()
                expect("lparen")
                let iterator = parseDeclaration(true)
                let startLoop = parseExpression()
                expect("colon")
                let endLoop = parseExpression()
                let step = 1
                if(peek().type === "step"){
                    consume()
                    step = parseExpression()
                }
                expect("rparen")
                let body = []
                if(peek().type === "lbrack"){ // {
                    consume()
                    loopDepth++

                    

                    skipNewlines()

                    while (peek().type !== "rbrack") {
                        body.push(parseStatement())
                        skipNewlines()
                    }

                    expect("rbrack")
                }
                else{
                    // single statement body (no brackets)
                    loopDepth++
                    body = [parseStatement()]
                }

                loopDepth--

                let forObj = {
                    type: "ForStatement",
                    startLoop: startLoop,
                    endLoop: endLoop,
                    step: step,
                    iterator: iterator,
                    body: {
                        type: "BlockStatement",
                        body  
                    }
                }

                return forObj

            }

            if(peek().type === "functionDeclaration"){

                consume() // func
                let id = consume()

                if(id.type == "ownFunction"){ 
                    console.log("Error: declaring a built-in function (" + id.value + ")")
                    return
                }

                expect("lparen") // (

                let params = []

                if(peek().type !== "rparen"){
                    params.push(expect("identifier").value)
                    while(peek().type === "comma"){
                        consume() // ,
                        params.push(expect("identifier").value)
                    }
                }

                expect("rparen") // )
                let body = []
                if(peek().type === "lbrack"){ // {
                    consume()
                    

                    skipNewlines()

                    while(peek().type !== "rbrack"){
                        body.push(parseStatement())
                        skipNewlines()
                    }

                    expect("rbrack") // }
                }
                else{
                    // single statement body (no brackets)
                    body = [parseStatement()]
                }

                return {
                    type: "FunctionDeclaration",
                    name: id.value,
                    params: params,
                    body: {
                        type: "BlockStatement",
                        body
                    }
                }
            }

            if (peek().type === "return") {

                consume() // return

                let value = null

                if (peek().type !== "newline" && peek().type !== "rbrack") {
                    value = parseExpression()
                }

                return {
                    type: "ReturnStatement",
                    value: value
                }
            }

            if(peek().type === 'break'){
                if(loopDepth === 0){
                    throw new Error("Break statement not within loop")
                }
                consume()
                return {
                    type: "break"
                }
            }

            if(peek().type === 'continue'){
                if(loopDepth === 0){
                    throw new Error("Continue statement not within loop")
                }
                consume()
                return {
                    type: "continue"
                }
            }

            if(peek().type === 'match'){
                consume() // match
                expect("lparen")
                let baseComparison = parseExpression()
                expect("rparen")
                expect("lbrack")
                skipNewlines()
                let matches = []
                while(peek().type !== "rbrack"){
                    let match
                    if(peek().type == "underscore"){
                        match = "default"
                        consume()
                    }
                    else{
                        match = parseExpression()
                    }
                    expect("arrow")
                    let action = parseStatement()
                    matches.push({match, action})
                    skipNewlines()
                }
                expect("rbrack")
                return {
                    type: "MatchStatement",
                    baseComparison,
                    matches
                }
            }

            if(peek().type === 'lbrack'){
                expect("lbrack") // {

                let body = []

                skipNewlines()

                while(peek().type !== "rbrack"){
                    body.push(parseStatement())
                    skipNewlines()
                }

                expect("rbrack") // }

                return {
                    type: "BlockStatement",
                    body
                }
            }

            return parseExpression()
        }

        function parseDeclaration(isForLoop = false){

            if(!isForLoop) consume() // declaration keyword: number
            let id = expect("identifier")

            let initializer = null

            if(peek().type === "equals"){
                consume() // =
                initializer = parseExpression()
            }

            return {
                type: "VariableDeclaration",
                identifier: id.value,
                value: initializer
            }
        }

        function parseAssignment(){

            let id = consume()
            consume() // =

            let expr = parseExpression()

            return {
                type: "AssignmentExpression",
                identifier: id.value,
                value: expr
            }
        }

        function parseArrayAssignment(){
            let id = consume() // array name

            // this saves all indices in case of multiple dimensions, 
            // for example arr[i][j] would have indices [i, j]
            // (i and j being expressions)
            let index = []
            while(peek().type === "lArr"){
                consume()
                index.push(parseExpression())
                expect("rArr") // ]
            } // [
            
            if(peek().type === 'equals'){
                consume() // =
                let value = parseExpression()
                return {
                    type: "ArrayAssignmentExpression",
                    identifier: id.value,
                    index: index,
                    value: value
                }
            }
            else if(peek().type === "arrow"){
                return parseArrayPushPopShiftUnshift(id, index)
            }
        }

        function parseArrayPushPopShiftUnshift(id, index){
            let arrow = consume() //consume arrow (left or right)

            //now either we have a push/unshift operation (arr->(x) or arr<-(x))
            //or we have a pop/shift operation (arr-> or arr<-)

            if(peek().type == 'lparen'){
                //push/unshift operation
                consume('lparen')

                let element = parseExpression()
            
                expect('rparen')

                let node = {
                    type: "ArrayPushUnshift",
                    array: id.value,
                    elementToBeAdded: element,
                    operation: arrow.value == '->' ? 'push' : 'unshift',
                    index: index
                }

                return node
            }
            else {
                if(arrow.value !== '->'){
                    throw new Error("Invalid syntax: did you mean <-" + id.value + "?")
                }
                return {
                    type: "PopOperation",
                    array: id.value,
                    index: index && index.length > 0 ? index : null
                }
            }
        }

        function parseExpression() {
            return parseCondition()
        }

        function parseCondition(){

            let node = parseAdditive()

            while(
                peek().type === "condition"
            ){

                let operator = consume()
                let rightNode = parseAdditive()

                node = {
                    type: "ConditionExpression",
                    operator: operator.value,
                    left: node,
                    right: rightNode
                }
            }

            return node
        }

        function parseAdditive() {

            let node = parseMultiplicative()

            while(peek().type === "plus" || peek().type === "minus"){

                let operator = consume()

                let rightNode = parseMultiplicative()

                node = {
                    type: "BinaryExpression",
                    operator: operator.value,
                    left: node,
                    right: rightNode
                }
            }

            while(peek().type === "plusEquals" || peek().type === "minusEquals" || peek().type === "multiplyEquals" || peek().type === "divideEquals"){
                let operator = consume()
                let rightNode = parseMultiplicative()

                let binaryOperator

                switch(operator.type){
                    case "plusEquals": binaryOperator = "+"
                        break
                    case "minusEquals": binaryOperator = "-"
                        break
                    case "multiplyEquals": binaryOperator = "*"
                        break
                    case "divideEquals": binaryOperator = "/"
                        break
                }

                node = {
                    type: "AssignmentExpression",
                    operator: operator.value,
                    identifier: node.type === "Identifier" ? node.name : (() => {throw new Error("Left-hand side of assignment must be an identifier")})(),
                    value: {
                        type: "BinaryExpression",
                        operator: binaryOperator,
                        left: node,
                        right: rightNode
                    }
                }
            }

            while(peek().type === "increment" || peek().type === "decrement"){
                let operator = consume()

                let binaryOperator = operator.type === "increment" ? "+" : "-"

                node = {
                    type: "AssignmentExpression",
                    operator: operator.value,
                    identifier: node.type === "Identifier" ? node.name : (() => {throw new Error("Left-hand side of assignment must be an identifier")})(),
                    value: {
                        type: "BinaryExpression",
                        operator: binaryOperator,
                        left: node,
                        right: {
                            type: "Literal",
                            value: 1
                        }
                    }
                }
            }

            return node
        }

        function parseMultiplicative(){

            let node = parseUnary()

            while(peek().type === "multiply" || peek().type === "divide" || peek().type === "remainder"){

                let operator = consume()

                let rightNode = parseUnary()

                node = {
                    type: "BinaryExpression",
                    operator: operator.value,
                    left: node,
                    right: rightNode
                }
            }

            return node
        }

        function parseUnary(){

            let token = peek()

            if(token.type === "minus" || token.type === "not"){
                consume()

                return {
                    type: "UnaryExpression",
                    operator: token.type,
                    argument: parseUnary()
                }
            }

            return parsePrimary()
        }

        function parsePrimary(){

            let token = peek()

            
            //say()
            if(peek().type === "ownFunction"){

                let name = peek().value

                consume()
                expect("lparen") // (

                let args = []

                if(peek().type !== "rparen"){
                    args.push(parseExpression())
                    while(peek().type === "comma"){
                        consume() // ,
                        args.push(parseExpression())
                    }
                }

                expect("rparen") // )

                return {
                    type: "OwnFunctionCall",
                    name: name,
                    arguments: args
                }
            }

            if(token.type === "number"){
                consume()
                return {
                    type: "Literal",
                    value: Number(token.value)
                }
            }

            if(token.type === "string"){
                consume()
                return {
                    type: "Literal",
                    value: token.value
                }
            }

            //<-arr or <-arr[i][j] (shift)
            if(peek().type === "arrow" && peek().value === "<-" && peek(1)?.type === "identifier"){
                consume() // <-
                let id = consume()
                let index = []
                while(peek().type === "lArr"){
                    consume()
                    index.push(parseExpression())
                    expect("rArr")
                }
                return {
                    type: "ShiftOperation",
                    array: id.value,
                    index: index.length > 0 ? index : null
                }
            }

            if(token.type === "identifier"){

                consume()

                // function call
                if(peek().type === "lparen"){
                    consume()
                    let args = []
                    if(peek().type !== "rparen"){
                        args.push(parseExpression())
                        while(peek().type === "comma"){
                            consume()
                            args.push(parseExpression())
                        }
                    }
                    expect("rparen")
                    return {
                        type: "FunctionCall",
                        name: token.value,
                        arguments: args
                    }
                }

                // collect array indices (if any)
                let index = []
                while(peek().type === "lArr"){
                    consume()
                    index.push(parseExpression())
                    expect("rArr")
                }

                // after indices, check for arrow operations (push/pop/unshift/shift)
                if(peek().type === "arrow"){
                    let arrow = consume()
                    if(peek().type === "lparen"){
                        // push or unshift: arr->(x) or arr[i]->(x)
                        consume() // lparen
                        let element = parseExpression()
                        expect("rparen")
                        return {
                            type: "ArrayPushUnshift",
                            array: token.value,
                            elementToBeAdded: element,
                            operation: arrow.value === '->' ? 'push' : 'unshift',
                            index: index.length > 0 ? index : null
                        }
                    } else {
                        // pop or shift: arr-> or arr[i]->
                        return {
                            type: arrow.value === '->' ? "PopOperation" : "ShiftOperation",
                            array: token.value,
                            index: index.length > 0 ? index : null
                        }
                    }
                }

                if(index.length > 0){
                    return {
                        type: "ArrayAccess",
                        array: token.value,
                        index
                    }
                }

                return {
                    type: "Identifier",
                    name: token.value
                }
            }

            if(token.type === "boolean"){
                consume()
                return {
                    type: "Literal",
                    value: token.value === "true"
                }
            }

            if(token.type === "lparen"){
                consume() // (

                let expr = parseExpression()

                expect("rparen") // )

                return expr
            }

            if (token.type === "lArr") {
                consume() // [
                let elements = []
                skipNewlines()
                if (peek().type !== "rArr") {
                    elements.push(parseExpression())
                    while (peek().type === "comma") {
                        consume()
                        skipNewlines()
                        elements.push(parseExpression())
                    }
                }
                expect("rArr") // ]
                return {
                    type: "ArrayLiteral",
                    elements
                }
            }

            if(token.type === "pipe"){
                consume()
                let element = parseExpression()
                expect("pipe")
                return {
                    type: "LengthOperation",
                    element: element
                }
            }
    
            throw new Error("Unexpected token: " + token.value + " ln " + token.line + " col " + token.pos)
        }

        return parseProgram()
    }
 
    execute(node){

        switch(node.type){

            case "break":
                return {
                    type: "break"
                }

            case "continue":
                return {
                    type: "continue"
                }

            case "BlockStatement":

                let blockResult;

                for (const stmt of node.body) {

                    blockResult = this.execute(stmt)

                    if (blockResult && (
                        blockResult.type === "return" ||
                        blockResult.type === "break" ||
                        blockResult.type === "continue"
                    )) {
                        return blockResult
                    }
                }

                return blockResult

            case "ReturnStatement":
                return {
                    type: "return",
                    value: node.value ? this.execute(node.value) : null
                }

            case "Program":
                let result;
                for(let stmt of node.body){
                    result = this.execute(stmt)
                }
                return result


            case "VariableDeclaration":
                if(node.value){
                    this.env[node.identifier] = this.execute(node.value)
                }
                else{
                    this.env[node.identifier] = null
                }
                return this.env[node.identifier]

            case "AssignmentExpression":
                let val = this.execute(node.value)
                return this.assignVariable(node.identifier, val)

            case "ArrayAssignmentExpression": {
                let arr = this.lookupVariable(node.identifier)
                if (!arr || !Array.isArray(arr)) {
                    throw new Error(node.identifier + " is not an array")
                }
                let valArr = this.execute(node.value)
                let subArrayAA = arr
                for (let i = 0; i < node.index.length - 1; i++) {
                    let idx = this.execute(node.index[i])
                    if (!Array.isArray(subArrayAA[idx])) {
                        throw new Error("Index does not point to an array")
                    }
                    subArrayAA = subArrayAA[idx]
                }

                let lastIdx = this.execute(node.index[node.index.length - 1])
                subArrayAA[lastIdx] = valArr
                return valArr
            }

            case "BinaryExpression":

                let left = this.execute(node.left)
                let right = this.execute(node.right)

                switch(node.operator){
                    case "+": return left + right
                    case "-": return left - right
                    case "*": return left * right
                    case "/": return left / right
                    case "%": return left % right
                }

                throw new Error("Unknown operator " + node.operator)

            case "ConditionExpression":

                let l = this.execute(node.left)
                let r = this.execute(node.right)

                switch(node.operator){
                    case ">": return l > r
                    case "<": return l < r
                    case "==": return l === r
                    case "!=": return l !== r
                    case ">=": return l >= r
                    case "<=": return l <= r
                    case "&&": return l && r
                    case "||": return l || r
                }
                throw new Error("Unknown condition operator " + node.operator)

            case "IfStatement":

                if (this.execute(node.condition)) {
                    return this.execute(node.body)
                }

                if (node.alternate) {
                    return this.execute(node.alternate)
                }
                return
            
            case "WhileStatement":

               while (this.execute(node.condition)) {

                    let result = this.execute(node.body)

                    if (result && result.type === "return") {
                        return result
                    }

                    if (result && result.type === "break") {
                        return
                    }

                    if (result && result.type === "continue") {
                        continue
                    }
                }

                return

            /*
            possible syntaxes:
                for(<variable_name> <start (expression)>:<end (expression)> step <step (expression)>)
                for(<variable_name> <expression>:<expression>)

                examples:
                    for(i 0:10 step 2){...}
                    for(j 10:getEnd() step -1){...}
                    for(k 0:100 step getStep()){...}

                the variable doesnt need a declaration (var not needed)
                step is optional, it defaults to 1
                getEnd can be 2 things:
                    - a number: when the iterator reaches it, the loop ends
                    - a boolean: if false, the loop ends

                IMPORTANT DESIGN CHOICES:
                    - the Start Index expression is executed ONCE
                    - the End Index expression is executed EVERY ITERATION
                    - the Step expression is executed ONCE

                to make this an infinite loop just put step to 0 or a false condition for the end index
            */
            case "ForStatement":
                this.execute(node.iterator)

                let start = this.execute(node.startLoop)
                let step = typeof node.step == 'number' ? node.step : this.execute(node.step)

                this.env[node.iterator.identifier] = start

                while (true) {
                    let end = this.execute(node.endLoop)
                    let i = this.env[node.iterator.identifier]

                    let condition =
                        (typeof end === "number" && (
                            (step > 0 && i < end) ||
                            (step < 0 && i > end)
                        )) ||
                        (typeof end === "boolean" && end) ||
                        (step == 0)

                    if (!condition) break

                    let result = this.execute(node.body)

                    if (result?.type === "return") return result
                    if (result?.type === "break") return
                    if (result?.type === "continue") continue

                    this.env[node.iterator.identifier] += step
                }

                return

            case "Literal":
                return node.value


            case "Identifier":
                return this.lookupVariable(node.name)
            
            case "UnaryExpression":

                let arg = this.execute(node.argument)
                
                switch(node.operator){
                    case "minus": return -arg
                    case "not": return !arg
                }

            case "OwnFunctionCall":

                let args = node.arguments.map(arg => this.execute(arg))

                if(node.name in ownFunctions){
                    return ownFunctions[node.name](...args)
                }
                throw new Error("Undefined function: " + node.name)
                
            case "FunctionDeclaration":
                if(node.name in ownFunctions){
                    throw new Error(node.name + " is a built-in function")
                }
                this.env[node.name] = {
                    params: node.params,
                    body: node.body
                }
                return

            case "FunctionCall":
                return this.callFunc(node)

            case "ArrayLiteral":
                return node.elements.map(element => this.execute(element))

            case "ArrayAccess":
                let array = this.lookupVariable(node.array)
                if(!array || !Array.isArray(array)){
                    throw new Error(node.array + " is not an array")
                }
                if(!node.index || node.index.length == 0){
                    throw new Error(node.array + " has invalid index")
                }
                let subArray = array
                let finalIndex
                for(let index of node.index){
                    let idx = this.execute(index)
                    finalIndex = idx
                    if(idx < 0 || idx >= subArray.length){
                        throw new Error("Index out of bounds")
                    }
                    subArray = subArray[idx]
                }
                return subArray

            case "ArrayPushUnshift":
                let arrayPP = this.lookupVariable(node.array)
                let element = this.execute(node.elementToBeAdded)
                let operation = node.operation
                let indexPP = node.index

                if(!arrayPP || !Array.isArray(arrayPP)){
                    throw new Error(node.array + " is not an array")
                }
                if(indexPP != null && indexPP.length > 0){
                    // we have multiple indices, for example arr[i][j], so we need to access the correct subarray
                    let subArray = arrayPP
                    for(let index of indexPP){
                        let idx = this.execute(index)
                        if(idx < 0 || idx >= subArray.length){
                            throw new Error("Index out of bounds")
                        }
                        subArray = subArray[idx]
                        if(!subArray || !Array.isArray(subArray)){
                            throw new Error("Not an array")
                        }
                    }
                    operation == 'push' ? subArray.push(element) : subArray.unshift(element)

                } 
                else {
                    operation == 'push' ? arrayPP.push(element) : arrayPP.unshift(element)
                }

                return arrayPP.length

            case "PopOperation": {
                let arrPop = this.lookupVariable(node.array)
                if(!arrPop || !Array.isArray(arrPop)) throw new Error(node.array + " is not an array")
                let targetPop = arrPop
                if(node.index && node.index.length > 0){
                    for(let idx of node.index){
                        targetPop = targetPop[this.execute(idx)]
                        if(!Array.isArray(targetPop)) throw new Error("Not an array")
                    }
                }
                return targetPop.pop()
            }

            case "ShiftOperation": {
                let arrShift = this.lookupVariable(node.array)
                if(!arrShift || !Array.isArray(arrShift)) throw new Error(node.array + " is not an array")
                let targetShift = arrShift
                if(node.index && node.index.length > 0){
                    for(let idx of node.index){
                        targetShift = targetShift[this.execute(idx)]
                        if(!Array.isArray(targetShift)) throw new Error("Not an array")
                    }
                }
                return targetShift.shift()
            }

            case "LengthOperation": {
                let element = this.execute(node.element)
                return element.length
            }

            case "MatchStatement": {
                let valueBaseComparison = this.execute(node.baseComparison)
                if(node.matches.length > 0){
                    let defaultMatch = undefined
                    let matched = false
                    for(let match of node.matches){
                        if(match.match === "default") {defaultMatch = match; continue}
                        let matchValue = this.execute(match.match)
                        if(valueBaseComparison === matchValue) {
                            let result = this.execute(match.action); 
                            if (result?.type === "return") return result
                            matched = true
                        }
                    }
                    if(!matched && defaultMatch) {
                        let result = this.execute(defaultMatch.action); 
                        if (result?.type === "return") return result
                    }
                }
                return
            }

            default:
                throw new Error("Unknown AST node " + node.type)
        }
    }

}

function isLetterOrDigit(char){
    return isDigit(char) || isLetter(char)
}

function isDigit(char){
    return char.length === 1 && !isNaN(parseFloat(char))   
}

function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
}

function debugAST(node, indent = "", isLast = true){

    if(!node) return

    const branch = isLast ? "└─ " : "├─ "
    const nextIndent = indent + (isLast ? "   " : "│  ")

    let label = node.type

    // labels
    if(node.type === "Literal")             label += ` (${node.value})`
    if(node.type === "Identifier")          label += ` (${node.name})`
    if(node.type === "BinaryExpression")    label += ` (${node.operator})`
    if(node.type === "ConditionExpression") label += ` (${node.operator})`
    if(node.type === "UnaryExpression")     label += ` (${node.operator})`
    if(node.type === "VariableDeclaration") label += ` (${node.identifier})`
    if(node.type === "AssignmentExpression")label += ` (${node.identifier})`
    if(node.type === "ArrayAssignmentExpression") label += ` (${node.identifier})`
    if(node.type === "IfStatement")         label += ` (${node.condition.operator})`
    if(node.type === "FunctionDeclaration") label += ` (${node.name})`
    if(node.type === "FunctionCall")        label += ` (${node.name})`
    if(node.type === "OwnFunctionCall")     label += ` (${node.name})`
    if(node.type === "ArrayAccess")         label += ` (${node.array})`
    if(node.type === "ArrayPushUnshift")    label += ` (${node.array} ${node.operation})`
    if(node.type === "PopOperation")        label += ` (${node.array})`
    if(node.type === "ShiftOperation")      label += ` (${node.array})`
    if(node.type === "MatchStatement")      label += ` (${node.baseComparison.name})`

    console.log(indent + branch + label)

    let children = []

    // children
    if(node.type === "Program")             children = node.body
    if(node.type === "BlockStatement")      children = node.body
    if(node.type === "BinaryExpression")    children = [node.left, node.right]
    if(node.type === "ConditionExpression") children = [node.left, node.right]
    if(node.type === "UnaryExpression")     children = [node.argument]
    if(node.type === "AssignmentExpression")children = [node.value]
    if(node.type === "VariableDeclaration" && node.value) children = [node.value]
    if(node.type === "ReturnStatement" && node.value)     children = [node.value]
    if(node.type === "IfStatement")         children = node.alternate ? [node.condition, node.body, node.alternate] : [node.condition, node.body]
    if(node.type === "WhileStatement")      children = [node.condition, node.body]
    if(node.type === "ForStatement")        children = [node.iterator, node.startLoop, node.endLoop, node.body]
    if(node.type === "FunctionDeclaration") children = [node.body]
    if(node.type === "FunctionCall")        children = node.arguments
    if(node.type === "OwnFunctionCall")     children = node.arguments
    if(node.type === "ArrayLiteral")        children = node.elements
    if(node.type === "ArrayAccess")         children = node.index
    if(node.type === "ArrayAssignmentExpression") children = [...node.index, node.value]
    if(node.type === "ArrayPushUnshift")    children = node.index ? [...node.index, node.elementToBeAdded] : [node.elementToBeAdded]
    if(node.type === "PopOperation"  && node.index) children = node.index
    if(node.type === "ShiftOperation" && node.index) children = node.index
    if(node.type === "LengthOperation")     children = [node.element]
    if(node.type === "MatchStatement")      children = node.matches.map((i) => {return i.action})

    children.forEach((child, i) =>
        debugAST(child, nextIndent, i === children.length - 1)
    )
}
