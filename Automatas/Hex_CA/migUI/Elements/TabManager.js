const MAX_TAB_WIDTH = 50
const TAB_HEIGHT = 17

class TabManager{
    constructor(options){
        this.tabs = []
        this.activeTab = null
        this.options = options      //all tabs will have panels with the same properties

        this.panel = new Panel(options)     //main panel only for dislaying the tabs buttons
        this.panel.automaticHeight = false
        this.panel.h = 50 + TAB_HEIGHT
        //this.panel.lastElementPos.x -= 16

        this.options.title = ''
        //this.options.y = this.panel.pos.y + this.panel.h

        this.lastPos = createVector(this.panel.pos.x, this.panel.h-TAB_HEIGHT-1)
        this.w = this.panel.w
        this.Ylines = []
    }

    reposition(x, y){
        for(let p of this.tabs) p.panel.reposition(x, y+this.panel.h)
        let dx = x - this.panel.pos.x
		let dy = y - this.panel.pos.y
        this.panel.reposition(x, y)
        this.lastPos.x += dx
		this.lastPos.y += dy
        for(let i = 0; i < this.Ylines.length; i++){
            this.Ylines[i] += dy
        }
    }

    changeActiveButtons(tab){
        for(let b of this.panel.buttons){
            if(tab.button == b) b.active = true
            else b.active = false
        }
    }

    repositionAllPanels(){
        for(let p of this.tabs){
            let pan = p.panel
            pan.reposition(this.panel.pos.x, this.panel.h + this.panel.pos.y)
        }
    }


    createTab(name){
        let panelOfTab = new Panel(this.options)
        //always on screen
        
        panelOfTab.reposition(this.panel.pos.x, this.panel.h + this.panel.pos.y)
        let tab = new Tab(name, panelOfTab, this.lastPos, this)
        
        this.tabs.push(tab)
        if(this.tabs.length == 1) this.activeTab = tab
        

        let button = this.panel.createButton(tab.name, true)
        this.panel.h = this.panel.buttons[this.panel.buttons.length-1].pos.y+TAB_HEIGHT+1-this.panel.pos.y
        panelOfTab.h = Math.min(panelOfTab.h, height - this.panel.h - this.panel.pos.y)
        button.setRoundedCorners(true, true, false, false)
        button.setFunc(() => {
            this.activeTab = tab
            this.changeActiveButtons(tab)
        })
        
        
        tab.button = button
        if(this.tabs.length == 1) this.changeActiveButtons(tab)
        if(button.pos.y != this.lastPos.y){
            this.Ylines.push(button.pos.y+button.h+1)
        }
        this.lastPos = button.pos.copy()
        this.repositionAllPanels()
        return panelOfTab
    }

    update(){
        this.panel.update()
        if(this.activeTab){
            this.activeTab.update()
        }
        //plot special case
        for(let p of this.tabs){
            if(p == this.activeTab) continue
            let pan = p.panel
            for(let pl of pan.plots) if(pl.func) pl.feed(pl.func())
        }
    }

    showLinesTabs(){
        push()
        stroke(this.panel.lightCol)
        for(let yl of this.Ylines){
            line(this.panel.pos.x+1, yl, this.panel.pos.x + this.panel.w, yl)
        }
        pop()
    }

    show(){
        if(this.activeTab){
            this.activeTab.show()
        }
        this.panel.show()
        this.showLinesTabs()
    }
}