class Game{
	constructor(){
		nexus = new Nexus(createVector(WIDTH/2,HEIGHT/2))
		fleet = new Fleet(100)
		rayos = []
		spawner = new Spawner(fleet, 10, 1, 3)
		orbit = new Orbit()
		menu = new Menu(createVector(WIDTH, 0), 300, HEIGHT)

		count_dif_tot = 60*5
		count_dif = count_dif_tot
		activeAnim = []
	}

	mouseClicked(){
	    if(mouseX > WIDTH + 300 || mouseY > HEIGHT) return
	    nexus.click(mouseX, mouseY)
	    menu.click(mouseX, mouseY)
	}

	keyPressed(){
	    nexus.cargaAttack()
	}

	debug(){
	    nexus.range = Infinity
	    nexus.money = Infinity
	    nexus.health = Infinity
	    nexus.xp = Infinity

	    fleet.poolLimit = 300
	}

	step(){
		background(0)
	    count_dif--
	    if(count_dif <= 0){
	        count_dif = count_dif_tot
	        this.aumentarDificultadProg()
	    }

	    for(let i = 0; i < rayos.length; i++){
	        let r = rayos[i]
	        r.show()
	        if(r.trans <= 0) rayos.splice(i, 1)
	    }

	    for(let i = 0; i < activeAnim.length; i++){
	        let a = activeAnim[i]
	        a.show()
	        if(a.isFinished()) activeAnim.splice(i, 1)
	    }

	    spawner.update()
	    nexus.update()
	    orbit.update()
	    fleet.update()
	    menu.show()
	}

	// aumentar la dificultad cada vez que se aumente de nivel
	aumentarDificultadLevel(){
	    spawner.maxHealth += Math.pow(1.25, nexus.nivel)
	    fleet.poolLimit += Math.pow(1.5, nexus.nivel)
	    spawner.setSpawnPerSecond(fleet.poolLimit/15)
	}

	// calculado para q la maxima dificultad llegue en 15 mins (lineal)
	aumentarDificultadProg(){
	    spawner.maxHealth += 0.3
	    spawner.maxSpeed += 0.04
	    fleet.poolLimit += 2
	    spawner.setSpawnPerSecond(fleet.poolLimit/15)
	    let dificulty = (spawner.maxHealth/10)*spawner.maxSpeed*(fleet.poolLimit/70)+(spawner.spawn_per_second)
	    //console.log(dificulty)
	}

}