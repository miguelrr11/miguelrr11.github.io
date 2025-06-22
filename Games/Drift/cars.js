//min and max values for each car property
const minmaxMoveSpeed = { min: 10, max: 35 };
const minmaxMaxSpeed = { min: 20, max: 50 };
const minmaxDrag = { min: 0.5, max: 1 };
const minmaxSteerAngle = { min: 1, max: 10 };
const minmaxTraction = { min: 0, max: 0.4 };
const minmaxDeltaSteerMult = { min: 0, max: 1 };
const minmaxLatDrag = { min: 0, max: 1 };


const superCar = {
    moveSpeed : 20,
    maxSpeed : 30,
    drag : 0.98,                // how quickly the car slows down when not accelerating
    steerAngle : 4,             // how quickly the car can turn
    traction : 0.25,            // how quickly the car can recover from a skid
    deltaSteerMult : 0.4,       // how quickly the steering angle changes (steering sensitivity)
    latDrag : 0.9,              // lateral drag, how quickly the car slows down when not accelerating
}

const hyperCar = {
    moveSpeed : 25,
    maxSpeed : 40,
    drag : 0.9,
    steerAngle : 2, 
    traction : 0.3,
    deltaSteerMult : 0.1,
    latDrag : 0.95
}

const driftCar = {
    moveSpeed : 30,
    maxSpeed : 50,
    drag : 0.85,
    steerAngle : 1, 
    traction : 0.35,
    deltaSteerMult : 0.05,
    latDrag : 0.8
}

const police = {
    moveSpeed : 18,
    maxSpeed : 28,
    drag : 0.93,
    steerAngle : 5,
    traction : 0.2,
    deltaSteerMult : 0.5,
    latDrag : 0.85,
    allowBackDrift: false,      
    continuousDrift: true        
}

function getRandomPoliceCar(){
    return {
        moveSpeed : police.moveSpeed + randomm(-1, 1),
        maxSpeed : police.maxSpeed + randomm(-1, 1),
        drag : police.drag + randomm(-0.06, 0.06),
        steerAngle : police.steerAngle + randomm(-0.5, 0.5),
        traction : police.traction + randomm(-0.05, 0.05),
        deltaSteerMult : police.deltaSteerMult + randomm(-0.2, 0.2),
        latDrag : police.latDrag + randomm(-0.05, 0.05),
        allowBackDrift: police.allowBackDrift,
        continuousDrift: police.continuousDrift
    }
}

function getRandomCar(){
    return {
        moveSpeed : randomm(minmaxMoveSpeed.min, minmaxMoveSpeed.max),
        maxSpeed : randomm(minmaxMaxSpeed.min, minmaxMaxSpeed.max),
        drag : randomm(minmaxDrag.min, minmaxDrag.max),
        steerAngle : randomm(minmaxSteerAngle.min, minmaxSteerAngle.max),
        traction : randomm(minmaxTraction.min, minmaxTraction.max),
        deltaSteerMult : randomm(minmaxDeltaSteerMult.min, minmaxDeltaSteerMult.max),
        latDrag : randomm(minmaxLatDrag.min, minmaxLatDrag.max)
    }
}

const randomCar = {
    moveSpeed : randomm(minmaxMoveSpeed.min, minmaxMoveSpeed.max),
    maxSpeed : randomm(minmaxMaxSpeed.min, minmaxMaxSpeed.max),
    drag : randomm(minmaxDrag.min, minmaxDrag.max),
    steerAngle : randomm(minmaxSteerAngle.min, minmaxSteerAngle.max),
    traction : randomm(minmaxTraction.min, minmaxTraction.max),
    deltaSteerMult : randomm(minmaxDeltaSteerMult.min, minmaxDeltaSteerMult.max),
    latDrag : randomm(minmaxLatDrag.min, minmaxLatDrag.max)
}

