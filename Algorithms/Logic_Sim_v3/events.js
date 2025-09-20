
function mousePressed() {
    if(mouseX > WIDTH){
        //selectedComp = null
        return
    }

    if(input_text_In && changing_name_in != undefined){
        if(!input_text_In.evaluate()){
            changing_name_in = undefined
        }
        else input_text_In.active = true
    }

    if(input_text_Out && changing_name_out != undefined){
        if(!input_text_Out.evaluate()){
            changing_name_out = undefined
        }
        else input_text_Out.active = true
    }

    if(multiSelectionCompsWindow 
    && inBounds(multiSelectionCompsWindow.x, multiSelectionCompsWindow.y, 
                multiSelectionCompsWindow.w, multiSelectionCompsWindow.h)){
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

        // Check comps and subchips OUTPUTS
        let result = checkClickOnComponentInput(mousePos, chip.components, tamCompNodes, true) ||
                     checkClickOnComponentInput(mousePos, chip.chips, tamCompNodes, true);
        if (result) {
            startDragging(result.component.isSub ? result.component.getOutputPositionSC(result.index) : 
                result.component.getOutputPosition(result.index), result.index, result.component.name, tamCompNodes);
            return
        }

        // Check comps and subchips INPUTS
        // result = checkClickOnComponentInput(mousePos, chip.components, tamCompNodes) ||
        //              checkClickOnComponentInput(mousePos, chip.chips, tamCompNodes);
        // if (result) {
        //     startDragging(result.component.isSub ? result.component.getInputPositionSC(result.index) : 
        //         result.component.getInputPosition(result.index), result.index, result.component.name, tamCompNodes);
        //     return
        // }

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
        if(hoveredComp == null){
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

        //sacar conexion de bus
        if(hoveredComp == null){
            for(let i = 0; i < chip.components.length; i++){
                let bus = chip.components[i]
                if(bus.type != "BUS") continue
                let seg = bus.inBoundConn()
                if(seg != undefined && !bus.inBounds()){
                    // draggingFromConn = seg.conn
                    // startDragging({x: seg.x, y: seg.y, i: seg.i}, 0, bus.name, 0, false)
                    draggingFromConn = seg.conn
                    //startDragging({x: seg.bus.path[0].x, y:  seg.bus.path[0].y, i: seg.i}, 0, bus.name, 0, false)
                    startDragging({x: seg.x, y:  seg.y, i: seg.i}, 0, bus.name, 0, false)
                    // for(let i = 0; i < seg.i + 1; i++){
                    //     dragPath.push({x: seg.bus.path[i].x, y: seg.bus.path[i].y})
                    // }
                    dragPath.push({x: seg.x, y: seg.y})
                    draggingFromBus = true
                    break
                }
            }
        }

        //adding input or output
        setAddingIO()
        if(addingInput != null){
            chip.addInput(addingInput)
            addingInput = null
            return
        }
        else if(addingOutput != null){
            chip.addOutput(addingOutput)
            addingOutput = null
            return
        }

        //adding bus
        if(creatingBus){
            if(pathBus == null){
                pathBus = [{x: mouseX, y: mouseY}]
            }
            else{
                let x = mouseX
                let y = mouseY
                if(keyIsPressed && keyCode == 16 && pathBus.length > 0){  //SHIFT
                    let prev = pathBus[pathBus.length - 1]
                    let [dx, dy] = [Math.abs(prev.x - mouseX), Math.abs(prev.y - mouseY)];
                    [x, y] = [dx > dy ? mouseX : prev.x, dx > dy ? prev.y : mouseY ]
                }
                pathBus.push({x, y})
            }
            // else if(!keyIsPressed){
            //     pathBus.push({x: mouseX, y: mouseY})
            //     chip.addComponent("BUS" + compNames, "BUS", undefined, undefined, pathBus);
            //     compNames++;
            //     pathBus = null
            //     creatingBus = false
            // }
            // else{
            //     pathBus.push({x: mouseX, y: mouseY})
            // }
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
            if(!c.isSub && c.type == 'BUS') continue
            if (c.inBounds(mousePos.x, mousePos.y)) {
                selectedComp = c;
                frontComp = c
                break;
            }
        }
    }
    
    // Releasing a connection
    if(draggingConnection){
        let mousePos = { x: mouseX, y: mouseY };
        let result = checkClickOnComponentInput(mousePos, chip.components, tamCompNodes) ||
                     checkClickOnComponentInput(mousePos, chip.chips, tamCompNodes) ||
                     (chip.outputs.some((_, i) => isWithinBounds(mousePos, chip.getOutputPosition(i), tamBasicNodes)) ?
                         { component: { name: 'OUTPUTS' }, index: chip.outputs.findIndex((_, i) =>
                            isWithinBounds(mousePos, chip.getOutputPosition(i), tamBasicNodes)) } : null);
        // releasing a conn in comp inputs or chip outputs
        if (result) {
            if(result.component.type != 'BUS'){
                let prev = dragPath.length ? dragPath[dragPath.length - 1] : dragStart;
                let [dx, dy] = [Math.abs(prev.x - mouseX), Math.abs(prev.y - mouseY)];
                dragPath.push({ x: dx > dy ? mouseX : prev.x, y: dx > dy ? prev.y : mouseY });
            }
            

            if(draggingFromConn == undefined) chip.connect(dragStartComponent, dragStartIndex, result.component.name, result.index, dragPath);
            else chip.connect(dragStartComponent, dragStartIndex, result.component.name, result.index, dragPath, dragStart, draggingFromConn);

            draggingConnection = false;
            dragStart = null;
            dragStartIndex = null;
            dragStartComponent = null;
            dragPath = [];
            draggingFromConn = undefined
        }
        // else{
        //     result = null
        //     for (let i = 0; i < chip.inputs.length; i++) {
        //         let inputPos = chip.getInputPosition(i);
        //         if (isWithinBounds(mousePos, inputPos, tamCompNodes)) {
        //             result = {component: chip, index: i}
        //         }
        //     }
        //     // releasing a conn in comp inputs or chip outputs
        //     if (result) {
                
                

        //         if(draggingFromConn == undefined) chip.connect('INPUTS', result.index, dragStartComponent, dragStartIndex, dragPath);
        //         else chip.connect('INPUTS', result.index, dragStartComponent, dragStartIndex, dragPath, dragStart, draggingFromConn);

        //         draggingConnection = false;
        //         dragStart = null;
        //         dragStartIndex = null;
        //         dragStartComponent = null;
        //         dragPath = [];
        //         draggingFromConn = undefined
        //     }
        // }
        //connect TO bus
        let collBus = checkClickOnBus()
        if(collBus && !draggingFromBus){
            let x = collBus.x
            let y = collBus.y
            let prev = dragPath.length ? dragPath[dragPath.length - 1] : dragStart;
            let [dx, dy] = [Math.abs(prev.x - x), Math.abs(prev.y - y)];
            dragPath.push({ x: dx > dy ? x : prev.x, y: dx > dy ? prev.y : y });
            // for(let i = collBus.i; i >= 0; i--){
            //     dragPath.push({x: collBus.bus.path[i].x, y: collBus.bus.path[i].y})
            // }
            //dragPath.push({x: mouseX, y: mouseY})
            chip.connect(dragStartComponent, dragStartIndex, collBus.bus.name, 0, dragPath);
            draggingConnection = false;
            dragStart = null;
            dragStartIndex = null;
            dragStartComponent = null;
            dragPath = [];
            draggingFromConn = undefined
        }
        if(!result && (!collBus || (collBus && draggingFromBus))) {
            //right angles segments
            let prev = dragPath.length ? dragPath[dragPath.length - 1] : dragStart;
            let [dx, dy] = [Math.abs(prev.x - mouseX), Math.abs(prev.y - mouseY)];
            dragPath.push({ x: dx > dy ? mouseX : prev.x, y: dx > dy ? prev.y : mouseY });
        }
        draggingFromBus = false
    }
}

function mouseDragged(){
    if (!draggingConnection) {

        //move comps and chips
        if(multiSelectionCompsWindow == null && multiSelectionWindow == null){
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
            if(true){
                if(multiSelectionOffsets == null){
                    multiSelectionOffsets = []
                    for(let comp of multiSelectionComps){
                        multiSelectionOffsets.push({comp, offx: comp.x - mouseX, offy: comp.y - mouseY})
                    }
                    for(let c of multiSelectionOffsets){
                        if(c.comp.constructor.name != 'Object') c.comp.move(mouseX, mouseY, c.offx, c.offy)
                        else {
                            c.comp.conn.move(mouseX, mouseY, c.offx, c.offy, c.comp.index)
                            for(let aux of multiSelectionComps){
                                if(aux.conn == c.comp.conn && aux.index == c.comp.index){
                                    aux.x = c.comp.conn.path[c.comp.index].x
                                    aux.y = c.comp.conn.path[c.comp.index].y
                                }
                            }
                        }
                    }
                }
                if(multiSelectionCompsWindowOff == null){
                    multiSelectionCompsWindowOff = {offx: multiSelectionCompsWindow.x - mouseX,
                                                    offy: multiSelectionCompsWindow.y - mouseY}
                }
                else{
                    for(let c of multiSelectionOffsets){
                        if(c.comp.constructor.name != 'Object') c.comp.move(mouseX, mouseY, c.offx, c.offy)
                        else{ 
                            c.comp.conn.move(mouseX, mouseY, c.offx, c.offy, c.comp.index)
                            for(let aux of multiSelectionComps){
                                if(aux.conn == c.comp.conn && aux.index == c.comp.index){
                                    aux.x = c.comp.conn.path[c.comp.index].x
                                    aux.y = c.comp.conn.path[c.comp.index].y
                                }
                            }
                        }
                    }
                    multiSelectionCompsWindow.x = mouseX + multiSelectionCompsWindowOff.offx
                    multiSelectionCompsWindow.y = mouseY + multiSelectionCompsWindowOff.offy
                }
                return
            }
        }


        //move inputs and outputs
        if(movingInput.node != undefined) chip.inputsPos[movingInput.node].y = chip.inputsPos[movingInput.node].y = mouseY + movingInput.off
        if(movingOutput.node  != undefined) chip.outputsPos[movingOutput.node].y = chip.outputsPos[movingOutput.node].y = mouseY + movingOutput.off
        else{
            let index = chip.getInBoundsDragInputAll()
            if(index != undefined){
                let off = chip.inputsPos[index].y - mouseY
                chip.inputsPos[index].y = mouseY + off
                movingInput.off = off
                movingInput.node = index
            }
            index = chip.getInBoundsDragOutputAll()
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

    //changing name of inputs
    let index = chip.getInBoundsDragInputAll()
    if(index != undefined){
        let x = chip.inputsPos[index].x + tamCompNodes + 10
        let y = chip.inputsPos[index].y - 3
        changing_name_in = index
        input_text_In = undefined
        input_text_In = new Input(x, y, "Enter name of pin", () => {
            if(changing_name_in != undefined) chip.inputsPos[changing_name_in].tag = input_text_In.getText()
            changing_name_in = undefined
        }, 
        colorOn, colorBackMenu)
        input_text_In.active = true
        input_text_In.transCol = colorBackMenu
    }

    //changing name of outputs
    index = chip.getInBoundsDragOutputAll()
    if(index != undefined){
        let x = chip.outputsPos[index].x - 200 - tamCompNodes - 10
        let y = chip.outputsPos[index].y - 3
        changing_name_out = index
        input_text_Out = undefined
        input_text_Out = new Input(x, y, "Enter name of pin", () => {
            if(changing_name_out != undefined) chip.outputsPos[changing_name_out].tag = input_text_Out.getText()
            changing_name_out = undefined
        }, 
        colorOn, colorBackMenu)
        input_text_Out.active = true
        input_text_Out.transCol = colorBackMenu
    }

}

function doubleClicked(){
    if(mouseX > WIDTH){
        //selectedComp = null
        return
    }
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
    if(creatingBus){
        //pathBus.push({x: mouseX, y: mouseY})
        chip.addComponent("BUS" + compNames, "BUS", undefined, undefined, pathBus);
        compNames++;
        pathBus = null
        creatingBus = false
    }
}

function keyPressed(){
    if(panel.areInputsActive()) return
    if(changing_name_in != undefined) return
    if(changing_name_out != undefined) return
    //press z
    if(keyCode == 90){
        if(draggingConnection){
            if(dragPath.length == 0) draggingConnection = false
            else dragPath.pop()
        }
        
        if(creatingBus){
            if(pathBus == null) creatingBus = false
            else pathBus = null
        }
    }
    //press ESC
    if(keyCode == 27){
        if(chipStack.length > 0){ 
            chip = chipStack.pop()
            route.pop()
            setPanelRouteText()
            selectedComp = null
            hoveredNode = null
            hoveredComp = null
            frontComp = null
            restartMultiSelection()
        }
    }
    //press T
    if(keyCode == 84){
        showingTags = !showingTags
    }
    //press backspace
    if(keyCode == 8){
        //eliminar connection
        if(hoveredConn != null){
            chip.connections = chip.connections.filter(conn => conn != hoveredConn)
            hoveredConn = null;
        }

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
            return
        }

        //eliminar comps de multiselection
        if(multiSelectionComps){
            for(let selectedComp of multiSelectionComps){
                if(selectedComp.constructor.name != "Object"){
                    if(selectedComp.isSub){
                        chip.chips = chip.chips.filter(chipItem => chipItem.name !== selectedComp.name);
                        chip.connections = chip.connections.filter(conn => conn.toComponent !== selectedComp.name && conn.fromComponent !== selectedComp.name);
                    }
                    else{
                        chip.components = chip.components.filter(chipItem => chipItem.name !== selectedComp.name);
                        chip.connections = chip.connections.filter(conn => conn.toComponent !== selectedComp.name && conn.fromComponent !== selectedComp.name);
                    }
                }
                else{
                    chip.connections = chip.connections.filter(conn => conn != selectedComp.conn)
                }
            }
            selectedComp = null
            frontComp = null
            restartMultiSelection()
            return
        }

        //eliminar IO
        if(hoveredNode != null && chipStack.length == 0){
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
            return
        }

        //eliminar bus
        if(hoveredBus != null){
            for(let i = 0; i < chip.components.length; i++){
                if(chip.components[i] == hoveredBus) {chip.components.splice(i, 1); break}
            }
            chip.connections = chip.connections.filter(conn => conn.toComponent !== hoveredBus.name && conn.fromComponent !== hoveredBus.name);
            if(hoveredBus == frontComp) frontComp = null
            hoveredBus = null
        }
    }
}







