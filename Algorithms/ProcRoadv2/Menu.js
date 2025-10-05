class Menu{
    constructor(tool){
        this.buttons = []
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
        let buttonShowRoad = new Button(xLoc, 10, 95, 20, 'Main Graph', () => {
            this.tool.showOptions.SHOW_ROAD = !this.tool.showOptions.SHOW_ROAD
        }, undefined,  () => {return this.tool.showOptions.SHOW_ROAD})
        let buttonShowPaths = new Button(xLoc, 40, 95, 20, 'Paths', () => {
            this.tool.showOptions.SHOW_PATHS = !this.tool.showOptions.SHOW_PATHS
        }, undefined,  () => {return this.tool.showOptions.SHOW_PATHS})
        let buttonShowNodes = new Button(xLoc, 130, 95, 20, 'Nodes', () => {
            this.tool.showOptions.SHOW_NODES = !this.tool.showOptions.SHOW_NODES
        }, undefined,  () => {return this.tool.showOptions.SHOW_NODES})
        let buttonShowConnectors = new Button(xLoc, 100, 95, 20, 'Connections', () => {
            this.tool.showOptions.SHOW_CONNECTORS = !this.tool.showOptions.SHOW_CONNECTORS
        }, undefined,  () => {return this.tool.showOptions.SHOW_CONNECTORS})
        let buttonShowIntersecSegs = new Button(xLoc, 70, 95, 20, 'Intersections', () => {
            this.tool.showOptions.SHOW_INTERSECSEGS = !this.tool.showOptions.SHOW_INTERSECSEGS
        }, undefined,  () => {return this.tool.showOptions.SHOW_INTERSECSEGS})
        let buttonShowTags = new Button(xLoc, 160, 95, 20, 'Tags', () => {
            this.tool.showOptions.SHOW_TAGS = !this.tool.showOptions.SHOW_TAGS
        }, undefined,  () => {return this.tool.showOptions.SHOW_TAGS})
        let buttonShowSegDetails = new Button(xLoc, 190, 95, 20, 'Endings', () => {
            this.tool.showOptions.SHOW_SEGS_DETAILS = !this.tool.showOptions.SHOW_SEGS_DETAILS
        }, undefined,  () => {return this.tool.showOptions.SHOW_SEGS_DETAILS})
        let buttonShowLanes = new Button(xLoc, 220, 95, 20, 'Lanes', () => {
            this.tool.showOptions.SHOW_LANES = !this.tool.showOptions.SHOW_LANES
        }, undefined,  () => {return this.tool.showOptions.SHOW_LANES})

        let buttonSnapToGrid = new Button(10, 90, 80, 20, 'Snap Grid', () => {
            this.tool.state.snapToGrid = !this.tool.state.snapToGrid
        }, undefined,  () => {return this.tool.state.snapToGrid})

        this.buttons.push(buttonSnapToGrid)

        this.buttons.push(buttonShowNodes)
        this.buttons.push(buttonShowRoad)
        this.buttons.push(buttonShowPaths)
        this.buttons.push(buttonShowConnectors)
        this.buttons.push(buttonShowIntersecSegs)
        this.buttons.push(buttonShowTags)
        this.buttons.push(buttonShowSegDetails)
        this.buttons.push(buttonShowLanes)

        //this.buttons.push(buttonSetPaths)

        this.buttons.push(buttonShowLaneState)
        this.buttons.push(buttonMinusFor)
        this.buttons.push(buttonPlusFor)
        this.buttons.push(buttonMinusBack)
        this.buttons.push(buttonPlusBack)

        this.buttons.push(buttonCreate)
        this.buttons.push(buttonDelete)
        this.buttons.push(buttonHand)

        this.interacted = false
        this.coolDownClick = 0
        
    }

    inBounds(){
        for(let b of this.buttons){
            if(inBounds(mouseX, mouseY, b.pos.x, b.pos.y, b.size.w, b.size.h)){
                return true
            }
        }
        return false
    }

    update(){
        let anyClicked = false
        if(this.coolDownClick > 0) this.coolDownClick--
        this.buttons.forEach(b => {
            if(inBounds(mouseX, mouseY, b.pos.x, b.pos.y, b.size.w, b.size.h) && mouseIsPressed && this.coolDownClick <= 0){
                anyClicked = true
                if(b.onClick) b.onClick()
                
            }
        })
        this.interacted = anyClicked
        if(anyClicked) this.coolDownClick = 10
        return anyClicked
    }

    show(){
        this.buttons.forEach(b => b.show())
    }
}

class Button{
    constructor(x, y, w, h, label, onClick, updateLabel, enabled){
        this.pos = {x, y}
        this.size = {w, h}
        this.label = label
        this.onClick = onClick
        this.updateLabel = updateLabel
        this.enabled = enabled
    }

    hover(){
        return inBounds(mouseX, mouseY, this.pos.x, this.pos.y, this.size.w, this.size.h)
    }

    show(){
        if(this.updateLabel) this.label = this.updateLabel()
        let enabled = this.enabled ? this.enabled() : true
        push()
        rectMode(CORNER)
        enabled ? fill(70) : fill(50)
        //enabled ? stroke(255) : noStroke()
        noStroke()
        // this.hover() ? strokeWeight(2.25) : strokeWeight(1)
        rect(this.pos.x, this.pos.y, this.size.w, this.size.h, 4)
        enabled ? fill(255) : fill(150)
        noStroke()
        textAlign(CENTER, CENTER)
        this.hover() ? textSize(16) : textSize(15)
        text(this.label, this.pos.x + this.size.w / 2, this.pos.y + this.size.h / 2)
        pop()
    }
}