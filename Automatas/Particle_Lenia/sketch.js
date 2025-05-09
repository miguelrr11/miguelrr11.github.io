// Particle Lenia with shader-based field visualization in p5.js

let particles = [];
let params;
let dt = 0.1;
let stepsPerFrame = 1;
let numParticles = 80;
let canvasSize = 750;
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
    let delta  = p5.Vector.sub(current, lastMouse);
    lastMouse = current;
  
    // mundo “visible” con zoom
    let scaledWorldSize = worldSize / zoom;
  
    // de píxeles → unidades del mundo
    let dx = delta.x * (scaledWorldSize / canvasSize);
    let dy = delta.y * (scaledWorldSize / canvasSize);
  
    // arrastrar → mover la cámara en sentido opuesto
    offset.x -= dx;
    offset.y -= dy;
  }
  

function mouseWheel(event) {
    let zoomFactor = 1.05;
    let oldZoom = zoom;

    // Actualiza el zoom (positivo → alejamos)
    if (event.delta > 0) zoom /= zoomFactor;
    else zoom *= zoomFactor;

    // Limita el zoom
    zoom = constrain(zoom, 0.2, 5);

    // Corrige el offset para que el punto bajo el cursor se mantenga fijo
    let mx = (mouseX - canvasSize / 2) * (worldSize / canvasSize);
    let my = (mouseY - canvasSize / 2) * (worldSize / canvasSize);
    offset.add(mx * (1 / oldZoom - 1 / zoom), my * (1 / oldZoom - 1 / zoom));

    return false; // evita que la página se desplace
}


function keyPressed() {
    params = {
        mu_k: random(2.0, 6.0),       // distancia donde el kernel gaussiano tiene su pico (zona de influencia)
        sigma_k: random(0.3, 2.0),    // ancho del kernel, afecta a la difusión
        w_k: random(0.005, 0.05),     // peso total del kernel, controla la fuerza del campo U
        mu_g: random(0.3, 0.9),       // valor óptimo de activación G
        sigma_g: random(0.05, 0.3),   // tolerancia de G, cuánto se activa fuera del óptimo
        c_rep: random(0.2, 2.0)       // fuerza de repulsión entre partículas cercanas
    };
    
}
let panel
let sliders = []
let trans = 1.0
async function setup() {
  // Use WEBGL for offscreen graphics
  createCanvas(canvasSize, canvasSize);
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
    let sl1 = panel.createSlider(2.0, 6.0, random(2.0, 6.0), 'mu_k', true)
    let sl2 = panel.createSlider(0.3, 2.0, random(0.3, 2.0), 'sigma_k', true)
    let sl3 = panel.createSlider(0.005, 0.05, random(0.005, 0.05), 'w_k', true)
    let sl4 = panel.createSlider(0.3, 0.9, random(0.3, 0.9), 'mu_g', true)
    let sl5 = panel.createSlider(0.05, 0.3, random(0.05, 0.3), 'sigma_g', true)
    let sl6 = panel.createSlider(0.2, 2.0, random(0.2, 2.0), 'c_rep', true)
    sliders.push(sl1, sl2, sl3, sl4, sl5, sl6)
    let bt = panel.createButton('Randomize', true)
    bt.setFunc(() => {
        for(let i = 0; i < sliders.length; i++){
            sliders[i].setValue(random(sliders[i].min, sliders[i].max))
        }
    }
    )
    let cb = panel.createCheckbox('High Fidelity', false)
    cb.setFunc((arg) => {
        if(arg) pixelDensity(2)
        else pixelDensity(1)
    })
    panel.createSeparator()
    // dt and stepsPerFrame
    let sl7 = panel.createSlider(0.01, 2, 0.1, 'dt', true)
    sl7.setFunc((arg) => {dt = arg})
    let sl8 = panel.createSlider(1, 5, 1, 'Steps per Frame', true)
    sl8.setFunc((arg) => {stepsPerFrame = arg})
    sl8.integer = true
    let sl9 = panel.createSlider(0.65, 1.0, 1.0, 'Transparency')
    sl9.setFunc((arg) => {trans = arg})

    let fpsCounter = panel.createText('FPS: 0')
    fpsCounter.setFunc(() => {return 'FPS: ' + Math.round(frameRate())})
    
  offset = createVector(0, 0);
  pixelDensity(1);
  fieldGfx = createGraphics(canvasSize, canvasSize, WEBGL);
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
  for (let i = 0; i < numParticles; i++) {
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
  for (let s = 0; s < stepsPerFrame; s++) {
    updateParticles();
  }

  let scaledWorldSize = worldSize / zoom;
let scaledWorldRadius = scaledWorldSize / 2;


  // Render field into offscreen buffer
  fieldGfx.shader(leniaShader);
  leniaShader.setUniform("u_resolution", [canvasSize, canvasSize]);

  // Pack particle positions into flat array [x0,y0,x1,y1,...], normalized [0,1]
  let packed = [];
  for (let pt of particles) {
   // ahora: sin offset
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
  leniaShader.setUniform('u_world_size',   scaledWorldSize);
  leniaShader.setUniform('u_world_radius', scaledWorldRadius);
  leniaShader.setUniform('u_offset',       [offset.x, offset.y]);
  leniaShader.setUniform('u_point_radius', .45);
  leniaShader.setUniform('u_trans', trans);
  


  // Draw fullscreen quad in the offscreen buffer
  fieldGfx.push();
  fieldGfx.translate(-canvasSize / 2, -canvasSize / 2);
  fieldGfx.rect(0, 0, canvasSize, canvasSize);
  fieldGfx.pop();

  // Draw the field buffer on main canvas
  image(fieldGfx, 0,0, canvasSize, canvasSize);

  // Overlay particles
  push();
  // Switch to 2D drawing coordinates
  resetMatrix();
  translate(canvasSize / 2, canvasSize / 2);
  scale(canvasSize / scaledWorldSize);
  translate(-scaledWorldRadius - offset.x, -scaledWorldRadius - offset.y);
    pop()

  push()
  panel.update()
  panel.show()
  pop()

}

function updateParticles() {
  let newPts = [];
  for (let pt of particles) {
    let v = gradE(params, particles, pt);
    newPts.push(p5.Vector.add(pt, p5.Vector.mult(v, dt)));
  }
  particles = newPts;
}

function peak(x, mu, sigma) {
  return exp(-pow((x - mu) / sigma, 2));
}

function computeFields(p, pts, x) {
  let U = 0,
    R = 0;
  for (let pt of pts) {
    let d = p5.Vector.sub(x, pt);
    let r = d.mag() + 1e-5;
    U += peak(r, p.mu_k, p.sigma_k);
    if (r < 1) R += 0.5 * p.c_rep * pow(1 - r, 2);
  }
  U *= p.w_k;
  let G = peak(U, p.mu_g, p.sigma_g);
  return { U, G, R, E: R - G };
}

function gradE(p, pts, x) {
  let eps = 1e-3;
  let e1 = computeFields(p, pts, createVector(x.x + eps, x.y)).E;
  let e2 = computeFields(p, pts, createVector(x.x - eps, x.y)).E;
  let e3 = computeFields(p, pts, createVector(x.x, x.y + eps)).E;
  let e4 = computeFields(p, pts, createVector(x.x, x.y - eps)).E;
  let dx = (e1 - e2) / (2 * eps);
  let dy = (e3 - e4) / (2 * eps);
  return createVector(-dx, -dy);
}
