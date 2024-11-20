//Delaunay Triangulation fuerza bruta
//Miguel Rodríguez
//27-08-2024

const WIDTH = 600
const HEIGHT = 600

let points = []
let triangles = []
let circles = []
let centers = []
let voronoi = false
let circ

function setup(){
    createCanvas(WIDTH, HEIGHT)
    noLoop()
    stroke(0)
    strokeWeight(2)
    points.push([300, 250], 
                [230, 350],
                [370, 350])
    triangles = delaunayTriangulation(points);
    redraw()
    
}

function keyPressed(){
    voronoi = true
    redraw()
}

function keyReleased(){
    voronoi = false
    redraw()
}

function mouseClicked(){
    points.push([mouseX, mouseY])
    circles = []
    triangles = delaunayTriangulation(points);
    redraw()
}

function draw(){
    background(0)
    stroke(0)
    for(let t of triangles){
        beginShape(TRIANGLES)
        fill(random(0, 255), 50, 100)
        if(voronoi){
            fill(0)
            stroke(255)
        }
        vertex(t[0][0], t[0][1])
        vertex(t[1][0], t[1][1])
        vertex(t[2][0], t[2][1])
        endShape()
    }
    for(let c of circles){
        stroke(255, 30)
        noFill()
        ellipse(c[0], c[1], c[2]*2, c[2]*2)   
    }
    if(voronoi){
        for(let c of circles){
            fill(255, 0, 0) 
            noStroke()
            ellipse(c[0], c[1], 8, 8)
        }
    }
}

function calculateCircumcenter(triangle) {
    const [A, B, C] = triangle
    const D = 2 * (A[0] * (B[1] - C[1]) + B[0] * (C[1] - A[1]) + C[0] * (A[1] - B[1]))

    const Ux = (
        ((A[0] ** 2 + A[1] ** 2) * (B[1] - C[1])) +
        ((B[0] ** 2 + B[1] ** 2) * (C[1] - A[1])) +
        ((C[0] ** 2 + C[1] ** 2) * (A[1] - B[1]))
    ) / D

    const Uy = (
        ((A[0] ** 2 + A[1] ** 2) * (C[0] - B[0])) +
        ((B[0] ** 2 + B[1] ** 2) * (A[0] - C[0])) +
        ((C[0] ** 2 + C[1] ** 2) * (B[0] - A[0]))
    ) / D

    const radius = Math.sqrt((A[0] - Ux) ** 2 + (A[1] - Uy) ** 2)

   
    return { center: [Ux, Uy], radius }
}

function pointInCircle(point, circle) {
    const [x, y] = point
    const [Ux, Uy] = circle.center
    const distance = Math.sqrt((x - Ux) ** 2 + (y - Uy) ** 2)
    return distance < circle.radius
}

function isDelaunayTriangle(triangle, points) {
    circ = calculateCircumcenter(triangle)
    return !points.some(point => !triangle.includes(point) && pointInCircle(point, circ))
}

function delaunayTriangulation(points) {
    const triangles = []
    const n = points.length

    for (let i = 0; i < n - 2; i++) {
        for (let j = i + 1; j < n - 1; j++) {
            for (let k = j + 1; k < n; k++) {
                const triangle = [points[i], points[j], points[k]]
                if (isDelaunayTriangle(triangle, points)) {
                    circles.push([circ.center[0], circ.center[1], circ.radius])
                    centers.push([circ.center[0], circ.center[1]])
                    triangles.push(triangle)
                }
            }
        }
    }
    return triangles;
}

function SWAP(x0, x) {
    let temp = x0.slice();  // Copy contents of x0
    x0.length = 0;          // Clear x0
    x0.push(...x);          // Copy contents of x to x0
    x.length = 0;           // Clear x
    x.push(...temp);        // Copy contents of temp (old x0) to x
}





