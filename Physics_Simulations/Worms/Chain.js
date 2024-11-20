class Chain{
	constructor(root, n, tam){
		this.root = root  
		this.segments = []
		this.tam = tam
		this.createSegments(n, tam)
	}

	addSegment(){
		let last = this.segments[this.segments.length-1]
		this.segments.push(new Segment(createVector(last.x + this.tam, last.y + this.tam), this.tam))
		this.totalLength += this.tam
	}

	createSegments(n, tam){
		for(let i = 0; i < n; i++) this.segments.push(new Segment(createVector(300 + i*tam, 300), tam))
		this.totalLength = n*tam
	}

	update(tx, ty){
		let targetDir = createVector(tx, ty)
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
		
		let rootDir = p5.Vector.sub(this.segments[0].tip, this.root);
		this.root = p5.Vector.sub(this.segments[0].tip, rootDir);

		this.segments[0].tip = p5.Vector.add(this.root, rootDir);
		this.root = this.segments[0].tip
	}


	show(type){
		push()
		if(type == "green"){ stroke(0, 255, 0, 150)}
		if(type == "red"){ stroke(255, 0, 0, 150)}
		strokeWeight(7)
		line(this.root.x, this.root.y, this.segments[0].tip.x, this.segments[0].tip.y)
		for(let i = 1; i < this.segments.length-1; i++){
			line(this.segments[i-1].tip.x, this.segments[i-1].tip.y, this.segments[i].tip.x, this.segments[i].tip.y)
		}
	    pop()
	}



}