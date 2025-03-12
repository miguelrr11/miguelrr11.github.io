class FullCreature{
    constructor(n){
        this.root = createVector(width/2, height/2)
        this.creatures = []
        this.createCreatures(n)
        this.totalLength = n * 70
    }

    createCreatures(n){
        for(let i = 0; i < n; i++){
            let x = random(width)
            let y = random(height)
            this.creatures.push(new Creature(x, y))
        }
    }

    applyIK(){
        let targetDir = this.creatures[this.creatures.length - 1].getNextPos()
        if (dist(targetDir.x, targetDir.y, this.root.x, this.root.y) > this.totalLength) {
		    targetDir = p5.Vector.sub(targetDir, this.root);
		    targetDir.normalize();
		    targetDir.mult(this.totalLength);
		    targetDir.add(this.root);
		}
        this.creatures[this.creatures.length - 1].pos = targetDir;
        for (let i = this.creatures.length - 1; i > 0; i--) {
		    let dir = p5.Vector.sub(this.creatures[i].pos, this.creatures[i - 1].pos);
		    dir.normalize();
		    dir.mult(this.creatures[i - 1].w);
		    this.creatures[i - 1].pos = p5.Vector.sub(this.creatures[i].pos, dir);
		}
        let rootDir = p5.Vector.sub(this.creatures[0].pos, this.root);
        this.root = p5.Vector.sub(this.creatures[0].pos, rootDir);

        // Recalculate the positions of all segments forward from the root
        this.creatures[0].pos = p5.Vector.add(this.root, rootDir);
        this.root = this.creatures[0].pos

        //calculate the angles of the creatures, they depend of the relative positions of the creatures
        //the angle of a creature is the mid angle bewtween the two creatures that are next to it
        for(let i = 0; i < this.creatures.length; i++){
            let prev = this.creatures[i-1]
            let next = this.creatures[i+1]
            let angle = this.creatures[i].angle
            if(prev){
                let dir = p5.Vector.sub(this.creatures[i].pos, prev.pos)
                angle = dir.heading()
            }
            if(next){
                let dir = p5.Vector.sub(this.creatures[i].pos, next.pos)
                angle += dir.heading()
            }
            this.creatures[i].angle = (angle / 2) + PI/2
        }
    }
    


    update(){
        // for(let creature of this.creatures){
        //     creature.update()
        // }
        this.creatures.forEach(creature => creature.updateLimbs())
        this.applyIK()
    }

    show(){
        for(let creature of this.creatures){
            creature.show()
        }
    }
}