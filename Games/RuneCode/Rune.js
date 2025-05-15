const LEFT_RUNES = ['DIGEST', 'REMOVE', 'WRITE', 'READ']
const RIGHT_RUNES = ['FOOD', 'WASTE', 'RPOS', 'WALL']

const LEFT_RUNES_COLS = [[144, 227, 154], [243, 114, 44], [248, 150, 30], [67, 170, 139]]
const RIGHT_RUNES_COLS = [[99, 132, 117], [39, 125, 161], [197, 195, 94], [67, 170, 139]]

class Rune{
    constructor(){
        this.left = Math.floor(Math.random() * LEFT_RUNES.length)
        this.right = Math.floor(Math.random() * RIGHT_RUNES.length)

        this.hp = 100

        this.trans = 255
    }


    execute(){
        this.trans = 0
        this.hp --
        if(this.hp <= 0){
            this.hp = 0
            return undefined
        }
        return `${LEFT_RUNES[this.left]} ${RIGHT_RUNES[this.right]}`
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