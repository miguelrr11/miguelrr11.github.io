// NONE should be the last element in the array
// RPOS should be the third element in the array (getText function)

const LEFT_RUNES = ['ATTACK', 'WRITE', 'READ', 'ABSORB', 'REPAIR', 'GO TO', 'NONE']
const RIGHT_RUNES = ['MANA', 'SHARD', 'RPOS 0 to 0', 'SHIELD', 'WEAK', 'SPELL', 'NONE']

const LEFT_RUNES_COLS = [[144, 227, 154], [248, 150, 30], [67, 170, 139], [39, 125, 161], [99, 132, 117], [67, 170, 139], [40, 40, 40]]
const RIGHT_RUNES_COLS = [[99, 132, 117], [39, 125, 161], [197, 195, 94], [67, 170, 139], [144, 227, 154], [39, 125, 161], [40, 40, 40]]

class Rune{
    constructor(){
        this.left = constrain(Math.floor(Math.random() * LEFT_RUNES.length), 0, LEFT_RUNES.length - 2)
        this.right = constrain(Math.floor(Math.random() * RIGHT_RUNES.length), 0, RIGHT_RUNES.length - 2)

        this.hp = 100
        this.startPos = 0
        this.endPos = 0

        this.trans = 255
    }

    getText(side){
        if(side == 'left'){
            return LEFT_RUNES[this.left]
        }
        else if(side == 'right'){
            if(RIGHT_RUNES[this.right].includes('RPOS')) return 'RPOS ' + this.startPos + ' to ' + this.endPos
            return RIGHT_RUNES[this.right]
        }
    }

    setRelPos(startPos, endPos){
        this.startPos = startPos
        this.endPos = endPos
    }

    repair(){
        this.hp = 100
    }

    execute(){
        this.trans = 0
        this.hp -= random(0.8, 1.2)
        if(this.hp <= 0){
            this.hp = 0
            return undefined
        }
        return [LEFT_RUNES[this.left], RIGHT_RUNES[this.right]]
    }

    show(startX, startY, endX, endY){
        this.trans += 10
        push()
        noStroke()
        fill([...LEFT_RUNES_COLS[this.left], this.trans])
        if(this.hp == 0) fill(80)
        ellipse(startX, startY, 6)
        fill([...RIGHT_RUNES_COLS[this.right], this.trans])
        if(this.hp == 0) fill(80)
        ellipse(endX, endY, 6)
        pop()
    }
}