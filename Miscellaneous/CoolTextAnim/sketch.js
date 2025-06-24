//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

let textAnims = []
let texts = ['Fantastic!', 'Amazing!', 'Incredible!', 'Awesome!', 'Cool!', '23', '42', '100', 'Hello!', 'World!']

function mouseClicked(){
    let ta = new TextAnim(texts[Math.floor(Math.random() * texts.length)])
    ta.pos.x = mouseX
    ta.pos.y = mouseY
    textAnims.push(ta)
}

// function mouseDragged(){
//     let ta = new TextAnim(Math.floor(Math.random() * 100))
//     ta.pos.x = mouseX
//     ta.pos.y = mouseY
//     textAnims.push(ta)
// }

function setup(){
    createCanvas(WIDTH, HEIGHT)
}

function draw(){
    background(50)

    for(let i = textAnims.length - 1; i >= 0; i--){
        let ta = textAnims[i]
        ta.show()
        if(ta.finished()){
            textAnims.splice(i, 1)
        }
    }
}
