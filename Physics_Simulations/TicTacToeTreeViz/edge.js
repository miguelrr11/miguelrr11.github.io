class Edge{
    constructor(id, nodeA, nodeB){
        this.id = id
        this.nodes = [nodeA, nodeB]
        this.constraint = new Constraint(nodeA.particle, nodeB.particle)
    }
}