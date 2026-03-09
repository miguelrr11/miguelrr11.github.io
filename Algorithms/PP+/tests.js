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
        desc: "Declare and read a number variable",
        source: `number x = 42`,
        expect: 42
    },
    {
        desc: "Declare variable without initializer (should be null)",
        source: `number x`,
        expect: null
    },
    {
        desc: "Reassign a variable",
        source: `
            number x = 5
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
        source: `number x = y`,
        throws: true
    },

    // ─── ARITHMETIC ───────────────────────────────────────────────────────────
    {
        desc: "Addition",
        source: `number x = 3 + 4`,
        expect: 7
    },
    {
        desc: "Subtraction",
        source: `number x = 10 - 3`,
        expect: 7
    },
    {
        desc: "Multiplication",
        source: `number x = 6 * 7`,
        expect: 42
    },
    {
        desc: "Division",
        source: `number x = 20 / 4`,
        expect: 5
    },
    {
        desc: "Remainder / modulo",
        source: `number x = 17 % 5`,
        expect: 2
    },
    {
        desc: "Operator precedence: * before +",
        source: `number x = 2 + 3 * 4`,
        expect: 14
    },
    {
        desc: "Parentheses override precedence",
        source: `number x = (2 + 3) * 4`,
        expect: 20
    },
    {
        desc: "Unary negation",
        source: `number x = -7`,
        expect: -7
    },
    {
        desc: "Chained arithmetic",
        source: `number x = 1 + 2 + 3 + 4`,
        expect: 10
    },
    {
        desc: "Increment operator",
        source: `number x = 5
            x++
            `,
        expect: 6
    },
    {
        desc: "Decrement operator",
        source: `number x = 5
            x--
            `,
        expect: 4
    },

    // ─── COMPOUND ASSIGNMENT ──────────────────────────────────────────────────
    {
        desc: "+= operator",
        source: `
            number x = 10
            x += 5
        `,
        expect: 15
    },
    {
        desc: "-= operator",
        source: `
            number x = 10
            x -= 3
        `,
        expect: 7
    },
    {
        desc: "*= operator",
        source: `
            number x = 4
            x *= 3
        `,
        expect: 12
    },
    {
        desc: "/= operator",
        source: `
            number x = 20
            x /= 4
        `,
        expect: 5
    },

    // ─── STRINGS ──────────────────────────────────────────────────────────────
    {
        desc: "String literal",
        source: `number x = "hello"`,
        expect: "hello"
    },
    {
        desc: "String concatenation with +",
        source: `number x = "hello" + " world"`,
        expect: "hello world"
    },

    // ─── BOOLEANS ─────────────────────────────────────────────────────────────
    {
        desc: "Boolean true literal",
        source: `number x = true`,
        expect: true
    },
    {
        desc: "Boolean false literal",
        source: `number x = false`,
        expect: false
    },
    {
        desc: "Logical NOT on true",
        source: `number x = !true`,
        expect: false
    },
    {
        desc: "Logical NOT on false",
        source: `number x = !false`,
        expect: true
    },

    // ─── CONDITIONS ───────────────────────────────────────────────────────────
    {
        desc: "Greater than (true)",
        source: `number x = 5 > 3`,
        expect: true
    },
    {
        desc: "Greater than (false)",
        source: `number x = 3 > 5`,
        expect: false
    },
    {
        desc: "Less than",
        source: `number x = 2 < 10`,
        expect: true
    },
    {
        desc: "Equals ==",
        source: `number x = 7 == 7`,
        expect: true
    },
    {
        desc: "Not equals !=",
        source: `number x = 7 != 8`,
        expect: true
    },
    {
        desc: "Greater than or equal (equal case)",
        source: `number x = 5 >= 5`,
        expect: true
    },
    {
        desc: "Less than or equal",
        source: `number x = 3 <= 4`,
        expect: true
    },
    {
        desc: "Logical AND (both true)",
        source: `number x = true && true`,
        expect: true
    },
    {
        desc: "Logical AND (one false)",
        source: `number x = true && false`,
        expect: false
    },
    {
        desc: "Logical OR (one true)",
        source: `number x = false || true`,
        expect: true
    },
    {
        desc: "Logical OR (both false)",
        source: `number x = false || false`,
        expect: false
    },

    // ─── IF / ELSE ────────────────────────────────────────────────────────────
    {
        desc: "If branch taken",
        source: `
            number x = 0
            if (true) {
                x = 1
            }
        `,
        expect: 1
    },
    {
        desc: "If branch !taken",
        source: `
            number x = 0
            if (false) {
                x = 1
            }
        `,
        expect: 0
    },
    {
        desc: "If-else: if branch",
        source: `
            number x = 0
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
            number x = 0
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
            number x = 0
            number y = 1
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
            number x = 0
            number y = 2
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
            number x = 0
            number y = 99
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
        desc: "While loop runs correct number of times",
        source: `
            number x = 0
            number i = 0
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
            number x = 42
            while (false) {
                x = 0
            }
        `,
        expect: 42
    },
    {
        desc: "While loop accumulates sum 1..10",
        source: `
            number x = 0
            number i = 1
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
            number x = 0
            number i = 1
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
        desc: "While loop accumulates sum 1..10 and continues at even numbers",
        source: `
            number x = 0
            number i = 1
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

    // ─── FUNCTIONS ────────────────────────────────────────────────────────────
    {
        desc: "Function declaration and call",
        source: `
            func double(n) {
                ret n * 2
            }
            number x = double(7)
        `,
        expect: 14
    },
    {
        desc: "Function with multiple parameters",
        source: `
            func add(a, b) {
                ret a + b
            }
            number x = add(3, 4)
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
            number x = test(10)
        `,
        expect: 1
    },
    {
        desc: "Function with no ret value rets null",
        source: `
            func nothing() {
            }
            number x = nothing()
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
            number x = factorial(5)
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
            number x = fib(8)
        `,
        expect: 21
    },
    {
        desc: "Function scope does !leak into outer scope",
        source: `
            number x = 100
            func setLocal() {
                number x = 999
            }
            setLocal()
        `,
        expect: 100
    },
    {
        desc: "Function can read outer scope variables",
        source: `
            number base = 10
            func addBase(n) {
                ret base + n
            }
            number x = addBase(5)
        `,
        expect: 15
    },
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
            interp.compile()
            interp.run()
            const output = interp.env["x"] // adjust if your API differs

            if (test.throws) {
                result.error = "Expected an error to be thrown, but none was"
            } else if (typeof test.expect === "function") {
                result.passed = test.expect(output)
                if (!result.passed) result.error = `Custom check failed. Got: ${JSON.stringify(output)}`
            } else {
                result.passed = output === test.expect
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

runTests()