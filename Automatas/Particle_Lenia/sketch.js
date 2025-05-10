// Particle Lenia with shader-based field visualization in p5.js

let particles = [];
let params;
let dt = 0.1;
let stepsPerFrame = 1;
let numParticles = 90;
let WIDTH = 1200
let HEIGHT = 700
let fieldGfx;
let leniaShader;
let worldRadius = 15;
let worldSize = worldRadius * 2;
let offset
let lastMouse;
let zoom = 1.0;


function mousePressed() {
    lastMouse = createVector(mouseX, mouseY);
}

function mouseDragged() {
    if(panel.isMouseInBounds()) return
    if(panel.isInteracting) return
    let current = createVector(mouseX, mouseY);
    let delta = p5.Vector.sub(current, lastMouse);
    lastMouse = current;

    // mundo “visible” con zoom
    let scaledWorldSize = worldSize / zoom;

    // de píxeles → unidades del mundo
    let dx = delta.x * (scaledWorldSize / width);
    let dy = delta.y * (scaledWorldSize / height);

    // arrastrar → mover la cámara en sentido opuesto
    offset.x -= dx;
    offset.y -= dy;
}


function mouseWheel(event) {
    let zoomFactor = 1.05;
    let oldZoom = zoom;

    // Actualiza el zoom (positivo → alejamos)
    if(event.delta > 0) zoom /= zoomFactor;
    else zoom *= zoomFactor;

    // Limita el zoom
    zoom = constrain(zoom, 0.2, 5);

    // Corrige el offset para que el punto bajo el cursor se mantenga fijo
    let mx = (mouseX - width / 2) * (worldSize / width);
    let my = (mouseY - height / 2) * (worldSize / height);
    offset.add(mx * (1 / oldZoom - 1 / zoom), my * (1 / oldZoom - 1 / zoom));

    return false; // evita que la página se desplace
}


let panel
let sliders = []
let trans = 1.0
async function setup() {
    // Use WEBGL for offscreen graphics
    createCanvas(WIDTH, HEIGHT);
    leniaShader = await loadShader("shader.vert", "shader.frag");
    let fontPanel = await loadFont("migUI/main/bnr.ttf")
    panel = new Panel({
        x: 0,
        font: fontPanel,
        retractable: true,
        darkCol: color(0, 0, 0, 50),
    })
    panel.createText('Particle Lenia', true)
    panel.createSeparator()
    let sl1 = panel.createSlider(3.0, 6.0, random(3.5, 5.5), 'mu_k', true);       // Kernel peak distance
    let sl2 = panel.createSlider(0.5, 2.0, random(0.8, 1.5), 'sigma_k', true);    // Kernel width
    let sl3 = panel.createSlider(0.01, 0.05, random(0.015, 0.03), 'w_k', true);   // Kernel weight
    let sl4 = panel.createSlider(0.4, 0.8, random(0.5, 0.7), 'mu_g', true);       // Growth center
    let sl5 = panel.createSlider(0.05, 0.3, random(0.1, 0.2), 'sigma_g', true);   // Growth width
    let sl6 = panel.createSlider(0.5, 2.0, random(0.8, 1.5), 'c_rep', true);      // Repulsion strength
    
    sliders.push(sl1, sl2, sl3, sl4, sl5, sl6)
    let bt = panel.createButton('Randomize', true)
    bt.setFunc(() => {
        for(let i = 0; i < sliders.length; i++) {
            sliders[i].setValue(random(sliders[i].min, sliders[i].max))
        }
    })
    let cb = panel.createCheckbox('High Fidelity', false)
    cb.setFunc((arg) => {
        if(arg) pixelDensity(displayDensity())
        else pixelDensity(1)
    })
    panel.createSeparator()
    // dt and stepsPerFrame
    let sl7 = panel.createSlider(0.01, 2, 0.1, 'dt', true)
    sl7.setFunc((arg) => {
        dt = arg
    })
    let sl8 = panel.createSlider(1, 25, 1, 'Steps per Frame', true)
    sl8.setFunc((arg) => {
        stepsPerFrame = arg
    })
    sl8.integer = true
    let sl9 = panel.createSlider(0.65, 1.0, 1.0, 'Transparency')
    sl9.setFunc((arg) => {
        trans = arg
    })

    let fpsCounter = panel.createText('FPS: 0')
    fpsCounter.setFunc(() => {
        return 'FPS: ' + Math.round(frameRate())
    })

    offset = createVector(0, 0);
    pixelDensity(1);
    fieldGfx = createGraphics(width, height, WEBGL);
    fieldGfx.noStroke();

    // Initialize parameters
    params = {
        mu_k: random(2.0, 6.0), // distancia donde el kernel gaussiano tiene su pico (zona de influencia)
        sigma_k: random(0.3, 2.0), // ancho del kernel, afecta a la difusión
        w_k: random(0.005, 0.05), // peso total del kernel, controla la fuerza del campo U
        mu_g: random(0.3, 0.9), // valor óptimo de activación G
        sigma_g: random(0.05, 0.3), // tolerancia de G, cuánto se activa fuera del óptimo
        c_rep: random(0.2, 2.0), // fuerza de repulsión entre partículas cercanas
    };

    // Sample initial particle positions in [-6,6]
    for(let i = 0; i < numParticles; i++) {
        let x = 0 + random(-1, 1);
        let y = 0 + random(-1, 1);
        particles.push(createVector(x, y));
    }

    noStroke();
}


function draw() {

    //get value of the sliders
    params.mu_k = sliders[0].getValue()
    params.sigma_k = sliders[1].getValue()
    params.w_k = sliders[2].getValue()
    params.mu_g = sliders[3].getValue()
    params.sigma_g = sliders[4].getValue()
    params.c_rep = sliders[5].getValue()

    // Integrate motion
    for(let s = 0; s < stepsPerFrame; s++) {
        updateParticles();
    }

    let scaledWorldSize = worldSize / zoom;
    let scaledWorldRadius = scaledWorldSize / 2;


    // Render field into offscreen buffer
    fieldGfx.shader(leniaShader);
    leniaShader.setUniform("u_resolution", [width, height]);

    // Pack particle positions into flat array [x0,y0,x1,y1,...], normalized [0,1]
    let packed = [];
    for(let pt of particles) {
        packed.push((pt.x + scaledWorldRadius - offset.x) / scaledWorldSize);
        packed.push((pt.y + scaledWorldRadius - offset.y) / scaledWorldSize);
    }
    leniaShader.setUniform("u_particles", packed);
    leniaShader.setUniform("u_num_particles", numParticles);

    // Pass parameters
    leniaShader.setUniform("u_mu_k", params.mu_k);
    leniaShader.setUniform("u_sigma_k", params.sigma_k);
    leniaShader.setUniform("u_w_k", params.w_k);
    leniaShader.setUniform("u_mu_g", params.mu_g);
    leniaShader.setUniform("u_sigma_g", params.sigma_g);
    leniaShader.setUniform("u_c_rep", params.c_rep);
    leniaShader.setUniform('u_world_size', scaledWorldSize);
    leniaShader.setUniform('u_world_radius', scaledWorldRadius);
    leniaShader.setUniform('u_offset', [offset.x, offset.y]);
    leniaShader.setUniform('u_point_radius', .45);
    leniaShader.setUniform('u_trans', trans);
    leniaShader.setUniform("u_aspect", width / height);




    // Draw fullscreen quad in the offscreen buffer
    fieldGfx.push();
    fieldGfx.translate(-width / 2, -height / 2);
    fieldGfx.rect(0, 0, width, height);
    fieldGfx.pop();

    // Draw the field buffer on main canvas
    image(fieldGfx, 0, 0, width, height);

    push()
    panel.update()
    panel.show()
    pop()

}

function updateParticles() {
    let newPts = [];
    for (let pt of particles) {
        let v = gradE(params, particles, pt.x, pt.y);
        newPts.push({
            x: pt.x + (v.x) * dt,
            y: pt.y + (v.y) * dt
        });
    }
    particles = newPts;
}


function peak(x, mu, sigma) {
    return Math.exp(-Math.pow((x - mu) / sigma, 2));
}
function computeFields(p, pts, x, y) {
    let U = 0,
        R = 0;
    for (let pt of pts) {
        let dx = x - pt.x;
        let dy = y - pt.y;
        let r = Math.hypot(dx, dy) + 1e-5;
        U += peak(r, p.mu_k, p.sigma_k);
        if (r < 1) R += 0.5 * p.c_rep * Math.pow(1 - r, 2);
    }
    U *= p.w_k;
    let G = peak(U, p.mu_g, p.sigma_g);
    return {
        U,
        G,
        R,
        E: R - G
    };
}

function gradE(p, pts, x, y) {
    let eps = 1e-3;
    let e1 = computeFields(p, pts, x + eps, y).E;
    let e2 = computeFields(p, pts, x - eps, y).E;
    let e3 = computeFields(p, pts, x, y + eps).E;
    let e4 = computeFields(p, pts, x, y - eps).E;
    let dx = (e1 - e2) / (2 * eps);
    let dy = (e3 - e4) / (2 * eps);
    return { x: -dx, y: -dy };
}
