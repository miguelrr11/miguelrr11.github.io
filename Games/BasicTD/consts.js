const WIDTH_SCENE = 600
const HEIGHT_SCENE = 600
const SIZE_CELL = 30
const HALF_SIZE_CELL = SIZE_CELL * .5
const N_CELLS = WIDTH_SCENE / SIZE_CELL
const SIZE_CELL_ORE = SIZE_CELL / 2
const N_CELLS_ORE = N_CELLS * 2

const CANON_BASE_PRICE = 15
const MINER_BASE_PRICE = 10
const CROSSBOW_BASE_PRICE = 15
const BOMBER_BASE_PRICE = 20
const GENERATOR_BASE_PRICE = 5
const PEA_SHOOTER_BASE_PRICE = 5
const MEDIC_BASE_PRICE = 30

const ATTACK_DISTANCE_RAIDER = 40

const TOWER_TYPES = {
    addCanon:     { cls: Canon,     price: CANON_BASE_PRICE },
    addMiner:     { cls: Miner,     price: MINER_BASE_PRICE },
    addCrossBow:  { cls: CrossBow,  price: CROSSBOW_BASE_PRICE },
    addBomber:    { cls: Bomber,    price: BOMBER_BASE_PRICE },
    addGenerator: { cls: Generator, price: GENERATOR_BASE_PRICE },
    addPeaShooter:{ cls: PeaShooter,price: PEA_SHOOTER_BASE_PRICE},
    addMedic:     { cls: Medic,     price: MEDIC_BASE_PRICE}
}

const CANON_BASE_RANGE = 80
const CROSSBOW_BASE_RANGE = 80
const BOMBER_BASE_RANGE = 40
const PEA_SHOOTER_BASE_RANGE = 65
const MEDIC_BASE_RANGE = 130

const CANON_BASE_POWER = 1
const MINER_BASE_POWER = 3
const CROSSBOW_BASE_POWER = 2
const BOMBER_BASE_POWER = 3
const GENERATOR_BASE_POWER = 4
const PEA_SHOOTER_BASE_POWER = 1
const MEDIC_BASE_POWER = 1.5

const ENEMY_RAD = 15

const START_ORE = 10

// enum for oregrid
const EMPTY_CELL = 0
const ORE_CELL = 1
const ENERGY_CELL = 2

const COLOR_ORE_CELL = [242, 196, 167]
const COLOR_MINER = [240, 149, 91]
const COLOR_ENERGY_CELL = [160, 210, 255]
const COLOR_ENERGY_CELL_HSB = 140
const COLOR_GENERATOR = [86, 167, 240]
const COLOR_MEDIC = [131, 247, 133]

// constantes de consumo energetico torres
const ACT_ATTACK  = 0.005;    // velocidad de subida (por segundo)
const ACT_RELEASE = 0.0001;  // velocidad de bajada (por segundo)
const IDLE_DRAW   = 0.15; // consumo en reposo (fracción del máximo)
const FULL_AT     = 0.8;  // actividad a partir de la cual consume el 100%
const POWER_OFF_RATIO = 0.75     // se apaga si recibe menos de esto
const POWER_ON_RATIO  = 0.80     // vuelve a encenderse al superar esto
const LIMIT_RATIO = 1 / POWER_OFF_RATIO

const CURRENCY_SYMBOL = '†'

// constantes de torres
const COOLDOWN_SCALE       = 0.01      // turns dt into cooldown units
const FRAME_MS             = 1000 / 60 // reference frame length for frame-rate-independent lerps
const NO_TOWER_HOVERED     = -1        // value the game passes when no tower is hovered
const TOWER_BODY_SCALE     = 0.65      // tower body diameter relative to SIZE_CELL
const BAR_WIDTH_SCALE      = 0.12      // activity/health bar width relative to SIZE_CELL
const BLINK_PERIOD         = 25        // frames per blink when a tower has no power
const LEVEL_UP_PRICE_MULT  = 1.5
const LEVEL_UP_POWER_MULT  = 1.2
const MIN_FIRE_RATE        = 1
const TOOLTIP_TEXT_SIZE    = 15
const TOOLTIP_PADDING      = 3
const RANGE_FADE_START     = 30        // mouse distance where the range circle starts fading

const SELL_PERCENTAGE = 0.5

function drawCanon(x, y, level, shootAnim, angle){
    push()
    translate(x, y)
    rotate(angle)
    square(0, 0, SIZE_CELL*.5 + shootAnim*10)
    if(level == 2) square(0, 0, SIZE_CELL*.2 + shootAnim*10)
    else if(level == 3){
        fill(0)
        square(0, 0, SIZE_CELL*.2 + shootAnim*10)
    }
    else if(level == 4){
        fill(0)
        square(0, 0, SIZE_CELL*.2 + shootAnim*10)
        stroke(255)
        drawCross(0, 0, SIZE_CELL*.25 + shootAnim*10)
    }
    noStroke()
    fill(0)
    let s = 5
    rect(SIZE_CELL*.55*.5+s*.3, 0, s, s*2)
    pop()
}

function drawCrossBow(x, y, level, shootAnim, angle){
    push()
    translate(x, y)
    rotate(angle)
    rect(0, 0, SIZE_CELL*.55 + shootAnim*10, SIZE_CELL*.25 + shootAnim*10)
    if(level == 2){
        line(0, -SIZE_CELL*.25*.5, 0, SIZE_CELL*.25*.5)
    }
    if(level == 3){
        fill(0)
        noStroke()
        rect(0, 0, SIZE_CELL*.25 + shootAnim*10, SIZE_CELL*.25 + shootAnim*10)
    }
    if(level == 4){
        line(-SIZE_CELL*.25, 0, SIZE_CELL*.25, 0)
        line(0, -SIZE_CELL*.25*.5, 0, SIZE_CELL*.25*.5)
    }
    noStroke()
    fill(0)
    let s = 5
    square(SIZE_CELL*.55*.5+s*.3, 0, s)
    pop()
}

function drawBomber(x, y, level, shootAnim, angle){
    push()
    translate(x, y)
    rotate(angle)
    circle(0, 0, SIZE_CELL*.55 + shootAnim*10)
    if(level == 2){
        circle(0, 0, SIZE_CELL*.25 + shootAnim*10)
    }
    if(level == 3){
        fill(0)
        noStroke()
        circle(0, 0, SIZE_CELL*.25 + shootAnim*10)
    }
    if(level == 4){
        fill(0)
        noStroke()
        stroke(0)
        strokeWeight(4)
        let d = SIZE_CELL * .25 * .35
        point(-d, -d)
        point(-d, d)
        point(d, -d)
        point(d, d)
        
    }
    noStroke()
    fill(0)
    let s = 5
    square(SIZE_CELL*.55*.5+s*.3, 0, s)
    pop()
}

function drawPeaShooter(x, y, level, shootAnim, angle){
    push()
    translate(x, y)
    rotate(angle)
    square(0, 0, SIZE_CELL*.35 + shootAnim*10)
    if(level == 2) square(0, 0, SIZE_CELL*.2 + shootAnim*10)
    else if(level == 3){
        fill(0)
        square(0, 0, SIZE_CELL*.2 + shootAnim*10)
    }
    else if(level == 4){
        fill(0)
        square(0, 0, SIZE_CELL*.2 + shootAnim*10)
        stroke(255)
        drawCross(0, 0, SIZE_CELL*.25 + shootAnim*10)
    }
    noStroke()
    fill(0)
    let s = 5
    //rect(SIZE_CELL*.5*.5+s*.3, 0, s, s*2)
    pop()
}