let offset1 = 0
let offset2 = 0
let offset3 = 0

let goalOff1 = 0
let goalOff2 = 0
let goalOff3 = 0


const baseFirstRotor = "EKMFLGDQVZNTOWYHXUSPAIBRCJ"
const baseSecondRotor = "AJDKSIRUXBLHWTMCQGZNPYFVOE"
const baseThirdRotor = "BDFHJLCPRTXVZNYEIWGAKMUSQO"
const reflector = "YRUHQSLDPXNGOKMIEBFZCWVJAT"


const baseFirstRotorInv = "UWYGADFPVZBECKMTHXSLRINQOJ"
const baseSecondRotorInv = "AJPCZWRLFBDKOTYUQGENHXMIVS"
const baseThirdRotorInv = "TAGBPCSDQEUFVNZHYIXJWLRKOM"

const notchFirst  = 'Q';  
const notchSecond = 'E';


let plugBoard = new Map()


function addPlug(a, b) {
    plugBoard.set(a, b)
    plugBoard.set(b, a)
}

function removePlug(a){
    if (plugBoard.has(a)) {
        let b = plugBoard.get(a);
        plugBoard.delete(a);
        plugBoard.delete(b);
    }
}


function setState(off1, off2, off3){
    offset1 = off1
    offset2 = off2
    offset3 = off3
}


function turnRotors(){
  if (offset2 === charToIndex(notchSecond)) {
    offset3 = (offset3 + 1) % 26;
    offset2 = (offset2 + 1) % 26;
  }
  if (offset1 === charToIndex(notchFirst)) {
    offset2 = (offset2 + 1) % 26;
  }
  offset1 = (offset1 + 1) % 26;
}

function inverseTurnRotors(){
    if (offset2 === charToIndex(notchSecond)) {
        offset3 = (offset3 - 1 + 26) % 26;
        offset2 = (offset2 - 1 + 26) % 26;
    }
    if (offset1 === charToIndex(notchFirst)) {
        offset2 = (offset2 - 1 + 26) % 26;
    }
    offset1 = (offset1 - 1 + 26) % 26;
}



function getCodedInput(input){
    let codedInput = ""
    for (let i = 0; i < input.length; i++) {
        codedInput += getCodedChar(input.charAt(i))
    }
    return codedInput
}


function getCodedChar(char){
    turnRotors()
    char = char.toUpperCase()
    if (!char.match(/[A-Z]/)) return char 

    let pluggedChar = plugBoard.get(char) || char

    let codedChar1 = applyRotor(baseFirstRotor, pluggedChar, offset1)
    let codedChar2 = applyRotor(baseSecondRotor, codedChar1, offset2)
    let codedChar3 = applyRotor(baseThirdRotor, codedChar2, offset3)

    let codedChar4 = applyRotor(reflector, codedChar3)

    let codedChar5 = applyRotor(baseThirdRotorInv, codedChar4, offset3)
    let codedChar6 = applyRotor(baseSecondRotorInv, codedChar5, offset2)
    let codedChar7 = applyRotor(baseFirstRotorInv, codedChar6, offset1)

    let finalChar = plugBoard.get(codedChar7) || codedChar7

    transformation = []
    transformation.push(
        char, pluggedChar,
        codedChar1, codedChar2, codedChar3,
        codedChar4, codedChar5, codedChar6,
        codedChar7, finalChar
    )

    return finalChar
}


function applyRotor(rotor, inputChar, offset = 0) {
    const steppedIn = (charToIndex(inputChar) + offset + 26) % 26
    const wiredChar = rotor.charAt(steppedIn)
    const steppedOut = (charToIndex(wiredChar) - offset + 26) % 26
    return String.fromCharCode(65 + steppedOut)
}


function charToIndex(char) {
    return char.charCodeAt(0) - 65
}
