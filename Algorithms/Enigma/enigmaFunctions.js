let offset1 = 0
let offset2 = 0
let offset3 = 0

// Base rotor wirings
const baseFirstRotor = "EKMFLGDQVZNTOWYHXUSPAIBRCJ"
const baseSecondRotor = "AJDKSIRUXBLHWTMCQGZNPYFVOE"
const baseThirdRotor = "BDFHJLCPRTXVZNYEIWGAKMUSQO"
const reflector = "YRUHQSLDPXNGOKMIEBFZCWVJAT"

// Inverse rotor wirings
const baseFirstRotorInv = "UWYGADFPVZBECKMTHXSLRINQOJ"
const baseSecondRotorInv = "AJPCZWRLFBDKOTYUQGENHXMIVS"
const baseThirdRotorInv = "TAGBPCSDQEUFVNZHYIXJWLRKOM"

const notchFirst  = 'Q';  
const notchSecond = 'E';

// Plugboard (bidirectional)
let plugBoard = new Map()

// Add a bidirectional plugboard pair
function addPlug(a, b) {
    plugBoard.set(a, b)
    plugBoard.set(b, a)
}

// Reset rotor offsets
function setState(off1, off2, off3){
    offset1 = off1
    offset2 = off2
    offset3 = off3
}

// Advance rotor offsets (simulate rotor stepping)
function turnRotors(){
  // 1) check for double-step condition:
  //    if middle rotor is at its notch, it will step
  //    and also cause the left rotor to step.
  if (offset2 === charToIndex(notchSecond)) {
    offset3 = (offset3 + 1) % 26;
    offset2 = (offset2 + 1) % 26;
  }

  // 2) check if right rotor is at its notch; if so, middle rotor steps.
  if (offset1 === charToIndex(notchFirst)) {
    offset2 = (offset2 + 1) % 26;
  }

  // 3) always step the rightmost (fast) rotor
  offset1 = (offset1 + 1) % 26;
}


// Encrypt or decrypt entire message
function getCodedInput(input){
    console.log("Offsets: " + offset1, offset2, offset3)
    let codedInput = ""
    for (let i = 0; i < input.length; i++) {
        turnRotors()
        codedInput += getCodedChar(input.charAt(i))
        
    }
    return codedInput
}

// Encrypt/decrypt single character
function getCodedChar(char){

    char = char.toUpperCase()
    if (!char.match(/[A-Z]/)) return char // ignore non-letter input

    // Plugboard (entry)
    let pluggedChar = plugBoard.get(char) || char

    // Forward through rotors
    let codedChar1 = applyRotor(baseFirstRotor, pluggedChar, offset1)
    let codedChar2 = applyRotor(baseSecondRotor, codedChar1, offset2)
    let codedChar3 = applyRotor(baseThirdRotor, codedChar2, offset3)

    // Reflector
    let codedChar4 = applyRotor(reflector, codedChar3)

    // Backward through rotors
    let codedChar5 = applyInverseRotor(baseThirdRotorInv, codedChar4, offset3)
    let codedChar6 = applyInverseRotor(baseSecondRotorInv, codedChar5, offset2)
    let codedChar7 = applyInverseRotor(baseFirstRotorInv, codedChar6, offset1)

    // Plugboard (exit)
    let finalChar = plugBoard.get(codedChar7) || codedChar7

    return finalChar
}

// Apply forward rotor transformation with offset
function applyRotor(rotor, inputChar, offset = 0) {
  // 1) shift into the rotor’s frame
  const steppedIn = (charToIndex(inputChar) + offset + 26) % 26;
  // 2) look up the wiring
  const wiredChar = rotor.charAt(steppedIn);
  // 3) shift back out of the rotor’s frame
  const steppedOut = (charToIndex(wiredChar) - offset + 26) % 26;
  return String.fromCharCode(65 + steppedOut);
}


// Apply inverse rotor transformation with offset
function applyInverseRotor(rotorInv, inputChar, offset = 0) {
    // 1) shift into the rotor’s frame
    const steppedIn = (charToIndex(inputChar) + offset + 26) % 26;
    // 2) inverse‐wire lookup: find which position in the wiring maps back
    const wiredChar  = rotorInv.charAt(steppedIn);
    const steppedOut = (charToIndex(wiredChar) - offset + 26) % 26;
    return String.fromCharCode(65 + steppedOut);
}


// Convert character A–Z to index 0–25
function charToIndex(char) {
    return char.charCodeAt(0) - 65
}
