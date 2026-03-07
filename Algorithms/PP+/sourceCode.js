let sourceCode = `
    number x = 0
    number i = 1
    while (i <= 10) {
        i += 1
        if(i % 2 == 0){
            continue
        }
        x += i
    }
        say(x)
`