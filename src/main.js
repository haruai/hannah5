import './style.css';
import { GrowingPlant } from './growing-plant.js';
import { RoomCamera } from './camera.js';
import { CatMemory } from './cat-memory.js';
import { IdleScene } from './idle.js';
import { RoomTime } from './room-time.js';
import { NightInteractions } from './night-interactions.js';
import { makeSteamFrames, makePetals, makeSparkles } from './sprites.js';
const $ = s => document.querySelector(s);
const canvas = $('#scene'), ctx = canvas.getContext('2d', { alpha: false });
const world = $('#world'), camera = $('#camera');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
ctx.imageSmoothingEnabled = false;
export const idle = new IdleScene();
export const playback = { time: 0, renderedFrames: 0, lastState: null };
let ready = false, lastAt = null, raf = 0, wake = 0, transition = null, renderedState;
let manifest = {}, assets = {};
const steam = makeSteamFrames(), petals = makePetals(), sparkles = makeSparkles();
export const roomCamera = new RoomCamera({ world, element: camera, canPan: () => ready });
export const catMemory = new CatMemory({ world, camera, motion, time: () => playback.time, requestDraw, canOpen: () => ready });
export const growingPlant = new GrowingPlant({ world, camera, motion, time: () => playback.time, requestDraw, canInteract: () => ready });
export const nightInteractions = new NightInteractions({ world, camera, motion, time: () => playback.time, requestDraw, revealWindow: () => roomCamera.revealWindow(motion.matches) });
export const roomTime = new RoomTime((next, previous) => {
  if (ready && !motion.matches) transition = { from: previous, to: next, at: playback.time };
  else transition = null;
  world.dataset.roomState = next;
  requestDraw();
});
function selectState(state) {
  if (renderedState === state) return;
  renderedState = state;
  roomCamera.setState(state);
  catMemory.setState(state, assets.sleeping['cat-recognition']);
  catMemory.head = assets[state]['cat-recognition'];
  nightInteractions.setState(state);
  const sleeping = state === 'sleeping';
  world.setAttribute('aria-label', 'Hannah’s cozy pixel-art bedroom');
  canvas.setAttribute('aria-label', sleeping
    ? 'Hannah sleeps on a pillow under a pink quilt beside her black cat. Toronto glows through the night window; warm lamplight falls on the flowers and plants.'
    : `Hannah lounges beside her black cat on a pink quilt, with a bouquet, framed memories and plants. ${state === 'evening' ? 'A warm Toronto sunset' : state === 'morning' ? 'Soft morning light' : 'Blue sky and daylight'} fills the window.`);
}
function drawPatch(name) {
  const a = manifest[name];
  if (a && assets[renderedState][name]) ctx.drawImage(assets[renderedState][name], a.x, a.y);
}
function background() {
  const next = roomTime.state;
  if (!transition || motion.matches) {
    transition = null;
    selectState(next);
    ctx.drawImage(assets[next].room, 0, 0);
    return;
  }
  const f = Math.min(1, (playback.time-transition.at)/1600);
  ctx.drawImage(assets[transition.from].room, 0, 0);
  ctx.globalAlpha = f;
  ctx.drawImage(assets[next].room, 0, 0);
  ctx.globalAlpha = 1;
  const poseChanges = (transition.from === 'sleeping') !== (next === 'sleeping');
  if (poseChanges) {
    // A short ordered pixel dissolve changes pose without a long double exposure.
    const pose = Math.max(0, Math.min(1, (f-.38)/.24));
    const from = assets[transition.from].room, to = assets[next].room;
    const bayer = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
    for (const [x,y,w,h] of [[242,108,168,128],[179,197,95,38]]) {
      if (pose === 0 || pose === 1) ctx.drawImage(pose ? to : from,x,y,w,h,x,y,w,h);
      else for(let j=y;j<y+h;j+=2) for(let i=x;i<x+w;i+=2) {
        const im = pose*16 > bayer[((j/2|0)%4)*4+(i/2|0)%4] ? to : from;
        ctx.drawImage(im,i,j,Math.min(2,x+w-i),Math.min(2,y+h-j),i,j,Math.min(2,x+w-i),Math.min(2,y+h-j));
      }
    }
  }
  selectState(f < .5 ? transition.from : next);
  if (f >= 1) transition = null;
}
function ambient(t, s) {
  const sleeping = renderedState === 'sleeping';
  for (const name of s.active) {
    if (catMemory.overridesCat && name.startsWith('cat-')) continue;
    if (sleeping && !name.startsWith('cat-')) continue;
    drawPatch(name);
  }
  if (sleeping) {
    if ((t % 4800 > 1600 && t % 4800 < 2900) || nightInteractions.shifting)
      ctx.drawImage(assets.sleeping['blanket-breath'], 293, 186);
    const twinkle = t % 13700;
    if (twinkle > 9000 && twinkle < 9700) {
      ctx.globalAlpha = .6;
      ctx.drawImage(sparkles[Math.min(4, Math.floor((twinkle-9000)/140))], 174, 64);
      ctx.globalAlpha = 1;
    }
  } else ctx.drawImage(steam[s.steamVariant][s.steamFrame],558,216);
  if (renderedState === 'evening' && idle.petal) {
    const p = idle.petal, f = (t-p.start)/p.duration;
    ctx.globalAlpha = f > .8 ? Math.max(0,(1-f)*5) : .85;
    ctx.drawImage(petals[Math.floor(f*11)%4],Math.round(p.x+f*p.drift+Math.sin(f*7)*4),Math.round(p.y+f*91));
    ctx.globalAlpha=1;
  }
  if ((sleeping || renderedState === 'evening') && s.cityAge >= 0 && s.cityAge < 1400) {
    ctx.globalAlpha = Math.round(Math.sin(s.cityAge/1400*Math.PI)*5)/10;
    ctx.fillStyle='#ffd297'; ctx.fillRect(idle.city.x,idle.city.y,1,2); ctx.globalAlpha=1;
  }
}
function draw() {
  background();
  const state = motion.matches ? null : idle.update(playback.time);
  // Let the environmental fade settle before local animation patches resume.
  if (state && !transition) ambient(playback.time, state);
  catMemory.draw(ctx, drawPatch);
  growingPlant.draw(ctx);
  nightInteractions.draw(ctx);
  playback.lastState = state;
  playback.renderedFrames++;
}
function tick(now) {
  raf=0;
  if (document.hidden || !ready) return;
  if(lastAt !== null) playback.time += Math.min(100,Math.max(0,now-lastAt));
  lastAt=now;
  draw();
  if (!motion.matches) wake=setTimeout(() => { wake=0; raf=requestAnimationFrame(tick); },30);
  else lastAt=null;
}
function requestDraw() {
  if(!ready || document.hidden || raf || wake) return;
  raf=requestAnimationFrame(tick);
}
function resetLoop() {
  clearTimeout(wake); wake=0;
  cancelAnimationFrame(raf); raf=0; lastAt=null;
}
document.addEventListener('visibilitychange', () => {
  resetLoop();
  if(document.hidden) roomTime.stop();
  else { roomTime.check(); requestDraw(); }
});
window.addEventListener('pageshow', () => { roomTime.check(); requestDraw(); });
motion.addEventListener('change', () => { resetLoop(); if(motion.matches) transition=null; requestDraw(); });
async function image(path) {
  const im = new Image();
  im.src = `${import.meta.env.BASE_URL}${path}`;
  await im.decode(); return im;
}
async function init() {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}art/idle/manifest.json`);
    if(!response.ok) throw new Error('Room animation layout could not load');
    manifest=await response.json();
    await Promise.all(['evening','morning','day','sleeping'].map(async state => {
      const base=state==='evening'?'art/idle':`art/time/${state}`;
      const a = assets[state] = {};
      await Promise.all([
        image(state==='evening'?'art/idle/room.png':`art/time/${state}.png`).then(im=>a.room=im),
        image(state==='evening'?'art/memory/cat-recognition.png':`${base}/cat-recognition.png`).then(im=>a['cat-recognition']=im),
        ...Object.keys(manifest).filter(k=>k!=='steam-clean').map(async k=>a[k]=await image(`${base}/${k}.png`)),
        ...(state==='sleeping'?[image(`${base}/blanket-breath.png`).then(im=>a['blanket-breath']=im)]:[]),
      ]);
    }));
    await Promise.all([document.fonts.load('20px "VT323"'),catMemory.preload(),growingPlant.preload()]);
    ready=true;
    roomTime.start();
    world.dataset.roomState=roomTime.state;
    draw();
    $('#loading').classList.add('done'); world.classList.add('ready');
    requestDraw();
  } catch(e) {
    $('#loading').textContent='This little room couldn’t load. Please refresh to try again.';
    console.error(e);
  }
}
init();
