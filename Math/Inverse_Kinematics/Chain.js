class Chain{
	constructor(root, n, tam){
		this.root = root  
		this.segments = []
		this.createSegments(n, tam)
	}

	createSegments(n, tam){
		for(let i = 0; i < n; i++) this.segments.push(new Segment(createVector(300 + i*tam, 300), tam))
		this.totalLength = n*tam
	}

	update(type){
		let targetDir = createVector(mouseX, mouseY)
		if(type == 'robot'){
			targetDir = createVector(noise(frameCount/100) * WIDTH, 
									 noise(frameCount/100+1000) * HEIGHT)
		}
		if (dist(targetDir.x, targetDir.y, this.root.x, this.root.y) > this.totalLength) {
		    targetDir = p5.Vector.sub(targetDir, this.root);
		    targetDir.normalize();
		    targetDir.mult(this.totalLength);
		    targetDir.add(this.root);
		}

		this.segments[this.segments.length - 1].tip = targetDir;

		for (let i = this.segments.length - 1; i > 0; i--) {
		    let dir = p5.Vector.sub(this.segments[i].tip, this.segments[i - 1].tip);
		    dir.normalize();
		    dir.mult(this.segments[i - 1].length);
		    this.segments[i - 1].tip = p5.Vector.sub(this.segments[i].tip, dir);
		}

		if(type == 'fabric' || type == 'robot' || type == 'simple'){
			let firstDir = p5.Vector.sub(this.segments[0].tip, this.root);
			firstDir.normalize();
			firstDir.mult(this.segments[0].length);
			this.segments[0].tip = p5.Vector.add(this.root, firstDir);

			for (let i = 1; i < this.segments.length; i++) {
			    let dir = p5.Vector.sub(this.segments[i].tip, this.segments[i - 1].tip);
			    dir.normalize();
			    dir.mult(this.segments[i - 1].length);
			    this.segments[i].tip = p5.Vector.add(this.segments[i - 1].tip, dir);
			}
		}
		else{
			// Adjust the root position based on the new position of the first segment
			let rootDir = p5.Vector.sub(this.segments[0].tip, this.root);
			this.root = p5.Vector.sub(this.segments[0].tip, rootDir);

			// Recalculate the positions of all segments forward from the root
			this.segments[0].tip = p5.Vector.add(this.root, rootDir);
			this.root = this.segments[0].tip
		}
		
		
		
	}

	show(type){
		push()
		if(type == 'fabric' || type == 'simple'){
			noFill()
			stroke(255)
			if(type == 'simple') strokeWeight(3)
		    beginShape()
		    vertex(this.root.x, this.root.y)
		    for(let s of this.segments){
		        vertex(s.tip.x, s.tip.y)
		    }
	    	endShape()
		}
		else if(type == 'snake' || type == 'robot'){
			stroke(255)
			for(let i = 0; i < this.segments.length-1; i++){
				strokeWeight(map(i, 0, this.segments.length, 1, 40))
				if(i == 0) line(this.root.x, this.root.y, this.segments[i].tip.x, this.segments[i].tip.y)
				else line(this.segments[i-1].tip.x, this.segments[i-1].tip.y, this.segments[i].tip.x, this.segments[i].tip.y)
			}
		}
		if(type == 'simple'){
			fill(255, 0, 0)
			noStroke()
			for(let s of this.segments) ellipse(s.tip.x, s.tip.y, 15, 15)
		}
	    pop()
	}



}