class Tab{
    constructor(name, panel, pos, tabManager){
        this.name = getClippedTextMIGUI(name, clipping_length_normalMIGUI)
        this.panel = panel
        textSize(text_SizeMIGUI-3)
        this.w = textWidth(this.name) + 15
        this.h = TAB_HEIGHT
        this.pos = pos.copy()
        this.tabManager = tabManager
        this.button = undefined
    }

    update(){
        this.panel.update()
    }

    show(){
        this.panel.show()
    }
}