class KDtree{
	constructor(points){
		this.points = points
		this.root = this.createKDtree(points)
	}

	createKDtree(points, depth = 0){
	    if(points.length == 0) return

	    let k = 2
	    let axis = depth % k

	    if(axis == 0) points.sort((a, b) => a.x - b.x);
	    else points.sort((a, b) => a.y - b.y);

	    let median = floor(points.length / 2)

	    let nodo = new Nodo()
	    nodo.axis = axis
	    nodo.location = points[median]
	    nodo.left = this.createKDtree(points.slice(0, median), depth+1)
	    nodo.right = this.createKDtree(points.slice(median+1), depth+1)
	    return nodo
	}

	distn(ax, ay, bx, by){
		let dx = ax - bx 
		let dy = ay - by 
		return (dx * dx) + (dy * dy)
	}

	closestPoint(point, nodo = this.root, axis = 0, best = undefined) {
		// If node is a leaf, return the node itself
		nodosVisitados.push(nodo)

		if(!nodo) return undefined

		if(nodo.isLeaf()) return nodo

		if(nodo === this.root && best) return best

		if(!best) best = nodo


		// Determine which child to visit first based on the splitting axis
		let nextAxis = (axis + 1) % 2; // Switch between x-axis (0) and y-axis (1)
		let nearestChild
		if(axis == 0) nearestChild = (point.x <= nodo.location.x) ? nodo.left : nodo.right;
		else nearestChild = (point.y <= nodo.location.y) ? nodo.left : nodo.right;
		

		if(nearestChild == undefined) return best

		let furthestChild = (nearestChild === nodo.left) ? nodo.right : nodo.left;

		if(furthestChild == undefined) return best

		// Recursively search the nearest child
		let nearest = this.closestPoint(point, nearestChild, nextAxis);

		// Update the best point found so far if needed
		if(!best || this.distn(point.x, point.y, nearest.location.x, nearest.location.y) <= this.distn(point.x, point.y, best.location.x, best.location.y)) {
			best = nearest;
		}

		// Check if it's necessary to search the furthest child
		if(axis == 0){
			if (this.distn(point.x, point.y, best.location.x, best.location.y) >= Math.abs(point.x - nodo.location.x)) {
				let furthest = this.closestPoint(point, furthestChild, nextAxis);
				if (!best || this.distn(point.x, point.y, furthest.location.x, furthest.location.y) <= this.distn(point.x, point.y, best.location.x, best.location.y)) {
					best = furthest;
				}
			}
		}
		if(axis == 1){
			if (this.distn(point.x, point.y, best.location.x, best.location.y) >= Math.abs(point.y - nodo.location.y)) {
				let furthest = this.closestPoint(point, furthestChild, nextAxis);
				if (!best || this.distn(point.x, point.y, furthest.location.x, furthest.location.y) <= this.distn(point.x, point.y, best.location.x, best.location.y)) {
					best = furthest;
				}
			}
		}


		return best;
	}

	show(nodo = this.root){
		nodo.show()
		if(nodo.left)  this.show(nodo.left)
		if(nodo.right) this.show(nodo.right)
	}
}