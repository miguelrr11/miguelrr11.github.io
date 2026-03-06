class Interpreter {
    constructor(){
        this.env = {}
        this.sourceCode = "number a = -5 * -(2 * !false)\n"
        this.tokens = this.lex(this.sourceCode)
        this.ast = this.parse(this.tokens)
        console.log(this.ast)
        debugAST(this.ast)
        this.execute(this.ast)
        console.log(this.env)
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
            else if(lookAhead == '+' && lookTwoAhead != '='){
                curPos++
                tokens.push({type: 'plus', value: '+', pos: tokenStartPos})
            }
            else if(lookAhead == '-' && lookTwoAhead != '='){
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
            else if(lookAhead == '=' && lookTwoAhead != '='){
                curPos++
                tokens.push({type: 'equals', value: '=', pos: tokenStartPos})
            }
            else if(lookAhead == '+' && lookTwoAhead == '='){
                curPos += 2
                tokens.push({type: 'plusEquals', value: '+=', pos: tokenStartPos})
            }
            else if(lookAhead == '-' && lookTwoAhead == '='){
                curPos += 2
                tokens.push({type: 'minusEquals', value: '-=', pos: tokenStartPos})
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
                while(curPos < text.length && isDigit(text.charAt(curPos))){
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
                let type = ''
                switch (str){
                    case 'true':
                        type = 'boolean'
                        break
                    case 'false':
                        type = 'boolean'
                        break
                    case 'number':
                        type = 'declaration'
                        break
                    default:
                        type = 'identifier'
                }
                tokens.push({type: type, value: str, pos: tokenStartPos})
            }
            else if(lookAhead == '"'){
                curPos++
                tokens.push({type: 'quote', value: '"', pos: tokenStartPos})
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
            else if(lookAhead === '\n'){
                curPos++
                tokens.push({type: 'newline', value: '\n', pos: tokenStartPos})
            }
            
            else {
                console.log('Unkown character: ' + lookAhead + ' at col: ' + curPos)
                return
            }

        }
        tokens.push({type: 'EOF', value: '\n', pos: curPos})
        console.log(tokens)
        return tokens
    }

    parse(tokens){
        let current = 0;

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

            return parseExpression()
        }

        function parseDeclaration(){

            consume() // declaration keyword: number
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

            return node
        }

        function parseMultiplicative(){

            let node = parseUnary()

            while(peek().type === "multiply" || peek().type === "divide"){

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

            if(token.type === "number"){
                consume()
                return {
                    type: "Literal",
                    value: Number(token.value)
                }
            }

            if(token.type === "identifier"){
                consume()
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

            throw new Error("Unexpected token: " + token.value)
        }

        return parseProgram()
    }

    execute(node){

        switch(node.type){

            case "Program":
                let result;
                for(let stmt of node.body){
                    result = this.execute(stmt)
                }
                return result


            case "VariableDeclaration":
                if(node.value){
                    this.env[node.identifier] = this.execute(node.value)
                }else{
                    this.env[node.identifier] = null
                }
                return this.env[node.identifier]


            case "AssignmentExpression":
                if(!(node.identifier in this.env)){
                    throw new Error("Variable not declared: " + node.identifier)
                }

                let val = this.execute(node.value)
                this.env[node.identifier] = val
                return val


            case "BinaryExpression":

                let left = this.execute(node.left)
                let right = this.execute(node.right)

                switch(node.operator){
                    case "+": return left + right
                    case "-": return left - right
                    case "*": return left * right
                    case "/": return left / right
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


            case "Literal":
                return node.value


            case "Identifier":

                if(!(node.name in this.env)){
                    throw new Error("Undefined variable: " + node.name)
                }

                return this.env[node.name]
            
            case "UnaryExpression":

                let arg = this.execute(node.argument)
                
                switch(node.operator){
                    case "minus": return -arg
                    case "not": return !arg
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

    if(node.type === "Literal")
        label += ` (${node.value})`

    if(node.type === "Identifier")
        label += ` (${node.name})`

    if(node.type === "BinaryExpression")
        label += ` (${node.operator})`

    if(node.type === "VariableDeclaration")
        label += ` (${node.identifier})`

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

    children.forEach((child, i) =>
        debugAST(child, nextIndent, i === children.length - 1)
    )
}