//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true


let DT

let enemyManager, player, ballManager
let textAnims = []

async function setup(){
    createCanvas(WIDTH, HEIGHT)
    let font = await loadFont('font.ttf')
    textFont(font)
    enemyManager = new EnemyManager()
    ballManager = new BallManager()
    player = new Player()
}

function draw(){
    DT = deltaTime * 0.1
    background(255)

   

    ballManager.update(DT)
    ballManager.show()

    enemyManager.update(DT)
    enemyManager.show()

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
