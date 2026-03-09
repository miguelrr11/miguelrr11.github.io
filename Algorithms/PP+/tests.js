// ─────────────────────────────────────────────
//  Test Runner for your language
//  Usage: import your Interpreter, then call runTests()
// ─────────────────────────────────────────────
//
//  Each test has:
//    source   – source code in your language
//    expect   – the expected return value of execute()
//               OR a function (val) => boolean for custom checks
//    desc     – human-readable description

//import { Interpreter } from "./Interpreter.js" // adjust path as needed

const tests = [

    // ─── VARIABLES ────────────────────────────────────────────────────────────
    {
        desc: "Declare and read a var variable",
        source: `var x = 42`,
        expect: 42
    },
    {
        desc: "Declare variable without initializer (should be null)",
        source: `var x`,
        expect: null
    },
    {
        desc: "Reassign a variable",
        source: `
            var x = 5
            x = 99
        `,
        expect: 99
    },
    {
        desc: "Assigning undeclared variable throws",
        source: `x = 10`,
        throws: true
    },
    {
        desc: "Reading undeclared variable throws",
        source: `var x = y`,
        throws: true
    },

    // ─── ARITHMETIC ───────────────────────────────────────────────────────────
    {
        desc: "Addition",
        source: `var x = 3 + 4`,
        expect: 7
    },
    {
        desc: "Subtraction",
        source: `var x = 10 - 3`,
        expect: 7
    },
    {
        desc: "Multiplication",
        source: `var x = 6 * 7`,
        expect: 42
    },
    {
        desc: "Division",
        source: `var x = 20 / 4`,
        expect: 5
    },
    {
        desc: "Remainder / modulo",
        source: `var x = 17 % 5`,
        expect: 2
    },
    {
        desc: "Operator precedence: * before +",
        source: `var x = 2 + 3 * 4`,
        expect: 14
    },
    {
        desc: "Parentheses override precedence",
        source: `var x = (2 + 3) * 4`,
        expect: 20
    },
    {
        desc: "Unary negation",
        source: `var x = -7`,
        expect: -7
    },
    {
        desc: "Chained arithmetic",
        source: `var x = 1 + 2 + 3 + 4`,
        expect: 10
    },
    {
        desc: "Increment operator",
        source: `var x = 5
            x++
            `,
        expect: 6
    },
    {
        desc: "Decrement operator",
        source: `var x = 5
            x--
            `,
        expect: 4
    },

    // ─── COMPOUND ASSIGNMENT ──────────────────────────────────────────────────
    {
        desc: "+= operator",
        source: `
            var x = 10
            x += 5
        `,
        expect: 15
    },
    {
        desc: "-= operator",
        source: `
            var x = 10
            x -= 3
        `,
        expect: 7
    },
    {
        desc: "*= operator",
        source: `
            var x = 4
            x *= 3
        `,
        expect: 12
    },
    {
        desc: "/= operator",
        source: `
            var x = 20
            x /= 4
        `,
        expect: 5
    },

    // ─── STRINGS ──────────────────────────────────────────────────────────────
    {
        desc: "String literal",
        source: `var x = "hello"`,
        expect: "hello"
    },
    {
        desc: "String concatenation with +",
        source: `var x = "hello" + " world"`,
        expect: "hello world"
    },

    // ─── BOOLEANS ─────────────────────────────────────────────────────────────
    {
        desc: "Boolean true literal",
        source: `var x = true`,
        expect: true
    },
    {
        desc: "Boolean false literal",
        source: `var x = false`,
        expect: false
    },
    {
        desc: "Logical NOT on true",
        source: `var x = !true`,
        expect: false
    },
    {
        desc: "Logical NOT on false",
        source: `var x = !false`,
        expect: true
    },

    // ─── CONDITIONS ───────────────────────────────────────────────────────────
    {
        desc: "Greater than (true)",
        source: `var x = 5 > 3`,
        expect: true
    },
    {
        desc: "Greater than (false)",
        source: `var x = 3 > 5`,
        expect: false
    },
    {
        desc: "Less than",
        source: `var x = 2 < 10`,
        expect: true
    },
    {
        desc: "Equals ==",
        source: `var x = 7 == 7`,
        expect: true
    },
    {
        desc: "Not equals !=",
        source: `var x = 7 != 8`,
        expect: true
    },
    {
        desc: "Greater than or equal (equal case)",
        source: `var x = 5 >= 5`,
        expect: true
    },
    {
        desc: "Less than or equal",
        source: `var x = 3 <= 4`,
        expect: true
    },
    {
        desc: "Logical AND (both true)",
        source: `var x = true && true`,
        expect: true
    },
    {
        desc: "Logical AND (one false)",
        source: `var x = true && false`,
        expect: false
    },
    {
        desc: "Logical OR (one true)",
        source: `var x = false || true`,
        expect: true
    },
    {
        desc: "Logical OR (both false)",
        source: `var x = false || false`,
        expect: false
    },

    // ─── IF / ELSE ────────────────────────────────────────────────────────────
    {
        desc: "If branch taken",
        source: `
            var x = 0
            if (true) {
                x = 1
            }
        `,
        expect: 1
    },
    {
        desc: "If branch !taken",
        source: `
            var x = 0
            if (false) {
                x = 1
            }
        `,
        expect: 0
    },
    {
        desc: "If-else: if branch",
        source: `
            var x = 0
            if (10 > 5) {
                x = 1
            } else {
                x = 2
            }
        `,
        expect: 1
    },
    {
        desc: "If-else: else branch",
        source: `
            var x = 0
            if (1 > 5) {
                x = 1
            } else {
                x = 2
            }
        `,
        expect: 2
    },
    {
        desc: "Else-if chain: first branch",
        source: `
            var x = 0
            var y = 1
            if (y == 1) {
                x = 10
            } else if (y == 2) {
                x = 20
            } else {
                x = 30
            }
        `,
        expect: 10
    },
    {
        desc: "Else-if chain: middle branch",
        source: `
            var x = 0
            var y = 2
            if (y == 1) {
                x = 10
            } else if (y == 2) {
                x = 20
            } else {
                x = 30
            }
        `,
        expect: 20
    },
    {
        desc: "Else-if chain: final else",
        source: `
            var x = 0
            var y = 99
            if (y == 1) {
                x = 10
            } else if (y == 2) {
                x = 20
            } else {
                x = 30
            }
        `,
        expect: 30
    },

    // ─── WHILE LOOPS ──────────────────────────────────────────────────────────
    {
        desc: "While loop runs correct var of times",
        source: `
            var x = 0
            var i = 0
            while (i < 5) {
                x += 1
                i += 1
            }
        `,
        expect: 5
    },
    {
        desc: "While loop body never runs when condition is false",
        source: `
            var x = 42
            while (false) {
                x = 0
            }
        `,
        expect: 42
    },
    {
        desc: "While loop accumulates sum 1..10",
        source: `
            var x = 0
            var i = 1
            while (i <= 10) {
                x += i
                i += 1
            }
        `,
        expect: 55
    },
    {
        desc: "While loop accumulates sum 1..10 and breaks at 5",
        source: `
            var x = 0
            var i = 1
            while (i <= 10) {
                x += i
                i += 1
                if(i > 5){
                    break
                }
            }
        `,
        expect: 15
    },
    {
        desc: "While loop accumulates sum 1..10 and continues at even vars",
        source: `
            var x = 0
            var i = 1
            while (i <= 10) {
                i += 1
                if(i % 2 == 0){
                    continue
                }
                x += i
            }
        `,
        expect: 35
    },
    // ─── ARRAYS ────────────────────────────────────────────────────────────
    {
        desc: "Array literal",
        source: `
            var x = [1, 2, 3]
        `,
        expect: [1, 2, 3]
    },
    {
        desc: "Array indexing",
        source: `
            var arr = [1, 2, 3]
            var x = arr[0]
        `,
        expect: 1
    },
    {
        desc: "Array assignment",
        source: `
            var arr = [1, 2, 3]
            arr[0] = 4
            var x = arr
        `,
        expect: [4, 2, 3]
    },
    // ─── ARRAY MORE COMPLEX ────────────────────────────────────────────────────────────
    {
        desc: "Array assignment with function call index and expression value",
        source: `
            var arr = [1, 2, 3]
            func getIndex() {
                ret 0
            }
            arr[getIndex()] = 4
            var x = arr
        `,
        expect: [4, 2, 3]
    },
    {
        desc: "Array assignment with function call index and expression value (complex)",
        source: `
            var arr = [1, 2, 3]
            func getIndex() {
                ret 0
            }
            arr[getIndex()] = 2 + 2
            var x = arr
        `,
        expect: [4, 2, 3]
    },
    {
        desc: "Classic array indexing in loop",
        source: `
            var arr = [10, 20, 30]
            var sum = 0
            var i = 0
            while (i < 3) {
                sum += arr[i]
                i += 1
            }
            var x = sum
        `,
        expect: 60
    },
    // ─── FUNCTIONS ────────────────────────────────────────────────────────────
    {
        desc: "Function declaration and call",
        source: `
            func double(n) {
                ret n * 2
            }
            var x = double(7)
        `,
        expect: 14
    },
    {
        desc: "Function with multiple parameters",
        source: `
            func add(a, b) {
                ret a + b
            }
            var x = add(3, 4)
        `,
        expect: 7
    },
    {
        desc: "Function ret exits early",
        source: `
            func test(n) {
                if (n > 5) {
                    ret 1
                }
                ret 0
            }
            var x = test(10)
        `,
        expect: 1
    },
    {
        desc: "Function with no ret value rets null",
        source: `
            func nothing() {
            }
            var x = nothing()
        `,
        expect: null
    },
    {
        desc: "Recursive function: factorial",
        source: `
            func factorial(n) {
                if (n <= 1) {
                    ret 1
                }
                ret n * factorial(n - 1)
            }
            var x = factorial(5)
        `,
        expect: 120
    },
    {
        desc: "Recursive function: fibonacci",
        source: `
            func fib(n) {
                if (n <= 1) {
                    ret n
                }
                ret fib(n - 1) + fib(n - 2)
            }
            var x = fib(8)
        `,
        expect: 21
    },
    {
        desc: "Function scope does !leak into outer scope",
        source: `
            var x = 100
            func setLocal() {
                var x = 999
            }
            setLocal()
        `,
        expect: 100
    },
    {
        desc: "Function can read outer scope variables",
        source: `
            var base = 10
            func addBase(n) {
                ret base + n
            }
            var x = addBase(5)
        `,
        expect: 15
    },
    // ─── FOR LOOPS ────────────────────────────────────────────────────────────
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
            */
    {
        desc: "For loop with numeric end and step",
        source: `
            var sum = 0 
            for(i 0:10 step 2){
                sum += i
            }
            var x = sum
        `,
        expect: 20
    },
    {
        desc: "For loop with function call end and step",
        source: `
            func getEnd(){
                ret 10
            }
            func getStep(){ 
                ret 2
            }
            var sum = 0
            for(i 0:getEnd() step getStep()){
                sum += i
            }
            var x = sum
        `,
        expect: 20  
    },
    {
        desc: "For loop with boolean end condition",
        source: `
            var sum = 0
            var i = 0
            func shouldContinue(n){
                ret n <= 10
            }
            for(i 0:shouldContinue(i) step 1){
                sum = i
            }
            var x = sum
        `,
        expect: 10
    },
    // start index and step should only be called once, end condition should be called every iteration
    {
        desc: "For loop with function call end and step (check calls)",
        source: `
            var calls = 0
            func getEnd(){
                calls++
                ret 10
            }
            func getStep(){
                calls++
                ret 2
            }
            var sum = 0
            for(i 0:getEnd() step getStep()){
                sum += i
            }   
            var x = calls
        `,
        expect: 7 // step called once, end called every iteration (5 iterations) plus getEnd = 7
    },
    {
        desc: 'For loop with negative step',
        source: `
            var sum = 0
            for(i 10:0 step -1){
                sum += i
            }
            var x = sum
        `,
        expect: 55
    },
    {
        desc: 'For loop with negative step and boolean end condition',
        source: `
            var sum = 0
            var i = 10
            func shouldContinue(n){
                ret n >= 0
            }
            for(i 10:shouldContinue(i) step -1){
                sum += i
            }
            var x = sum
        `,
        expect: 55
    }
]


// ─────────────────────────────────────────────
//  Runner
// ─────────────────────────────────────────────

function runTests() {

    let passed = 0
    let failed = 0
    const results = []

    for (const test of tests) {

        let result = { desc: test.desc, passed: false, error: null, got: undefined }

        try {

            const interp = new Interpreter()
            interp.set(test.source)
            interp.prepare()
            interp.run()
            const output = interp.env["x"] // adjust if your API differs

            if (test.throws) {
                result.error = "Expected an error to be thrown, but none was"
            } 
            else if (typeof test.expect === "function") {
                result.passed = test.expect(output)
                if (!result.passed) result.error = `Custom check failed. Got: ${JSON.stringify(output)}`
            } 
            else {
                if(test.expect != undefined && test.expect != null && test.expect.constructor.name == 'Array') {
                    result.passed = JSON.stringify(output) === JSON.stringify(test.expect);
                }
                else {result.passed = output === test.expect}
                if (!result.passed) result.error = `Expected ${JSON.stringify(test.expect)}, got ${JSON.stringify(output)}`
            }

        } catch (err) {

            if (test.throws) {
                result.passed = true
            } else {
                result.error = err.message
            }

        }

        if (result.passed) passed++
        else failed++

        results.push(result)
    }

    // ── Pretty print ──────────────────────────
    console.log("\n═══════════════════════════════════════")
    console.log(`  Test Results: ${passed} passed, ${failed} failed`)
    console.log("═══════════════════════════════════════\n")

    for (const r of results) {
        if(r.passed) continue
        const icon = r.passed ? "✅" : "❌"
        console.log(`${icon}  ${r.desc}`)
        if (!r.passed) console.log(`     → ${r.error}`)
    }

    console.log("\n───────────────────────────────────────")
    console.log(failed === 0 ? "  🎉 All tests passed!" : `  ⚠️  ${failed} test(s) failed`)
    console.log("───────────────────────────────────────\n")

    return { passed, failed, results }
}