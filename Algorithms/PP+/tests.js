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
    // --- ARRAY CREATION ---
    {
        desc: "Empty array literal",
        source: `
            var arr = []
            var x = arr
        `,
        expect: []
    },
    {
        desc: "Array literal with values",
        source: `
            var arr = [1, 2, 3]
            var x = arr
        `,
        expect: [1, 2, 3]
    },
    {
        desc: "Nested array literal",
        source: `
            var arr = [[1, 2], [3, 4]]
            var x = arr
        `,
        expect: [[1, 2], [3, 4]]
    },
    {
        desc: "Deeply nested array",
        source: `
            var arr = [[[1, 2], [3, 4]], [[5, 6]]]
            var x = arr
        `,
        expect: [[[1, 2], [3, 4]], [[5, 6]]]
    },
    {
        desc: "Array with mixed types",
        source: `
            var arr = [1, "hello", true]
            var x = arr
        `,
        expect: [1, "hello", true]
    },
    {
        desc: "Array with expressions as elements",
        source: `
            var a = 2
            var arr = [a + 1, a * 3, a]
            var x = arr
        `,
        expect: [3, 6, 2]
    },

    // --- ARRAY ACCESS ---
    {
        desc: "Access first element",
        source: `
            var arr = [10, 20, 30]
            var x = arr[0]
        `,
        expect: 10
    },
    {
        desc: "Access last element",
        source: `
            var arr = [10, 20, 30]
            var x = arr[2]
        `,
        expect: 30
    },
    {
        desc: "Access nested element 2D",
        source: `
            var arr = [[1, 2], [3, 4]]
            var x = arr[1][0]
        `,
        expect: 3
    },
    {
        desc: "Access nested element 3D",
        source: `
            var arr = [[[1, 2], [3, 4]], [[5, 6]]]
            var x = arr[0][1][1]
        `,
        expect: 4
    },
    {
        desc: "Access element with variable index",
        source: `
            var arr = [10, 20, 30]
            var i = 1
            var x = arr[i]
        `,
        expect: 20
    },
    {
        desc: "Access element with expression index",
        source: `
            var arr = [10, 20, 30, 40]
            var i = 1
            var x = arr[i + 1]
        `,
        expect: 30
    },
    {
        desc: "Use array element in expression",
        source: `
            var arr = [3, 4]
            var x = arr[0] * arr[1]
        `,
        expect: 12
    },

    // --- ARRAY ASSIGNMENT ---
    {
        desc: "Assign to first element",
        source: `
            var arr = [1, 2, 3]
            arr[0] = 99
            var x = arr
        `,
        expect: [99, 2, 3]
    },
    {
        desc: "Assign to middle element",
        source: `
            var arr = [1, 2, 3]
            arr[1] = 99
            var x = arr
        `,
        expect: [1, 99, 3]
    },
    {
        desc: "Assign to nested element 2D",
        source: `
            var arr = [[1, 2], [3, 4]]
            arr[0][1] = 99
            var x = arr
        `,
        expect: [[1, 99], [3, 4]]
    },
    {
        desc: "Assign to nested element 3D",
        source: `
            var arr = [[[1, 2], [3, 4]], [[5, 6]]]
            arr[0][1][0] = 99
            var x = arr
        `,
        expect: [[[1, 2], [99, 4]], [[5, 6]]]
    },
    {
        desc: "Assign with variable index",
        source: `
            var arr = [1, 2, 3]
            var i = 2
            arr[i] = 99
            var x = arr
        `,
        expect: [1, 2, 99]
    },
    {
        desc: "Assign expression result to element",
        source: `
            var arr = [1, 2, 3]
            arr[0] = arr[1] + arr[2]
            var x = arr
        `,
        expect: [5, 2, 3]
    },
    {
        desc: "Overwrite entire sub-array",
        source: `
            var arr = [[1, 2], [3, 4]]
            arr[0] = [9, 8, 7]
            var x = arr
        `,
        expect: [[9, 8, 7], [3, 4]]
    },

    // --- PUSH (->) ---
    {
        desc: "Push to end of flat array",
        source: `
            var arr = [1, 2, 3]
            arr->(4)
            var x = arr
        `,
        expect: [1, 2, 3, 4]
    },
    {
        desc: "Push to empty array",
        source: `
            var arr = []
            arr->(42)
            var x = arr
        `,
        expect: [42]
    },
    {
        desc: "Multiple pushes",
        source: `
            var arr = []
            arr->(1)
            arr->(2)
            arr->(3)
            var x = arr
        `,
        expect: [1, 2, 3]
    },
    {
        desc: "Push to sub-array via index",
        source: `
            var arr = [[1, 2], [3, 4]]
            arr[1]->(5)
            var x = arr
        `,
        expect: [[1, 2], [3, 4, 5]]
    },
    {
        desc: "Push to deeply nested sub-array",
        source: `
            var arr = [[[1, 2], [3, 4]], [[5, 6]]]
            arr[0][0]->(99)
            var x = arr
        `,
        expect: [[[1, 2, 99], [3, 4]], [[5, 6]]]
    },
    {
        desc: "Push expression result",
        source: `
            var arr = [1, 2]
            var a = 3
            arr->(a * 2)
            var x = arr
        `,
        expect: [1, 2, 6]
    },

    // --- UNSHIFT (<-) ---
    {
        desc: "Unshift to front of flat array",
        source: `
            var arr = [1, 2, 3]
            arr<-(0)
            var x = arr
        `,
        expect: [0, 1, 2, 3]
    },
    {
        desc: "Unshift to empty array",
        source: `
            var arr = []
            arr<-(42)
            var x = arr
        `,
        expect: [42]
    },
    {
        desc: "Multiple unshifts",
        source: `
            var arr = []
            arr<-(3)
            arr<-(2)
            arr<-(1)
            var x = arr
        `,
        expect: [1, 2, 3]
    },
    {
        desc: "Unshift to sub-array via index",
        source: `
            var arr = [[1, 2], [3, 4]]
            arr[0]<-(0)
            var x = arr
        `,
        expect: [[0, 1, 2], [3, 4]]
    },

    // --- ARRAYS IN LOOPS ---
    {
        desc: "Fill array with for loop",
        source: `
            var arr = [0, 0, 0, 0, 0]
            for(i 0:5){
                arr[i] = i * 2
            }
            var x = arr
        `,
        expect: [0, 2, 4, 6, 8]
    },
    {
        desc: "Accumulate into array with while loop",
        source: `
            var arr = []
            var i = 0
            while(i < 4){
                arr->(i * i)
                i++
            }
            var x = arr
        `,
        expect: [0, 1, 4, 9]
    },
    {
        desc: "Sum array elements with for loop",
        source: `
            var arr = [1, 2, 3, 4, 5]
            var sum = 0
            for(i 0:5){
                sum += arr[i]
            }
            var x = sum
        `,
        expect: 15
    },
    {
        desc: "Build 2D array with nested for loops",
        source: `
            var arr = [[0, 0], [0, 0]]
            for(i 0:2){
                for(j 0:2){
                    arr[i][j] = i + j
                }
            }
            var x = arr
        `,
        expect: [[0, 1], [1, 2]]
    },
    {
        desc: "Reverse array by pushing in reverse order",
        source: `
            var arr = [1, 2, 3, 4]
            var rev = []
            var i = 3
            while(i >= 0){
                rev->(arr[i])
                i--
            }
            var x = rev
        `,
        expect: [4, 3, 2, 1]
    },

    // --- ARRAYS IN FUNCTIONS ---
    {
        desc: "Pass array to function and read element",
        source: `
            func first(arr){
                ret arr[0]
            }
            var arr = [10, 20, 30]
            var x = first(arr)
        `,
        expect: 10
    },
    {
        desc: "Function returns array",
        source: `
            func makeArr(){
                ret [7, 8, 9]
            }
            var x = makeArr()
        `,
        expect: [7, 8, 9]
    },
    {
        desc: "Function sums array elements",
        source: `
            func sum(arr){
                var total = 0
                for(i 0:3){
                    total = total + arr[i]
                }
                ret total
            }
            var x = sum([1, 2, 3])
        `,
        expect: 6
    },

    // --- EDGE CASES ---
    {
        desc: "Assign array to another variable (shared reference)",
        source: `
            var a = [1, 2, 3]
            var b = a
            b[0] = 99
            var x = a
        `,
        expect: [99, 2, 3]
    },
    {
        desc: "Array of empty arrays",
        source: `
            var arr = [[], [], []]
            arr[1]->(5)
            var x = arr
        `,
        expect: [[], [5], []]
    },
    {
        desc: "Chain push then access",
        source: `
            var arr = [1, 2]
            arr->(3)
            var x = arr[2]
        `,
        expect: 3
    },
    {
        desc: "Nested array access after push to sub-array",
        source: `
            var arr = [[1], [2]]
            arr[0]->(9)
            var x = arr[0][1]
        `,
        expect: 9
    },
    // --- POP (->) ---
    {
        desc: "Pop from end of array",
        source: `
            var arr = [1, 2, 3]
            var x = arr->
        `,
        expect: 3
    },
    {
        desc: "Pop leaves array without last element",
        source: `
            var arr = [1, 2, 3]
            arr->
            var x = arr
        `,
        expect: [1, 2]
    },
    {
        desc: "Pop return value used in expression",
        source: `
            var arr = [4, 5, 6]
            var x = arr-> + 10
        `,
        expect: 16
    },
    {
        desc: "Multiple pops return correct values in order",
        source: `
            var arr = [1, 2, 3]
            var a = arr->
            var b = arr->
            var x = [a, b]
        `,
        expect: [3, 2]
    },
    {
        desc: "Pop until one element left",
        source: `
            var arr = [1, 2, 3]
            arr->
            arr->
            var x = arr
        `,
        expect: [1]
    },
    {
        desc: "Pop result stored and array also checked",
        source: `
            var arr = [10, 20, 30]
            var popped = arr->
            arr[0] = popped
            var x = arr
        `,
        expect: [30, 20]
    },
    {
        desc: "Pop from sub-array",
        source: `
            var arr = [[1, 2, 3], [4, 5]]
            var x = arr[0]->
        `,
        expect: 3
    },
    {
        desc: "Pop from sub-array mutates correctly",
        source: `
            var arr = [[1, 2, 3], [4, 5]]
            arr[0]->
            var x = arr
        `,
        expect: [[1, 2], [4, 5]]
    },
    {
        desc: "Push then pop cancels out",
        source: `
            var arr = [1, 2, 3]
            arr->(99)
            arr->
            var x = arr
        `,
        expect: [1, 2, 3]
    },
    {
        desc: "Pop used in condition",
        source: `
            var arr = [1, 2, 0]
            var x = false
            if(arr->){
                x = true
            }
        `,
        expect: false
    },

    // --- SHIFT (<-) ---
    {
        desc: "Shift from front of array",
        source: `
            var arr = [1, 2, 3]
            var x = <-arr
        `,
        expect: 1
    },
    {
        desc: "Shift leaves array without first element",
        source: `
            var arr = [1, 2, 3]
            <-arr
            var x = arr
        `,
        expect: [2, 3]
    },
    {
        desc: "Shift return value used in expression",
        source: `
            var arr = [4, 5, 6]
            var x = <-arr + 10
        `,
        expect: 14
    },
    {
        desc: "Multiple shifts return correct values in order",
        source: `
            var arr = [1, 2, 3]
            var a = <-arr
            var b = <-arr
            var x = [a, b]
        `,
        expect: [1, 2]
    },
    {
        desc: "Shift until one element left",
        source: `
            var arr = [1, 2, 3]
            <-arr
            <-arr
            var x = arr
        `,
        expect: [3]
    },
    {
        desc: "Shift result stored and used",
        source: `
            var arr = [10, 20, 30]
            var shifted = <-arr
            arr[0] = shifted
            var x = arr
        `,
        expect: [10, 30]
    },
    {
        desc: "Shift from sub-array",
        source: `
            var arr = [[1, 2, 3], [4, 5]]
            var x = <-arr[0]
        `,
        expect: 1
    },
    {
        desc: "Shift from sub-array mutates correctly",
        source: `
            var arr = [[1, 2, 3], [4, 5]]
            <-arr[0]
            var x = arr
        `,
        expect: [[2, 3], [4, 5]]
    },
    {
        desc: "Unshift then shift cancels out",
        source: `
            var arr = [1, 2, 3]
            arr<-(99)
            <-arr
            var x = arr
        `,
        expect: [1, 2, 3]
    },
    {
        desc: "Shift used in condition",
        source: `
            var arr = [0, 1, 2]
            var x = false
            if(<-arr){
                x = true
            }
        `,
        expect: false
    },

    // --- POP AND SHIFT TOGETHER ---
    {
        desc: "Pop and shift from same array",
        source: `
            var arr = [1, 2, 3, 4, 5]
            var a = arr->
            var b = <-arr
            var x = [a, b]
        `,
        expect: [5, 1]
    },
    {
        desc: "Pop and shift leave correct remainder",
        source: `
            var arr = [1, 2, 3, 4, 5]
            arr->
            <-arr
            var x = arr
        `,
        expect: [2, 3, 4]
    },
    {
        desc: "Drain array alternating pop and shift",
        source: `
            var arr = [1, 2, 3, 4]
            var a = arr->
            var b = <-arr
            var c = arr->
            var d = <-arr
            var x = [a, b, c, d]
        `,
        expect: [4, 1, 3, 2]
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
        expect: 7
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
    },
    {
        desc: 'For loop with explicit condition in end',
        source: `
            var x = 0
            for(i 0:(x<10)){
                x++
            }
        `,
        expect: 10
    },
    // --- LENGTH OF ARRAYS ---
    {
        desc: "Length of flat array",
        source: `
            var arr = [1, 2, 3]
            var x = |arr|
        `,
        expect: 3
    },
    {
        desc: "Length of empty array",
        source: `
            var arr = []
            var x = |arr|
        `,
        expect: 0
    },
    {
        desc: "Length of single element array",
        source: `
            var arr = [42]
            var x = |arr|
        `,
        expect: 1
    },
    {
        desc: "Length of nested array (counts top-level only)",
        source: `
            var arr = [[1, 2], [3, 4], [5, 6]]
            var x = |arr|
        `,
        expect: 3
    },
    {
        desc: "Length of sub-array via index",
        source: `
            var arr = [[1, 2, 3], [4, 5]]
            var x = |arr[0]|
        `,
        expect: 3
    },
    {
        desc: "Length changes after push",
        source: `
            var arr = [1, 2, 3]
            arr->(4)
            var x = |arr|
        `,
        expect: 4
    },
    {
        desc: "Length changes after pop",
        source: `
            var arr = [1, 2, 3]
            arr->
            var x = |arr|
        `,
        expect: 2
    },
    {
        desc: "Length changes after unshift",
        source: `
            var arr = [1, 2, 3]
            arr<-(0)
            var x = |arr|
        `,
        expect: 4
    },
    {
        desc: "Length changes after shift",
        source: `
            var arr = [1, 2, 3]
            <-arr
            var x = |arr|
        `,
        expect: 2
    },
    {
        desc: "Length used as loop bound",
        source: `
            var arr = [10, 20, 30, 40]
            var sum = 0
            for(i 0:|arr|){
                sum = sum + arr[i]
            }
            var x = sum
        `,
        expect: 100
    },
    {
        desc: "Length used in condition",
        source: `
            var arr = [1, 2, 3]
            var x = false
            if(|arr| == 3){
                x = true
            }
        `,
        expect: true
    },
    {
        desc: "Length in expression",
        source: `
            var arr = [1, 2, 3, 4]
            var x = |arr| * 2
        `,
        expect: 8
    },
    {
        desc: "Length of array built dynamically",
        source: `
            var arr = []
            arr->(1)
            arr->(2)
            arr->(3)
            var x = |arr|
        `,
        expect: 3
    },

    // --- LENGTH OF STRINGS ---
    {
        desc: "Length of string",
        source: `
            var s = "Hello"
            var x = |s|
        `,
        expect: 5
    },
    {
        desc: "Length of empty string",
        source: `
            var s = ""
            var x = |s|
        `,
        expect: 0
    },
    {
        desc: "Length of string literal inline",
        source: `
            var x = |"Hello World"|
        `,
        expect: 11
    },
    {
        desc: "Length of string used in condition",
        source: `
            var s = "Hi"
            var x = false
            if(|s| < 5){
                x = true
            }
        `,
        expect: true
    },
    {
        desc: "Length of string used in expression",
        source: `
            var s = "abc"
            var x = |s| + 1
        `,
        expect: 4
    },

    // --- LENGTH IN FUNCTIONS ---
    {
        desc: "Length passed to function",
        source: `
            func lenOf(arr){
                ret |arr|
            }
            var arr = [1, 2, 3, 4, 5]
            var x = lenOf(arr)
        `,
        expect: 5
    },
    {
        desc: "Function uses length as loop bound",
        source: `
            func sum(arr){
                var total = 0
                for(i 0:|arr|){
                    total = total + arr[i]
                }
                ret total
            }
            var x = sum([1, 2, 3, 4])
        `,
        expect: 10
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

        let result = { desc: test.desc, passed: false, error: null, got: undefined, source: test.source }

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
        if (!r.passed) {
            console.log(`     → ${r.error}`)
            console.log('Source:\n' + r.source)
        }
    }

    console.log("\n───────────────────────────────────────")
    console.log(failed === 0 ? "  🎉 All tests passed!" : `  ⚠️  ${failed} test(s) failed`)
    console.log("───────────────────────────────────────\n")

    return { passed, failed, results }
}