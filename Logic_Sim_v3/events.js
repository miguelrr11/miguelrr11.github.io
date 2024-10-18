
function mousePressed() {
    if(mouseX > WIDTH){
        //selectedComp = null
        return
    }

    //erase all multiselection 
    if(multiSelectionCompsWindow && !inBounds(multiSelectionCompsWindow.x, multiSelectionCompsWindow.y, 
                                             multiSelectionCompsWindow.w, multiSelectionCompsWindow.h)
                                 && multiSelectionWindow == null){
        multiSelectionWindow = null
        multiSelectionComps = null
        multiSelectionCompsWindow = null
        multiSelectionCompsWindowOff = null
        multiSelectionOffsets = null
    }

    // Check if clicking on a chip input or output
    if (!draggingConnection) {
        let mousePos = { x: mouseX, y: mouseY };

        // Check inputs
        for (let i = 0; i < chip.inputs.length; i++) {
            let inputPos = chip.getInputPosition(i);
            if (isWithinBounds(mousePos, inputPos, tamCompNodes)) {
                startDragging(inputPos, i, 'INPUTS', tamCompNodes);
                return
            }
        }

        // Check comps and subchips
        let result = checkClickOnComponentInput(mousePos, chip.components, tamCompNodes, true) ||
                     checkClickOnComponentInput(mousePos, chip.chips, tamCompNodes, true);
        if (result) {
            startDragging(result.component.isSub ? result.component.getOutputPositionSC(result.index) : 
                result.component.getOutputPosition(result.index), result.index, result.component.name, tamCompNodes);
            return
        }

        // Cut connections
        cutConnections(mousePos, chip.components, chip.connections, tamCompNodes);
        cutConnections(mousePos, chip.chips, chip.connections, tamCompNodes);

        // Cutting connections for chip outputs
        for (let i = 0; i < chip.outputs.length; i++) {
            let outputPos = chip.getOutputPosition(i);
            if (isWithinBounds(mousePos, outputPos, tamBasicNodes)) {
                for (let j = 0; j < chip.connections.length; j++) {
                    let conn = chip.connections[j];
                    if (conn.toComponent === 'OUTPUTS' && conn.toIndex === i) {
                        //cutSubConnections(conn)
                        chip.connections.splice(j, 1);
                        chip.outputs[i] = 0;
                        return
                    }
                }
            }
        }

        //connection from existing connection if the connection is not covered (copies the subPath)
        if(hoveredNode.comp == null && hoveredComp == null){
            for(let i = 0; i < chip.connections.length; i++){
                let conn = chip.connections[i]
                let seg = conn.inBoundConn()
                if(seg != undefined){
                    draggingFromConn = seg.conn
                    startDragging({x: draggingFromConn.fromPos.x, y: draggingFromConn.fromPos.y, i: seg.i}, conn.fromIndex, conn.fromComponent, 0, true)
                    for(let i = 0; i < seg.i; i++){
                        dragPath.push({x: draggingFromConn.path[i].x, y: draggingFromConn.path[i].y})
                    }
                    break
                }
            }
        }

        //adding input or output
        setAddingIO()
        if(addingInput != null){
            chip.addInput(addingInput)
            addingInput = null
        }
        else if(addingOutput != null){
            chip.addOutput(addingOutput)
            addingOutput = null
        }
        
    } 

    // Selecting components
    selectedComp = undefined; 
    let mousePos = { x: mouseX, y: mouseY };
    let components = chip.components.concat(chip.chips);
    if(frontComp && frontComp.inBounds(mousePos.x, mousePos.y)){
        selectedComp = frontComp;
    }
    else{
        for (let i = components.length - 1; i >= 0; i--) {
            let c = components[i];
            if (c.inBounds(mousePos.x, mousePos.y)) {
                selectedComp = c;
                frontComp = c
                break;
            }
        }
    }
    


    if (selectedComp) {
        let name = selectedComp.isSub ? selectedComp.externalName : selectedComp.type;
        //panel_remove.setText("REMOVE: " + name);
        if(selectedComp.isSub){ 
            //panel_edit.setText("EDIT: " + name)
            //panel_edit.enable()
        }
    } 
    else {
        //panel_remove.setText("REMOVE: ");
        //panel_edit.setText("EDIT")
        //panel_edit.disable()
    }

    if(draggingConnection){
        // Releasing a connection
        let mousePos = { x: mouseX, y: mouseY };
        let result = checkClickOnComponentInput(mousePos, chip.components, tamCompNodes) ||
                     checkClickOnComponentInput(mousePos, chip.chips, tamCompNodes) ||
                     (chip.outputs.some((_, i) => isWithinBounds(mousePos, chip.getOutputPosition(i), tamBasicNodes)) ?
                         { component: { name: 'OUTPUTS' }, index: chip.outputs.findIndex((_, i) =>
                            isWithinBounds(mousePos, chip.getOutputPosition(i), tamBasicNodes)) } : null);
        if (result) {
            let prev = dragPath.length ? dragPath[dragPath.length - 1] : dragStart;
            let [dx, dy] = [Math.abs(prev.x - mouseX), Math.abs(prev.y - mouseY)];
            dragPath.push({ x: dx > dy ? mouseX : prev.x, y: dx > dy ? prev.y : mouseY });

            if(draggingFromConn == undefined) chip.connect(dragStartComponent, dragStartIndex, result.component.name, result.index, dragPath);
            else chip.connect(dragStartComponent, dragStartIndex, result.component.name, result.index, dragPath, dragStart, draggingFromConn);

            draggingConnection = false;
            dragStart = null;
            dragStartIndex = null;
            dragStartComponent = null;
            dragPath = [];
            draggingFromConn = undefined
        } else {
            //right angles segments
            let prev = dragPath.length ? dragPath[dragPath.length - 1] : dragStart;
            let [dx, dy] = [Math.abs(prev.x - mouseX), Math.abs(prev.y - mouseY)];
            dragPath.push({ x: dx > dy ? mouseX : prev.x, y: dx > dy ? prev.y : mouseY });
        }
    }

    

}

function mouseDragged(){
    if (!draggingConnection) {

        //move comps and chips
        if(multiSelectionWindow == null){
            if(movingComp.comp){ 
                movingComp.comp.move(mouseX, mouseY, movingComp.offx, movingComp.offy)
                return
            }
            else {
                if(frontComp){
                    if (frontComp.inBounds(mouseX, mouseY)) {
                        let offx = frontComp.x - mouseX;
                        let offy = frontComp.y - mouseY;
                        frontComp.move(mouseX, mouseY, offx, offy);
                        movingComp = { comp: frontComp, offx, offy };
                        restartMultiSelection()
                        return
                    }
                }
                for (let i = chip.chips.length - 1; i >= 0; i--) {
                    let c = chip.chips[i];
                    if (c.inBounds(mouseX, mouseY)) {
                        let offx = c.x - mouseX;
                        let offy = c.y - mouseY;
                        c.move(mouseX, mouseY, offx, offy);
                        movingComp = { comp: c, offx, offy };
                        restartMultiSelection()
                        return
                    }
                }
                
                if (!movingComp.comp) {
                    for (let i = chip.components.length - 1; i >= 0; i--) {
                        let c = chip.components[i];
                        if (c.inBounds(mouseX, mouseY)) {
                            let offx = c.x - mouseX;
                            let offy = c.y - mouseY;
                            c.move(mouseX, mouseY, offx, offy);
                            movingComp = { comp: c, offx, offy };
                            restartMultiSelection()
                            return
                        }
                    }
                }
            }
        }

        //try moving the multiselection of comps
        if(multiSelectionCompsWindow){
            let inB = inBounds(multiSelectionCompsWindow.x, multiSelectionCompsWindow.y, 
                               multiSelectionCompsWindow.w, multiSelectionCompsWindow.h)
            if(inB){
                if(multiSelectionOffsets == null){
                    multiSelectionOffsets = []
                    for(let comp of multiSelectionComps){
                        multiSelectionOffsets.push({comp, offx: comp.x - mouseX, offy: comp.y - mouseY})
                    }
                    for(let c of multiSelectionOffsets){
                        c.comp.move(mouseX, mouseY, c.offx, c.offy)
                    }
                    
                }
                if(multiSelectionCompsWindowOff == null){
                    multiSelectionCompsWindowOff = {offx: multiSelectionCompsWindow.x - mouseX,
                                                    offy: multiSelectionCompsWindow.y - mouseY}
                }
                else{
                    for(let c of multiSelectionOffsets){
                        c.comp.move(mouseX, mouseY, c.offx, c.offy)
                    }
                    multiSelectionCompsWindow.x = mouseX + multiSelectionCompsWindowOff.offx
                    multiSelectionCompsWindow.y = mouseY + multiSelectionCompsWindowOff.offy
                }
            }
        }


        //move inputs and outputs
        if(movingInput.node != undefined) chip.inputsPos[movingInput.node].y = chip.inputsPos[movingInput.node].y = mouseY + movingInput.off
        if(movingOutput.node  != undefined) chip.outputsPos[movingOutput.node].y = chip.outputsPos[movingOutput.node].y = mouseY + movingOutput.off
        else{
            let index = chip.getInBoundsInputToggle()
            if(index != undefined){
                let off = chip.inputsPos[index].y - mouseY
                chip.inputsPos[index].y = mouseY + off
                movingInput.off = off
                movingInput.node = index
            }
            index = chip.getInBoundsOutputToggle()
            if(index != undefined){
                let off = chip.outputsPos[index].y - mouseY
                chip.outputsPos[index].y = mouseY + off
                movingOutput.off = off
                movingOutput.node = index
            }
        }  
    }

    //multi selection of comps
    if(multiSelectionCompsWindow == null){
        if(multiSelectionWindow == null){
            multiSelectionWindow = {x1: mouseY, y1: mouseY, x1: mouseX, y1: mouseY, w: 0, h: 0}
        }
        else{
            multiSelectionWindow.x2 = mouseX
            multiSelectionWindow.y2 = mouseY
            multiSelectionWindow.w = Math.abs(multiSelectionWindow.x1 - multiSelectionWindow.x2)
            multiSelectionWindow.h = Math.abs(multiSelectionWindow.y1 - multiSelectionWindow.y2)
        }
    }
    
}

function mouseReleased() {
    // Click chip inputs to toggle them
    if(movingInput.node == undefined){
        let inp = chip.getInBoundsInputToggle()
        if(inp != undefined) chip.toggleInput(inp)
    }
    
    movingComp = {comp: null, offx: 0, offy: 0}
    movingInput = {node: undefined, off: 0}
    movingOutput = {node: undefined, off: 0}

    multiSelectionCompsWindowOff = null
    multiSelectionOffsets = null
    setMultiSelectionComps()
    multiSelectionWindow = null
    
}

function mouseClicked() {
    for(let c of chip.components){
        if(c instanceof Display){
            if(c.inBoundsSign()) c.toggleSign()
        }
    }


}

function doubleClicked(){
    let mousePos = { x: mouseX, y: mouseY };
    let components = chip.components.concat(chip.chips);
    if(frontComp && frontComp.inBounds(mousePos.x, mousePos.y)){
        selectedComp = frontComp;
    }
    else{
        for (let i = components.length - 1; i >= 0; i--) {
            let c = components[i];
            if (c.inBounds(mousePos.x, mousePos.y)) {
                selectedComp = c;
                frontComp = c
                break;
            }
        }
    }
    if(selectedComp){
        if(selectedComp.isSub){
            frontComp = null
            restartMultiSelection()
            chipStack.push(chip)
            chip = selectedComp
            panel_goBack.enable()
            route.push(selectedComp.externalName)
            setPanelRouteText()
        }
    }
}

function keyPressed(){
    //press z
    if(keyCode == 90){
        if(!draggingConnection) return
        if(dragPath.length == 0) draggingConnection = false
        else dragPath.pop()
    }
    //press ESC
    if(keyCode == 27){
        if(chipStack.length > 0){ 
            chip = chipStack.pop()
            route.pop()
            setPanelRouteText()
            selectedComp = null
            hoveredNode = {comp: null, index: -1}
            hoveredComp = null
            frontComp = null
            restartMultiSelection()
        }
    }
    //press backspace
    if(keyCode == 8){
        //eliminar comps
        if(selectedComp){
            if(selectedComp.isSub){
                chip.chips = chip.chips.filter(chipItem => chipItem.name !== selectedComp.name);
                chip.connections = chip.connections.filter(conn => conn.toComponent !== selectedComp.name && conn.fromComponent !== selectedComp.name);
            }
            else{
                chip.components = chip.components.filter(chipItem => chipItem.name !== selectedComp.name);
                chip.connections = chip.connections.filter(conn => conn.toComponent !== selectedComp.name && conn.fromComponent !== selectedComp.name);
            }
            selectedComp = null
            frontComp = null
            restartMultiSelection()
        }

        if(multiSelectionComps){
            for(let selectedComp of multiSelectionComps){
                if(selectedComp.isSub){
                    chip.chips = chip.chips.filter(chipItem => chipItem.name !== selectedComp.name);
                    chip.connections = chip.connections.filter(conn => conn.toComponent !== selectedComp.name && conn.fromComponent !== selectedComp.name);
                }
                else{
                    chip.components = chip.components.filter(chipItem => chipItem.name !== selectedComp.name);
                    chip.connections = chip.connections.filter(conn => conn.toComponent !== selectedComp.name && conn.fromComponent !== selectedComp.name);
                }
            }
            selectedComp = null
            frontComp = null
            restartMultiSelection()
        }

        //eliminar IO
        if(hoveredNode.comp != null && chipStack.length == 0){
            if(hoveredNode.comp == 'INPUTS'){
                chip.removeInput(hoveredNode.index)
                let indexToDelete = hoveredNode.index
                removeConnectionsFromINPUTS(indexToDelete)
            }
            if(hoveredNode.comp == 'OUTPUTS'){
                chip.removeOutput(hoveredNode.index)
                let indexToDelete = hoveredNode.index
                let index = chip.connections.findIndex(c => c.toComponent === 'OUTPUTS' && c.toIndex === indexToDelete);
                if (index !== -1){
                    chip.connections.splice(index, 1);
                }
            }
        }
    }
}