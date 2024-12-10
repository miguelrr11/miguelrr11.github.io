const WIDTH  = 850
const HEIGHT = 850
const WIDTH_UI = 600

const GRID_SIZE = 85       //cells per row / column
const SQ_GRID_SIZE = GRID_SIZE * GRID_SIZE
const TAM_CELL = WIDTH / GRID_SIZE
const LAND = 0.5              //% of the grid that is land (the other is water)
const N_OVEJAS = SQ_GRID_SIZE*0.1
const FOOD_CHANCE = .035        //starting food
const FOOD_FACTOR_REGEN = 150    //factor que importa (cuanto mas alto, menos comida spawnea)
const FOOD_REGEN = (SQ_GRID_SIZE / (SQ_GRID_SIZE + GRID_SIZE * FOOD_FACTOR_REGEN))    //natural regeneration

//state of primordials
const STARTING_AGE = 100
const STARTING_STATE = 'food'

const MUT_FACTOR = .5
const AGE_LIMIT_REPRODUCE = 70
const AGE_LIMIT = 400
const MIN_LUST = .45

const COL_DARK_GREEN = "#679436"
const COL_LIGHT_GREEN = "#ADC417"
const COL_DARK_BLUE = "#055D80"
const COL_LIGHT_BLUE = "#427AA1"

const COL_HUNGER = "#9bc53d"
const COL_THIRST = "#5bc0eb"
const COL_LUST_MALE = "#dd2d4a"
const COL_LUST_FEMALE = "#f26a8d"

const COL_FOOD = "#3E5A20"

const COL_OVEJA_LEAST_BEAUTY = "#ede0d4"  
const COL_OVEJA_MOST_BEAUTY = "#7f5539"
const TAM_OVEJA = TAM_CELL * 0.55
const SPEED_OVEJA = TAM_CELL
const SPEED_MULT = 60
const TIME_UNTIL_DEAD = 5

const AGE_FACTOR = 3    //age per second

const DELTA_HUNGER = .03
const DELTA_THIRST = .03
const DELTA_LUST = .005

const INITIAL_SPEED = 3
const INITIAL_RADIUS = 40

const RADIUS_GOAL_FOOD = TAM_CELL
const RADIUS_GOAL_WATER = TAM_CELL * 2.5
const RADIUS_GOAL_PARTNER = TAM_CELL * 0.5

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