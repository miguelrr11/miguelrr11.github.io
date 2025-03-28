let WIDTH  = 850
let HEIGHT = 850
let WIDTH_UI = 800
let WIDTH_PLOTS = HEIGHT * .2 * 2
let WIDTH_PANEL = WIDTH_UI - WIDTH_PLOTS

let GRID_SIZE = 85       //cells per row / column
let SQ_GRID_SIZE = GRID_SIZE * GRID_SIZE
let TAM_CELL = WIDTH / GRID_SIZE
let LAND = 0.5              //% of the grid that is land (the other is water)
let N_OVEJAS = SQ_GRID_SIZE*0.1     //SQ_GRID_SIZE*0.1
const N_FOXES_MULT = 0.02      //0.017
let N_FOXES = Math.max(SQ_GRID_SIZE*N_FOXES_MULT, 1)
let FOOD_CHANCE = .035        //starting food
let FOOD_FACTOR_REGEN = 150    //factor que importa (cuanto mas alto, menos comida spawnea)
let FOOD_REGEN = (SQ_GRID_SIZE / (SQ_GRID_SIZE + GRID_SIZE * FOOD_FACTOR_REGEN))    //natural regeneration
const MIN_SPEED = 10

//state of primordials
let STARTING_AGE_S = 100
let STARTING_STATE_S = 'food'
let STARTING_AGE_F = 100
let STARTING_STATE_F = 'food'

let MUT_FACTOR_S = .5
let MUT_FACTOR_F = .5
let AGE_LIMIT_REPRODUCE_S = 70
let AGE_LIMIT_REPRODUCE_F = 70
let AGE_LIMIT_S = 400
let AGE_LIMIT_F = 400
let MIN_LUST_S = .4
let MIN_LUST_F = .4

let COL_DARK_GREEN = "#679436"
let COL_LIGHT_GREEN = "#ADC417"
let COL_DARK_BLUE = "#055D80"
let COL_LIGHT_BLUE = "#427AA1"
let COL_SIMPLE_BLUE = "#80A1B1"

let COL_HUNGER = "#9bc53d"
let COL_THIRST = "#5bc0eb"
let COL_LUST_MALE = "#dd2d4a"
let COL_LUST_FEMALE = "#f26a8d"

let COL_FOOD = "#3E5A20"

let COL_OVEJA_LEAST_BEAUTY = "#ede0d4"  
let COL_OVEJA_MOST_BEAUTY = "#7f5539"
let TAM_OVEJA = TAM_CELL * 0.55

let COL_FOX_LEAST_BEAUTY = "#fcbf49"  
let COL_FOX_MOST_BEAUTY = "#E75414"

let TIME_UNTIL_DEAD = 5

let AGE_FACTOR = 3    //age per second

let DELTA_HUNGER_S = .035
let DELTA_THIRST_S = .035
let DELTA_LUST_S = .025

let DELTA_HUNGER_F = .015
let DELTA_THIRST_F = .01
let DELTA_LUST_F = .015
const FOX_MIN_NECESSITY = .3 //si ninguna necesisdad esta por encima, no hace nada

let SPEED_OVEJA = TAM_CELL      //distancia del brinco: CONSTANTE
let SPEED_FOX = TAM_CELL * 2.25    //por defecto los foxes se mueven mas distancia
const INITIAL_SPEED = 3           //no tocar
let SPEED_MULT_S = 60             //valor que importa
let INITIAL_RADIUS_S = 40
let SPEED_MULT_F = 40             //valor que importa
let INITIAL_RADIUS_F = 20

let RADIUS_GOAL_FOOD = TAM_CELL * 1.5
let RADIUS_GOAL_WATER = TAM_CELL * 2.5
let RADIUS_GOAL_PARTNER = TAM_CELL * 1.5

let FOOD_POS = 
[
    {
        "x": 0.4662524369419041,
        "y": 0.24058376233885334
    },
    {
        "x": 0.773076456493448,
        "y": 0.6103167027490854
    },
    {
        "x": 0.2765969859170525,
        "y": 0.6633338896729802
    },
    {
        "x": 0.42641645824124547,
        "y": 0.4480653381882854
    },
    {
        "x": 0.7435748290167452,
        "y": 0.3770344332884303
    }
]    
