import { animate, createTimeline, svg, utils, stagger } from './lib/anime.esm.min.js';

const NS = 'http://www.w3.org/2000/svg'; // needed to create new svg elements with js
const svgEl = document.getElementById('game');
const $ = (sel) => svgEl.querySelector(sel); // short way to find things inside the svg

//  Settings
const HOLD_TO_WAKE_MS = 2000;   // long press on a sleeping animal / restart button
const HOLD_TO_DRAG_MS = 300;    // how long to press food before it can be dragged
const OPEN_ANGLE = 120;         // degrees the lid must be twisted to open
const EAT_DISTANCE = 130;       // how close food must be to the mouth
const ANIMAL_SCALE = 1.3;       // animals are drawn 1.3x bigger (see index.html)

//  Layouts for landscape and portrait screens
const LAYOUTS = {
  landscape: {
    size: [1000, 700], // view width and length
    ground: 430, // where the ground starts
    animals: { monkey: [300, 225], fox: [700, 225] },
    jars: { fish: [300, 575], banana: [700, 575] },   // crossed, so the child has to choose
    replay: [945, 55],  // restart button
    starPath: 'M 40 640 C 250 -80, 750 -80, 960 640', // path where the star flies
  },
  portrait: {
    size: [700, 1300], // taller than wide
    ground: 660,
    animals: { monkey: [190, 450], fox: [510, 450] },
    jars: { fish: [190, 1020], banana: [510, 1020] },
    replay: [645, 55],
    starPath: 'M 30 1200 C 120 -100, 580 -100, 670 1200',
  },
};
let layout = LAYOUTS.landscape; // layout thats in use rn

// Game objects

// Makes an object with everything we need to animate one animal
function makeAnimal(id, mouthY) {
  const el = $('#' + id);
  return {
    id, el, mouthY, // mouthY = how far down from the center the mouth is
    bounce: el.querySelector('.bounce'), // the part that jumps and breathes
    head: el.querySelector('.head'),
    eyes: el.querySelector('.eyes'),
    mouth: el.querySelector('.mouth'),
    zs: el.querySelectorAll('.z'), // the zzz letters
    ring: el.querySelector('.hold-ring'), // ring that shows the long press
    ringDraw: svg.createDrawable(el.querySelector('.hold-ring')),
    awake: false,
    fed: false,
    x: 0, y: 0, // position, set in applyLayout
  };
}
const animals = {
  monkey: makeAnimal('monkey', 2),
  fox: makeAnimal('fox', 10),
};

// state can be 'locked' (in the jar), 'free' (out of the jar) or 'eaten'
function makeFood(id, forAnimal) {
  return { id, el: $('#' + id), forAnimal, state: 'locked', x: 0, y: 0, busy: false, pointerId: null, jar: null };
}
const foods = {
  banana: makeFood('banana', 'monkey'), // banana goes to monkey
  fish: makeFood('fish', 'fox'), // fish goes to fox
};

function makeJar(foodId) {
  const el = $('#jar-' + foodId);
  const jar = {
    el, lid: el.querySelector('.lid'), food: foods[foodId],
    open: false, rotation: 0,  // how many degrees the lid has been rotated
    lastAngle: null, // finger angle from the last move, used to find how much it turned
    pointers: new Map(),   // every finger currently on this jar
    wiggle: null, x: 0, y: 0, // wiggle animation and position
  };
  foods[foodId].jar = jar; // stores location for reset
  return jar;
}
const jars = { banana: makeJar('banana'), fish: makeJar('fish') };

// Restart button
const replay = { el: $('#replay'), ring: $('#replay .hold-ring'), ringDraw: svg.createDrawable($('#replay .hold-ring')), pulse: null };

// Layers decide what is drawn on top of what
const topLayer = $('#top-layer'); // above everything (food being dragged, hearts)
const foodLayer = $('#food-layer'); // behind the jars
const touchLayer = $('#touch-layer'); // finger circles

//  LAYOUT

// Moves everything to the right place depending on the screen shape
function applyLayout() {
  layout = innerWidth >= innerHeight ? LAYOUTS.landscape : LAYOUTS.portrait; // wider than tall = landscape
  const [w, h] = layout.size;
  svgEl.setAttribute('viewBox', `0 0 ${w} ${h}`);
  $('#ground').setAttribute('y', layout.ground);
  $('#star-path').setAttribute('d', layout.starPath);

  // move the animals
  for (const a of Object.values(animals)) {
    [a.x, a.y] = layout.animals[a.id];
    utils.set(a.el, { x: a.x, y: a.y });
  }
  // move the jars and the food that belongs to them
  for (const [id, j] of Object.entries(jars)) {
    [j.x, j.y] = layout.jars[id];
    utils.set(j.el, { x: j.x, y: j.y });
    const f = j.food;
    // food still in the jar follows the jar
    if (f.state === 'locked') { f.x = j.x; f.y = j.y + 25; placeFood(f); }
    // free food that nobody is holding goes to its spot above the jar
    else if (f.state === 'free' && f.pointerId === null && !f.busy) { Object.assign(f, restPos(f)); placeFood(f); }
  }
  utils.set(replay.el, { x: layout.replay[0], y: layout.replay[1] });
}

// Small helper functions
const placeFood = (f) => utils.set(f.el, { x: f.x, y: f.y }); // move the food to its x and y
const restPos = (f) => ({ x: f.jar.x, y: f.jar.y - 140 }); // where free food waits (above its jar)
const mouthPos = (a) => ({ x: a.x, y: a.y + a.mouthY * ANIMAL_SCALE }); // where the mouth is
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y); // distance between two points
const angle = (a, b) => Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI; // angle between two points in degrees

// Screen pixels -> svg coordinates, so fingers work on every screen size
function toSvg(e) {
  return new DOMPoint(e.clientX, e.clientY).matrixTransform(svgEl.getScreenCTM().inverse());
}

//  IDLE ANIMATIONS (run all the time in the background)
function startIdle() {
  // A cloud drifting across the sky
  animate('#cloud', { x: [-200, 1250], y: 170, duration: 40000, loop: true, ease: 'linear' });

  for (const a of Object.values(animals)) {
    // Breathing
    animate(a.bounce, { scaleY: [1, 1.04], duration: 1400, loop: true, alternate: true, ease: 'inOutSine' });
    // Zzz floating up while asleep (saved so it can be paused when the animal wakes up)
    a.zzzAnim = animate(a.zs, {
      opacity: [0, 1, 0], y: [0, -30], scale: [0.6, 1.2],
      duration: 1800, delay: stagger(450), loop: true, ease: 'outSine',
    });
  }
  for (const j of Object.values(jars)) {
    // Lid wiggles to say "twist me!"
    j.wiggle = animate(j.lid, { rotate: [0, -15, 15, -10, 0], duration: 900, loop: true, loopDelay: 1800, ease: 'inOutSine' });
  }
}

// Appears when the game starts
function intro() {
  createTimeline()
    // animals pop in one after the other
    .add([animals.monkey.el, animals.fox.el], { scale: [0, 1], duration: 700, delay: stagger(200), ease: 'outBack(1.7)' })
    // then the jars
    .add([jars.fish.el, jars.banana.el], { scale: [0, 1], duration: 600, delay: stagger(150), ease: 'outBack(2)' }, '-=300')
    // then the restart button
    .add(replay.el, { scale: [0, 1], duration: 400, ease: 'outBack(2)' }, '-=200')
    // Hint: a little bit of the hold ring flashes to show you can hold the animals
    .add([animals.monkey.ring, animals.fox.ring], { opacity: 1, duration: 1 })
    .add([animals.monkey.ringDraw, animals.fox.ringDraw].flat(), { draw: ['0 0', '0 0.3', '0 0'], duration: 1200, ease: 'inOutSine' })
    .add([animals.monkey.ring, animals.fox.ring], { opacity: 0, duration: 1 });
}

//  TOUCH FEEDBACK – a circle under every finger

// Finger down: a circle grows under the finger
function showTouch(p) {
  const c = document.createElementNS(NS, 'circle');
  c.setAttribute('r', 30);
  c.setAttribute('class', 'touch box');
  touchLayer.append(c);
  utils.set(c, { x: p.x, y: p.y, scale: 0 });
  animate(c, { scale: 1, opacity: [0, 1], duration: 200, ease: 'outQuad' });
  return c; // returned so it can follow the finger and be removed later
}
function hideTouch(c) {
  // Finger lifted: the circle grows and fades away
  animate(c, { scale: 2, opacity: 0, duration: 450, ease: 'outQuad', onComplete: () => c.remove() });
}

//  POINTER EVENTS (work for touch, mouse and pen)
const pointers = new Map();   // pointerId -> info about what that finger is doing

svgEl.addEventListener('pointerdown', onDown);
svgEl.addEventListener('pointermove', onMove);
svgEl.addEventListener('pointerup', onUp);
svgEl.addEventListener('pointercancel', onUp); // treat cancel the same as lifting the finger
svgEl.addEventListener('contextmenu', (e) => e.preventDefault()); // no menu on long press

function onDown(e) {
  e.preventDefault();
  svgEl.setPointerCapture(e.pointerId);   // keep getting moves for this finger
  const p = toSvg(e);
  const info = { // info about this finger
    id: e.pointerId,
    type: e.pointerType, // 'touch', 'mouse' or 'pen'
    start: p, // where the finger first touched
    last: p, // where the finger was last touched
    touch: showTouch(p), // outline
    action: null }; // what its doing

  pointers.set(e.pointerId, info);

  // find what was touched
  const foodEl = e.target.closest('.food');
  const jarEl = e.target.closest('.jar');
  const animalEl = e.target.closest('.animal');

  // start the correct action (food is checked first because it can be on top of the jar)
  if (foodEl) startFood(info, foods[foodEl.dataset.food]);
  else if (jarEl) startJar(info, jars[jarEl.dataset.food]);
  else if (animalEl) tapAnimal(info, animals[animalEl.dataset.animal]);
  else if (e.target.closest('#replay')) startHold(info, replay, resetGame);
}

function onMove(e) {
  const info = pointers.get(e.pointerId);
  if (!info) return; // finger we dont know abt = ignore
  const p = toSvg(e);
  info.last = p; // remember new position
  utils.set(info.touch, { x: p.x, y: p.y }); // circle follows the finger

  if (info.action === 'food' && info.ready) {
    // dragging food, keep the same distance between finger and food
    const f = info.food;
    f.x = p.x - info.offset.x;
    f.y = p.y - info.offset.y;
    placeFood(f);
  } else if (info.action === 'jar') {
    twistJar(info.jar);
  } else if (info.action === 'hold' && dist(p, info.start) > 40) {
    cancelHold(info);   // finger slid away -> cancel the long press
  }
}

function onUp(e) {
  const info = pointers.get(e.pointerId);
  if (!info) return;
  pointers.delete(e.pointerId); // finger is gone
  hideTouch(info.touch);

  // finish whatever the finger was doing
  if (info.action === 'food') endFood(info);
  else if (info.action === 'jar') endJar(info);
  else if (info.action === 'hold') cancelHold(info); // let go too early
}


//  LONG PRESS
// obj = the thing being held, onDone = what happens when the ring is full
function startHold(info, obj, onDone) {
  info.action = 'hold';
  info.holdObj = obj;
  utils.set(obj.ring, { opacity: 1 });
  // The ring draws itself around the object during the 2 seconds
  info.holdAnim = animate(obj.ringDraw, {
    draw: ['0 0', '0 1'],
    duration: HOLD_TO_WAKE_MS,
    ease: 'linear',
    onComplete: () => {
      // held long enough: hide the ring and do the action
      info.action = null;
      animate(obj.ring, { opacity: 0, duration: 300, onComplete: () => utils.set(obj.ringDraw, { draw: '0 0' }) });
      onDone(obj);
    },
  });
}
function cancelHold(info) {
  info.action = null;
  info.holdAnim.pause();
  const obj = info.holdObj;
  // ring shrinks back and disappears
  animate(obj.ringDraw, { draw: '0 0', duration: 300, ease: 'outQuad', onComplete: () => utils.set(obj.ring, { opacity: 0 }) });
}

//  ANIMALS
function tapAnimal(info, a) {
  if (!a.awake) {
    startHold(info, a, wakeUp); // sleeping animal needs a long press
  } else {
    // Awake animal laughs when tapped
    animate(a.bounce, { y: [0, -25, 0], duration: 400, ease: 'outQuad' });
  }
}

function wakeUp(a) {
  a.awake = true;
  a.zzzAnim.pause(); // no more zzz
  createTimeline()
    .add(a.zs, { opacity: 0, duration: 200 })
    .add(a.eyes, { scaleY: [0.15, 1], duration: 600, ease: 'outElastic(1, .5)' }) // eyes open
    .add(a.bounce, { y: [0, -50, 0], duration: 600, ease: 'outQuad' }, '<<') // jumps at the same time
    .add(a.mouth, { d: svg.morphTo(`#${a.id}-smile`), duration: 300 }, '<<') // smiles
    .add(a.head, { rotate: [0, -8, 8, 0], duration: 500 }) // little head tilt
    .add(a.mouth, { d: svg.morphTo(`#${a.id}-closed`), duration: 300 });
}

// Wrong food: head shake and frown
function sayNo(a) {
  createTimeline()
    .add(a.mouth, { d: svg.morphTo(`#${a.id}-frown`), duration: 250 })
    .add(a.head, { rotate: [0, -14, 14, -10, 10, 0], duration: 700, ease: 'inOutSine' }, '<<')
    .add(a.mouth, { d: svg.morphTo(`#${a.id}-closed`), duration: 300 }, '+=200');
}

// Finds the animal whose mouth is closest to the food (or null if none are close enough)
function nearestAnimal(f) {
  let best = null;
  for (const a of Object.values(animals)) {
    const d = dist(f, mouthPos(a));
    if (d < EAT_DISTANCE && (!best || d < best.d)) best = { a, d };
  }
  return best ? best.a : null;
}

// Creates 3 hearts above the animal (they are removed after the animation)
function makeHearts(a) {
  return [0, 1, 2].map(() => {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'heart box');
    g.innerHTML = '<path d="M 0 10 C -24 -6 -14 -26 0 -14 C 14 -26 24 -6 0 10 Z" fill="#ff6b8a"/>';
    topLayer.append(g);
    utils.set(g, { x: a.x, y: a.y - 80, opacity: 0 });
    return g;
  });
}

// Right food: eat it! (Timeline + morphing)
function eat(a, f) {
  f.state = 'eaten';
  f.busy = true;
  f.el.style.pointerEvents = 'none';   // eaten food can't be touched anymore
  a.fed = true;
  const m = mouthPos(a);
  const hearts = makeHearts(a);

  // when everything is done: remove the hearts and check if both animals are fed
  createTimeline({ onComplete: () => { hearts.forEach((h) => h.remove()); checkWin(); } })
    .add(a.mouth, { d: svg.morphTo(`#${a.id}-open`), duration: 200 }) // mouth opens
    .add(f, { x: m.x, y: m.y, duration: 350, ease: 'inQuad', onUpdate: () => placeFood(f) }) // food flies into the mouth
    .add(f.el, { scale: 0.2, opacity: 0, duration: 200 }, '-=100') // food disappears
    .add(a.mouth, { d: svg.morphTo(`#${a.id}-closed`), duration: 150 })
    .add(a.head, { scaleY: [1, 0.9, 1, 0.9, 1, 0.9, 1], duration: 900, ease: 'inOutSine' })   // chewing
    .add(a.mouth, { d: svg.morphTo(`#${a.id}-smile`), duration: 400, ease: 'outBack' }) // happy
    .add(a.bounce, { y: [0, -45, 0], duration: 600, ease: 'outQuad' }, '<<')
    .add(hearts, {
      x: (el, i) => a.x + (i - 1) * 70, // spread out left, middle, right
      y: [a.y - 80, a.y - 260], // float up
      opacity: [1, 0],
      scale: [0.4, 1.4],
      duration: 1100,
      delay: stagger(150),
      ease: 'outSine',
    }, '<<');
}

//  JARS – MULTI-TOUCH: twist the lid with two fingers
function startJar(info, j) {
  if (j.open) return; // already open, nothing to do
  info.action = 'jar';
  info.jar = j;
  j.pointers.set(info.id, info);
  // stop the wiggle so it doesnt fight with the finger
  if (j.wiggle) { j.wiggle.pause(); j.wiggle = null; utils.set(j.lid, { rotate: j.rotation }); }
  animate(j.el, { scale: [1, 1.06, 1], duration: 250 });   // jar reacts to the touch
  j.lastAngle = jarAngle(j);   // reset so the lid does not jump when a finger is added
}

// Angle between the two fingers. With a mouse (testing on a computer)
// the angle between the lid center and the mouse is used instead.
function jarAngle(j) {
  const fingers = [...j.pointers.values()];
  if (fingers.length >= 2) return angle(fingers[0].last, fingers[1].last);
  if (fingers.length === 1 && fingers[0].type === 'mouse') return angle({ x: j.x, y: j.y - 70 }, fingers[0].last);
  return null; // only one finger = can't twist
}

// Turns the lid as much as the fingers turned since last time
function twistJar(j) {
  const a = jarAngle(j);
  if (a !== null && j.lastAngle !== null) {
    let delta = a - j.lastAngle;
    if (delta > 180) delta -= 360;     // keep the change between -180 and 180
    if (delta < -180) delta += 360;
    j.rotation += delta;
    utils.set(j.lid, { rotate: j.rotation });
  }
  j.lastAngle = a;
  if (Math.abs(j.rotation) >= OPEN_ANGLE) openJar(j); // twisted enough (either direction)
}

// A finger left the jar
function endJar(info) {
  const j = info.jar;
  j.pointers.delete(info.id);
  j.lastAngle = jarAngle(j); // new angle with the fingers that are left
}

function openJar(j) {
  j.open = true;
  // the fingers on the jar stop twisting
  for (const info of j.pointers.values()) info.action = null;
  j.pointers.clear();

  const f = j.food;
  f.state = 'free';
  f.busy = true; // cant be grabbed while it jumps out
  topLayer.append(f.el);          // food is drawn above the jar from now on
  const rest = restPos(f);
  const spin = j.rotation > 0 ? 360 : -360; // lid keeps spinning the same way it was twisted

  createTimeline({ onComplete: () => { f.busy = false; drawHint(f); } })
    .add(j.el, { scaleX: [1, 1.1, 1], scaleY: [1, 0.9, 1], duration: 300 }) // jar squishes
    .add(j.lid, { y: -260, rotate: j.rotation + spin, opacity: 0, duration: 700, ease: 'outQuad' }) // lid flies off
    .add(f, { x: rest.x, y: rest.y, duration: 700, ease: 'outBack(2)', onUpdate: () => placeFood(f) }, '-=550') // food jumps out
    .add(f.el, { scale: [0.8, 1.15, 1], rotate: [0, -10, 10, 0], duration: 600 }, '<<');
}

// LINE DRAWING: a line draws itself from the food to the right animal
function drawHint(f) {
  const a = animals[f.forAnimal];
  const m = mouthPos(a);
  // control point for the curve, in the middle and above both points
  const midX = (f.x + m.x) / 2;
  const midY = Math.min(f.y, m.y) - 140;
  const hint = $('#hint');
  hint.setAttribute('d', `M ${f.x} ${f.y} Q ${midX} ${midY} ${m.x} ${m.y}`);
  const line = svg.createDrawable(hint);

  createTimeline()
    .add(hint, { opacity: 0.9, duration: 1 })
    .add(line, { draw: ['0 0', '0 1'], duration: 1000, ease: 'inOutSine' }) // line draws to the animal
    .add(a.head, { scale: [1, 1.12, 1], duration: 400 }) // animal head pops
    .add(line, { draw: ['0 1', '1 1'], duration: 700, ease: 'inOutSine' }, '<<') // line erases itself
    .add(hint, { opacity: 0, duration: 1 });
}

//  FOOD – PAN: hold a moment, drag to the animal, drop
function startFood(info, f) {
  // only free food that nobody else is holding can be picked up
  if (f.state !== 'free' || f.busy || f.pointerId !== null) return;
  f.pointerId = info.id;
  info.action = 'food';
  info.food = f;
  info.ready = false;
  info.offset = { x: info.start.x - f.x, y: info.start.y - f.y }; // so the food doesnt jump to the finger
  topLayer.append(f.el);

  animate(f.el, { scale: 0.9, duration: 120 });   // finger touched: small squish
  // After a short hold the food "lifts up" and can be moved
  info.timer = setTimeout(() => {
    info.ready = true;
    animate(f.el, { scale: 1.3, rotate: [0, -8, 8, 0], duration: 400, ease: 'outElastic(1, .6)' });
  }, HOLD_TO_DRAG_MS);
}

function endFood(info) {
  clearTimeout(info.timer); // if let go before it was ready
  const f = info.food;
  f.pointerId = null;
  animate(f.el, { scale: 1, duration: 300, ease: 'outBack(2)' });   // finger lifted: food drops down
  if (!info.ready) return; // was just a tap, nothing more

  const a = nearestAnimal(f);
  // right animal and awake = eat
  if (a && a.id === f.forAnimal && a.awake) {
    eat(a, f);
    return;
  }
  if (a && !a.awake) {
    // Sleeping animal: flash the ring to show "hold me to wake me up"
    utils.set(a.ring, { opacity: 1 });
    animate(a.ringDraw, { draw: ['0 0', '0 0.35', '0 0'], duration: 900, ease: 'inOutSine', onComplete: () => utils.set(a.ring, { opacity: 0 }) });
  } else if (a) {
    sayNo(a); // wrong animal
  }
  sendBack(f); // food goes back above its jar
}

// Food bounces back to its spot above the jar
function sendBack(f) {
  f.busy = true;
  const r = restPos(f);
  animate(f, { x: r.x, y: r.y, duration: 700, ease: 'outElastic(1, .7)', onUpdate: () => placeFood(f), onComplete: () => (f.busy = false) });
}

//  LEVEL DONE – MOTION PATH: a star flies along a curve
function checkWin() {
  if (!Object.values(animals).every((a) => a.fed)) return; // not everyone has eaten yet

  const path = $('#star-path');
  const star = $('#star');
  const trail = svg.createDrawable(path);
  const { translateX, translateY, rotate } = svg.createMotionPath(path); // makes the star follow the path

  // when done: restart button starts pulsing so the child knows they can play again
  createTimeline({ onComplete: () => {
    replay.pulse = animate(replay.el, { scale: [1, 1.2], duration: 600, loop: true, alternate: true, ease: 'inOutSine' });
  } })
    .add(path, { opacity: 1, duration: 1 })
    .add(star, { opacity: [0, 1], scale: [0, 1.5], duration: 300 }) // star appears
    .add(star, { translateX, translateY, rotate, duration: 2600, ease: 'inOutSine' }) // star flies
    .add(trail, { draw: ['0 0', '0 1'], duration: 2600, ease: 'inOutSine' }, '<<') // trail behind the star
    .add([animals.monkey.bounce, animals.fox.bounce], { y: [0, -60, 0, -40, 0], duration: 1200, delay: stagger(200) }, '-=1400') // animals celebrate
    .add(trail, { draw: ['0 1', '1 1'], duration: 800 }) // trail disappears
    .add(star, { scale: 0, opacity: 0, duration: 400 }, '<<');
}

//  RESTART (long press on the restart button)
function resetGame() {
  // stop the pulsing
  if (replay.pulse) { replay.pulse.pause(); replay.pulse = null; }
  utils.set(replay.el, { scale: 1 });

  for (const info of pointers.values()) info.action = null; // forget everything

  // animals go back to sleep
  for (const a of Object.values(animals)) {
    a.awake = false;
    a.fed = false;
    a.mouth.setAttribute('d', $(`#${a.id}-closed`).getAttribute('d')); // closed mouth again
    utils.set(a.eyes, { scaleY: 0.15 }); // closed eyes again
    utils.set(a.head, { rotate: 0, scale: 1, scaleY: 1 });
    a.zzzAnim.restart(); // zzz starts again
  }
  // jars close again
  for (const j of Object.values(jars)) {
    j.open = false;
    j.rotation = 0;
    j.pointers.clear();
    utils.set(j.lid, { y: 0, rotate: 0, opacity: 1 }); // lid back on
    // start animation again if it was stopped
    if (!j.wiggle) j.wiggle = animate(j.lid, { rotate: [0, -15, 15, -10, 0], duration: 900, loop: true, loopDelay: 1800, ease: 'inOutSine' });
    // food back into jar
    const f = j.food;
    f.state = 'locked';
    f.busy = false;
    f.pointerId = null;
    f.el.style.pointerEvents = ''; // can be touched again
    foodLayer.append(f.el); // food goes behind jar
    utils.set(f.el, { scale: 1, opacity: 1, rotate: 0 });
  }
  // hide the star
  utils.set('#star', { opacity: 0 });
  utils.set('#star-path', { opacity: 0 });
  applyLayout(); // reset food
  intro(); // play the intro again
}

//  START
for (const a of Object.values(animals)) {
  utils.set(a.eyes, { scaleY: 0.15 });   // eyes closed = asleep
  utils.set(a.ring, { opacity: 0 }); // ring is hidden
  utils.set(a.ringDraw, { draw: '0 0' }); // ring is empty
}
utils.set(replay.ring, { opacity: 0 }); // restart ring is hidden too
utils.set(replay.ringDraw, { draw: '0 0' });

applyLayout(); // set layout
addEventListener('resize', applyLayout); // resize layout
startIdle(); // start animation
intro(); // animals and jars pop in