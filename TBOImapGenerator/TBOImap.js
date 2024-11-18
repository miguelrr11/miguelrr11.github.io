let two_doors = 0.8
let three_doors = 0.2
let four_doors = 0

const boss_room = 0.01

class TBOImap{
	constructor(){
		this.init()
	}

	init(){
		this.map = []
		for(let i = 0; i < nRooms; i++){
	        this.map[i] = []
	    }
	    this.rooms = 0
	    this.initialRoom = undefined
	    this.bossRoom = undefined
	    this.done = false
	}

	tweakDoorsChances(){
		two_doors = mapp(this.rooms, 0, roomLimit, 0.1, 0.05)
		if(this.rooms < roomLimit * 0.1) two_doors = 1
		three_doors = mapp(this.rooms, 0, roomLimit, 0.05, 0.08)
		//four_doors = mapp(this.rooms, 0, roomLimit, 0.05, 0.025)
	}

	getAdyacentRooms(i, j){
		let adyacent = []
		if(i + 1 < nRooms){
			if(this.map[i+1][j]){
				if(this.map[i+1][j].doors.includes('W')){
					adyacent.push({i: i+1, j: j})
				}
			}
		}
		if(i - 1 >= 0){
			if(this.map[i-1][j]){
				if(this.map[i-1][j].doors.includes('E')){
					adyacent.push({i: i-1, j: j})
				}
			}
		}
		if(j + 1 < nRooms){
			if(this.map[i][j+1]){
				if(this.map[i][j+1].doors.includes('N')){
					adyacent.push({i: i, j: j+1})
				}
			}
		}
		if(j - 1 >= 0){
			if(this.map[i][j-1]){
				if(this.map[i][j-1].doors.includes('S')){
					adyacent.push({i: i, j: j-1})
				}
			}
		}
		//console.log(adyacent)
		return adyacent
	}

	closeDoors(room){
		let i = room.i
		let j = room.j
		let doors = room.doors
		let finalDoors = []
		for(let door of doors){
			if(door == 'N'){
				if(j - 1 >= 0 && this.map[i][j-1]) finalDoors.push('N')
			}
			if(door == 'S'){
				if(j + 1 < nRooms && this.map[i][j+1]) finalDoors.push('S')
			}
			if(door == 'E'){
				if(i + 1 < nRooms && this.map[i+1][j]) finalDoors.push('E')
			}
			if(door == 'W'){
				if(i - 1 >= 0 && this.map[i-1][j] ) finalDoors.push('W')
			}
		}
		return finalDoors
	}
	
	checkDoors(doors, i, j){
		let finalDoors = []
		for(let door of doors){
			if(door == 'N'){
				if(j - 1 >= 0 && (!this.map[i][j-1] || this.map[i][j-1].doors.includes('S'))) finalDoors.push('N')
			}
			if(door == 'S'){
				if(j + 1 < nRooms && (!this.map[i][j+1] || this.map[i][j+1].doors.includes('N'))) finalDoors.push('S')
			}
			if(door == 'E'){
				if(i + 1 < nRooms && (!this.map[i+1][j] || this.map[i+1][j].doors.includes('W'))) finalDoors.push('E')
			}
			if(door == 'W'){
				if(i - 1 >= 0 && (!this.map[i-1][j] || this.map[i-1][j].doors.includes('E'))) finalDoors.push('W')
			}
		}
		return finalDoors
	}

	addDoors(doors){
		let possibleDoors = ['N', 'E', 'S', 'W']
		possibleDoors = possibleDoors.filter(door => !doors.includes(door))
		//console.log(doors)
		if(possibleDoors.length == 0) return doors
		//try to create door in front of other existing door to create a map with corridors
		let added_second = false
		if(Math.random() < 1){
			if(Math.random() < 0.5){
				if(doors.includes('N')){
					doors.push('S')
					possibleDoors = possibleDoors.filter(item => item !== 'S');
					added_second = true
				}
				if(doors.includes('S')){
					doors.push('N')
					possibleDoors = possibleDoors.filter(item => item !== 'N');
					added_second = true
				}
			}
			else if(Math.random() < 0.5){
				if(doors.includes('E')){
					doors.push('W')
					possibleDoors = possibleDoors.filter(item => item !== 'W');
					added_second = true
				}
				if(doors.includes('W')){
					doors.push('E')
					possibleDoors = possibleDoors.filter(item => item !== 'E');
					added_second = true
				}
			}
		}
		if(!added_second && (Math.random() < two_doors || this.rooms < roomLimit * 0.1)) doors.push(pickAndRemove(possibleDoors))
		if(Math.random() < three_doors && possibleDoors.length != 0) doors.push(pickAndRemove(possibleDoors))
		if(Math.random() < four_doors && possibleDoors.length != 0) doors.push(pickAndRemove(possibleDoors))
		return doors
	}

	set2x2(){
		for(let i = 0; i < nRooms-1; i++){
			for(let j = 0; j < nRooms-1; j++){
				if(this.map[i][j] && this.map[i+1][j] && this.map[i+1][j+1] && this.map[i][j+1] &&
				this.notSpecialType(i, j) && this.notSpecialType(i+1, j) && this.notSpecialType(i, j+1) && this.notSpecialType(i+1, j+1) &&
				Math.random() < 0.75){
					this.map[i][j].type     = '2x2p'
					this.map[i][j+1].type   = '2x2'
					this.map[i+1][j+1].type = '2x2'
					this.map[i+1][j].type   = '2x2'
				}
			}
		}
	}

	connectToAdyacent(i, j, adyacent){
		let doors = []
		for(let a of adyacent){
			if(a.i < i && !doors.includes('W')) doors.push('W')
			if(a.i > i && !doors.includes('E')) doors.push('E')
			if(a.j < j && !doors.includes('N')) doors.push('N')
			if(a.j > j && !doors.includes('S')) doors.push('S')
		}
		//console.log(doors)
		return doors
	}

	chooseRandom(){
		return [Math.floor(Math.random() * nRooms), Math.floor(Math.random() * nRooms)]
	}

	getPossibleRoomsOneAdyacent(){
		let possible = []
		for(let i = 0; i < nRooms; i++){
			for(let j = 0; j < nRooms; j++){
				if(!this.map[i][j]){
					let [adyi, adyj] = this.isAdyacentToOne(i, j)
					if(adyi && this.map[adyi][adyj].type != 'boss'){ 
						if(this.map[adyi][adyj].type == 'boss') continue
						possible.push({i, j, adyi, adyj})
					}
				}
			}
		}
		return possible
	}

	notSpecialType(i, j){
		return this.map[i][j].type == 'normal' || this.map[i][j].type == '2x2p'
	}

	goodForSecret(i, j){
		return this.map[i][j].type != 'boss' && this.map[i][j].type != 'secret' && this.map[i][j].type != 'superSecret' 
	}

	goodForSuperSecret(i, j){
		return this.map[i][j].type == 'normal' || this.map[i][j].type == '2x2' || this.map[i][j].type == '2x2p'
	}

	isAdyacentToOne(i, j){
		let ady = 0
		let adyi, adyj
		if(i+1 < nRooms && this.map[i+1][j] && this.notSpecialType(i+1, j)){ ady++; adyi = i+1; adyj=j}
		if(i-1 >= 0 && this.map[i-1][j] && this.notSpecialType(i-1, j)){ ady++; adyi = i-1; adyj=j}
		if(j+1 < nRooms && this.map[i][j+1] && this.notSpecialType(i, j+1)){ ady++; adyi = i; adyj=j+1}
		if(j-1 >= 0 && this.map[i][j-1] && this.notSpecialType(i, j-1)){ ady++; adyi = i; adyj=j-1}
		if(ady != 1) return [false, false]
		return [adyi, adyj]
	}

	getPossibleRooms(){
		let possible = []
		for(let i = 0; i < nRooms; i++){
			for(let j = 0; j < nRooms; j++){
				let ady = this.getAdyacentRooms(i, j)
				if(ady.length != 0) possible.push({i, j})
			}
		}
		return possible
	}

	addSecret(){
		let max = -1
		let imax, jmax
		for(let i = 0; i < nRooms; i++){
			for(let j = 0; j < nRooms; j++){
				if(this.map[i][j]) continue
				let ady = this.getNumberOfAdyacentSecret(i, j)
				if(ady > max){
					max = ady
					imax = i
					jmax = j
				}
			}
		}
		this.map[imax][jmax] = new Room(imax, jmax, [], 'secret')
	}

	addSuperSecret(){
		let imax, jmax
		let possible = []
		for(let i = 0; i < nRooms; i++){
			for(let j = 0; j < nRooms; j++){
				if(this.map[i][j]) continue
				let ady = this.getNumberOfAdyacentSuperSecret(i, j)
				if(ady == 1){
					possible.push({i: i, j: j})
				}
			}
		}
		let index = 0
		if(possible.length == 0) return
		else if(possible.length > 1 && this.bossRoom){
			possible.sort((a, b) => 
			    dist(a.i, a.j, this.bossRoom.i, this.bossRoom.j) - 
			    dist(b.i, b.j, this.bossRoom.i, this.bossRoom.j)
			  );
		}
		let i = possible[index].i
		let j = possible[index].j
		this.map[i][j] = new Room(i, j, [], 'superSecret')
	}

	getNumberOfAdyacentSecret(i, j){
		let ady = 0
		if(i+1 < nRooms && this.map[i+1][j] && !this.goodForSecret(i+1, j)){ return 0}
		if(i-1 >= 0 && this.map[i-1][j] && !this.goodForSecret(i-1, j)){	  return 0}
		if(j+1 < nRooms && this.map[i][j+1] && !this.goodForSecret(i, j+1)){ return 0}
		if(j-1 >= 0 && this.map[i][j-1] && !this.goodForSecret(i, j-1)){	  return 0}

		if(i+1 < nRooms && this.map[i+1][j] && this.goodForSecret(i+1, j)){  ady++;}
		if(i-1 >= 0 && this.map[i-1][j] && this.goodForSecret(i-1, j)){ 	  ady++;}
		if(j+1 < nRooms && this.map[i][j+1] && this.goodForSecret(i, j+1)){  ady++;}
		if(j-1 >= 0 && this.map[i][j-1] && this.goodForSecret(i, j-1)){	  ady++;}
		return ady
	}

	getNumberOfAdyacentSuperSecret(i, j){
		let ady = 0
		if(i+1 < nRooms && this.map[i+1][j] && !this.goodForSuperSecret(i+1, j)){ return 0}
		if(i-1 >= 0 && this.map[i-1][j] && !this.goodForSuperSecret(i-1, j)){	  return 0}
		if(j+1 < nRooms && this.map[i][j+1] && !this.goodForSuperSecret(i, j+1)){ return 0}
		if(j-1 >= 0 && this.map[i][j-1] && !this.goodForSuperSecret(i, j-1)){	  return 0}

		if(i+1 < nRooms && this.map[i+1][j] && this.goodForSuperSecret(i+1, j)){  ady++;}
		if(i-1 >= 0 && this.map[i-1][j] && this.goodForSuperSecret(i-1, j)){ 	  ady++;}
		if(j+1 < nRooms && this.map[i][j+1] && this.goodForSuperSecret(i, j+1)){  ady++;}
		if(j-1 >= 0 && this.map[i][j-1] && this.goodForSuperSecret(i, j-1)){	  ady++;}
		return ady
	}

	isAdyacentToMoreThanOne(i, j){
		let ady = 0
		if(i+1 < nRooms && this.map[i+1][j] && this.notSpecialType(i+1, j)){ ady++;}
		if(i-1 >= 0 && this.map[i-1][j] && this.notSpecialType(i-1, j)){ ady++;}
		if(j+1 < nRooms && this.map[i][j+1] && this.notSpecialType(i, j+1)){ ady++;}
		if(j-1 >= 0 && this.map[i][j-1] && this.notSpecialType(i, j-1)){ ady++;}
		return ady > 1
	}

	generateRooms(){
		if(this.done) return
		//while(true){
			let added = false
			let possibleRooms = this.getPossibleRooms()
			for(let room of possibleRooms){
				let i = room.i
				let j = room.j
				if(!this.isAdyacentToMoreThanOne(i, j) && Math.random() < 0.25) continue
				if(this.map[i][j]) continue
				let adyacent = this.getAdyacentRooms(i, j)
				if(adyacent.length == 0) continue
				let doors = this.connectToAdyacent(i, j, adyacent)
				doors = this.addDoors(doors)
				doors = this.checkDoors(doors, i, j)
				this.map[i][j] = new Room(i, j, doors)
				this.tweakDoorsChances()
				this.rooms++
				added = true
			}

			if(!added && this.rooms <= 3){
				this.init()
				this.generate()
			}

			else if(!added){
				this.finishGenerating()
				this.done = true
			}
			
			// if(this.rooms > roomLimit) return false
			// if(!added) return false
		//}
		//this.finishGenerating()
	}

	connectAdyacentRooms(){
		for(let i = 0; i < nRooms; i++){
			for(let j = 0; j < nRooms; j++){
				if(this.map[i][j]){
					if(j - 1 >= 0 && this.map[i][j-1] && !this.map[i][j-1].doors.includes('S')){
						this.map[i][j-1].doors.push('S')
						this.map[i][j].doors.push('N')
					}
					if(j + 1 < nRooms && this.map[i][j+1] && !this.map[i][j+1].doors.includes('N')){
						this.map[i][j+1].doors.push('N')
						this.map[i][j].doors.push('S')
					}
					if(i - 1 >= 0 && this.map[i-1][j] && !this.map[i-1][j].doors.includes('E')){
						this.map[i-1][j].doors.push('E')
						this.map[i][j].doors.push('W')
					}
					if(i + 1 < nRooms && this.map[i+1][j] && !this.map[i+1][j].doors.includes('W')){
						this.map[i+1][j].doors.push('W')
						this.map[i][j].doors.push('E')
					}
				}
			}
		}
	}

	finishGenerating(){
		this.closeOpenRooms()
		this.connectAdyacentRooms()
		this.addBoss()
		this.addSpecialRoom('shop')
		this.addSpecialRoom('treasure')
		if(Math.random() < 0.4) this.addSpecialRoom('curse')
		if(Math.random() < 0.1) this.addSpecialRoom('library')
		if(Math.random() < 0.25) this.addSpecialRoom('sacrifice')
		if(Math.random() < 0.1) this.addSpecialRoom('planetarium')
		if(Math.random() < 0.4) this.addSpecialRoom('challenge')
		this.set2x2()
		this.addSuperSecret()
		this.addSecret()
	}

	//adds a room that is adyacent to only one room
	addSpecialRoom(type){
		let possible = []
		// for(let i = 0; i < nRooms; i++){
		// 	for(let j = 0; j < nRooms; j++){
		// 		if(this.map[i][j] && this.map[i][j].doors.length == 1 && this.map[i][j].type == 'normal'){
		// 			possible.push({i, j})
		// 		}
		// 	}
		// }
		if (possible.length == 0){
			possible = this.getPossibleRoomsOneAdyacent()
			if(possible.length == 0) return
			let doors = []
			let index = Math.floor(Math.random() * possible.length)
			let i = possible[index].i
			let j = possible[index].j
			let adyi = possible[index].adyi
			let adyj = possible[index].adyj
			if(i < adyi) doors.push('W')
			if(i > adyi) doors.push('E')
			if(j < adyj) doors.push('N')
			if(j > adyj) doors.push('S')
			this.map[i][j] = new Room(i, j, doors, type)
			return
		}
		let index = Math.floor(Math.random() * possible.length)
		let i = possible[index].i
		let j = possible[index].j
		this.map[i][j].type = type
	}

	addBoss(){
		let possible = []
		for(let i = 0; i < nRooms; i++){
			for(let j = 0; j < nRooms; j++){
				if(this.map[i][j] && this.map[i][j].doors.length == 1 && (this.map[i][j].type == 'initial' || this.map[i][j].type == 'normal')){
					possible.push({i, j})
				}
			}
		}
		if (possible.length <= 1){
			possible = this.getPossibleRoomsOneAdyacent()
			if(possible.length == 0) return
			let doors = []
			let index = Math.floor(Math.random() * possible.length)
			let i = possible[index].i
			let j = possible[index].j
			let adyi = possible[index].adyi
			let adyj = possible[index].adyj
			if(i < adyi) doors.push('W')
			if(i > adyi) doors.push('E')
			if(j < adyj) doors.push('N')
			if(j > adyj) doors.push('S')
			this.map[i][j] = new Room(i, j, doors, 'boss')
			this.bossRoom = {i, j}
			return
		}

		if (possible.length > 1) {
		  possible.sort((a, b) => 
		    dist(b.i, b.j, this.initialRoom.i, this.initialRoom.j) - 
		    dist(a.i, a.j, this.initialRoom.i, this.initialRoom.j)
		  );
		}

		let loc = possible[0];
		this.map[loc.i][loc.j].type = 'boss';
	}


	
	closeOpenRooms(){
		for(let i = 0; i < nRooms; i++){
			for(let j = 0; j < nRooms; j++){
				if(this.map[i][j]) this.map[i][j].doors = this.closeDoors(this.map[i][j])
			}
		}
	}

	createInitialRoom(i, j){
		let possibleDoors = ['N', 'E', 'S', 'W']
		let doors = []
		doors.push(pickAndRemove(possibleDoors))
		if(Math.random() < two_doors) doors.push(pickAndRemove(possibleDoors))
		if(Math.random() < three_doors) doors.push(pickAndRemove(possibleDoors))
		if(Math.random() < four_doors) doors.push(pickAndRemove(possibleDoors))
		this.map[i][j] = new Room(i, j, doors, 'initial')
		this.initialRoom = {i, j}
		this.rooms++
	}

	chooseType(){
		if(this.rooms > 4 && Math.random() < boss_room) return 'boss'
		//if(this.rooms > 12) return 'boss'
		return 'normal'
	}

	generate(){
		this.init()
		let ci = Math.floor(nRooms / 2)
		let cj = Math.floor(nRooms / 2)
		this.createInitialRoom(ci, cj)
		//this.generateRooms()
	}

	show(){
		for(let i = 0; i < nRooms; i++){
	        for(let j = 0; j < nRooms; j++){
	            if(this.map[i][j]) this.map[i][j].showBackground()
	        }
	    }
		for(let i = 0; i < nRooms; i++){
	        for(let j = 0; j < nRooms; j++){
	            if(this.map[i][j]) this.map[i][j].show()
	        }
	    }
	}
}

function pickAndRemove(arr){
	if(arr.length == 0){
		console.log("empty array")
		return
	}
	let index = Math.floor(Math.random() * arr.length)
	return arr.splice(index, 1)[0]
}