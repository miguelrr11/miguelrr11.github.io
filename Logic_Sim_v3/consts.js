const widthPanel = 250
const WIDTH = 1400 - widthPanel
const HEIGHT = 880

const tamBasicNodes = 30
const tamCompNodes = 18

const colorBack = "#0E212E"
const colorOn = "#1FF451"
const colorOff = "#14663F"
const colorDisconnected = "#262F36"
//const colorComp = "#C7F9CC"
const colorComp = Math.random() * 150
const colorSelected = "#1FF451"

const colsComps = [roundNum(Math.random() * 150),
                   roundNum(Math.random() * 150),
                   roundNum(Math.random() * 150),
                   roundNum(Math.random() * 150),
                   roundNum(Math.random() * 150)]

//connection
const strokeOff = 3.8
const strokeOn = 4.2

//comps and nodes
const strokeLight = 1.5
const strokeSelected = 2.2
const controlDist = 100

const inputX = 30 + tamBasicNodes - tamCompNodes
const outputX = WIDTH - 60
const inputToggleX = 0
const outputToggleX = WIDTH - 30

const tamCollConn = strokeOn * 2

const radCurveConn = 15
const maxIO = 20