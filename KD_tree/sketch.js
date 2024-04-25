//KD-Tree creation and search
//Miguel Rodríguez
//25-04-24

const WIDTH = 600
const HEIGHT = 600
let tree
let points = []
let nodosVisitados = []
let extraCanvas
let img

function preload(){
    img = loadImage('millondepuntos.png')
}

function setup(){
    createCanvas(WIDTH, HEIGHT)

    extraCanvas = createGraphics(WIDTH, HEIGHT)
    extraCanvas.clear()

    scale(0.5)
    image(img, 0, 0)
    scale(2)
    
    console.time('loop')
    for(let i = 0; i < 1000000; i++){
        points.push(createVector(floor(random(10, WIDTH-10)), floor(random(10, HEIGHT-10))))
    }
    console.timeEnd('loop')

    console.time('tree')
    tree = new KDtree(points)
    console.timeEnd('tree')

    extraCanvas.fill(0,255, 0)
    extraCanvas.stroke(0)
    extraCanvas.strokeWeight(2)
    extraCanvas.textSize(13)
    extraCanvas.textFont('Courier')
    extraCanvas.text('Haz click para encontrar el punto más cercano de entre estos 1.000.000', WIDTH + 20, HEIGHT - 100)
    image(extraCanvas, 0, 0);
    
}

function mouseClicked(){
    if(!(mouseX < WIDTH && mouseY < HEIGHT)) return
    extraCanvas.clear()
    scale(0.5)
    image(img, 0, 0)
    scale(2)
    nodosVisitados = []
    
    let newPoint = createVector(mouseX, mouseY)

    let start = performance.now()
    let res = tree.closestPoint(newPoint)
    let end = performance.now()
    let t1 = end-start

    start = performance.now()

    for(let n of nodosVisitados) n.show(true)

    extraCanvas.fill(255, 0, 0)
    extraCanvas.ellipse(newPoint.x, newPoint.y, 5)
    extraCanvas.fill(0, 255, 0)
    extraCanvas.ellipse(res.location.x, res.location.y, 5)

    end = performance.now()
    let t2 = end-start

    start = performance.now()
    let slowest = closestSlowest(newPoint)
    end = performance.now()
    let t3 = end-start

    extraCanvas.fill(0,255,0)
    extraCanvas.stroke(0)
    extraCanvas.strokeWeight(2)
    extraCanvas.textSize(13)
    extraCanvas.text('Haz click para encontrar el punto más cercano de entre estos 1.000.000', 20, 20)
    extraCanvas.text("Punto más cercano encontrado en: " + (Math.round(t1 * 100) / 100) + " ms (KD-Tree)", 20, 40)
    extraCanvas.text("Punto más cercano encontrado en: " + (Math.round(t3 * 100) / 100) + " ms (Bucle simple)", 20, 60)
    extraCanvas.text("Tiempo empleado en renderizar: " + (Math.round(t2 * 100) / 100) + " ms", 20, 80)
    image(extraCanvas, 0, 0)
    
}

function closestSlowest(point){
    let best = points[0]
    for(let p of points){
        if(distn(p.x, p.y, point.x, point.y) < distn(best.x, best.y, point.x, point.y)) best = p
    }
    return best
}

function distn(ax, ay, bx, by){
    let dx = ax - bx 
    let dy = ay - by 
    return (dx * dx) + (dy * dy)
}


