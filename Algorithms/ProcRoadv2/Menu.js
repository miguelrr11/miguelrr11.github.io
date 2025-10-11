class Menu{
    constructor(tool){
        this.buttons = []
        this.sliders = []
        this.tool = tool

        let buttonCreate = new Button(10, 10, 80, 30, 'Create [C]', () => {tool.createState()}, () => {
            return this.tool.state.mode === 'creating' ? 'Creating...' : 'Create [C]'
        }, () => {return this.tool.state.mode == 'creating'})
        let buttonDelete = new Button(100, 10, 80, 30, 'Delete [D]', () => {tool.deleteState()}, () => {
            return this.tool.state.mode === 'deleting' ? 'Deleting...' : 'Delete [D]'
        }, () => {return this.tool.state.mode == 'deleting'})
        let buttonHand = new Button(190, 10, 80, 30, 'Move [H]', () => {tool.handState()}, () => {
            return this.tool.state.mode === 'movingNode' ? 'Moving...' : 'Move [H]'
        }, () => {return this.tool.state.mode == 'movingNode'})

        const MAIN_X = 28;
        const MAIN_Y = 50;
        const MAIN_W = 44;  
        const MAIN_H = 30;

        const GAP = 0;                        
        const SIDE_W = Math.floor(MAIN_W * 0.4); 
        const SIDE_H = Math.floor((MAIN_H - GAP) / 2); 

        // ---- Posiciones derivadas ----
        const LEFT_X  = MAIN_X - GAP - SIDE_W;
        const RIGHT_X = MAIN_X + MAIN_W + GAP;

        const TOP_Y    = MAIN_Y;                  
        const BOTTOM_Y = MAIN_Y + SIDE_H + GAP;   

        let buttonPlusFor = new Button(
        LEFT_X, TOP_Y, SIDE_W, SIDE_H,
        '+',
        () => { this.tool.state.nForLanes++; }
        );

        let buttonMinusFor = new Button(
        LEFT_X, BOTTOM_Y, SIDE_W, SIDE_H,
        '-',
        () => { if (this.tool.state.nForLanes > 0) this.tool.state.nForLanes--; }
        );

        let buttonShowLaneState = new Button(
        MAIN_X-SIDE_W, MAIN_Y, MAIN_W + SIDE_W*2, MAIN_H,
        '',
        undefined,
        () => `${this.tool.state.nForLanes} - ${this.tool.state.nBackLanes}`
        );

        let buttonPlusBack = new Button(
        RIGHT_X, TOP_Y, SIDE_W, SIDE_H,
        '+',
        () => { this.tool.state.nBackLanes++; }
        );

        let buttonMinusBack = new Button(
        RIGHT_X, BOTTOM_Y, SIDE_W, SIDE_H,
        '-',
        () => { if (this.tool.state.nBackLanes > 0) this.tool.state.nBackLanes--; }
        );

        let xLoc = width - 95 - 10
        let yLoc = 50
        let hButton = 30
        let buttonsToCollapse = []
        
        let buttonShowRoad = new Button(xLoc, yLoc, 95, 20, 'Main Graph', () => {
            this.tool.showOptions.SHOW_ROAD = !this.tool.showOptions.SHOW_ROAD
        }, undefined,  () => {return this.tool.showOptions.SHOW_ROAD})
        let buttonShowPaths = new Button(xLoc, yLoc + hButton, 95, 20, 'Segments', () => {
            this.tool.showOptions.SHOW_PATHS = !this.tool.showOptions.SHOW_PATHS
        }, undefined,  () => {return this.tool.showOptions.SHOW_PATHS})
        let buttonShowIntersecSegs = new Button(xLoc, yLoc + hButton * 2, 95, 20, 'Intersections', () => {
            this.tool.showOptions.SHOW_INTERSECSEGS = !this.tool.showOptions.SHOW_INTERSECSEGS
        }, undefined,  () => {return this.tool.showOptions.SHOW_INTERSECSEGS})
        let buttonShowConnectors = new Button(xLoc, yLoc + hButton * 3, 95, 20, 'Connections', () => {
            this.tool.showOptions.SHOW_CONNECTORS = !this.tool.showOptions.SHOW_CONNECTORS
        }, undefined,  () => {return this.tool.showOptions.SHOW_CONNECTORS})
        let buttonShowNodes = new Button(xLoc, yLoc + hButton * 4, 95, 20, 'Nodes', () => {
            this.tool.showOptions.SHOW_NODES = !this.tool.showOptions.SHOW_NODES
        }, undefined,  () => {return this.tool.showOptions.SHOW_NODES})
        let buttonShowTags = new Button(xLoc, yLoc + hButton * 5, 95, 20, 'Tags', () => {
            this.tool.showOptions.SHOW_TAGS = !this.tool.showOptions.SHOW_TAGS
        }, undefined,  () => {return this.tool.showOptions.SHOW_TAGS})
        let buttonShowSegDetails = new Button(xLoc, yLoc + hButton * 6, 95, 20, 'Endings', () => {
            this.tool.showOptions.SHOW_SEGS_DETAILS = !this.tool.showOptions.SHOW_SEGS_DETAILS
        }, undefined,  () => {return this.tool.showOptions.SHOW_SEGS_DETAILS})
        let buttonShowLanes = new Button(xLoc, yLoc + hButton * 7, 95, 20, 'Lanes', () => {
            this.tool.showOptions.SHOW_LANES = !this.tool.showOptions.SHOW_LANES
        }, undefined,  () => {return this.tool.showOptions.SHOW_LANES})
        let buttonShowConvexHull = new Button(xLoc, yLoc + hButton * 8, 95, 20, 'Junction Area', () => {
            this.tool.showOptions.SHOW_CONVEXHULL = !this.tool.showOptions.SHOW_CONVEXHULL
        }, undefined,  () => {return this.tool.showOptions.SHOW_CONVEXHULL})
        let buttonShowWays = new Button(xLoc, yLoc + hButton * 9, 95, 20, 'Road', () => {
            this.tool.showOptions.SHOW_WAYS = !this.tool.showOptions.SHOW_WAYS
        }, undefined,  () => {return this.tool.showOptions.SHOW_WAYS})

        buttonsToCollapse = [
            buttonShowRoad,
            buttonShowPaths,
            buttonShowIntersecSegs,
            buttonShowConnectors,
            buttonShowNodes,
            buttonShowTags,
            buttonShowSegDetails,
            buttonShowLanes,
            buttonShowConvexHull,
            buttonShowWays,
        ]

        let buttonCollapse = new Button(xLoc, yLoc - 40, 95, 30, this.tool.state.menuCollapsed ? 'Expand' : 'Collapse', () => {
            this.tool.state.menuCollapsed = !this.tool.state.menuCollapsed
            if(this.tool.state.menuCollapsed){
                buttonsToCollapse.forEach(b => {
                    b.collapse(yLoc - 35)
                })
            } 
            else {
                buttonsToCollapse.forEach(b => {
                    b.uncollapse(yLoc - 35)
                })
            }
        }, () => {
            return this.tool.state.menuCollapsed ? 'Expand' : 'Collapse'
        })
        this.buttons.push(buttonCollapse)
        


        let buttonAddCars = new Button(10, HEIGHT - 30, 95, 20, 'Add Cars', () => {
            addCars(25)
        })
        let buttonRemoveCars = new Button(10, HEIGHT - 60, 95, 20, 'Remove Cars', () => {
            cars = []
        })


        let buttonSnapToGrid = new Button(10, 90, 80, 20, 'Snap Grid', () => {
            this.tool.state.snapToGrid = !this.tool.state.snapToGrid
        }, undefined,  () => {return this.tool.state.snapToGrid})

        let buttonSetStartSearch = new Button(10, 130, 80, 20, 'Set Start', () => {
            this.tool.state.mode = 'settingStart'
        }, undefined,  () => {return this.tool.state.mode == 'settingStart'})
        let buttonSetEndSearch = new Button(10, 160, 80, 20, 'Set End', () => {
            this.tool.state.mode = 'settingEnd'
        }, undefined,  () => {return this.tool.state.mode == 'settingEnd'})
        let buttonRemovePathfinding = new Button(10, 190, 80, 20, 'Clear Path', () => {
            this.tool.state.foundPath = []
            this.tool.state.startNodeID = -1
            this.tool.state.endNodeID = -1
            this.tool.state.mode = 'movingNode'
            cursor(HAND)
        }, undefined,  () => {return this.tool.state.foundPath.length > 0})

        let buttonShowFps = new Button(width - 140, 15, 30, 20, '60', undefined, () => {
            this.tool.state.fpsAcum.push(frameRate())
            if(this.tool.state.fpsAcum.length > 20) this.tool.state.fpsAcum.shift()
            let sum = 0
            this.tool.state.fpsAcum.forEach(v => sum += v)
            let avg = sum / this.tool.state.fpsAcum.length
            return round(avg)
        })

        let buttonSave = new Button(width - 70 - 10, HEIGHT - 60, 70, 20, 'Save', () => {
            storeItem('roadData', this.tool.getCurrentRoad())
        })
        let buttonLoad = new Button(width - 70 - 10, HEIGHT - 30, 70, 20, 'Load', () => {
            let roadData = getItem('roadData')
            if(roadData) this.tool.setStateToRoad(roadData)
        })

        let buttonZoomMinus = new Button(width - 70 - 10 - 80 - 10, HEIGHT - 30, 30, 20, '-', () => {
            this.tool.zoom /= 1.1
            if(this.tool.zoom < 0.1) this.tool.zoom = 0.1
        })
        let buttonZoomPlus = new Button(width - 70 - 10 - 40 - 10, HEIGHT - 30, 30, 20, '+', () => {
            this.tool.zoom *= 1.1
            if(this.tool.zoom > 5) this.tool.zoom = 5
        })

        let buttonShowZoomLevel = new Button(width - 70 - 10 - 80 - 10, HEIGHT - 60, 70, 20, 'State: ' + this.tool.state.mode, undefined, () => {
            return round(this.tool.zoom, 3)
        })

        this.buttons.push(buttonShowZoomLevel)
        this.buttons.push(buttonShowConvexHull)

        this.buttons.push(buttonZoomMinus)
        this.buttons.push(buttonZoomPlus)

        this.buttons.push(buttonSnapToGrid)
        this.buttons.push(buttonSetStartSearch)
        this.buttons.push(buttonSetEndSearch)
        this.buttons.push(buttonRemovePathfinding)
        this.buttons.push(buttonShowFps)
        this.buttons.push(buttonSave)
        this.buttons.push(buttonLoad)

        this.buttons.push(buttonShowNodes)
        this.buttons.push(buttonShowRoad)
        this.buttons.push(buttonShowPaths)
        this.buttons.push(buttonShowConnectors)
        this.buttons.push(buttonShowIntersecSegs)
        this.buttons.push(buttonShowTags)
        this.buttons.push(buttonShowSegDetails)
        this.buttons.push(buttonShowLanes)
        this.buttons.push(buttonShowWays)
        this.buttons.push(buttonAddCars)
        this.buttons.push(buttonRemoveCars)

        //this.buttons.push(buttonSetPaths)

        this.buttons.push(buttonShowLaneState)
        this.buttons.push(buttonMinusFor)
        this.buttons.push(buttonPlusFor)
        this.buttons.push(buttonMinusBack)
        this.buttons.push(buttonPlusBack)

        this.buttons.push(buttonCreate)
        this.buttons.push(buttonDelete)
        this.buttons.push(buttonHand)

        let sliderLaneWidth = new Slider(10, 230, 80, 'Lane Width', 5, 60, LANE_WIDTH, (value) => {
            LANE_WIDTH = value
            this.tool.road.setPaths()
        })
        let sliderLengthSegBezier = new Slider(10, 270, 80, 'Bezier Res', 50, 2, LENGTH_SEG_BEZIER, (value) => {
            LENGTH_SEG_BEZIER = value
            this.tool.road.setPaths()
        })
        let sliderOffsetRadIntersec = new Slider(10, 310, 80, 'Intersec Rad', 0, 75, OFFSET_RAD_INTERSEC, (value) => {
            OFFSET_RAD_INTERSEC = value
            this.tool.road.setPaths()
        })
        let sliderTensionMin = new Slider(10, 350, 80, 'Tension Min', 0, 1, TENSION_BEZIER_MIN, (value) => {
            TENSION_BEZIER_MIN = value
            this.tool.road.setPaths()
        })
        let sliderTensionMax = new Slider(10, 390, 80, 'Tension Max', 0, 1, TENSION_BEZIER_MAX, (value) => {
            TENSION_BEZIER_MAX = value
            this.tool.road.setPaths()
        })

        this.sliders.push(sliderTensionMin)
        this.sliders.push(sliderTensionMax)

        this.sliders.push(sliderLaneWidth)
        this.sliders.push(sliderLengthSegBezier)
        this.sliders.push(sliderOffsetRadIntersec)

        let buttonDebugRoad = new Button(10, 430, 95, 200, 'Debug Road', undefined, () => {
            return 'Nodes: ' + '\n' + this.tool.road.nodes.length + '\n' +
                   'Segments: ' + '\n' + this.tool.road.segments.length + '\n' +
                   'Connectors: ' + '\n' + this.tool.road.connectors.length + '\n' +
                   'Intersections: ' + '\n' + this.tool.road.intersecSegs.length + '\n' +
                   'Paths: ' + '\n' + this.tool.road.paths.size + '\n' +
                   'Cars: ' + '\n' + cars.length + '\n' +
                   'CH Queue: ' + '\n' + this.tool.road.convexHullQueue.length
        }, () => {return false})
        buttonDebugRoad.txSize = 10
        buttonDebugRoad.setTextAlign('left-top')
        this.buttons.push(buttonDebugRoad)

        this.interacted = false
        this.coolDownClick = 0

    }

    inBounds(){
        for(let b of this.buttons){
            if(inBounds(mouseX, mouseY, b.pos.x, b.pos.y, b.size.w, b.size.h)){
                cursor(HAND)
                return true
            }
        }
        for(let s of this.sliders){
            if(s.isMouseOver()){
                return true
            }
        }
        return false
    }

    update(){
        let anyClicked = false
        let whatInteracting = false
        if(this.coolDownClick > 0) this.coolDownClick--
        this.buttons.forEach(b => {
            if(inBounds(mouseX, mouseY, b.pos.x, b.pos.y, b.size.w, b.size.h) && mouseIsPressed && this.coolDownClick <= 0 && !b.collapsing && !b.uncollapsing){
                anyClicked = true
                whatInteracting = 'button'
                if(b.onClick) b.onClick()

            }
        })

        // Update sliders
        this.sliders.forEach(s => {
            if(s.update()){
                anyClicked = true
                whatInteracting = 'slider'
                cursor('ew-resize')
            }
        })

        this.interacted = anyClicked
        if(anyClicked) this.coolDownClick = 10

        return whatInteracting
    }

    show(){
        this.buttons.forEach(b => b.show())
        this.sliders.forEach(s => s.show())
    }
}

const collapseSpeed = 0.1

class Button{
    constructor(x, y, w, h, label, onClick, updateLabel, enabled){
        this.pos = {x, y}
        this.size = {w, h}
        this.label = label
        this.onClick = onClick
        this.updateLabel = updateLabel
        this.enabled = enabled
        this.txSize = 14

        this.originalPos = {x, y}

        this.collapsing = false
        this.uncollapsing = false
        this.collapseProgress = 0 
        this.collapsingGoalY = undefined

        this.textAlign = 'center'
    }

    setTextAlign(mode){
        this.textAlign = mode
    }

    collapse(goalY){
        this.collapsing = true
        this.uncollapsing = false
        this.collapseProgress = 0
        this.collapseGoalY = goalY
    }

    uncollapse(){
        this.uncollapsing = true
        this.collapsing = false
        this.collapseProgress = 0
        this.collapseGoalY = this.originalPos
    }

    hover(){
        return inBounds(mouseX, mouseY, this.pos.x, this.pos.y, this.size.w, this.size.h)
    }

    show(){
        if(this.updateLabel) this.label = this.updateLabel()
        if(this.collapsing){
            this.pos.y = lerp(this.pos.y, this.collapseGoalY, collapseSpeed)
            let totalDistance = abs(this.originalPos.y - this.collapseGoalY)
            let currentDistance = abs(this.originalPos.y - this.pos.y)
            this.collapseProgress = totalDistance > 0 ? currentDistance / totalDistance : 1
            if(abs(this.pos.y - this.collapseGoalY) < 0.5){
                this.pos.y = this.collapseGoalY
                this.collapsing = false
                this.collapseProgress = 1
            }
        }
        else if(this.uncollapsing){
            this.pos.y = lerp(this.pos.y, this.originalPos.y, collapseSpeed)
            let totalDistance = abs(this.originalPos.y - this.collapseGoalY)
            let currentDistance = abs(this.originalPos.y - this.pos.y)
            this.collapseProgress = totalDistance > 0 ? 1 - (currentDistance / totalDistance) : 1
            if(abs(this.pos.y - this.originalPos.y) < 0.5){
                this.pos.y = this.originalPos.y
                this.uncollapsing = false
                this.collapseProgress = 0
            }
        }
        let collapsed = this.pos.y == this.collapseGoalY
        let enabled = this.enabled ? this.enabled() : !collapsed
        push()
        rectMode(CORNER)
        let originalCol = enabled ? 70 : 50
        let originalAlpha = enabled ? 255 : 170
        enabled ? fill(70) : fill(50, 170)
        if(this.collapsing){
            fill(originalCol, map(this.collapseProgress, 0, 1, originalAlpha, 0))
        }
        else if(this.uncollapsing){
            fill(originalCol, map(this.collapseProgress, 0, 1, 0, originalAlpha))
        }
        if(collapsed) noFill()
        noStroke()
        rect(this.pos.x, this.pos.y, this.size.w, this.size.h, 4)

        let textCol = enabled ? 255 : 170
        enabled ? fill(255) : fill(170)
        if(this.collapsing){
            fill(textCol, 255*(1-this.collapseProgress))
        }
        else if(this.uncollapsing){
            fill(textCol, 255*( this.collapseProgress))
        }
        if(collapsed) fill(textCol, 0)
        noStroke()
        this.hover() ? textSize(this.txSize+1) : textSize(this.txSize)
        if(this.textAlign == 'center') {
            textAlign(CENTER, CENTER)
            text(this.label, this.pos.x + this.size.w / 2, this.pos.y + this.size.h / 2)
        }
        else {
            textAlign(LEFT, TOP)
            text(this.label, this.pos.x + 5, this.pos.y + 5)
        }

        pop()
    }
}

class Slider{
    constructor(x, y, w, title, minValue, maxValue, initialValue, onChange){
        this.pos = {x, y}
        this.width = w
        this.height = 7
        this.title = title
        this.minValue = minValue
        this.maxValue = maxValue
        this.value = initialValue
        this.onChange = onChange

        this.isDragging = false
        this.titleHeight = 20

        // Total height includes title + slider
        this.totalHeight = this.titleHeight + this.height + 5
    }

    isMouseOver(){
        // Check if mouse is over the slider track or handle
        let sliderY = this.pos.y + this.titleHeight
        return mouseX >= this.pos.x &&
               mouseX <= this.pos.x + this.width &&
               mouseY >= sliderY - 5 &&
               mouseY <= sliderY + this.height + 5
    }

    update(){
        let sliderY = this.pos.y + this.titleHeight
        let interacted = false

        // Start dragging
        if(mouseIsPressed && this.isMouseOver() && !this.isDragging){
            this.isDragging = true
        }

        // Update value while dragging
        if(this.isDragging && mouseIsPressed){
            let normalizedX = constrain(mouseX - this.pos.x, 0, this.width)
            let normalizedValue = normalizedX / this.width
            let newValue = this.minValue + normalizedValue * (this.maxValue - this.minValue)

            // Round to 2 decimal places
            newValue = round(newValue * 100) / 100

            if(newValue !== this.value){
                this.value = newValue
                if(this.onChange){
                    this.onChange(this.value)
                }
            }
            interacted = true
        }

        // Stop dragging
        if(!mouseIsPressed && this.isDragging){
            this.isDragging = false
        }

        return interacted
    }

    show(){
        let sliderY = this.pos.y + this.titleHeight

        push()

        // Draw title
        fill(255)
        noStroke()
        textAlign(CENTER, TOP)
        textSize(10)
        text(this.title + ': ' + this.value, this.pos.x + this.width / 2, this.pos.y)

        // Draw slider track
        fill(70)
        noStroke()
        rect(this.pos.x, sliderY, this.width, this.height, 4)

        // Calculate handle position
        let normalizedValue = (this.value - this.minValue) / (this.maxValue - this.minValue)
        let handleX = this.pos.x + normalizedValue * this.width

        // Draw filled track
        fill(175)
        rect(this.pos.x, sliderY, normalizedValue * this.width, this.height, 4)

        // Draw handle
        let handleSize = this.isDragging || this.isMouseOver() ? 18 : 16
        fill(this.isDragging ? 120 : 80)
        stroke(255)
        strokeWeight(2)
        rectMode(CENTER)
        rect(handleX, sliderY + this.height / 2, handleSize*0.9, handleSize*0.7, 4)

        pop()
    }
}