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
    var a = [1]
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
                if(1 == |a|){
                    say("if inside block inside match")
                }
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



let inlineStatements = `
    var x = 2
    if(x == 0) say("x is zero")
    else if(x == 1) say("x is one")
    else say("x is not zero")

    while(x < 5) {
        while(x < 5) say(x++)
    }

    for(i 0:5) say(i)

    func test(n) ret n * 2
    say("test " + test(3))
`

let saveFuncsInArrays = `
    var arr = []
    func test() ret 42
    arr->(test)
    
    ## this works
    var x = arr[0]
    say(x())

    ## but this doesnt
    ## arr[0]()
`   

let all = `
var num = 5
var str = "Hello World"
var arr = []

num += 10

if(num > 10){
    say("Greater than 10")
}

func double(x){
    ret x * 2
}

arr->(double(num))

match(num){
    1 -> say(1)
    15 -> say(15)
    _ -> say("default")
}

func draw(x){
    say(2)
}

draw(1)
`

let orbits = `


var ballX =  width() / 2
var ballY = height() / 2
var nOrbits = 20

var orbits = []

func setup(){
    for(i 0:nOrbits) orbits->([0, 0])
    say(orbits)
}

func draw(){
    clear(0)
    fill(180, 180, 180)
    rect(0, 0, width(), width())

    ballX = lerp(ballX, mouseX(), 0.05)
    ballY = lerp(ballY, mouseY(), 0.05)

    noStroke()
    fill(0, 0, 200)

    for(i 0:|orbits|){
        var orbit = orbits[i]
        orbit[0] = ballX + cos(((i/nOrbits)*6.28 + frameCount() * 0.05)) * sin(frameCount() * 0.01) * 150
        orbit[1] = ballY + sin(((i/nOrbits)*6.28 + frameCount() * 0.05)) * cos(frameCount() * 0.01) * 150

        ellipse(orbit[0], orbit[1], 10, 10)
    }

    
    ellipse(ballX, ballY, 30, 30)

}

draw()
setup()

`

let gameoflife = `
var grid = []
var newGrid = []
var w = width()
var h = height()
var sizeCell = 20
var nCells = floor(min(w, h) / sizeCell)

var nb = [[-1, -1], [0, -1], [1, -1],[-1, 0],[1, 0],[-1, 1], [0, 1], [1, 1]]

func setup(){
    for(i 0:nCells){
        frameRate(60)
        grid[i] = []
        newGrid[i] = []
        for(j 0:nCells){
            grid[i][j] = floor(random(0, 2))
            newGrid[i][j] = floor(random(0, 2))
        }
    }
}

func wrap(i, stop) {
   ret ((i % stop) + stop) % stop
}

func draw(){
    background(0, 0, 0)
    fill(255, 255, 255)
    noStroke()
    if(mouseIsPressed() && (mouseX() > 0) && (mouseX() < w) && (mouseY() > 0) && (mouseY() < h)){
        setup()
    }
    updateCells()
    for(i 0:nCells){
        for(j 0:nCells){
            if(grid[i][j] == 1) rect(i * sizeCell, j * sizeCell, sizeCell, sizeCell) 
        }
    }
    for(i 0:nCells){
        for(j 0:nCells){
            grid[i][j] = newGrid[i][j]
        }
    }
}

func updateCells(){
    newGrid = []
    for(i 0:nCells){
        newGrid[i] = []
        for(j 0:nCells){
            var sum = 0
            newGrid[i][j] = grid[i][j]
            for(k 0:|nb|){
                if(grid[wrap((i + nb[k][0]), nCells)][wrap((j + nb[k][1]), nCells)] == 1) sum++
            }
            if(grid[i][j] == 1){
                if(sum == 2 || sum == 3) newGrid[i][j] = 1
                else newGrid[i][j] = 0
            }
            else if(grid[i][j] == 0){
                if(sum == 3) newGrid[i][j] = 1
                else newGrid[i][j] = 0
            }
        }
    }
}

setup()
`

let sourceCode = orbits

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