const ownFunctions = {
    say: (...args) => {
        console.log(...args)
    },
    rect: (x, y, w, h) => {
        rect(x, y, w, h)
    },
    fill: (r, g, b) => {
        fill(r, g, b)
    },
    translate: (x, y) => {
        translate(x, y)
    },
    rotate: (angle) => {
        rotate(angle)
    },
    radians: (angle) => {
        return radians(angle)
    },
    cos: (angle) => {
        return Math.cos(angle)
    },
    sin: (angle) => {
        return Math.sin(angle)
    },
    random: (min, max) => {
        return random(min, max)
    },
    clear: () => {
        background(50)
    },
    noise: (x, y = undefined, z = undefined) => {
        return noise(x, y, z)
    },
    noStroke: () => {
        noStroke()
    }
}

class Interpreter {
    constructor(){
        this.env = {}
    }

    set(sourceCode){
        this.sourceCode = sourceCode
    }

    prepare(){
        this.tokens = this.lex(this.sourceCode)
        this.ast = this.parse(this.tokens)
    }

    run(){
        return this.execute(this.ast)
    }

    callFunc(node){
        if(!node) return
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
        while(curPos < text.length){
            let tokenStartPos = curPos
            let lookAhead = text.charAt(curPos)
            let lookTwoAhead = text.charAt(curPos+1)
            if(lookAhead == ' ') curPos++
            else if(lookAhead == '#' && lookTwoAhead == '#'){
                curPos++
                while(curPos < text.length && text.charAt(curPos) != '\n'){
                    curPos++
                }
            }
            else if(lookAhead == '+' && lookTwoAhead != '=' && lookTwoAhead != '+'){
                curPos++
                tokens.push({type: 'plus', value: '+', pos: tokenStartPos})
            }
            else if(lookAhead == '-' && lookTwoAhead != '=' && lookTwoAhead != '-'){
                curPos++
                tokens.push({type: 'minus', value: '-', pos: tokenStartPos})
            }
            else if(lookAhead == '*' && lookTwoAhead != '='){
                curPos++
                tokens.push({type: 'multiply', value: '*', pos: tokenStartPos})
            }
            else if(lookAhead == '/' && lookTwoAhead != '='){
                curPos++
                tokens.push({type: 'divide', value: '/', pos: tokenStartPos})
            }
            else if(lookAhead == '%'){
                curPos++
                tokens.push({type: 'remainder', value: '%', pos: tokenStartPos})
            }
            else if(lookAhead == '=' && lookTwoAhead != '='){
                curPos++
                tokens.push({type: 'equals', value: '=', pos: tokenStartPos})
            }
            else if(lookAhead == '+' && lookTwoAhead == '='){
                curPos += 2
                tokens.push({type: 'plusEquals', value: '+=', pos: tokenStartPos})
            }
            else if(lookAhead == '+' && lookTwoAhead == '+'){
                curPos += 2
                tokens.push({type: 'increment', value: '++', pos: tokenStartPos})
            }
            else if(lookAhead == '-' && lookTwoAhead == '='){
                curPos += 2
                tokens.push({type: 'minusEquals', value: '-=', pos: tokenStartPos})
            }
            else if(lookAhead == '-' && lookTwoAhead == '-'){
                curPos += 2
                tokens.push({type: 'decrement', value: '--', pos: tokenStartPos})
            }
            else if(lookAhead == '*' && lookTwoAhead == '='){
                curPos += 2
                tokens.push({type: 'multiplyEquals', value: '*=', pos: tokenStartPos})
            }
            else if(lookAhead == '/' && lookTwoAhead == '='){
                curPos += 2
                tokens.push({type: 'divideEquals', value: '/=', pos: tokenStartPos})
            }
            else if(lookAhead == '=' && lookTwoAhead == '='){
                curPos += 2
                tokens.push({type: 'condition', value: '==', pos: tokenStartPos})
            }
            else if(lookAhead == '!' && lookTwoAhead == '='){
                curPos += 2
                tokens.push({type: 'condition', value: '!=', pos: tokenStartPos})
            }
            else if(lookAhead == '>' && lookTwoAhead == '='){
                curPos += 2
                tokens.push({type: 'condition', value: '>=', pos: tokenStartPos})
            }
            else if(lookAhead == '<' && lookTwoAhead == '='){
                curPos += 2
                tokens.push({type: 'condition', value: '<=', pos: tokenStartPos})
            }
            else if(lookAhead == '<'){
                curPos++
                tokens.push({type: 'condition', value: '<', pos: tokenStartPos})
            }
            else if(lookAhead == '>'){
                curPos++
                tokens.push({type: 'condition', value: '>', pos: tokenStartPos})
            }
            else if(lookAhead == '&' && lookTwoAhead == '&'){
                curPos += 2
                tokens.push({type: 'condition', value: '&&', pos: tokenStartPos})
            }
            else if(lookAhead == '|' && lookTwoAhead == '|'){
                curPos += 2
                tokens.push({type: 'condition', value: '||', pos: tokenStartPos})
            }
            else if(isDigit(lookAhead)){
                let str = lookAhead
                curPos++
                while(curPos < text.length && (isDigit(text.charAt(curPos)) || text.charAt(curPos) == '.')){
                    str += text.charAt(curPos)
                    curPos++
                }
                tokens.push({type: 'number', value: str, pos: tokenStartPos})
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
                    default:
                        if(str in ownFunctions){
                            type = 'ownFunction'
                        }
                        else type = 'identifier'
                }
                tokens.push({type: type, value: str, pos: tokenStartPos})
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
                tokens.push({type: 'string', value: string, pos: tokenStartPos})
            }
            else if(lookAhead === '!'){
                curPos++
                tokens.push({type:'not', value:'!', pos: tokenStartPos})
            }
            else if(lookAhead === '('){
                curPos++
                tokens.push({type: 'lparen', value: '(', pos: tokenStartPos})
            }
            else if(lookAhead === ')'){
                curPos++
                tokens.push({type: 'rparen', value: ')', pos: tokenStartPos})
            }
            else if(lookAhead === '{'){
                curPos++
                tokens.push({type: 'lbrack', value: '{', pos: tokenStartPos})
            }
            else if(lookAhead === '}'){
                curPos++
                tokens.push({type: 'rbrack', value: '}', pos: tokenStartPos})
            }
            else if(lookAhead === ','){
                curPos++
                tokens.push({type: 'comma', value: ',', pos: tokenStartPos})
            }
            else if(lookAhead === '\n'){
                curPos++
                tokens.push({type: 'newline', value: '\n', pos: tokenStartPos})
            }
            else if (lookAhead === '[') {
                tokens.push({
                    type: 'lArr',
                    value: '[',
                    pos: tokenStartPos,
                });

                curPos++;
            }
            else if (lookAhead === ']') {
                tokens.push({
                    type: 'rArr',
                    value: ']',
                    pos: tokenStartPos,
                });

                curPos++;
            }
            else if (lookAhead === '.'){
                curPos++
                tokens.push({type: 'dot', value: '.', pos: tokenStartPos})
            }
            else if(lookAhead === ':'){
                curPos++
                tokens.push({type: 'colon', value: ':', pos: tokenStartPos})
            }
            else {
                console.log('Unknown character: ' + lookAhead + ' at col: ' + curPos)
                return
            }

        }
        tokens.push({type: 'EOF', value: '\n', pos: curPos})
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

        function peek(){
            return tokens[current]
        }

        function consume(){
            return tokens[current++]
        }

        function expect(type){
            let token = peek()
            if(token.type !== type){
                throw new Error("Expected " + type + " but got " + token.type)
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

            if(peek().type === "identifier" && tokens[current+1]?.type === "equals"){
                return parseAssignment()
            }

            if(peek().type === "identifier" && tokens[current+1]?.type === "lArr"){
                return parseArrayAssignment()
            }

            if(peek().type === "if"){

                consume() // if
                expect("lparen") // (
                let condition = parseExpression()
                expect("rparen") // )

                expect("lbrack") // {

                let body = []

                skipNewlines()

                while(peek().type !== "rbrack"){
                    body.push(parseStatement())
                    skipNewlines()
                }

                expect("rbrack") // }
                skipNewlines()


                // check for else if
                let alternate = null

                if (peek().type === "else") {

                    consume() // else

                    if (peek().type === "if") {

                        // else if → recursive parsing

                        alternate = parseStatement()

                    } else {

                        expect("lbrack")

                        let elseBody = []

                        skipNewlines()

                        while (peek().type !== "rbrack") {
                            elseBody.push(parseStatement())
                            skipNewlines()
                        }

                        expect("rbrack")

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

                expect("lbrack") // {

                loopDepth++

                let body = []

                skipNewlines()

                while (peek().type !== "rbrack") {
                    body.push(parseStatement())
                    skipNewlines()
                }

                expect("rbrack")

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
                expect("lbrack") // {

                loopDepth++

                let body = []

                skipNewlines()

                while (peek().type !== "rbrack") {
                    body.push(parseStatement())
                    skipNewlines()
                }

                expect("rbrack")

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
                let id = expect("identifier")

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

                expect("lbrack") // {

                let body = []

                skipNewlines()

                while(peek().type !== "rbrack"){
                    body.push(parseStatement())
                    skipNewlines()
                }

                expect("rbrack") // }

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
            expect("lArr") // [
            let index = parseExpression()
            expect("rArr") // ]
            expect("equals") // =
            let value = parseExpression()
            return {
                type: "ArrayAssignmentExpression",
                identifier: id.value,
                index: index,
                value: value
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

                if (peek().type === "lArr") {
                    consume() // [
                    let index = parseExpression()
                    expect("rArr") // ]
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

    
            throw new Error("Unexpected token: " + token.value)
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

            case "ArrayAssignmentExpression":
                let arr = this.lookupVariable(node.identifier)
                if(!arr || !Array.isArray(arr)){
                    throw new Error(node.identifier + " is not an array")
                }
                let idx = this.execute(node.index)
                if(idx < 0 || idx >= arr.length){
                    throw new Error("Index out of bounds")
                }
                let valArr = this.execute(node.value)
                arr[idx] = valArr
                return valArr

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
                let step = node.step != undefined ? this.execute(node.step) : 1

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
                let index = this.execute(node.index)
                if(index < 0 || index >= array.length){
                    throw new Error("Index out of bounds")
                }
                return array[index]

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

    if(node.type === "Literal")
        label += ` (${node.value})`

    if(node.type === "Identifier")
        label += ` (${node.name})`

    if(node.type === "BinaryExpression")
        label += ` (${node.operator})`

    if(node.type === "VariableDeclaration")
        label += ` (${node.identifier})`

    if(node.type === "AssignmentExpression")
        label += ` (${node.identifier})`

    if(node.type === "ConditionExpression")
        label += ` (${node.operator})`

    if(node.type === "UnaryExpression")
        label += ` (${node.operator})`

    if(node.type === "IfStatement")
        label += ` (${node.condition.operator})`

    console.log(indent + branch + label)

    let children = []

    if(node.type === "Program")
        children = node.body

    if(node.type === "BinaryExpression")
        children = [node.left, node.right]

    if(node.type === "AssignmentExpression")
        children = [node.value]

    if(node.type === "VariableDeclaration" && node.value)
        children = [node.value]

    if(node.type === "ConditionExpression")
        children = [node.left, node.right]

    if(node.type === "UnaryExpression")
        children = [node.argument]

    if(node.type === "IfStatement")
        children = [node.condition, ...node.body]

    children.forEach((child, i) =>
        debugAST(child, nextIndent, i === children.length - 1)
    )
}
