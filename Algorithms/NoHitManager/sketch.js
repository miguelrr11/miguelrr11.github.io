//No Hit Manager
//Miguel Rodríguez
//06-03-2025

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 900

let profiles = new Map()
let UIs = new Map()
let currentProfile = -1
let panel
let profilesCounter = 0
let buttons = []

const col1 = "#E7ECEF"
const col2 = "#274C77"
const col3 = "#6096BA"
const col4 = "#A3CEF1"
const col5 = "#8B8C89"

const redPastel = "#f08080"
const greenPastel = "#b9fbc0"
const bluePastel = "#a9def9"
const yellowPastel = "#ffef9f"
const purplePastel = "#e4c1f9"

let redDiff, greenDiff



function preload(){
    fontPanel = loadFont("migUI/main/bnr.ttf")
}

let selectedSplit = 0


let textPos = {x: 20, y: 30}
let initialPosUI = {x: 20, y: textPos.y+35}
let hInitialUI = 18
let selectProfile, newProfile, dupProfile, delProfile, renProfile
let inputW = 122
function createInitialUI(){
    let offset = 15
    let tx = panel.createText('No Hit Manager', true)
    tx.pos = createVector(textPos.x, textPos.y)
    tx.textSize = 27

    selectProfile = panel.createOptionPicker('', [], changeProfile)
    selectProfile.reposition(initialPosUI.x, initialPosUI.y, 175, hInitialUI)

    newProfile = panel.createInput('', createNewProfile, true)
    newProfile.reposition(initialPosUI.x + selectProfile.w + offset, initialPosUI.y, inputW, hInitialUI)
    newProfile.placeholder = 'New Profile'

    renProfile = panel.createInput('', renameProfile)
    renProfile.reposition(initialPosUI.x + selectProfile.w + newProfile.w + offset*2, initialPosUI.y, inputW, hInitialUI)
    renProfile.placeholder = 'Rename Profile'

    dupProfile = panel.createButton('Dup', duplicateProfile)
    dupProfile.reposition(initialPosUI.x + selectProfile.w + inputW*2 + 3*offset, initialPosUI.y, 30, hInitialUI)

    delProfile = panel.createButton('Delete', deleteProfile)
    delProfile.reposition(initialPosUI.x + selectProfile.w + inputW*2 + dupProfile.w + 4*offset, initialPosUI.y, 50, hInitialUI)

    buttons.push(dupProfile)
    buttons.push(delProfile)
    buttons.push(renProfile)
}
function changeProfile(profileTitle){
    if(currentProfile == -1) return
    let index = -1
    for(let i = 0; i < profilesCounter; i++){
        if(profiles.has(i) && profiles.get(i).title == profileTitle){
            index = i
            break
        }
    }
    if(index != -1){
        removeUIfromPanel(UIs.get(currentProfile))
        currentProfile = index
        createUIfromProfile()
        selectSplit(0)
    }
    saveLocalData()
}
function createNewProfile(name){
    if(name != undefined && name.length > 0){
        let profile = {
            title: name,
            split: 0,
            runs: 0,
            hitsPB: 0,
            hits: 0,
            splits: [],
            currentSplit: 0
        }
        profiles.set(profilesCounter, profile)
        if(currentProfile != -1) removeUIfromPanel(UIs.get(currentProfile))
        currentProfile = profilesCounter
        createUIfromProfile(currentProfile)
        selectProfile.addOption(name)
        selectProfile.selectedIndex = currentProfile
        profilesCounter++
        newProfile.setText('')
    }
    saveLocalData()
}
function duplicateProfile(){
    if(currentProfile == -1) return
    let profile = profiles.get(currentProfile)
    let newProfile = {
        title: profile.title + ' Copy',
        split: 0,
        runs: 0,
        hitsPB: 0,
        hits: 0,
        splits: JSON.parse(JSON.stringify(profile.splits)),
        currentSplit: 0
    }
    profiles.set(profilesCounter, newProfile)
    selectProfile.addOption(newProfile.title)
    selectProfile.selectedIndex = profilesCounter
    profilesCounter++
    removeUIfromPanel(UIs.get(currentProfile))
    currentProfile = profilesCounter - 1
    createUIfromProfile(profilesCounter - 1)
    selectSplit(0)
    saveLocalData()
}
function deleteProfile(){
    if(currentProfile == -1) return
    let profile = profiles.get(currentProfile)
    let ui = UIs.get(currentProfile)
    profiles.delete(currentProfile)
    UIs.delete(currentProfile)
    removeUIfromPanel(ui)
    selectProfile.removeOption(profile.title)
    //set the selected index to the first profile
    currentProfile = -1
    for(let i = 0; i < profilesCounter; i++){
        if(profiles.get(i) != undefined){
            currentProfile = i
            break
        }
    }
    if(currentProfile != -1) createUIfromProfile(currentProfile)
    saveLocalData()
}
function renameProfile(){
    if(currentProfile == -1) return
    let profile = profiles.get(currentProfile)
    let name = newProfile.getText()
    if(name != undefined && name.length > 0){
        profile.title = name
        selectProfile.removeOption(profile.title)
        selectProfile.addOption(name)
        selectProfile.selectedIndex = currentProfile
        newProfile.setText('')
    }
    saveLocalData()
}
function addProfile(profile){
    profiles.set(profilesCounter, profile)
    if(currentProfile != -1) removeUIfromPanel(UIs.get(currentProfile))
    currentProfile = profilesCounter
    createUIfromProfile(currentProfile)
    selectProfile.addOption(profile.title)
    selectProfile.selectedIndex = currentProfile
    profilesCounter++
    newProfile.setText('')
    selectSplit(0)
    saveLocalData()
}

let hitPosUI = {x: 20, y: initialPosUI.y + hInitialUI + 12}
let wHitButton = 300
let hButton = 60
let finishRunButton, setPBButton, hitButton, nextSplitButton
let normalTextSize = 15
let hitTextSize = 28
let amtDarken = 135
function createHitUI(){
    let offset = 15
    finishRunButton = panel.createButton('Next\nRun', nextRun)
    finishRunButton.reposition(hitPosUI.x, hitPosUI.y, hButton, hButton)
    finishRunButton.setTextSize(normalTextSize)
    finishRunButton.darkCol = purplePastel
    finishRunButton.lightCol = darkenColor(hexToRgbMIGUI(purplePastel), amtDarken)

    setPBButton = panel.createButton('Set\nPB', setPB)
    setPBButton.reposition(hitPosUI.x + hButton + offset, hitPosUI.y, hButton, hButton)
    setPBButton.setTextSize(normalTextSize)
    setPBButton.darkCol = yellowPastel
    setPBButton.lightCol = darkenColor(hexToRgbMIGUI(yellowPastel), amtDarken)

    hitButton = panel.createButton('HIT', hit)
    hitButton.reposition(hitPosUI.x + hButton*2 + offset*2, hitPosUI.y, wHitButton, hButton)
    hitButton.setTextSize(hitTextSize)
    hitButton.darkCol = redPastel
    hitButton.lightCol = darkenColor(hexToRgbMIGUI(redPastel), amtDarken)
    hitButton.drawingFunc = drawKeyHintsHit

    nextSplitButton = panel.createButton('Next Split', nextSplit)
    nextSplitButton.reposition(hitPosUI.x + hButton*2 + wHitButton + offset*3, hitPosUI.y, 95, hButton)
    nextSplitButton.setTextSize(normalTextSize-1)
    nextSplitButton.darkCol = greenPastel
    nextSplitButton.lightCol = darkenColor(hexToRgbMIGUI(greenPastel), amtDarken)
    nextSplitButton.drawingFunc = drawKeyHintsSplit

    buttons.push(finishRunButton)
    buttons.push(setPBButton)
    buttons.push(hitButton)
    buttons.push(nextSplitButton)
}
function nextRun(){
    if(currentProfileNoSplits()) return
    let profile = profiles.get(currentProfile)
    profile.runs++
    profile.hits = 0
    profile.currentSplit = 0
    profile.splits.forEach(split => {
        split.hits = 0
        split.diff = 0
    })
    selectedSplit = 0
    removeUIfromPanel(UIs.get(currentProfile))
    createUIfromProfile()
    selectSplit(selectedSplit)
    saveLocalData()
}
function setPB(){
    if(currentProfileNoSplits()) return
    let profile = profiles.get(currentProfile)
    profile.hitsPB = profile.hits
    profile.splits.forEach(split => {
        split.pb = split.hits
        split.diff = 0
    })
    removeUIfromPanel(UIs.get(currentProfile))
    createUIfromProfile()
    selectSplit(selectedSplit)
    updateDiff()
    saveLocalData()
}
function hit(){
    if(currentProfileNoSplits()) return
    let profile = profiles.get(currentProfile)
    profile.hits++
    profile.splits[selectedSplit].hits++
    profile.splits[selectedSplit].diff = profile.splits[selectedSplit].hits - profile.splits[selectedSplit].pb
    removeUIfromPanel(UIs.get(currentProfile))
    createUIfromProfile()
    selectSplit(selectedSplit)
    updateDiff()
    saveLocalData()
}
function nextSplit(){
    if(currentProfile == -1) return
    let profile = profiles.get(currentProfile)
    if(selectedSplit < profile.splits.length - 1){
        selectedSplit++
        profile.currentSplit = selectedSplit
        removeUIfromPanel(UIs.get(currentProfile))
        createUIfromProfile()
        selectSplit(selectedSplit)
    }
    updateDiff()
    saveLocalData()
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
    textProfile.pb.position(572, posTextProfile.y)
    textProfile.pb.align = 'right'
    textProfile.hits.align = 'right'
}

let posTable = {x: 20, y: posTextProfileRect.y + 60}
let hSplit = 20
let wButton = 30
let wTitle = 270
let wOther = 75
let off = 5
function createUIfromProfile(index = currentProfile){
    if(index == -1) return
    let profile = profiles.get(index)
    let ui = []
    for(let i = 0; i < profile.splits.length; i++){
        let buttonSelectSplit = panel.createButton('', selectSplit)
        buttonSelectSplit.reposition(posTable.x, posTable.y + i*(hSplit + off), hSplit, hSplit)
        buttonSelectSplit.id = i
        let titleBox = panel.createInput(profile.splits[i].title, updateTitle, true)
        titleBox.reposition(posTable.x + wButton, posTable.y + i*(hSplit + off), wTitle, hSplit)
        titleBox.id = i
        let hitsBox = panel.createInput((profile.splits[i].hits + ''), updateHits, true)
        hitsBox.reposition(posTable.x + wTitle + wButton, posTable.y + i*(hSplit + off), wOther, hSplit)
        hitsBox.id = i
        let diffBox = panel.createInput(profile.splits[i].diff + '', updateDiff, true)
        diffBox.reposition(posTable.x + wTitle + wOther + wButton, posTable.y + i*(hSplit + off), wOther, hSplit)
        diffBox.id = i
        diffBox.modifiable = false  
        let pbBox = panel.createInput((profile.splits[i].pb + ''), updatePB, true)
        pbBox.reposition(posTable.x + wTitle + 2*wOther + wButton, posTable.y + i*(hSplit + off), wOther, hSplit)
        pbBox.id = i
        ui.push({button: buttonSelectSplit, title: titleBox, hits: hitsBox, diff: diffBox, pb: pbBox})
    }
    UIs.set(index, ui)
    updateDiff()
}

let posFirstButton = {x: 560, y: posTable.y}
let offsetY = 10
let sizeButton = hSplit
function createSplitModifiers(){
    let buttonAddSplit = panel.createButton('+', addSplit)
    buttonAddSplit.reposition(posFirstButton.x, posFirstButton.y, sizeButton, sizeButton)
    let buttonRemoveSplit = panel.createButton('-', removeSplit)
    buttonRemoveSplit.reposition(posFirstButton.x, posFirstButton.y + hSplit + offsetY, sizeButton, sizeButton)
    let buttonMoveSplitUp = panel.createButton('', moveSplitUp)
    buttonMoveSplitUp.reposition(posFirstButton.x, posFirstButton.y + 2*(hSplit + offsetY), sizeButton, sizeButton)
    buttonMoveSplitUp.drawingFunc = drawArrowDown
    let buttonMoveSplitDown = panel.createButton('', moveSplitDown)
    buttonMoveSplitDown.reposition(posFirstButton.x, posFirstButton.y + 3*(hSplit + offsetY), sizeButton, sizeButton)
    buttonMoveSplitDown.drawingFunc = drawArrowUp
    buttons.push(buttonAddSplit)
    buttons.push(buttonRemoveSplit)
    buttons.push(buttonMoveSplitUp)
    buttons.push(buttonMoveSplitDown)
}
function addSplit(){
    let profile = profiles.get(currentProfile)
    profile.splits.push({title: 'New Split', hits: 0, pb: 0, diff: 0})
    let ui = UIs.get(currentProfile)
    removeUIfromPanel(ui)
    createUIfromProfile()
    selectSplit(selectedSplit)
    saveLocalData()
}
function removeSplit(){
    let profile = profiles.get(currentProfile)
    profile.splits.splice(selectedSplit, 1)
    let ui = UIs.get(currentProfile)
    removeUIfromPanel(ui)
    createUIfromProfile()
    selectedSplit = Math.max(0, selectedSplit - 1)
    selectSplit(selectedSplit)
    saveLocalData()
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
    saveLocalData()
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
    saveLocalData()
}

function selectSplit(index){
    if(currentProfileNoSplits()) return
    let profile = profiles.get(currentProfile)
    selectedSplit = index
    for(let i = 0; i < profile.splits.length; i++){
        let bool = i === index
        UIs.get(currentProfile)[i].button.selected = bool
        UIs.get(currentProfile)[i].title.selected = bool
        UIs.get(currentProfile)[i].hits.selected = bool
        UIs.get(currentProfile)[i].diff.selected = bool
        UIs.get(currentProfile)[i].pb.selected = bool
        if(bool) UIs.get(currentProfile)[i].button.drawingFunc = drawArrowRight
        else UIs.get(currentProfile)[i].button.drawingFunc = undefined
    }
    saveLocalData()
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
    updateDiff()
}
function updatePB(args, input){
    let profile = profiles.get(currentProfile)
    let split = profile.splits[input.id]
    split.pb = parseInt(args)
    if(isNaN(split.pb)) split.pb = 0
    if(split.pb < 0) split.pb = 0
    updateDiff()
}

function updateTextProfile(){
    if(currentProfile == -1){
        textProfile.split.setText('No Profile Selected')
        textProfile.run.setText('')
        textProfile.hits.setText('')
        textProfile.pb.setText('')
        return
    }
    let profile = profiles.get(currentProfile)
    profile.hits = profile.splits.reduce((acc, split) => acc + split.hits, 0)
    profile.hitsPB = profile.splits.reduce((acc, split) => acc + split.pb, 0)
    textProfile.split.setText('Split ' + (selectedSplit + 1) + '/' + (profile.splits.length))
    textProfile.run.setText('Run #' + (profile.runs + 1))
    textProfile.hits.setText('Total Hits: ' + profile.hits)
    textProfile.pb.setText('PB: ' + profile.hitsPB)
}



let posTextTags = {x: 49, y: posTextProfileRect.y + 43}
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


function updateDiff(){
    if(currentProfileNoSplits()) return
    let profile = profiles.get(currentProfile)
    for(let i = 0; i < profile.splits.length; i++){
        profile.splits[i].diff = profile.splits[i].hits - profile.splits[i].pb
        UIs.get(currentProfile)[i].diff.setText(profile.splits[i].diff + '')
        let diff = profile.splits[i].diff
        if(diff > 0) UIs.get(currentProfile)[i].diff.textCol = redDiff
        else if(diff < 0) UIs.get(currentProfile)[i].diff.textCol = greenDiff
        else UIs.get(currentProfile)[i].diff.textCol = col5
    }
    saveLocalData()
}

function setup(){
    createCanvas(WIDTH, HEIGHT)
    panel = new Panel({
        x:0,
        y:0,
        w:WIDTH,
        h:HEIGHT,
        lightCol: col2,
        darkCol: col1,
        retractable: false,
        automaticHeight: false
    }, fontPanel)
    
    createInitialUI()
    createUIfromProfile()
    createTextOfProfile()
    createSplitModifiers()
    createHitUI()
    createTagsTable()
    selectSplit(0)

    // let profile = {
    //     title: 'Dark Souls',
    //     split: 0,
    //     runs: 34,
    //     hitsPB: 5,
    //     hits: 0,
    //     splits: [
    //         {title: 'Asylum Demon', hits: 0, pb: 0, diff: 0},
    //         {title: 'Taurus Demon', hits: 0, pb: 0, diff: 0},
    //         {title: 'Bell Gargoyles', hits: 0, pb: 0, diff: 0},
    //         {title: 'Capra Demon', hits: 0, pb: 0, diff: 0},
    //         {title: 'Gaping Dragon', hits: 0, pb: 0, diff: 0},
    //         {title: 'Chaos Witch Quelaag', hits: 0, pb: 0, diff: 0},
    //         {title: 'Iron Golem', hits: 0, pb: 0, diff: 0},
    //         {title: 'Ornstein & Smough', hits: 0, pb: 0, diff: 0},
    //         {title: 'Seath the Scaleless', hits: 0, pb: 0, diff: 0},
    //         {title: 'The Four Kings', hits: 0, pb: 0, diff: 0},
    //         {title: 'Pinwheel', hits: 0, pb: 0, diff: 0},
    //         {title: 'Gravelord Nito', hits: 0, pb: 0, diff: 0},
    //         {title: 'Demon Firesage', hits: 0, pb: 0, diff: 0},
    //         {title: 'Centipede Demon', hits: 0, pb: 0, diff: 0},
    //         {title: 'Bed of Chaos', hits: 0, pb: 0, diff: 0},
    //         {title: 'Gwyn, Lord of Cinder', hits: 0, pb: 0, diff: 0}
    //     ],
    //     currentSplit: 0
    // }
    // addProfile(profile)
    
    redDiff = darkenColor(hexToRgbMIGUI(redPastel), 60)
    greenDiff = darkenColor(hexToRgbMIGUI(greenPastel), 100)
    loadLocalData()
    saveLocalData()
}

function saveLocalData(){
    let data = {
        profiles: JSON.stringify([...profiles.values()]),
    }
    storeItem('NoHitData', data)
}

function loadLocalData(){
    let data = getItem('NoHitData')
    if(data){
        let profilesData = JSON.parse(data.profiles)
        for(let i = 0; i < profilesData.length; i++){
            let profile = profilesData[i]
            addProfile(profile)
        }
    }
}


function updateButtons(){
    let bool = currentProfile == -1
    for(let button of buttons){
        if(bool) button.disable()
        else button.enable()
    }
}

function keyPressed(){
    if(panel.areInputsActive()) return
    if(keyCode == 32){
        hit()
    }
    if(keyCode == 38){
        if(selectedSplit > 0) selectSplit(selectedSplit - 1)
    }
    if(keyCode == 40){
        if(selectedSplit < profiles.get(currentProfile).splits.length - 1) selectSplit(selectedSplit + 1)
    }
    if(keyCode == 8){
        removeSplit()
    }
    if(keyCode == 13){
        nextSplit()
    }
}

function draw(){
    background(0)
    updateTextProfile()
    updateButtons()

    panel.update()
    panel.show()
    showRectTextProfile()
}

function showRectTextProfile(){
    push()
    stroke(col2)
    fill([...hexToRgbMIGUI(col3), 50])
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

function darkenColor(color, amount){
    return color.map(c => constrain(c - amount, 0, 255))
}

function currentProfileNoSplits(){
    if(currentProfile == -1) return true
    let profile = profiles.get(currentProfile)
    return profile.splits.length == 0
}

function drawArrowRight(button){
    push()
    stroke(button.lightCol)
    translate(button.pos.x + button.w/2, button.pos.y + button.h/2)
    drawSimpleArrow(0, 8)
    pop()
}

function drawArrowDown(button){
    push()
    stroke(button.lightCol)
    translate(button.pos.x + button.w/2, button.pos.y + button.h/2)
    drawSimpleArrow(-HALF_PI, 8)
    pop()
}

function drawArrowUp(button){
    push()
    stroke(button.lightCol)
    translate(button.pos.x + button.w/2, button.pos.y + button.h/2)
    drawSimpleArrow(HALF_PI, 8)
    pop()
}

function drawKeyHintsHit(button){
    push()
    translate(button.pos.x + button.w/2, button.pos.y + button.h/2)
    textSize(9)
    text('[Space]', 0, 18)
    pop()
}

function drawKeyHintsSplit(button){
    push()
    translate(button.pos.x + button.w/2, button.pos.y + button.h/2)
    textSize(9)
    text('[Enter]', 0, 18)
    pop()
}

// evita el scroll al apretar espacio
document.addEventListener("keydown", function(event) {
    if (event.key === " "  || event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
    }
});

