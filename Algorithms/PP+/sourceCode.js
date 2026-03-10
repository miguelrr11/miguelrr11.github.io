let test = `
    number stop = 0

    func test(){
        stop += 1
    }

    say(stop)

    test()

    say(stop)
`

let test2 = `
    number angle = 0

    func draw(){
        noStroke()
        number x = 300 + noise(angle * 0.01) * 300 * cos(radians(angle))
        number y = 300 + noise(angle * 0.01) * 300 * sin(radians(angle))
        fill(noise(angle * 0.01) * 255, noise(angle * 0.03) * 255, noise(angle * 0.07) * 255)
        rect(x, y, noise(angle * 0.01) * 20, noise((angle + 20) * 0.01) * 20)
        angle+=0.5
    }

    draw()

`

let test3 = `
    number stop = 0
    stop++
    stop++
    stop--

    say(stop)
`

let testArr = `
    func f(){
        ret 1
    }
    var arr = [1, 2, 3]
    arr[f()] = 2 + 2
    say(arr[0])
`

let testFor = `
    var iters = 0
    for(i 0:10 step 0){
        say("hol.a")
        iters++
        if(iters > 100){
            ret
        }
    }
`

let gridTest = `
    ##doesnt work because I didnt implement the syntax of concatenating arrays with the [] operator, but it works if you assign the inner arrays separately
    ##var grid = [[0, 1], [2, 3]]
    ##say(grid[0][1])

    var grid = [0, 0]
    grid[0] = [0, 1]
    grid[1] = [2, 3]
    say(grid[0])
`

let dummy = `
    var a
`

let pushUnshift = `
    var a = [[[], 2],[3, 4]]
    a[0][0]->(9)

    say(a[0])
`

let testPop = `
    var a = [1, 2, 3]
    var b = a->
    var c = <-a
    a->
`

let testWeird = `
    var a = [1, 2, 3]
    a->([<-a])
    say(a)
`

let testLength = `
    var a = [1, 2, 3]
    for(i |a|-1:-1 step -1){
        say(a[i])
    }
`

let matchTest = `
    var x = 6
    var a = []
    match(x){
        1 -> match(x){
            1 -> say("should print if x == 1")
            (x + 1 - 1) -> say("should print if x == 1")
        }
        3 -> ret
        3 -> say("if x == 3 it shouldn't print bc it returned")
        6 -> {
                func test(){
                    say("this, as weird as it is, should print")
                }
                test()
            }
        _ -> say("other")   ## shouldn't print ever
        _ -> say("other 2") ## should print if x didnt match
    }
    say(a)
    say(x)
`

let matchPropagate =  `
    func test(n){
        match(n){
            1 -> ret 1
            _ -> ret 42
        }
        ret 0
    }
    var x = test(99)
    say(x)
`

let sourceCode = matchPropagate

/*
DONE
push  			arr->(x)       	
unshift			arr<-(x)	   
let x = arr.pop()	    var x = arr->
let y = arr.shift()     var y = <-arr

getlast 		arr[*]
split(sx, ex)	arr[sx | ex]

arr.length         |arr|


TODO:

match (x) {
    1 -> say("one")
    2 -> say("two")
    _ -> say("other")
}

match (<expression>){
    <expression> -> <statement>
    <expression> -> <statement>
    _ -> <statement>
}

*/