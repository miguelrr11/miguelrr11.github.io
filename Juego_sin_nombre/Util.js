const pi180 = (Math.PI/180);
const angles =[...new Array(360).fill(0)].map((_,i) => ({
  cos: Math.cos(i * pi180),
  sin: Math.sin(i * pi180)
}));

function getClosestEnemy(pos, avoid, dis){
    let dstn = dis ** 2
    let closest = undefined
    let closest_dist = Infinity
    for(let i = 0; i < fleet.enemies.length; i++){
        let e = fleet.enemies[i]
        if(!e.inCanvas()) continue
        if(!e.alive) continue
        if(avoid && avoid.includes(e)) continue
        if(e === this) continue

        let distEn = squaredDistance(pos.x, pos.y, e.pos.x, e.pos.y)
        if(distEn > dstn) continue
        if(distEn < closest_dist){ 
            closest = e
            closest_dist = distEn
        }
    }
    return closest
}

function squaredDistance(x1, y1, x2, y2) {
    return (x2 - x1) ** 2 + (y2 - y1) ** 2
}

function getRandomString(options) {
    var i;

    var weights = [options[0].weight];

    for (i = 1; i < options.length; i++)
        weights[i] = options[i].weight + weights[i - 1];
    
    var random = Math.random() * weights[weights.length - 1];
    
    for (i = 0; i < weights.length; i++)
        if (weights[i] > random)
            break;
    
    return options[i].item;
}

function mouseClicked(){
    if(mouseX > WIDTH + 300 || mouseY > HEIGHT) return
    if(!pausa) nexus.click(mouseX, mouseY)
    menu.click(mouseX, mouseY)
}

function keyPressed(){
    if(keyCode == ESCAPE) pausa = !pausa
    else if(!pausa && keyCode == 32) nexus.cargaAttack()    //32 == space key
    if(keyCode == UP_ARROW) orbit.addMoon()
    if(keyCode == 68) debug()
}

function getSimpleInt(n){
    if(n < 1000) return floor(n)  
    if(n < 1000000) return round(n/1000, 2) + "K"
    if(n < 1000000000) return round(n/1000000, 2) + "M"
    else return round(n/1000000000, 2) + "B"
}

function debug(){
    nexus.range = Infinity
    nexus.money = Infinity
    nexus.health = Infinity
    nexus.chainChance = 0.4
    spawner.setSpawnPerSecond(100)
    fleet.poolLimit = 300
    for(let i = 0; i < 3; i++){orbit.addMoon()}
}

function isMouseInCanvas(){
    return (mouseX <= WIDTH && mouseX >= 0
            && mouseY <= HEIGHT && mouseY >= 0)
}


// aumentar la dificultad cada vez que se aumente de nivel
function aumentarDificultadLevel(){
    
    spawner.maxHealth += Math.pow(1.25, nexus.nivel)
    fleet.poolLimit += Math.pow(1.5, nexus.nivel)
    spawner.setSpawnPerSecond(fleet.poolLimit/15)
}

// calculado para q la maxima dificultad llegue en 15 mins (lineal)
function aumentarDificultadProg(){
    spawner.maxHealth += 0.7
    spawner.maxSpeed += 0.04
    fleet.poolLimit += 2
    spawner.setSpawnPerSecond(fleet.poolLimit/15)
    let dificulty = (spawner.maxHealth/10)*spawner.maxSpeed*(fleet.poolLimit/70)+(spawner.spawn_per_second)
    //console.log(dificulty)
}

function getStroke(rarity){
    if(rarity == "Common") return color(0, 0, 0)
    if(rarity == "Rare") return color(69, 132, 32)
    if(rarity == "Discount") return color(255, 116, 0)
    if(rarity == "Sacrifice") return color(180, 0, 0)
    if(rarity == "Galactic") return color(255, 255, 255)
}

function getFill(rarity){
    if(rarity == "Common") return color(150, 150, 150)
    if(rarity == "Rare") return color(137, 233, 107)
    if(rarity == "Discount") return color(255, 183, 0)
    if(rarity == "Sacrifice") return color(221, 79, 79)
    if(rarity == "Galactic") return color(0, 0, 0)
}

function getFillTrans(rarity){
    if(rarity == "Common") return color(200, 200, 200)
    if(rarity == "Rare") return color(160, 245, 133)
    if(rarity == "Discount") return color(254, 212, 16)
    if(rarity == "Sacrifice") return color(231, 124, 124)
    if(rarity == "Galactic") return color(50, 50, 50)
}

function getRandomString(options) {
    var i;

    var weights = [options[0].weight];

    for (i = 1; i < options.length; i++)
        weights[i] = options[i].weight + weights[i - 1];
    
    var random = Math.random() * weights[weights.length - 1];
    
    for (i = 0; i < weights.length; i++)
        if (weights[i] > random)
            break;
    
    return options[i].item;
}