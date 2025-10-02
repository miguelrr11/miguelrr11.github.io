class Menu{
    constructor(){
        this.buttons = []

        let buttonCreate = new Button(10, 10, 80, 30, 'Create [C]', createState, () => {
            return state.mode === 'creatingLane' ? 'Creating...' : 'Create [C]'
        }, () => {return state.mode == 'creatingLane'})
        let buttonDelete = new Button(100, 10, 80, 30, 'Delete [D]', deleteState, () => {
            return state.mode === 'deleting' ? 'Deleting...' : 'Delete [D]'
        }, () => {return state.mode == 'deleting'})
        let buttonHand = new Button(190, 10, 80, 30, 'Move [H]', handState, () => {
            return state.mode === 'movingNode' ? 'Moving...' : 'Move [H]'
        }, () => {return state.mode == 'movingNode'})

        const MAIN_X = 305;
        const MAIN_Y = 10;
        const MAIN_W = 50;  
        const MAIN_H = 30;

        const GAP = 4;                        
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
        () => { state.nForLanes++; }
        );

        let buttonMinusFor = new Button(
        LEFT_X, BOTTOM_Y, SIDE_W, SIDE_H,
        '-',
        () => { if (state.nForLanes > 0) state.nForLanes--; }
        );

        let buttonShowLaneState = new Button(
        MAIN_X, MAIN_Y, MAIN_W, MAIN_H,
        '',
        undefined,
        () => `${state.nForLanes} - ${state.nBackLanes}`
        );

        let buttonPlusBack = new Button(
        RIGHT_X, TOP_Y, SIDE_W, SIDE_H,
        '+',
        () => { state.nBackLanes++; }
        );

        let buttonMinusBack = new Button(
        RIGHT_X, BOTTOM_Y, SIDE_W, SIDE_H,
        '-',
        () => { if (state.nBackLanes > 0) state.nBackLanes--; }
        );



        let buttonSetPaths = new Button(620, 10, 80, 30, 'Set Paths', () => {
            road.setPaths()
            //road.trimAllIntersections()
        })
        let buttonShowRoad = new Button(710, 10, 80, 30, 'Show Road', () => {
            SHOW_ROAD = !SHOW_ROAD
            if(SHOW_ROAD) buttonShowRoad.label = 'Hide Road'
            else buttonShowRoad.label = 'Show Road'
        })
        buttonShowRoad.label = SHOW_ROAD ? 'Hide Road' : 'Show Road'
        let buttonShowPaths = new Button(710, 50, 80, 30, 'Show Paths', () => {
            SHOW_PATHS = !SHOW_PATHS
            if(SHOW_PATHS) buttonShowPaths.label = 'Hide Paths'
            else buttonShowPaths.label = 'Show Paths'
        })
        buttonShowPaths.label = SHOW_PATHS ? 'Hide Paths' : 'Show Paths'
        let buttonShowNodes = new Button(710, 90, 80, 30, 'Show Nodes', () => {
            SHOW_NODES = !SHOW_NODES
            if(SHOW_NODES) buttonShowNodes.label = 'Hide Nodes'
            else buttonShowNodes.label = 'Show Nodes'
        })
        buttonShowNodes.label = SHOW_NODES ? 'Hide Nodes' : 'Show Nodes'    

        this.buttons.push(buttonShowNodes)
        this.buttons.push(buttonShowRoad)
        this.buttons.push(buttonShowPaths)

        this.buttons.push(buttonSetPaths)

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