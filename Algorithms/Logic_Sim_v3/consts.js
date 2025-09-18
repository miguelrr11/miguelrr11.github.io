const widthPanel = 250
const WIDTH = 1400 - widthPanel
const HEIGHT = 880

const tamBasicNodes = 25
const tamCompNodes = 16

const colorBackMenu = "#0E212E"
const colorBack = "#343A40"
const colorOn = "#1FF451"
const colorOff = "#12603aff"
const colorFloating = "#04070c"
const colorDisconnected = "#262F36"
//const colorComp = "#C7F9CC"
const colorComp = Math.random() * 150
const colorSelected = "#1FF451"

const textSizeIO = 12

const colsComps = [roundNum(Math.random() * 150),
                   roundNum(Math.random() * 150),
                   roundNum(Math.random() * 150),
                   roundNum(Math.random() * 150),
                   roundNum(Math.random() * 150),
                   roundNum(Math.random() * 150)]

//corner radius
const RADCHIP = 5
const RADNODE = 2

//connection
const strokeOff = 3.8
const strokeOn = 4.2

//comps and nodes
const strokeLight = 1.5
const strokeSelected = 2.2
const controlDist = 100

const marginWidth = 20
const lineLength = 25
const inputX = lineLength + tamBasicNodes - tamCompNodes + marginWidth
const outputX = WIDTH - tamBasicNodes - lineLength - marginWidth
const inputToggleX = 0 + marginWidth
const outputToggleX = WIDTH - tamBasicNodes - marginWidth

const tamCollConn = strokeOn * 2

const radCurveConn = 15
const maxIO = 20