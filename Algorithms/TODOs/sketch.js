//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 940
const HEIGHT = 600

const colBack = "#3c3c3c"

let panel, fontPanel
let inputTask, selectTab, createTab, deleteTab
let nTabs = 0
let separation = 180

let tabs = new Map()
let titles = []

function preload(){
    fontPanel = loadFont("migUI/main/bnr.ttf")
}

function saveDataLocalStorage(){
    let data = {}
    for(let [key, value] of tabs){
        if(value != '-1'){
            data[key] = value.options
            data['Crossed' + key] = getCrossedValues(value.options, key)
        }
        else{ 
            data[key] = ''
        }
    }
    localStorage.setItem('data', JSON.stringify(data))
}

function loadDataLocalStorage(){
    let data = JSON.parse(localStorage.getItem('data'))
    if(data == null) return
    
    for(let key in data){
        if(key.includes('Crossed')) continue
        deleteTab.enable()
        createNewTab(key)
        if(data[key] == '') continue
        let index = getIndexOfKey(tabs, key)
        let tabSelect = createSelectTask(index, data[key][0])
        tabs.set(key, tabSelect)
        for(let i = 1; i < data[key].length; i++){
            tabSelect.addOption(data[key][i])
        }
        if(data['Crossed' + key] == undefined) continue
        for(let crossed of data['Crossed' + key]){
            crossTask(tabSelect, crossed)
        }
    }
}

function getCrossedValues(options, tab){
    let crossed = []
    let tabSelect = tabs.get(tab)
    for(let i = 0; i < options.length; i++){
        //do it like this: tabSelect.isItCrossed(tabSelect.options[i])
        if(tabSelect.isItCrossed(tabSelect.options[i])){
            crossed.push(tabSelect.options[i])
        }
    }
    return crossed
}

function deleteSelectedTab(){
    let tab = selectTab.getSelected()
    let index = getIndexOfKey(tabs, tab)
    let tabSelect = tabs.get(tab)
    // if(tabSelect != '-1'){
    //     for(let i = 0; i < tabSelect.options.length; i++){
    //         if(tabSelect.isItCrossed(tabSelect.options[i])){
    //             tabSelect.removeOption(tabSelect.options[i])
    //             i--
    //         }
    //     }
    // }
    panel.deleteSelect(tabSelect, -separation)
    panel.deleteSentence(titles[index], -separation)
    tabs.delete(tab)
    titles.splice(index, 1)
    createTab.pos.x -= separation
    nTabs--
    if(nTabs == 0){
        inputTask.disable()
        deleteTab.disable()
        panel.deleteSelect(selectTab)
        panel.deleteSentence('Select Tab')
    }
    else{
        selectTab.removeOption(tab)
    }
    saveDataLocalStorage()
}

function deleteCrossedOptions(){
    for(let [key, value] of tabs){
        if(value != '-1'){
            for(let i = 0; i < value.options.length; i++){
                if(value.isItCrossed(value.options[i])){
                    value.removeOption(value.options[i])
                    i--
                }
            }
        }
    }
    saveDataLocalStorage()
}

function setup(){
    createCanvas(WIDTH, HEIGHT)
    
    panel = new Panel({
        retractable: false,
        title: "TODOs",
        // lightCol: "#89A0D2",
        // darkCol: "#E4F0F1",
        theme: 'clean',
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

    panel.createButton('Delete crossed Tasks', deleteCrossedOptions)
    deleteTab = panel.createButton('Delete selected Tab', deleteSelectedTab)
    deleteTab.disable()
    deleteTab.pos = createVector(17, HEIGHT - 40)

    loadDataLocalStorage()
    saveDataLocalStorage()
}

function createSelectTab(cleanedTabName){
    inputTask.enable()
    deleteTab.enable()
    let tx = panel.createText('Select Tab')
    tx.pos.x = 17
    tx.pos.y = 105
    selectTab = panel.createSelect([cleanedTabName], cleanedTabName, selectActualTab)
    selectTab.pos.x = 17
    selectTab.pos.y = 124.196
}

function createNewTab(tabName){
    let cleanedTabName = removeFirstAndLastWhiteSpaces(tabName)
    if(tabName == '' || allWhiteSpaces(tabName) || tabNameExists(cleanedTabName)) return
    if(nTabs == 0){
       createSelectTab(cleanedTabName)
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

    saveDataLocalStorage()
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
    saveDataLocalStorage()
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

function crossTask(tab, task = undefined){
    let taskk = task ? task : tab.getSelected()
    let indexOfTask = tab.selected
    if(!tab.isItCrossed(taskk)){
        tab.cross(indexOfTask)
    }
    else{
        tab.uncross(indexOfTask)
    }
    saveDataLocalStorage()
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