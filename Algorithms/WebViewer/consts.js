let scl = 0.7
let WIDTH = 1920 * scl
let HEIGHT = 1080 * scl
let canvas, ctx

const MIN_ZOOM = 0.05
const MAX_ZOOM = 5

const MAX_PARTICLE_COUNT = 2500

let hoveredParticle = null
let draggedParticle = null

let parentParticles = []

let constraints = []
let particles = []
let primordials = []
let firstParents = [] //particles that are parents and have no parent

let animConn = []
let removeAnimations = []
let animations = []

let xOff = 0
let yOff = 0
let prevMouseX, prevMouseY
let zoom = 1
let currentEdges

let framesPerAnimation = 60 * 1.5

let colors

let panelInput, font
let started = false
let errorFrames = 0

let dimmingLines = 1 //1 for increasing, -1 for decreasing
let transLines = 255

let darkModeColors
let lightModeColors
let curCol
let curColMode
let curColLerp

const absoluteSeparationDistance = 70

let textBoxes = new Map()
let WIDTH_TB = 200
let D_TB = 50

let offsetsText = []
let mousePos

let MAX_IMGS = 100

let REM_FRAMECOUNT_CLOSEST = 0