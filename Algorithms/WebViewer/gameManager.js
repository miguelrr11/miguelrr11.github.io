
let currentGame = {
    from: undefined,
    to: undefined,
    score: 0
}

function startGame() {
    resetState()
    btnGame.bool = true
    started = true
    currentGame = {
        from: random(articles),
        to: random(articles),
        score: 1
    }

    btnGame.str = 'Game started'
    btnGame.secondStr = 'Goal: ' + removeBarrabaja(getLastPartOfLink(decodeURIComponent(currentGame.to))) +
        '\nArticles visited: ' + currentGame.score

    let link = currentGame.from
    let primordial = new Particle(width / 2, height / 2, true, -1, link);
    primordial.color = random(colors);
    particles.push(primordial);
    parentParticles.push({
        pos: primordial.pos.copy(),
        radius: 50
    })

    createGraph(link, primordial)
        .then(() => {
            started = true;
        })
        .catch(() => {
            console.log('Error loading game')
        });
}

function resetGame() {
    currentGame = {
        from: undefined,
        to: undefined,
        score: 1
    }
    btnGame.str = 'Start Game'
    btnGame.secondStr = ''
    btnGame.bool = false
}

let winningParticle = undefined

function checkEndGame() {
    for(let p of particles) {
        if(p.link == currentGame.to) {
            btnGame.str = 'You found the article, open it to end the game!'
            winningParticle = p
            return
        }
    }
}

function endGame() {
    btnGame.str = 'Game finished!\nArticles visited: ' + currentGame.score
    btnGame.bool = false
    winningParticle = undefined
}