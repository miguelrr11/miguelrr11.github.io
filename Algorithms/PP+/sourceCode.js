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

// a->(x) works but a[i]->(x) doesnt because it expects an assignment (=), not a push/unshift
let pushUnshift = `
    var a = [[[], 2],[3, 4]]
    a[0][0]->(9)

    say(a[0])
`

let sourceCode = pushUnshift

/*
DONE
push  			arr->(x)       	
unshift			arr<-(x)	   

TODO
let x = arr.pop()	    var x = arr->
let y = arr.shift()     var y = <-arr

getlast 		arr[*]
split(sx, ex)	arr[sx | ex]

.length         |arr|

a->(x) needs to work, but also
a[i]->(x) needs to work, but also
a[i][j]->(x) and so on

TODO:

match x {
    1 -> say("one")
    2 -> say("two")
    _ -> say("other")
}

*/