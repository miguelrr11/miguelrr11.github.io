/**
 * 0: empty space
 * 1: cross
 * 2: circle
 */
class Graph{
    constructor() {
        this.nodesIDs = new Map()
        this.nodes = new Map() // key: the state hash; value: the node obj
        this.edges = new Map() // key: the pair of nodes; value: the edge obj
        this.nodeIDCounter = 0
        this.edgeIDCounter = 0
        this.unexploredNodes = []
        this.startGame()
        document.addEventListener('mousedown', this.advanceStateHovered.bind(this));
    }
    
    startGame() {
        let newState = new State([
            0, 0, 0,
            0, 1, 0,
            0, 0, 0
        ], 2)
        let hashState = this.hashState(newState.matrix)
        let newNode = new Node(this.nodeIDCounter++, newState, createVector(WIDTH/2, HEIGHT/2), 0)
        newNode.particle.isPinned = true
        newNode.particle.primordial = true
        this.nodesIDs.set(newNode.id, newNode)
        this.nodes.set(hashState, newNode)
        this.unexploredNodes.push(newNode)
        return newNode
    }
    
    hashState(matrix) {
        return matrix.join('')
    }
    
    getNode(matrix) {
        let hash = this.hashState(matrix)
        return this.nodes.get(hash)
    }

    advanceStateHovered(){
        let nodesArray = Array.from(this.nodes.values())
        for(let i = 0; i < nodesArray.length; i++){
            let particle = nodesArray[i].particle
            if(particle.inBounds(mouseX, mouseY)){
                if(nodesArray[i].state.turn == 1){
                    MIN_REST_DISTANCE = 50
                    MAX_REST_DISTANCE = MIN_REST_DISTANCE + 200
                }
                else{
                    MIN_REST_DISTANCE = 200
                    MAX_REST_DISTANCE = MIN_REST_DISTANCE + 200
                }
                this.advanceState(nodesArray[i])
                break
            }
        }
    }

    advanceStateUnexplored(){
        let unexploredNodesAux = [...this.unexploredNodes]
        //let unexploredNodesAux = [this.unexploredNodes[0]]
        this.unexploredNodes = []
        for(let node of unexploredNodesAux){
            this.advanceState(node)
        }
    }
    
    advanceState(node) {
        if(node.state.isEnding()) return
        let newStatesMatrices = node.getNewStates()
        let newTurn = node.state.turn == 1 ? 2 : 1
        for(let i = 0; i < newStatesMatrices.length; i++){
            let matrix = newStatesMatrices[i]
            let hashState = this.hashState(matrix)
            if(!this.nodes.has(hashState)){
                let newState = new State(matrix, newTurn)
                let dirAwayFromCenter = p5.Vector.sub(node.particle.pos, createVector(WIDTH/2, HEIGHT/2)).setMag(50)
                node.particle.isPinned = true
                let newNode = new Node(this.nodeIDCounter++, newState, p5.Vector.add(node.particle.pos, dirAwayFromCenter).add(p5.Vector.random2D().mult(10)), node.gen + 1)
                this.nodesIDs.set(newNode.id, newNode)
                this.nodes.set(hashState, newNode)

                let newEdge = new Edge(this.edgeIDCounter++, node, newNode)
                this.edges.set(node.id + '-' + newNode.id, newEdge)

                node.connectedNodes.push(newNode.id)
                newNode.connectedNodes.push(node.id)

                this.unexploredNodes.push(newNode)
            }
            else{
                let existingNode = this.nodes.get(hashState)
                if(!node.connectedNodes.includes(existingNode.id)){
                    let newEdge = new Edge(this.edgeIDCounter++, node, existingNode)
                    this.edges.set(node.id + '-' + existingNode.id, newEdge)

                    node.connectedNodes.push(existingNode.id)
                    existingNode.connectedNodes.push(node.id)
                }
            }
        }
    }

    updatePhysicsAndShow(){
        for(let c of this.edges.values()){
            for(let i = 0; i < 10; i++) c.constraint.satisfy()
        }

        let nodesArray = Array.from(this.nodes.values())
        for(let i = 0; i < nodesArray.length; i++){
            let particle = nodesArray[i].particle
            //repel only to nodes that share the same turn
            let sameTurnParticles = nodesArray.filter(n => n.state.turn === nodesArray[i].state.turn).map(n => n.particle)
            let repelDistance = nodesArray[i].state.turn === 1 ? 180 : 30
            particle.repel(sameTurnParticles, repelDistance)
            particle.update(deltaTime*10)
            //particle.constrainToBounds()
        }

        push()
		stroke(50)
		strokeWeight(2)
        for(let c of this.edges.values()){
            c.constraint.show()
        }
        pop()
        
        push()
		strokeWeight(3)
		stroke(255)
		fill(0)
        for(let i = 0; i < nodesArray.length; i++){
            let particle = nodesArray[i].particle
            nodesArray[i].state.turn == 1 ? fill(255, 100, 100) : fill(100, 100, 255)
            if(nodesArray[i].state.isEnding()) fill(100, 255, 100)
            particle.show()
        }
        pop()
        
        this.showHover()
    }

    showHover(node = undefined){
        let nodesArray = Array.from(this.nodes.values())
        let inBnode = node ? node : undefined
        if(!inBnode){
            for(let i = 0; i < nodesArray.length; i++){
                let particle = nodesArray[i].particle
                if(particle.inBounds(mouseX, mouseY)){
                    inBnode = nodesArray[i]
                    break
                }
            }
        }
        if(inBnode != undefined){
            push()
            translate(inBnode.particle.pos.x, inBnode.particle.pos.y)
            inBnode.state.show()
            pop()
        }
        else return
        for(let nodeID of inBnode.connectedNodes){
            let node = this.nodesIDs.get(nodeID)
            if(node.gen < inBnode.gen){
                push()
                translate(node.particle.pos.x, node.particle.pos.y)
                node.state.show()
                pop()
                push()
                let edge = this.edges.get(inBnode.id + '-' + nodeID) || this.edges.get(nodeID + '-' + inBnode.id)
                stroke(255, 0, 0, 150)
                strokeWeight(4)
                edge.constraint.show()
                pop()
                if(node.gen > 0) this.showHover(node)
            }
            // else{
            //     push()
            //     translate(node.particle.pos.x, node.particle.pos.y)
            //     node.state.show(true)
            //     pop()
            // }
        }
    }
}