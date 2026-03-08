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
    number stop = 0

    func draw(){
        clear()
        number angle = 0
        stop += 1
        number realStop = stop % 360
        while(angle < realStop){
            number x = 300 + 200 * cos(radians(angle))
            number y = 300 + 200 * sin(radians(angle))
            fill(255, 0, 0)
            rect(x, y, 10, 10)
            angle += 1
        }
    }

    say(stop)

    draw()

    say(stop)
`

let sourceCode = test2