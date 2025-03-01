//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 940
const HEIGHT = 600

const colBack = "#3c3c3c"

let panel, fontPanel
let inputTask, selectTab, createTab
let nTabs = 0
let separation = 180

let tabs = new Map()
let titles = []

function preload(){
    fontPanel = loadFont("migUI/main/bnr.ttf")
}

function setup(){
    createCanvas(WIDTH, HEIGHT)
    panel = new Panel({
        retractable: false,
        title: "TODOs",
        theme: 'light',
        w: WIDTH,
        x: 0,
        h: HEIGHT,
        y: 0,
        automaticHeight: false
    }, fontPanel)
    inputTask = panel.createInput('Create Task', addTask, true)
    inputTask.disable()
    panel.separate()
    
    
    createTab = panel.createInput('Create Tab', createNewTab, true)
    createTab.pos.y = 20
    createTab.pos.x = 223
    panel.lastElementPos.y -= 40
}

function createNewTab(tabName){
    let cleanedTabName = removeFirstAndLastWhiteSpaces(tabName)
    if(tabName == '' || allWhiteSpaces(tabName) || tabNameExists(cleanedTabName)) return
    if(nTabs == 0){
        inputTask.enable()
        panel.createText('Select Tab')
        selectTab = panel.createSelect([cleanedTabName], cleanedTabName, selectActualTab)
        selectTab.pos.y -= 5
    }
    else{
        selectTab.addOption(cleanedTabName)
    }
    nTabs++
    createTab.pos.x = 223 + nTabs * separation
    tabs.set(cleanedTabName, '-1')
    let title = panel.createText(cleanedTabName, true)
    title.cropText(160)
    title.pos.y = 20
    title.pos.x = 223 + (nTabs-1) * separation
    titles.push(title)
}

function createSelectTask(indexOfTab, task){
    createTab.pos.x = 223 + nTabs * separation
    let newTab = panel.createSelect([task], task, crossTask, true)
    newTab.pos.y = 45
    newTab.pos.x = 223 + indexOfTab * separation
    newTab.h = HEIGHT - 70
    return newTab
}

function selectActualTab(){
    console.log(selectTab.getSelected())
}

function addTask(task){
    let cleanedTask = removeFirstAndLastWhiteSpaces(task)
    let tab = selectTab.getSelected()
    if(cleanedTask == '' || allWhiteSpaces(cleanedTask) || taskNameExists(cleanedTask, tab)) return
    if(tabs.get(tab) == '-1'){
        let index = getIndexOfKey(tabs, tab)
        let tabSelect = createSelectTask(index, cleanedTask)
        tabs.set(tab, tabSelect)
    }
    else{
        let tabSelect = tabs.get(tab)
        tabSelect.addOption(cleanedTask)
    }
}

function draw(){
    background(colBack)

    panel.update()
    panel.show()

    push()
    stroke("#9bafd9")
    line(200, 0, 200, HEIGHT)
    pop()

}

function crossTask(tab){
    let task = tab.getSelected()
    let indexOfTask = tab.selected
    if(!tab.isItCrossed(task)){
        tab.cross(indexOfTask)
    }
    else{
        tab.uncross(indexOfTask)
    }
}

function getIndexOfKey(map, key) {
    let index = 0;
    for (let k of map.keys()) {
        if (k === key) {
            return index;
        }
        index++;
    }
    return -1; // Devuelve -1 si la clave no se encuentra en el mapa
}

function removeFirstAndLastWhiteSpaces(str){
    let newStr = ''
    let i = 0
    while(str[i] == ' ') i++
    for(; i < str.length; i++){
        newStr += str[i]
    }
    i = newStr.length - 1
    while(newStr[i] == ' ') i--
    let finalStr = ''
    for(let j = 0; j <= i; j++){
        finalStr += newStr[j]
    }
    return finalStr
}

function allWhiteSpaces(str){
    for(let i = 0; i < str.length; i++){
        if(str[i] != ' ') return false
    }
    return true
}

function tabNameExists(tabName){
    for(let title of titles){
        if(title.getText() == tabName) return true
    }
    return false
}

function taskNameExists(taskName, tab){
    let tabSelect = tabs.get(tab)
    if(tabSelect == '-1') return false
    for(let task of tabSelect.options){
        if(task == taskName) return true
    }
    return false
}