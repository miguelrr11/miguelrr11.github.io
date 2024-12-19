function tokenize(expression) {
    const tokens = [];
    const regex = /\s*(?:(\d+\.\d+|\d+)|([a-zA-Z_][a-zA-Z0-9_]*)\(|([,])|([+\-*/()]))\s*/g; // Updated regex to allow negative numbers and operators
    let match;
    let lastToken = null;
    let first = true

    while ((match = regex.exec(expression)) !== null) {
        if (match[1]) {
            if (lastToken && (lastToken.type === "NUMBER" || lastToken.type === "CLOSE_PAREN")) {
                throw new Error(`Unexpected number after another number or closing parenthesis at position ${regex.lastIndex}`);
            }
            if(lastToken && lastToken.value == '-'){  //2 * - (-1)
                
                tokens.splice(tokens.length-1, 1)
                if(tokens[tokens.length-1].type == "NUMBER" || tokens[tokens.length-1].value == ")") tokens.push({ type: "OPERATOR", value: "+" });
                tokens.push({ type: "NUMBER", value: "-" + match[1] });
                
            }
            else tokens.push({ type: "NUMBER", value: match[1] }); // If it's a number
        } else if (match[2]) {
            tokens.push({ type: "FUNCTION", value: match[2] }); // If it's a function name
            tokens.push({ type: "OPERATOR", value: "(" }); // Explicitly add '(' after function name
        } else if (match[3]) {
            tokens.push({ type: "COMMA", value: "," }); // Handle commas
        } else if (match[4]) {
            if (match[4] === "-" && first) {
                tokens.push({ type: "NUMBER", value: "0" });
                tokens.push({ type: "OPERATOR", value: "-" }); // Treat as a subtraction operator
                
            } else {
                tokens.push({ type: "OPERATOR", value: match[4] }); // If it's an operator or parentheses
            }
        }
        lastToken = tokens[tokens.length - 1];
        first = false
    }

    return tokens;
}
// 1-2 -> 1 + -2
/*
-12 -> positive operator and negative number: + -12
-pow(1, 2) -> negative operator and function: - pow(1, 2)
-(12 + 3) -> - negative operator and parenthesis: - (12 + 3)
*/

function parse(tokens) {
    let current = 0;

    function parseExpression() {
        return parseAdditive();
    }

    function parseAdditive() {
        let node = parseMultiplicative();

        while (current < tokens.length && (tokens[current].value === '+' || tokens[current].value === '-')) {
            let operator = tokens[current++];
            let rightNode = parseMultiplicative();
            node = { type: 'BinaryExpression', operator: operator.value, left: node, right: rightNode };
        }

        return node;
    }

    function parseMultiplicative() {
        let node = parsePrimary();

        while (current < tokens.length && (tokens[current].value === '*' || tokens[current].value === '/')) {
            let operator = tokens[current++];
            let rightNode = parsePrimary();
            node = { type: 'BinaryExpression', operator: operator.value, left: node, right: rightNode };
        }

        return node;
    }

    function parsePrimary() {
        let token = tokens[current];

        if (token.type === "NUMBER") {
            current++;
            return { type: "Literal", value: Number(token.value) };
        }

        if (token.type === "FUNCTION") {
            const functionName = token.value;
            current++; // Consume the function token
            if (tokens[current] && tokens[current].value === '(') {
                current++; // Consume '('
                const args = [];
                while (current < tokens.length) {
                    args.push(parseExpression());
                    if (tokens[current] && tokens[current].type === "COMMA") {
                        current++; // Consume comma
                    } else if (tokens[current] && tokens[current].value === ')') {
                        current++; // Consume ')'
                        break;
                    } else {
                        throw new Error("Unexpected token in function arguments");
                    }
                }
                return { type: "FunctionCall", name: functionName, arguments: args };
            } else {
                throw new Error("Missing opening parenthesis after function");
            }
        }

        if (token.type === "OPERATOR" && token.value === "(") {
            current++; // Consume "("
            let node = parseExpression();
            if (tokens[current] && tokens[current].value === ")") {
                current++; // Consume ")"
                return node;
            } else {
                throw new Error("Missing closing parenthesis");
            }
        }

        throw new Error(`Unexpected token: ${token ? token.value : "EOF"}`);
    }

    return parseExpression();
}

function evaluate(node) {
    if (node.type === "Literal") {
        return node.value;
    }

    if (node.type === "BinaryExpression") {
        const left = evaluate(node.left);
        const right = evaluate(node.right);

        if (node.operator === '/' && right === 0) {
            console.warn("Division by zero encountered. Returning Infinity.");
            return Infinity;
        }

        switch (node.operator) {
            case '+': return left + right;
            case '-': return left - right;
            case '*': return left * right;
            case '/': return left / right;
        }
    }

    if (node.type === "FunctionCall") {
        const args = node.arguments.map(evaluate);
        return functionCall(node.name, args[0], args[1])
    }

    throw new Error("Invalid AST Node");
}



function functionCall(func, arg1, arg2){

    switch (func) {
        case 'tan': return Math.tan(arg1);           // Tangent
        case 'sin': return Math.sin(arg1);           // Sine
        case 'cos': return Math.cos(arg1);           // Cosine
        case 'atan': return Math.atan(arg1);         // Arctangent
        case 'asin': return Math.asin(arg1);         // Arcsine
        case 'acos': return Math.acos(arg1);         // Arccosine
        case 'atan2': return Math.atan2(arg1, arg2); // Arctangent of y / x

        case 'exp': return Math.exp(arg1);           // e^arg
        case 'log': return Math.log(arg1);           // Natural log
        case 'log2': return Math.log2(arg1);         // Base-2 log
        case 'log10': return Math.log10(arg1);       // Base-10 log
        //case 'log1p': return Math.log1p(arg1);       // log(1 + arg)

        case 'abs': return Math.abs(arg1);           // Absolute value
        case 'sign': return Math.sign(arg1);         // Sign of the number

        case 'floor': return Math.floor(arg1);       // Round down
        case 'ceil': return Math.ceil(arg1);         // Round up
        case 'round': return Math.round(arg1);       // Round to nearest integer
        case 'trunc': return Math.trunc(arg1);       // Remove fractional part
        case 'fround': return Math.fround(arg1);     // Nearest single-precision float

        case 'sqrt': return Math.sqrt(arg1);         // Square root
        case 'cbrt': return Math.cbrt(arg1);         // Cube root
        case 'pow': return Math.pow(arg1, arg2);     // Power: arg1^arg2
        case 'hypot': return Math.hypot(arg1, arg2); // Hypotenuse of arguments

        case 'sinh': return Math.sinh(arg1);         // Hyperbolic sine
        case 'cosh': return Math.cosh(arg1);         // Hyperbolic cosine
        case 'tanh': return Math.tanh(arg1);         // Hyperbolic tangent
        case 'asinh': return Math.asinh(arg1);       // Hyperbolic arcsine
        case 'acosh': return Math.acosh(arg1);       // Hyperbolic arccosine
        case 'atanh': return Math.atanh(arg1);       // Hyperbolic arctangent

        case 'min': return Math.min(arg1, arg2);     // Minimum of args
        case 'max': return Math.max(arg1, arg2);     // Maximum of args

        case 'random': return Math.random();         // Random number [0, 1)

        //no funciona por ahora
        case 'PI': return Math.PI;                   // π constant
        case 'E': return Math.E;                     // Euler's constant
        case 'LN2': return Math.LN2;                 // Natural log of 2
        case 'LN10': return Math.LN10;               // Natural log of 10
        case 'LOG2E': return Math.LOG2E;             // Log base 2 of E
        case 'LOG10E': return Math.LOG10E;           // Log base 10 of E
        case 'SQRT2': return Math.SQRT2;             // Square root of 2
        case 'SQRT1_2': return Math.SQRT1_2;         // Square root of 1/2

        default: throw new Error(`Unknown function: ${func}`);
    }
}

function feedX(input, value) {
    return input.replace(/(?<!\b(?:e|ma))x(?!p\b)/gi, value.toString());
}

function feedY(input, value) {
    return input.replace(/(?<!\b(?:e|ma))y(?!p\b)/gi, value.toString());
}

function feedVar(input, value, character) {
    const escapedChar = character.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedChar, 'g');
    return input.replace(regex, value.toString());
}

//adds * symobols to the input string to make it compatible with the parser
function adaptToVariable(input, variable) {
    const rules = [
        { regex: new RegExp(`(?<![ea])${variable}([a-z])`, 'g'), replacement: `${variable}*$1` },
        { regex: new RegExp(`(?<![ea])${variable} ([a-z])`, 'g'), replacement: `${variable}* $1` },
        { regex: new RegExp(`([a-z])(?<![ea])${variable}`, 'g'), replacement: `$1*${variable}` },
        { regex: new RegExp(`([a-z]) (?<![ea])${variable}`, 'g'), replacement: `$1* ${variable}*` },
        { regex: new RegExp(`(?<![ea])${variable}\\(`, 'g'), replacement: `${variable}*(` }, // A( -> A*(
        { regex: new RegExp(`(?<![ea])${variable} \\(`, 'g'), replacement: `${variable}* (` }, // A ( -> A* (
        { regex: /\)([^*/+\-,)\s])/g, replacement: `)*$1` }, // )n -> )*n (excluding special chars)
        { regex: /\) ([^*/+\-,)\s])/g, replacement: `)* $1` }, // ) n -> )* n (excluding special chars)
        { regex: new RegExp(`${variable}(\\d)`, 'g'), replacement: `${variable}*$1` }, // A2 -> A*2
        { regex: new RegExp(`${variable} (\\d)`, 'g'), replacement: `${variable}* $1` }, // A 2 -> A* 2
        { regex: /(\d)([a-zA-Z])/g, replacement: '$1*$2' } // 2cos() -> 2*cos()
    ];

    let result = input;
    rules.forEach(({ regex, replacement }) => {
        result = result.replace(regex, replacement);
    });

    return result;
}


function calculate(input){
    const tokens = tokenize(input);
    const ast = parse(tokens);
    const result = evaluate(ast);
    return result
}

function getfx(adaptedX, value){
    let input = feedX(adaptedX, value)
    let result = calculate(input)
    return result
}

function getfy(adaptedX, value){
    let input = feedY(adaptedX, value)
    let result = calculate(input)
    return result
}
