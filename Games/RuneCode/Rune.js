// NONE should be the last element in the array
// RPOS should be the third element in the array (getText function)

const LEFT_RUNES = ['ATTACK', 'WRITE', 'READ', 'ABSORB', 'REPAIR', 'GO TO', 'LOOP', 'NONE']
const RIGHT_RUNES = ['MANA', 'SHARD', 'RPOS', 'SHIELD', 'WEAK', 'SPELL', 'INWARD', 'OUTWARD', 'NONE']

const LEFT_RUNES_COLS = [[248, 150, 30], [206, 71, 96], [206, 71, 96], [39, 125, 161], [99, 132, 117], [67, 170, 139], [153, 217, 140], [40, 40, 40]]
const RIGHT_RUNES_COLS = [[100, 223, 223], [123, 44, 191], [197, 195, 94], [74, 170, 211], [236, 91, 120], [186, 61, 86], [248, 150, 30], [248, 150, 30], [40, 40, 40]]

class Rune{
    constructor(left, right, from, to){
        this.left = left != undefined ? left : constrain(Math.floor(Math.random() * LEFT_RUNES.length), 0, LEFT_RUNES.length - 2)
        this.right = right != undefined ? right : constrain(Math.floor(Math.random() * RIGHT_RUNES.length), 0, RIGHT_RUNES.length - 2)

        this.hp = 100
        this.artificial = false

        this.from = from != undefined ? from : 0
        this.to = to != undefined ? to : 0

        this.loopIter = 0   //max iterations
        if(LEFT_RUNES[this.left] == 'LOOP'){
            this.loopIter = this.to
        }

        this.trans = 255
    }

    setLeft(left){
        this.left = left
        if(LEFT_RUNES[this.left] == 'LOOP'){
            this.loopIter = this.to
        }
    }

    setRight(right){
        this.right = right
        if(RIGHT_RUNES[this.right] == 'RPOS'){
            this.loopIter = this.to
        }
    }

    doIter(){
        this.to--
    }

    restoreLoop(){
        this.to = this.loopIter
    }

    getText(side){
        if(side == 'left'){
            return LEFT_RUNES[this.left]
        }
        else if(side == 'right'){
            if(RIGHT_RUNES[this.right] == 'RPOS'){ 
                if(LEFT_RUNES[this.left] != 'LOOP') return 'RPOS ' + this.from + ' to ' + this.to
                else return 'to ' + this.from + ', ' + this.to + ' time(s)'
            }
            return RIGHT_RUNES[this.right]
        }
    }

    dupe(){
        let newRune = new Rune(this.left, this.right)
        newRune.artificial = this.artificial
        newRune.from = this.from
        newRune.to = this.to
        return newRune
    }

    setRelPos(from, to){
        this.from = from
        this.to = to
        this.loopIter = to
    }

    repair(){
        this.hp = 100
    }

    execute(){
        this.trans = 0
        this.hp -= random(5, 8)
        if(this.hp <= 0){
            this.hp = 0
            return ['NONE', 'NONE']
        }
        return [LEFT_RUNES[this.left], RIGHT_RUNES[this.right]]
    }

    show(startX, startY, endX, endY, trans = undefined){
        push()
        let finalTrans = trans != undefined ? trans : this.trans
        noStroke()
        fill([...LEFT_RUNES_COLS[this.left], finalTrans])
        if(this.hp == 0) fill(80)
        ellipse(startX, startY, 6)
        fill([...RIGHT_RUNES_COLS[this.right], finalTrans])
        if(this.hp == 0) fill(80)
        ellipse(endX, endY, 6)
        pop()
    }
}

function getColorByWord(word){
    if(LEFT_RUNES.includes(word)){
        return LEFT_RUNES_COLS[LEFT_RUNES.indexOf(word)]
    }
    else if(RIGHT_RUNES.includes(word)){
        return RIGHT_RUNES_COLS[RIGHT_RUNES.indexOf(word)]
    }
    else if(word == 'HANDSIDE') return [248, 150, 30]
    return [40, 40, 40]
}