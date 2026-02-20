//descriptions
let staticDescription = "Static bodies are immovable objects with infinite mass. They are not affected by forces or collisions, but other bodies will collide with them and react accordingly. Use static bodies to create floors, walls, and other fixed structures in the simulation."
let dynamicDescription = "Dynamic bodies have finite mass and can move freely in response to forces and collisions. They are affected by gravity, air friction, and interactions with other bodies. Use dynamic bodies to create objects that can fall, bounce, and interact with the environment."
let springDescription = "Springs connect two anchor points, which can be on bodies or in the world. They apply a force based on how much they are stretched or compressed from their rest length. Springs can be used to create elastic connections between objects, like ropes, bouncy surfaces, or even simple machines."
let bridgeDescription = "Bridges are special dynamic bodies that are thin and designed to connect two points. They do not collide with each other, allowing you to build structures without them interfering with each other. Bridges can be connected to each other using 'bridge joints', which act like pin joints to maintain a fixed distance between the connected points."
let rectDescription = "Rectangles are dynamic bodies defined by their width and height. They can rotate and interact with other bodies in the simulation."
let circleDescription = "Circles are dynamic bodies defined by their radius. They can rotate and interact with other bodies in the simulation."
let deleteDescription = "Click on a body or spring to delete it."
let dragDescription = "Click and drag bodies to move them around."
let ropeDescription = "Ropes are made of multiple bridge elements connected by bridge joints."

p5.disableFriendlyErrors = true
let WIDTH = 600
let HEIGHT = 600

let startCircles = 50
let startRects = 20
let nCollisionsFrame = 0

// Spatial hash
const CELL_SIZE_SH = 20
let gridWidth = Math.ceil(WIDTH / CELL_SIZE_SH)
let gridHeight = Math.ceil(HEIGHT / CELL_SIZE_SH)

const gravity = 0.1
const airFriction = 0.005
let MAXSTEPS = 10

const percent = 0.8   // correction strength
const slop = 0.01     // penetration allowed before correction

const ROPE_SEGMENT_LENGTH = .75  // in cells

let bodies = []
let springs = []
let bridgeJoints = []
let jointConnectionSet = new Set() //to make lookup fast
let ropes = []  //just for rendering, they are actually made of bridges and bridge joints

let globalID = 0

//Zoom and scale
let xOff = 0
let yOff = 0
let prevMouseX = 0
let prevMouseY = 0
let zoom = 1

const RANGE_OUT_OF_BOUNDS = 5000

const colBody = [180]
const colAnchor = [255, 100, 100]

const ENDPOINT_ANCHORS = [0, 1, 2, 3, 4] //body anchors that can be connected with joints (0-3 corners, 4 center)
let JOINT_CONNECT_DIST = 12  //distance at which bridge joints will automatically connect to nearby bridges when created
let JOINT_ITERATIONS = 6
let JOINT_STIFFNESS = 0.95
let JOINT_DAMPING = 0.95
let MAX_STRESS_JOINT = .5  //distance in cells at which bridge joints will break
let ACTIVE_MAX_STRESS_JOINT = .5

let gridMouseX = 0
let gridMouseY = 0
let freeMouseX = 0
let freeMouseY = 0
let cellSize = 30
let nCells = 30

let tree = null

// Editor state
let dragStart = null  // {x, y} for body creation drag
let springRopeStart = null // {body, anchor} for spring first click
let fpsArr = Array(30).fill(60)
let collisionPoints = new Set()

let simState = {
    staticDynamicMode: 'dynamic',
    createMode: 'drag',
    running: true,
    snapGrid: false,
    showDebug: false,
    autoLengthSpring: false,
    lengthSpring: 10,  //in cells
    selectedBody: null,
    hoveredBody: null,
    unbreakableJoints: false,
    gravityEnabled: true
}

let tabs
let panel
let panelOptions
let panelAdvancedOptions
let createSelect, staticDynamicSelect, automaticLengthToggle, lengthSlider
let cteAngVelSlider, cteAngVelCB, unbreakJointsCB, gravityCB
let setPortalsButton