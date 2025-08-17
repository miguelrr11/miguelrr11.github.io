//Markov Poetry
//Miguel Rodríguez
//17-08-2025

p5.disableFriendlyErrors = true
const WIDTH = 800
const HEIGHT = 800

const NwordsOutput = 500
let markovChain
let countChain
let output

function setup(){
    createCanvas(WIDTH, HEIGHT)
    let chain = trainN(donquijote, 2);
    countChain = new Map(
        [...chain].map(([k, v]) => [k, structuredClone(v)])
    );
    countChain = sortChain(countChain)
    generateProbabilities(chain)
    markovChain = chain
    output = generateText(chain)
    console.log(output);
    
    chain = sortChain(chain)
    console.log(chain)


    background(0)
    fill(255)
    noStroke()
    textSize(25)
    text('Don Quijote generado con cadenas de Markov', 10, 30)
    textSize(20)
    text('Las cadenas de Markov son un modelo probabilístico en el que cada palabra depende solo de la anterior, para generar, en este caso, nuevo texto a partir del libro de Don Quijote. ', 10, 40, WIDTH - 20)
    textSize(15)
    text(output, 10, 120, WIDTH - 20)
    noLoop()
}

function sortChain(chain){
    for(let [k, v] of chain){
        chain.set(k, sortMapByValue(v, false))
    }
    let res = sortMapByValue(chain, true)
    return res
}

function draw(){

}

function generateText(chain){
    let state = randomKey(chain)
    let output = state + " "
    let transitions = undefined
    for(let i = 0; i < NwordsOutput; i++){
        transitions = chain.get(state)
        outputWord = sampleWord(transitions)
        let split = outputWord.trim().split(/\s+/)
        state = split[split.length - 1]
        //if(isUppercase(outputWord[0]) && isUppercase(outputWord[1])) output += "\n" + outputWord + "\n"
        output += outputWord + " "
    }
    return output
}

function generateProbabilities(chain){
    for(let [key, value] of chain){
        let keyMap = value
        let sum = 0
        for(let [key, value] of keyMap){
            sum += value
        }
        for(let [key, value] of keyMap){
            keyMap.set(key, value / sum)
        }
    }
}

function trainN(inputText, N = 1){
    const words = inputText.trim().split(/\s+/)
    const chain = new Map();

    for (let i = 0; i < words.length - (N+1); i ++) {
        const word = words[i];

        let nextwords = ""
        for(let j = i + 1; j < i + N + 1; j++){
            nextwords += words[j]
            if(j <= j + i + 1) nextwords += " "
        }

        if (!chain.has(word)) chain.set(word, new Map());
        const nextMap = chain.get(word);

        nextMap.set(nextwords, (nextMap.get(nextwords) ?? 0) + 1);
    }

    return chain;
}


function randomKey(map) {
  const keys = Array.from(map.keys());
  const randomIndex = Math.floor(Math.random() * keys.length);
  return keys[randomIndex];
}

function sampleWord(probMap) {
    let total = 0;
    for (const v of probMap.values()) {
        total += v;
    }
    if (total === 0) throw new Error("All probabilities are zero");

    let r = Math.random() * total;

    for (const [word, prob] of probMap) {
        r -= prob;
        if (r <= 0) return word;
    }

    return probMap.keys().next().value;
}

function isUppercase(char) {
    if(char == undefined) return false
    return char === char.toUpperCase() && char !== char.toLowerCase();
}

function sortMapByValue(map, bySize) {
    if(bySize) return new Map([...map.entries()].sort((a, b) => b[1].size - a[1].size));
    return new Map([...map.entries()].sort((a, b) => b[1] - a[1]));
}