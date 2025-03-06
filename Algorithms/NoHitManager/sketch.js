//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

let profiles = new Map()
let UIs = new Map()
let currentProfile = 0
let panel

function preload(){
    fontPanel = loadFont("migUI/main/bnr.ttf")
}

let selectedSplit = 0

let initialPosUI = {x: 20, y: 50}
let hInitialUI = 18
function createInitialUI(){
    let offset = 15
    let tx = panel.createText('No Hit Manager', true)
    tx.x = initialPosUI.x
    //tx.textSize = 20
    let selectProfile = panel.createOptionPicker('', ['Dark Souls'], changeProfile)
    selectProfile.reposition(initialPosUI.x, initialPosUI.y, 175, hInitialUI)
    let newProfile = panel.createInput('New Profile', createNewProfile, true)
    newProfile.reposition(initialPosUI.x + selectProfile.w + offset, initialPosUI.y, 150, hInitialUI)
    let dupProfile = panel.createButton('Dup', duplicateProfile)
    dupProfile.reposition(initialPosUI.x + selectProfile.w + newProfile.w + 2*offset, initialPosUI.y, 30, hInitialUI)
    let delProfile = panel.createButton('Delete', deleteProfile)
    delProfile.reposition(initialPosUI.x + selectProfile.w + newProfile.w + dupProfile.w + 3*offset, initialPosUI.y, 50, hInitialUI)
}
function changeProfile(index){
}
function createNewProfile(name){
}
function duplicateProfile(){
}
function deleteProfile(){
}

let hitPosUI = {x: 20, y: initialPosUI.y + hInitialUI + 12}
let wHitButton = 300
let hButton = 60
function createHitUI(){
    let offset = 15
    let finishRunButton = panel.createButton('Next Run', nextRun)
    finishRunButton.reposition(hitPosUI.x, hitPosUI.y, hButton, hButton)
    let setPbButton = panel.createButton('Set PB', setPB)
    setPbButton.reposition(hitPosUI.x + hButton + offset, hitPosUI.y, hButton, hButton)
    let hitButton = panel.createButton('HIT', hit)
    hitButton.reposition(hitPosUI.x + hButton*2 + offset*2, hitPosUI.y, wHitButton, hButton)
    let nextSplitButton = panel.createButton('Next Split', nextSplit)
    nextSplitButton.reposition(hitPosUI.x + hButton*2 + wHitButton + offset*3, hitPosUI.y, 95, hButton)
}
function nextRun(){
}
function setPB(){
}
function hit(){
}
function nextSplit(){
}

let posTextProfileRect = {x: 20, y: hitPosUI.y + hButton + 12}
let posTextProfile = {x: posTextProfileRect.x+5, y: posTextProfileRect.y + 7}
let textProfile
function createTextOfProfile(){
    textProfile = {
        split: panel.createText('Split'),
        run: panel.createText('Run'),
        hits: panel.createText('Total Hits'),
        pb: panel.createText('PB')
    }
    textProfile.split.position(posTextProfile.x, posTextProfile.y)
    textProfile.run.position(posTextProfile.x + 110, posTextProfile.y)
    textProfile.hits.position(500, posTextProfile.y)
    textProfile.pb.position(535, posTextProfile.y)
    textProfile.align = 'right'
    textProfile.hits.align = 'right'
}

let posTable = {x: 20, y: posTextProfileRect.y + 60}
let hSplit = 20
let wButton = 30
let wTitle = 270
let wOther = 75
function createUIfromProfile(index = currentProfile){
    let profile = profiles.get(index)
    let ui = []
    for(let i = 0; i < profile.splits.length; i++){
        let buttonSelectSplit = panel.createButton('', selectSplit)
        buttonSelectSplit.reposition(posTable.x, posTable.y + i*hSplit, wButton, hSplit)
        buttonSelectSplit.id = i
        let titleBox = panel.createInput(profile.splits[i].title, updateTitle, true)
        titleBox.reposition(posTable.x + wButton, posTable.y + i*hSplit, wTitle, hSplit)
        titleBox.id = i
        let hitsBox = panel.createInput((profile.splits[i].hits + ''), updateHits, true)
        hitsBox.reposition(posTable.x + wTitle + wButton, posTable.y + i*hSplit, wOther, hSplit)
        hitsBox.id = i
        let diffBox = panel.createInput(profile.splits[i].diff + '', updateDiff, true)
        diffBox.reposition(posTable.x + wTitle + wOther + wButton, posTable.y + i*hSplit, wOther, hSplit)
        diffBox.id = i
        diffBox.modifiable = false  
        let pbBox = panel.createInput((profile.splits[i].pb + ''), updatePB, true)
        pbBox.reposition(posTable.x + wTitle + 2*wOther + wButton, posTable.y + i*hSplit, wOther, hSplit)
        pbBox.id = i
        ui.push({button: buttonSelectSplit, title: titleBox, hits: hitsBox, diff: diffBox, pb: pbBox})
    }
    UIs.set(index, ui)
}






let posFirstButton = {x: 560, y: posTable.y}
let offsetY = 10
let sizeButton = hSplit
function createSplitModifiers(){
    let buttonAddSplit = panel.createButton('+', addSplit)
    buttonAddSplit.reposition(posFirstButton.x, posFirstButton.y, sizeButton, sizeButton)
    let buttonRemoveSplit = panel.createButton('-', removeSplit)
    buttonRemoveSplit.reposition(posFirstButton.x, posFirstButton.y + hSplit + offsetY, sizeButton, sizeButton)
    let buttonMoveSplitUp = panel.createButton('^', moveSplitUp)
    buttonMoveSplitUp.reposition(posFirstButton.x, posFirstButton.y + 2*(hSplit + offsetY), sizeButton, sizeButton)
    let buttonMoveSplitDown = panel.createButton('v', moveSplitDown)
    buttonMoveSplitDown.reposition(posFirstButton.x, posFirstButton.y + 3*(hSplit + offsetY), sizeButton, sizeButton)
}
function addSplit(){
    let profile = profiles.get(currentProfile)
    profile.splits.push({title: 'New Split', hits: 0, pb: 0, diff: 0})
    let ui = UIs.get(currentProfile)
    removeUIfromPanel(ui)
    createUIfromProfile()
}
function removeSplit(){
    let profile = profiles.get(currentProfile)
    profile.splits.splice(selectedSplit, 1)
    let ui = UIs.get(currentProfile)
    removeUIfromPanel(ui)
    createUIfromProfile()
    selectedSplit = Math.max(0, selectedSplit - 1)
    selectSplit(selectedSplit)
}
function moveSplitUp(){
    let profile = profiles.get(currentProfile)
    if(selectedSplit > 0){
        let temp = profile.splits[selectedSplit]
        profile.splits[selectedSplit] = profile.splits[selectedSplit - 1]
        profile.splits[selectedSplit - 1] = temp
        selectedSplit--
    }
    let ui = UIs.get(currentProfile)
    removeUIfromPanel(ui)
    createUIfromProfile()
    selectSplit(selectedSplit)
}
function moveSplitDown(){
    let profile = profiles.get(currentProfile)
    if(selectedSplit < profile.splits.length - 1){
        let temp = profile.splits[selectedSplit]
        profile.splits[selectedSplit] = profile.splits[selectedSplit + 1]
        profile.splits[selectedSplit + 1] = temp
        selectedSplit++
    }
    let ui = UIs.get(currentProfile)
    removeUIfromPanel(ui)
    createUIfromProfile()
    selectSplit(selectedSplit)
}

function selectSplit(index){
    let profile = profiles.get(currentProfile)
    selectedSplit = index
    for(let i = 0; i < profile.splits.length; i++){
        let bool = i === index
        UIs.get(currentProfile)[i].button.selected = bool
        UIs.get(currentProfile)[i].title.selected = bool
        UIs.get(currentProfile)[i].hits.selected = bool
        UIs.get(currentProfile)[i].diff.selected = bool
        UIs.get(currentProfile)[i].pb.selected = bool
        if(bool) UIs.get(currentProfile)[i].button.text = '>'
        else UIs.get(currentProfile)[i].button.text = ''
    }
}
function updateTitle(args, input){
    let profile = profiles.get(currentProfile)
    let split = profile.splits[input.id]
    split.title = args
}
function updateHits(args, input){
    let profile = profiles.get(currentProfile)
    let split = profile.splits[input.id]
    split.hits = parseInt(args)
    if(isNaN(split.hits)) split.hits = 0
    if(split.hits < 0) split.hits = 0
}
function updateDiff(args, input){
    let profile = profiles.get(currentProfile)
    let split = profile.splits[input.id]
    split.diff = parseInt(args)
    if(isNaN(split.diff)) split.diff = 0
    if(split.diff < 0) split.diff = 0
}
function updatePB(args, input){
    let profile = profiles.get(currentProfile)
    let split = profile.splits[input.id]
    split.pb = parseInt(args)
    if(isNaN(split.pb)) split.pb = 0
    if(split.pb < 0) split.pb = 0
}

function updateTextProfile(){
    let profile = profiles.get(currentProfile)
    textProfile.split.setText('Split ' + (selectedSplit + 1) + '/' + (profile.splits.length))
    textProfile.run.setText('Run #' + (profile.runs + 1))
    textProfile.hits.setText('Total Hits: ' + profile.hits)
    textProfile.pb.setText('PB: ' + profile.hitsPB)
}





let posTextTags = {x: 48, y: posTextProfileRect.y + 40}
function createTagsTable(){
    let tx = panel.createText('Title')
    tx.position(posTextTags.x, posTextTags.y)
    tx.textSize = 11
    tx = panel.createText('Hits')
    tx.position(posTextTags.x + wTitle, posTextTags.y)
    tx.textSize = 11
    tx = panel.createText('Diff')
    tx.position(posTextTags.x + wTitle + wOther, posTextTags.y)
    tx.textSize = 11
    tx = panel.createText('PB')
    tx.position(posTextTags.x + wTitle + wOther*2, posTextTags.y)
    tx.textSize = 11
}

function setup(){
    createCanvas(WIDTH, HEIGHT)
    panel = new Panel({
        x:0,
        y:0,
        w:WIDTH,
        h:HEIGHT,
        retractable: false,
        automaticHeight: false
    }, fontPanel)
    let profile = {
        title: 'Dark Souls',
        split: 0,
        runs: 34,
        hitsPB: 5,
        hits: 0,
        splits: [
            {title: 'Asylum Demon', hits: 0, pb: 1, diff: -1},
            {title: 'Taurus Demon', hits: 0, pb: 3, diff: -3},
            {title: 'Gargoyles', hits: 0, pb: 0, diff: 0},
            {title: 'Capra Demon', hits: 0, pb: 2, diff: -2},
        ],
        currentSplit: 0
    }
    profiles.set(0, profile)
    createInitialUI()
    createUIfromProfile()
    createTextOfProfile()
    createSplitModifiers()
    createHitUI()
    createTagsTable()
    selectSplit(0)
}

function draw(){
    background(0)
    updateTextProfile()
    
    panel.update()
    panel.show()
    showRectTextProfile()

}

function showRectTextProfile(){
    push()
    stroke(255)
    noFill()
    rect(posTextProfileRect.x, posTextProfileRect.y, posFirstButton.x+wButton - posTextProfileRect.x - 10, 25)
    pop()
}

function removeUIfromPanel(ui){
    for(let i = 0; i < ui.length; i++){
        panel.removeElement(ui[i].button)
        panel.removeElement(ui[i].title)
        panel.removeElement(ui[i].hits)
        panel.removeElement(ui[i].diff)
        panel.removeElement(ui[i].pb)
    }
}
