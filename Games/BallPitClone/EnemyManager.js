

class EnemyManager{
    constructor(){
        this.enemies = []
    }

    findClosest(enemy, avoid = []){
        if(this.enemies.length <= 1) return
        let closestDist = Infinity
        let closest = undefined
        for(let en of this.enemies){
            if(en == enemy) continue
            let avoiding = false
            for(let i = 0; i < avoid.length; i++){
                if(en == avoid[i]){
                    avoiding = true
                }
            }
            if(avoiding) continue
            let d = dist(enemy.x, enemy.y, en.x, en.y)
            if(d < closestDist){
                closestDist = d
                closest = en
            }
        }
        return {closest, closestDist}
    }

    updateSpawn(){
        let canSpawn = true
        let smallestY = 250
        if(this.enemies.length > 0){
            for(let en of this.enemies){
                if(en.y < smallestY) smallestY = en.y
                if(en.y < 50){
                    canSpawn = false
                    break
                }
            }
        }
        if(canSpawn){
            let posY = smallestY - ENEMY_SIZE
            if(posY){
                for(let i = START_X_TRACK + ENEMY_SIZE / 2; i < END_X_TRACK; i += ENEMY_SIZE){
                    if(Math.random() < 0.65) this.enemies.push(new Enemy(createVector(i, posY)))
                }
            }
            
        }
    }

    updateMovement(){
        if(this.enemies.length == 0) return
        for(let en of this.enemies){
            en.update(DT)
        }
    }

    cleanse(){
        for(let i = this.enemies.length-1; i >= 0; i--){
            let en = this.enemies[i]
            if(en.canBeRemoved) this.enemies.splice(i, 1)
        }
    }

    update(){
        this.updateMovement()
        this.updateSpawn()
        this.cleanse()
    }

    show(){
        if(this.enemies.length == 0) return
        for(let en of this.enemies){
            en.show()
        }
    }
}