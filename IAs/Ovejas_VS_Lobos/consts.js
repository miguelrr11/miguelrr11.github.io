const WIDTH  = 800
const HEIGHT = 800

const GRID_SIZE = 100
const TAM_CELL = WIDTH / GRID_SIZE
const N_OVEJAS = 500
const FOOD_CHANCE = .01

const COL_DARK_GREEN = "#679436"
const COL_LIGHT_GREEN = "#ADC417"
const COL_DARK_BLUE = "#055D80"
const COL_LIGHT_BLUE = "#427AA1"

const COL_HUNGER = "#9bc53d"
const COL_THIRST = "#5bc0eb"
const COL_LUST = "#e55934"

const COL_FOOD = "#3E5A20"

const COL_OVEJA_LEAST_BEAUTY = "#ede0d4"
const COL_OVEJA_MOST_BEAUTY = "#7f5539"
const TAM_OVEJA = TAM_CELL * 0.55
const SPEED_OVEJA = TAM_CELL
const SPEED_MULT = 60
const TIME_UNTIL_DEAD = 3

const DELTA_HUNGER = .05
const DELTA_THIRST = .03
const DELTA_LUST = .01

const INITIAL_SPEED = 3
const INITIAL_RADIUS = 40
const RADIUS_GOAL = TAM_CELL*2

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