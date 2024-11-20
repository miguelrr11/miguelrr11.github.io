class Fleet{

	constructor(poolLimit){
		this.enemies = []
		this.poolLimit = poolLimit
	}

	add(enemy, forceAdd){
		if(this.enemies.length < this.poolLimit || enemy.fromBoss || forceAdd) {
			this.enemies.push(enemy) 
			return true
		}
		return false
	}

	// actualiza enemigos y los dibuja
	update(){
		for(let i = 0; i < this.enemies.length; i++){
			let e = this.enemies[i]
	        if(!e.alive || e.update(nexus.isAttacking) == undefined){
	        	activeAnim.push(new Animation(e.pActiveMuerte, e.pos.copy(), 0.2))
	            this.enemies.splice(i, 1)
	        }
	        else {
	            e.show()
	        }
	    }
	}
}