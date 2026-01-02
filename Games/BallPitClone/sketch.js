//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true


let DT

let enemyManager, player, ballManager, pm
let textAnims = []

async function setup(){
    createCanvas(WIDTH, HEIGHT)
    let font = await loadFont('font.ttf')
    textFont(font)
    enemyManager = new EnemyManager()
    ballManager = new BallManager()
    player = new Player()
    pm = new ParticleManager()
}

function draw(){
    DT = deltaTime * 0.1
    background(225)

    enemyManager.update(DT)
    enemyManager.show()

    ballManager.update(DT)
    ballManager.show()

    pm.update()
    pm.show()

    player.update(DT)
    player.show()

    for(let i = textAnims.length - 1; i >= 0; i--){
        let ta = textAnims[i]
        ta.show()
        if(ta.finished()){
            textAnims.splice(i, 1)
        }
    }
}
