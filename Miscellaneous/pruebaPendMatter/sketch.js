// sketch.js

// Module aliases from Matter.js
let Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Constraint = Matter.Constraint,
    Body = Matter.Body,
    Events = Matter.Events;

let engine;
let world;
let anchor;
let bob;
let pendulumConstraint;
let fixedY = 200; // Fixed y-position for the anchor

function setup() {
  createCanvas(800, 600);
  
  // Create Matter.js engine and world
  engine = Engine.create();
  world = engine.world;
  
  // Create the anchor body
  anchor = Bodies.rectangle(400, fixedY, 40, 20, {
    inertia: Infinity,
    frictionAir: 0,
    friction: 0,
    restitution: 0,
    inverseMass: 0,
  });
  
  // Create the bob body
  bob = Bodies.circle(400, 100, 20, {
    restitution: 0.9
  });
  
  // Create a constraint between the anchor and bob
  pendulumConstraint = Constraint.create({
    bodyA: anchor,
    bodyB: bob,
    length: 100,
    stiffness: 0,
    damping: 0
  });
  
  // Add bodies and constraint to the world
  World.add(world, [anchor, bob, pendulumConstraint]);
  
  // Constrain the anchor's vertical movement
  Events.on(engine, 'beforeUpdate', function() {
    anchor.position.y = fixedY;
    anchor.velocity.y = 0;
  });
  
  // Set the anchor's initial horizontal velocity
  Body.setVelocity(anchor, { x: 2, y: 0 });
}

function keyPressed() {
  if (keyCode === RIGHT_ARROW) {
    Body.setVelocity(anchor, { x: 5, y: 0 });
  } else if (keyCode === LEFT_ARROW) {
    Body.setVelocity(anchor, { x: -5, y: 0 });
  }
}

function draw() {
  background(220);
  if(keyIsPressed){
    if (keyCode === RIGHT_ARROW) {
    Body.setVelocity(anchor, { x: 5, y: 0 });
  } else if (keyCode === LEFT_ARROW) {
    Body.setVelocity(anchor, { x: -5, y: 0 });
  }
  }
  
  
  // Update the Matter.js engine
  Engine.update(engine);
  
  // Draw the anchor
  fill(0);
  rectMode(CENTER);
  rect(anchor.position.x, anchor.position.y, 40, 20);
  
  // Draw the bob
  fill(127);
  ellipse(bob.position.x, bob.position.y, 40);
  
  // Draw the constraint (pendulum string)
  stroke(0);
  line(anchor.position.x, anchor.position.y, bob.position.x, bob.position.y);
}
