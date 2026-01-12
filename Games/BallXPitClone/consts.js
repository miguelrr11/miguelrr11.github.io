const WIDTH = 600
const HEIGHT = 600

let ENEMY_SIZE = 35
let TRACK_VEL = 0.15
let ENEMY_HP = 5

let PLAYER_RAD = 15
const BALL_TRAIL_LENGTH = 10
const ORB_RAD = PLAYER_RAD * 3

const TRACK_WIDTH = ENEMY_SIZE * 10
const START_X_TRACK = (WIDTH / 2) - (TRACK_WIDTH / 2)
const END_X_TRACK = START_X_TRACK + TRACK_WIDTH

let PLAYER_SPEED = 2
let CADENCE = 12  //12
let DMG_MULT_PLAYER_XP = 1

const BALL_SPEED = 2.85
const BASIC_BALL_R = 4
const BIG_BALL_R = 10

const MAX_BOUNCES = 20

const RAY_DURATION = 30

const DEF_FIRE_DMG = 1.5
const DEF_LIGHTNING_DMG = 2
const DEF_POISON_DMG = 0.5
const DEF_RAY_DMG = 0.5
const CRIT_CHANCE = 0.05
const CRIT_MULTIPLIER = 3

const POISON_COUNTDOWN = 60 * 6  //in frames, once passed the poison effect is removed

const RND_MUL_DMG = 0.2  //random damage will be between dmg * (1 - RND_MUL_DMG) and dmg * (1 + RND_MUL_DMG)