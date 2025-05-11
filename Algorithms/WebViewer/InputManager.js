
function mouseClicked() {
    if(hoveredParticle) console.log(hoveredParticle)
}

function mouseReleased() {
    prevMouseX = undefined
    prevMouseY = undefined
    draggedParticle = undefined
    if(hoveredParticle && hoveredParticle.isParent) {
        for(let child of hoveredParticle.children) child.removeInertia()
    }
    if(btnColorMode.hovering) changeColorMode()
    if(btnGame.hovering && !btnGame.bool) startGame()
    else if(btnGame.hovering && btnGame.bool) window.open(currentGame.to)

}

function mouseWheel(event) {
    if(!started) return;
    btnCenter.bool = false;

    let worldX = (mouseX - xOff) / zoom;
    let worldY = (mouseY - yOff) / zoom;

    zoom += event.delta / 1000;
    zoom = Math.max(MIN_ZOOM, Math.min(zoom, MAX_ZOOM));

    xOff = mouseX - worldX * zoom;
    yOff = mouseY - worldY * zoom;

    return false;
}

function mouseDragged() {
    if(hoveredParticle || draggedParticle || !started) return
    if(!prevMouseX) prevMouseX = mouseX
    if(!prevMouseY) prevMouseY = mouseY
    let dx = mouseX - prevMouseX; // Change in mouse X
    let dy = mouseY - prevMouseY; // Change in mouse Y
    xOff += dx;
    yOff += dy;
    prevMouseX = mouseX;
    prevMouseY = mouseY;
}

function doubleClicked() {
    if(hoveredParticle && !hoveredParticle.isParent && hoveredParticle.link) {
        let existingPri = existsPrimordial(hoveredParticle.link)
        if(existingPri != undefined) {
            hoveredParticle.isPinned = true
            animConn.push({
                from: hoveredParticle,
                to: existingPri
            })
        }
        else {
            if(currentGame) currentGame.score++
            createGraph(hoveredParticle.link, getP(hoveredParticle))
            //remove from first parents hoveredParticle.parent
            for(let i = 0; i < firstParents.length; i++) {
                if(firstParents[i] == hoveredParticle.parent) {
                    firstParents.splice(i, 1)
                    break
                }
            }
        }
        if(hoveredParticle == winningParticle) endGame()
        removeChild(hoveredParticle)
        hoveredParticle = undefined
    }
    if(hoveredParticle && hoveredParticle.isParent && hoveredParticle.children.length > 0) {
        window.open(hoveredParticle.link, '_blank')
    }
    else if(hoveredParticle && hoveredParticle.isParent && hoveredParticle.children.length == 0) {
        createGraph(hoveredParticle.link, hoveredParticle)
        hoveredParticle = undefined
    }
}

function keyPressed() {
    if(keyCode == 82) {
        btnReset.bool = true
    }
    if(keyCode == 67) {
        btnCenter.bool = true
    }
    if(keyCode == 32 && started) {
        changeColorMode()
    }
}

function manageInput() {
    if(!started) {
        if(errorFrames > 0) {
            errorFrames -= 0.75
            let mul = mapp(errorFrames, 6 * 3, 0, 15, 1)
            let dx = Math.cos(errorFrames) * mul
            input.pos.x = input.initialPos.x + dx
        }
        input.update()
        input.show()
    }
}

function windowResized() {
    WIDTH = windowWidth
    HEIGHT = windowHeight
    input.pos.x = WIDTH / 2
    input.pos.y = HEIGHT / 2
    btnReset.x = WIDTH - 20
    btnReset.y = HEIGHT - 20
    btnCenter.x = WIDTH - 20
    btnCenter.y = HEIGHT - 45
    btnGit.x = 20
    btnGit.y = HEIGHT - 20
    btnGame.x = 20
    btnGame.y = 20
    btnColorMode.x = 20
    btnColorMode.y = HEIGHT - 45
    btnHelp.x = 20
    btnHelp.y = HEIGHT - 70
    initTopo()
    resizeCanvas(windowWidth, windowHeight);
}