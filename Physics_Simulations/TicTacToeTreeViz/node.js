class Node{
    constructor(id, state, pos, gen){
        this.particle = new Particle(pos.x, pos.y, false, id)
        this.id = id
        this.state = state
        this.connectedNodes = []
        this.gen = gen
    }

    getNewStates(){
        return this.state.getNewStates()
    }
}