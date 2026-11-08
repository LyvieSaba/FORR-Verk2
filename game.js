import { animate, createTimeline, svg, utils, stagger } from './lib/anime.esm.min.js';

const NS = 'http://www.w3.org/2000/svg';
const svgEl = document.getElementById('game');
const $ = (sel) => svgEl.querySelector(sel);

//  Settings 
const HOLD_TO_WAKE_MS = 2000;   // long press on a sleeping animal / restart button
const HOLD_TO_DRAG_MS = 300;    // how long to press food before it can be dragged
const OPEN_ANGLE = 120;         // degrees the lid must be twisted to open
const EAT_DISTANCE = 130;       // how close food must be to the mouth
const ANIMAL_SCALE = 1.3;       // animals are drawn 1.3x bigger (see index.html)

//  Layouts for landscape and portrait screens 
const LAYOUTS = {
  landscape: {
    size: [1000, 700],
    ground: 430,
    animals: { monkey: [300, 225], fox: [700, 225] },
    jars: { fish: [300, 575], banana: [700, 575] },   // crossed, so the child has to choose
    replay: [945, 55],
    starPath: 'M 40 640 C 250 -80, 750 -80, 960 640',
  },
  portrait: {
    size: [700, 1300],
    ground: 660,
    animals: { monkey: [190, 450], fox: [510, 450] },
    jars: { fish: [190, 1020], banana: [510, 1020] },
    replay: [645, 55],
    starPath: 'M 30 1200 C 120 -100, 580 -100, 670 1200',
  },
};
let layout = LAYOUTS.landscape;

// Game objects 
function makeAnimal(id, mouthY) {
  const el = $('#' + id);
  return {
    id, el, mouthY,
    bounce: el.querySelector('.bounce'),
    head: el.querySelector('.head'),
    eyes: el.querySelector('.eyes'),
    mouth: el.querySelector('.mouth'),
    zs: el.querySelectorAll('.z'),
    ring: el.querySelector('.hold-ring'),
    ringDraw: svg.createDrawable(el.querySelector('.hold-ring')),
    awake: false,
    fed: false,
    x: 0, y: 0,
  };
}
const animals = {
  monkey: makeAnimal('monkey', 2),
  fox: makeAnimal('fox', 10),
};

function makeFood(id, forAnimal) {
  return { id, el: $('#' + id), forAnimal, state: 'locked', x: 0, y: 0, busy: false, pointerId: null, jar: null };
}
const foods = {
  banana: makeFood('banana', 'monkey'),
  fish: makeFood('fish', 'fox'),
};

function makeJar(foodId) {
  const el = $('#jar-' + foodId);
  const jar = {
    el, lid: el.querySelector('.lid'), food: foods[foodId],
    open: false, rotation: 0, lastAngle: null,
    pointers: new Map(),   // every finger currently on this jar
    wiggle: null, x: 0, y: 0,
  };
  foods[foodId].jar = jar;
  return jar;
}
const jars = { banana: makeJar('banana'), fish: makeJar('fish') };

const replay = { el: $('#replay'), ring: $('#replay .hold-ring'), ringDraw: svg.createDrawable($('#replay .hold-ring')), pulse: null };
const topLayer = $('#top-layer');
const foodLayer = $('#food-layer');
const touchLayer = $('#touch-layer');

//  LAYOUT 
function applyLayout() {
  layout = innerWidth >= innerHeight ? LAYOUTS.landscape : LAYOUTS.portrait;
  const [w, h] = layout.size;
  svgEl.setAttribute('viewBox', `0 0 ${w} ${h}`);
  $('#ground').setAttribute('y', layout.ground);
  $('#star-path').setAttribute('d', layout.starPath);

  for (const a of Object.values(animals)) {
    [a.x, a.y] = layout.animals[a.id];
    utils.set(a.el, { x: a.x, y: a.y });
  }
  for (const [id, j] of Object.entries(jars)) {
    [j.x, j.y] = layout.jars[id];
    utils.set(j.el, { x: j.x, y: j.y });
    const f = j.food;
    if (f.state === 'locked') { f.x = j.x; f.y = j.y + 25; placeFood(f); }
    else if (f.state === 'free' && f.pointerId === null && !f.busy) { Object.assign(f, restPos(f)); placeFood(f); }
  }
  utils.set(replay.el, { x: layout.replay[0], y: layout.replay[1] });
}

const placeFood = (f) => utils.set(f.el, { x: f.x, y: f.y });
const restPos = (f) => ({ x: f.jar.x, y: f.jar.y - 140 });
const mouthPos = (a) => ({ x: a.x, y: a.y + a.mouthY * ANIMAL_SCALE });
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const angle = (a, b) => Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;

// Screen pixels 
function toSvg(e) {
  return new DOMPoint(e.clientX, e.clientY).matrixTransform(svgEl.getScreenCTM().inverse());
}

//  IDLE ANIMATIONS 
function startIdle() {
  // A cloud drifting across the sky
  animate('#cloud', { x: [-200, 1250], y: 170, duration: 40000, loop: true, ease: 'linear' });

  for (const a of Object.values(animals)) {
    // Breathing
    animate(a.bounce, { scaleY: [1, 1.04], duration: 1400, loop: true, alternate: true, ease: 'inOutSine' });
    // Zzz floating up while asleep
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

// appears when the game starts 
function intro() {
  createTimeline()
    .add([animals.monkey.el, animals.fox.el], { scale: [0, 1], duration: 700, delay: stagger(200), ease: 'outBack(1.7)' })
    .add([jars.fish.el, jars.banana.el], { scale: [0, 1], duration: 600, delay: stagger(150), ease: 'outBack(2)' }, '-=300')
    .add(replay.el, { scale: [0, 1], duration: 400, ease: 'outBack(2)' }, '-=200')
    // Hint: a little bit of the hold ring flashes to show you can hold the animals
    .add([animals.monkey.ring, animals.fox.ring], { opacity: 1, duration: 1 })
    .add([animals.monkey.ringDraw, animals.fox.ringDraw].flat(), { draw: ['0 0', '0 0.3', '0 0'], duration: 1200, ease: 'inOutSine' })
    .add([animals.monkey.ring, animals.fox.ring], { opacity: 0, duration: 1 });
}

//  TOUCH FEEDBACK – a circle under every finger

function showTouch(p) {
  const c = document.createElementNS(NS, 'circle');
  c.setAttribute('r', 30);
  c.setAttribute('class', 'touch box');
  touchLayer.append(c);
  utils.set(c, { x: p.x, y: p.y, scale: 0 });
  animate(c, { scale: 1, opacity: [0, 1], duration: 200, ease: 'outQuad' });
  return c;
}
function hideTouch(c) {
  // Finger lifted: the circle grows and fades away
  animate(c, { scale: 2, opacity: 0, duration: 450, ease: 'outQuad', onComplete: () => c.remove() });
}

//  POINTER EVENTS
const pointers = new Map();   // pointerId -> info about what that finger is doing

svgEl.addEventListener('pointerdown', onDown);
svgEl.addEventListener('pointermove', onMove);
svgEl.addEventListener('pointerup', onUp);
svgEl.addEventListener('pointercancel', onUp);
svgEl.addEventListener('contextmenu', (e) => e.preventDefault());

function onDown(e) {
  e.preventDefault();
  svgEl.setPointerCapture(e.pointerId);   // keep getting moves for this finger
  const p = toSvg(e);
  const info = { id: e.pointerId, type: e.pointerType, start: p, last: p, touch: showTouch(p), action: null };
  pointers.set(e.pointerId, info);

  const foodEl = e.target.closest('.food');
  const jarEl = e.target.closest('.jar');
  const animalEl = e.target.closest('.animal');

  if (foodEl) startFood(info, foods[foodEl.dataset.food]);
  else if (jarEl) startJar(info, jars[jarEl.dataset.food]);
  else if (animalEl) tapAnimal(info, animals[animalEl.dataset.animal]);
  else if (e.target.closest('#replay')) startHold(info, replay, resetGame);
}

function onMove(e) {
  const info = pointers.get(e.pointerId);
  if (!info) return;
  const p = toSvg(e);
  info.last = p;
  utils.set(info.touch, { x: p.x, y: p.y });

  if (info.action === 'food' && info.ready) {
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
  pointers.delete(e.pointerId);
  hideTouch(info.touch);

  if (info.action === 'food') endFood(info);
  else if (info.action === 'jar') endJar(info);
  else if (info.action === 'hold') cancelHold(info);
}


//  LONG PRESS
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
  animate(obj.ringDraw, { draw: '0 0', duration: 300, ease: 'outQuad', onComplete: () => utils.set(obj.ring, { opacity: 0 }) });
}

//  ANIMALS
function tapAnimal(info, a) {
  if (!a.awake) {
    startHold(info, a, wakeUp);
  } else {
    // Awake animal laughs when tapped
    animate(a.bounce, { y: [0, -25, 0], duration: 400, ease: 'outQuad' });
  }
}

function wakeUp(a) {
  a.awake = true;
  a.zzzAnim.pause();
  createTimeline()
    .add(a.zs, { opacity: 0, duration: 200 })
    .add(a.eyes, { scaleY: [0.15, 1], duration: 600, ease: 'outElastic(1, .5)' })
    .add(a.bounce, { y: [0, -50, 0], duration: 600, ease: 'outQuad' }, '<<')
    .add(a.mouth, { d: svg.morphTo(`#${a.id}-smile`), duration: 300 }, '<<')
    .add(a.head, { rotate: [0, -8, 8, 0], duration: 500 })
    .add(a.mouth, { d: svg.morphTo(`#${a.id}-closed`), duration: 300 });
}

// Wrong food: head shake and frown
function sayNo(a) {
  createTimeline()
    .add(a.mouth, { d: svg.morphTo(`#${a.id}-frown`), duration: 250 })
    .add(a.head, { rotate: [0, -14, 14, -10, 10, 0], duration: 700, ease: 'inOutSine' }, '<<')
    .add(a.mouth, { d: svg.morphTo(`#${a.id}-closed`), duration: 300 }, '+=200');
}

function nearestAnimal(f) {
  let best = null;
  for (const a of Object.values(animals)) {
    const d = dist(f, mouthPos(a));
    if (d < EAT_DISTANCE && (!best || d < best.d)) best = { a, d };
  }
  return best ? best.a : null;
}

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

  createTimeline({ onComplete: () => { hearts.forEach((h) => h.remove()); checkWin(); } })
    .add(a.mouth, { d: svg.morphTo(`#${a.id}-open`), duration: 200 })
    .add(f, { x: m.x, y: m.y, duration: 350, ease: 'inQuad', onUpdate: () => placeFood(f) })
    .add(f.el, { scale: 0.2, opacity: 0, duration: 200 }, '-=100')
    .add(a.mouth, { d: svg.morphTo(`#${a.id}-closed`), duration: 150 })
    .add(a.head, { scaleY: [1, 0.9, 1, 0.9, 1, 0.9, 1], duration: 900, ease: 'inOutSine' })   // chewing
    .add(a.mouth, { d: svg.morphTo(`#${a.id}-smile`), duration: 400, ease: 'outBack' })
    .add(a.bounce, { y: [0, -45, 0], duration: 600, ease: 'outQuad' }, '<<')
    .add(hearts, {
      x: (el, i) => a.x + (i - 1) * 70,
      y: [a.y - 80, a.y - 260],
      opacity: [1, 0],
      scale: [0.4, 1.4],
      duration: 1100,
      delay: stagger(150),
      ease: 'outSine',
    }, '<<');
}

//  JARS – MULTI-TOUCH: twist the lid with two fingers
function startJar(info, j) {
  if (j.open) return;
  info.action = 'jar';
  info.jar = j;
  j.pointers.set(info.id, info);
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
  return null;
}

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
  if (Math.abs(j.rotation) >= OPEN_ANGLE) openJar(j);
}

function endJar(info) {
  const j = info.jar;
  j.pointers.delete(info.id);
  j.lastAngle = jarAngle(j);
}

function openJar(j) {
  j.open = true;
  for (const info of j.pointers.values()) info.action = null;
  j.pointers.clear();

  const f = j.food;
  f.state = 'free';
  f.busy = true;
  topLayer.append(f.el);          // food is drawn above the jar from now on
  const rest = restPos(f);
  const spin = j.rotation > 0 ? 360 : -360;

  createTimeline({ onComplete: () => { f.busy = false; drawHint(f); } })
    .add(j.el, { scaleX: [1, 1.1, 1], scaleY: [1, 0.9, 1], duration: 300 })
    .add(j.lid, { y: -260, rotate: j.rotation + spin, opacity: 0, duration: 700, ease: 'outQuad' })
    .add(f, { x: rest.x, y: rest.y, duration: 700, ease: 'outBack(2)', onUpdate: () => placeFood(f) }, '-=550')
    .add(f.el, { scale: [0.8, 1.15, 1], rotate: [0, -10, 10, 0], duration: 600 }, '<<');
}

// LINE DRAWING: a line draws itself from the food to the right animal
function drawHint(f) {
  const a = animals[f.forAnimal];
  const m = mouthPos(a);
  const midX = (f.x + m.x) / 2;
  const midY = Math.min(f.y, m.y) - 140;
  const hint = $('#hint');
  hint.setAttribute('d', `M ${f.x} ${f.y} Q ${midX} ${midY} ${m.x} ${m.y}`);
  const line = svg.createDrawable(hint);

  createTimeline()
    .add(hint, { opacity: 0.9, duration: 1 })
    .add(line, { draw: ['0 0', '0 1'], duration: 1000, ease: 'inOutSine' })
    .add(a.head, { scale: [1, 1.12, 1], duration: 400 })
    .add(line, { draw: ['0 1', '1 1'], duration: 700, ease: 'inOutSine' }, '<<')
    .add(hint, { opacity: 0, duration: 1 });
}

// =============================================================
//  FOOD – PAN: hold a moment, drag to the animal, drop
// =============================================================
function startFood(info, f) {
  if (f.state !== 'free' || f.busy || f.pointerId !== null) return;
  f.pointerId = info.id;
  info.action = 'food';
  info.food = f;
  info.ready = false;
  info.offset = { x: info.start.x - f.x, y: info.start.y - f.y };
  topLayer.append(f.el);

  animate(f.el, { scale: 0.9, duration: 120 });   // finger touched: small squish
  // After a short hold the food "lifts up" and can be moved
  info.timer = setTimeout(() => {
    info.ready = true;
    animate(f.el, { scale: 1.3, rotate: [0, -8, 8, 0], duration: 400, ease: 'outElastic(1, .6)' });
  }, HOLD_TO_DRAG_MS);
}

function endFood(info) {
  clearTimeout(info.timer);
  const f = info.food;
  f.pointerId = null;
  animate(f.el, { scale: 1, duration: 300, ease: 'outBack(2)' });   // finger lifted: food drops down
  if (!info.ready) return;

  const a = nearestAnimal(f);
  if (a && a.id === f.forAnimal && a.awake) {
    eat(a, f);
    return;
  }
  if (a && !a.awake) {
    // Sleeping animal: flash the ring to show "hold me to wake me up"
    utils.set(a.ring, { opacity: 1 });
    animate(a.ringDraw, { draw: ['0 0', '0 0.35', '0 0'], duration: 900, ease: 'inOutSine', onComplete: () => utils.set(a.ring, { opacity: 0 }) });
  } else if (a) {
    sayNo(a);
  }
  sendBack(f);
}

function sendBack(f) {
  f.busy = true;
  const r = restPos(f);
  animate(f, { x: r.x, y: r.y, duration: 700, ease: 'outElastic(1, .7)', onUpdate: () => placeFood(f), onComplete: () => (f.busy = false) });
}

// =============================================================
//  LEVEL DONE – MOTION PATH: a star flies along a curve
// =============================================================
function checkWin() {
  if (!Object.values(animals).every((a) => a.fed)) return;

  const path = $('#star-path');
  const star = $('#star');
  const trail = svg.createDrawable(path);
  const { translateX, translateY, rotate } = svg.createMotionPath(path);

  createTimeline({ onComplete: () => {
    replay.pulse = animate(replay.el, { scale: [1, 1.2], duration: 600, loop: true, alternate: true, ease: 'inOutSine' });
  } })
    .add(path, { opacity: 1, duration: 1 })
    .add(star, { opacity: [0, 1], scale: [0, 1.5], duration: 300 })
    .add(star, { translateX, translateY, rotate, duration: 2600, ease: 'inOutSine' })
    .add(trail, { draw: ['0 0', '0 1'], duration: 2600, ease: 'inOutSine' }, '<<')
    .add([animals.monkey.bounce, animals.fox.bounce], { y: [0, -60, 0, -40, 0], duration: 1200, delay: stagger(200) }, '-=1400')
    .add(trail, { draw: ['0 1', '1 1'], duration: 800 })
    .add(star, { scale: 0, opacity: 0, duration: 400 }, '<<');
}

// =============================================================
//  RESTART (long press on the restart button)
// =============================================================
function resetGame() {
  if (replay.pulse) { replay.pulse.pause(); replay.pulse = null; }
  utils.set(replay.el, { scale: 1 });

  for (const info of pointers.values()) info.action = null;

  for (const a of Object.values(animals)) {
    a.awake = false;
    a.fed = false;
    a.mouth.setAttribute('d', $(`#${a.id}-closed`).getAttribute('d'));
    utils.set(a.eyes, { scaleY: 0.15 });
    utils.set(a.head, { rotate: 0, scale: 1, scaleY: 1 });
    a.zzzAnim.restart();
  }
  for (const j of Object.values(jars)) {
    j.open = false;
    j.rotation = 0;
    j.pointers.clear();
    utils.set(j.lid, { y: 0, rotate: 0, opacity: 1 });
    if (!j.wiggle) j.wiggle = animate(j.lid, { rotate: [0, -15, 15, -10, 0], duration: 900, loop: true, loopDelay: 1800, ease: 'inOutSine' });
    const f = j.food;
    f.state = 'locked';
    f.busy = false;
    f.pointerId = null;
    f.el.style.pointerEvents = '';
    foodLayer.append(f.el);
    utils.set(f.el, { scale: 1, opacity: 1, rotate: 0 });
  }
  utils.set('#star', { opacity: 0 });
  utils.set('#star-path', { opacity: 0 });
  applyLayout();
  intro();
}

// =============================================================
//  START
// =============================================================
for (const a of Object.values(animals)) {
  utils.set(a.eyes, { scaleY: 0.15 });   // eyes closed = asleep
  utils.set(a.ring, { opacity: 0 });
  utils.set(a.ringDraw, { draw: '0 0' });
}
utils.set(replay.ring, { opacity: 0 });
utils.set(replay.ringDraw, { draw: '0 0' });

applyLayout();
addEventListener('resize', applyLayout);
startIdle();
intro();
