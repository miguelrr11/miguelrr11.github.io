class Menu{
    constructor(tool){
        this.buttons = []
        this.tool = tool

        let buttonCreate = new Button(10, 10, 80, 30, 'Create [C]', () => {tool.createState()}, () => {
            return this.tool.state.mode === 'creatingLane' ? 'Creating...' : 'Create [C]'
        }, () => {return this.tool.state.mode == 'creatingLane'})
        let buttonDelete = new Button(100, 10, 80, 30, 'Delete [D]', () => {tool.deleteState()}, () => {
            return this.tool.state.mode === 'deleting' ? 'Deleting...' : 'Delete [D]'
        }, () => {return this.tool.state.mode == 'deleting'})
        let buttonHand = new Button(190, 10, 80, 30, 'Move [H]', () => {tool.handState()}, () => {
            return this.tool.state.mode === 'movingNode' ? 'Moving...' : 'Move [H]'
        }, () => {return this.tool.state.mode == 'movingNode'})

        const MAIN_X = 305;
        const MAIN_Y = 10;
        const MAIN_W = 50;  
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
        MAIN_X, MAIN_Y, MAIN_W, MAIN_H,
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



        let buttonSetPaths = new Button(620, 10, 95, 30, 'Set Paths', () => {
            road.setPaths()
            //road.trimAllIntersections()
        })
        let buttonShowRoad = new Button(700, 10, 95, 20, 'Show Main', () => {
            this.tool.showOptions.SHOW_ROAD = !this.tool.showOptions.SHOW_ROAD
            if(this.tool.showOptions.SHOW_ROAD) buttonShowRoad.label = 'Hide Main'
            else buttonShowRoad.label = 'Show Main'
        })
        buttonShowRoad.label = this.tool.showOptions.SHOW_ROAD ? 'Hide Road' : 'Show Road'
        let buttonShowPaths = new Button(700, 40, 95, 20, 'Show Paths', () => {
            this.tool.showOptions.SHOW_PATHS = !this.tool.showOptions.SHOW_PATHS
            if(this.tool.showOptions.SHOW_PATHS) buttonShowPaths.label = 'Hide Paths'
            else buttonShowPaths.label = 'Show Paths'
        })
        buttonShowPaths.label = this.tool.showOptions.SHOW_PATHS ? 'Hide Paths' : 'Show Paths'
        let buttonShowNodes = new Button(700, 70, 95, 20, 'Show Nodes', () => {
            this.tool.showOptions.SHOW_NODES = !this.tool.showOptions.SHOW_NODES
            if(this.tool.showOptions.SHOW_NODES) buttonShowNodes.label = 'Hide Nodes'
            else buttonShowNodes.label = 'Show Nodes'
        })
        buttonShowNodes.label = this.tool.showOptions.SHOW_NODES ? 'Hide Nodes' : 'Show Nodes'  
        let buttonShowConnectors = new Button(700, 100, 95, 20, 'Show Conns', () => {
            this.tool.showOptions.SHOW_CONNECTORS = !this.tool.showOptions.SHOW_CONNECTORS
            if(this.tool.showOptions.SHOW_CONNECTORS) buttonShowConnectors.label = 'Hide Conns'
            else buttonShowConnectors.label = 'Show Conns'
        })
        buttonShowConnectors.label = this.tool.showOptions.SHOW_CONNECTORS ? 'Hide Conns' : 'Show Conns'
        let buttonShowIntersecSegs = new Button(700, 130, 95, 20, 'Show Inter', () => {
            this.tool.showOptions.SHOW_INTERSECSEGS = !this.tool.showOptions.SHOW_INTERSECSEGS
            if(this.tool.showOptions.SHOW_INTERSECSEGS) buttonShowIntersecSegs.label = 'Hide Inter'
            else buttonShowIntersecSegs.label = 'Show Inter'
        })
        buttonShowIntersecSegs.label = this.tool.showOptions.SHOW_INTERSECSEGS ? 'Hide Inter' : 'Show Inter'
        let buttonShowTags = new Button(700, 160, 95, 20, 'Show Tags', () => {
            this.tool.showOptions.SHOW_TAGS = !this.tool.showOptions.SHOW_TAGS
            if(this.tool.showOptions.SHOW_TAGS) buttonShowTags.label = 'Hide Tags'
            else buttonShowTags.label = 'Show Tags'
        })
        buttonShowTags.label = this.tool.showOptions.SHOW_TAGS ? 'Hide Tags' : 'Show Tags'
        let buttonShowSegDetails = new Button(700, 190, 95, 20, 'Show Details', () => {
            this.tool.showOptions.SHOW_SEGS_DETAILS = !this.tool.showOptions.SHOW_SEGS_DETAILS
            if(this.tool.showOptions.SHOW_SEGS_DETAILS) buttonShowSegDetails.label = 'Hide Details'
            else buttonShowSegDetails.label = 'Show Details'
        })
        buttonShowSegDetails.label = this.tool.showOptions.SHOW_SEGS_DETAILS ? 'Hide Details' : 'Show Details'

        let buttonShowLanes = new Button(700, 220, 95, 20, 'Show Lanes', () => {
            this.tool.showOptions.SHOW_LANES = !this.tool.showOptions.SHOW_LANES
            if(this.tool.showOptions.SHOW_LANES) buttonShowLanes.label = 'Hide Lanes'
            else buttonShowLanes.label = 'Show Lanes'
        })
        buttonShowLanes.label = this.tool.showOptions.SHOW_LANES ? 'Hide Lanes' : 'Show Lanes'


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
                this.coolDownClick = 10
            }
        })
        this.interacted = anyClicked
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

    show(){
        if(this.updateLabel) this.label = this.updateLabel()
        let enabled = this.enabled ? this.enabled() : true
        push()
        rectMode(CORNER)
        fill(50)
        stroke(255)
        rect(this.pos.x, this.pos.y, this.size.w, this.size.h)
        enabled ? fill(255) : fill(150)
        noStroke()
        textAlign(CENTER, CENTER)
        textSize(15)
        text(this.label, this.pos.x + this.size.w / 2, this.pos.y + this.size.h / 2)
        pop()
    }
}