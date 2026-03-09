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

let dummy = `
    var a
`

let sourceCode = testFor