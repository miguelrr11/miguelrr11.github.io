//aa game
//Miguel Rodríguez Rodríguez
//02-08-2024

const WIDTH = 600
const HEIGHT = 700
const col_back = "#F8EDE3"
const col_green = "#49FF00"
let level_id = 0
let level
let levels

function mouseClicked(){
    level.shoot()
}

function setup(){
    createCanvas(WIDTH, HEIGHT)
    fill(255)
    noStroke()
    //n_balls, speed, n_balls_in_nexus, level_id
    levels = [[1, 1, 0, 1],
              [1, 17, 2, 2],
              [2, 17, 3, 3],
              [3, -17, 4, 4],
              [3, 14, 5, 5],
              [4, -17, 6, 6],
              [5, 19, 7, 7],
              [6, -19, 6, 8],
              [7, 19, 7, 9],
              [8, 20, 5, 10]]
    restartLevel()
}

function restartLevel(){
    level = new Level(levels[level_id][0], 
                      levels[level_id][1], 
                      levels[level_id][2], 
                      levels[level_id][3])
}

function nextLevel(){
    level_id++
    restartLevel()
}

function draw(){
    level.update()
    if(!level.finished){ 
        background(col_back)
        level.show()
    }
    else{ 
        background(col_green)
        level.showFinishedAnimation()
    }
}
