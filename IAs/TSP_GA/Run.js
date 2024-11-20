class Run{
	constructor(order){
		this.order = order
		this.totalDist = 0
		this.fitness = 0
	}

	mutate(){
		let newOrder = dupeArr(this.order)
		for(let i = 0; i < nCities; i++){
			if(random() < mutateFactor){
				const i = Math.floor(random(newOrder.length))
				const j = Math.floor(random(newOrder.length))
				let tmp = newOrder[i]
		    	newOrder[j] = newOrder[j]
		    	newOrder[i] = tmp
			}
		}
    	this.order = newOrder
	}

	calculateDist(){
		let totalDist = 0
		for(let i = 0; i < this.order.length-1; i++){
	        let c1 = cities[this.order[i]]
	        let c2 = cities[this.order[i+1]]
	        totalDist += dist(c1.x, c1.y, c2.x, c2.y)
	    }
	    this.totalDist = totalDist
	}

	show(){
		push()
		stroke(200)
	    fill(140)
	    strokeWeight(2)
	    textSize(20)
		for(let c of cities) ellipse(c.x, c.y, 20, 20)
	    for(let i = 0; i < this.order.length-1; i++){
	        let c1 = cities[this.order[i]]
	        let c2 = cities[this.order[i+1]]
	        line(c1.x, c1.y, c2.x, c2.y)
	    }
	    pop()
	}
}