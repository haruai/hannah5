import {test,expect} from '@playwright/test';
import {stateAt} from '../src/room-time.js';
test.use({timezoneId:'America/Toronto'});
const moduleState = (page,fn) => page.evaluate(async fn => {
  const m=await import(document.querySelector('script[src*="/src/main.js"]').src);
  return new Function('m',fn)(m);
},fn);
test('all local hour boundaries',()=>{
  for(const [hour,state] of [[0,'sleeping'],[5,'sleeping'],[6,'morning'],[11,'morning'],[12,'day'],[16,'day'],[17,'evening'],[21,'evening'],[22,'sleeping'],[23,'sleeping']])
    expect(stateAt(new Date(2026,8,16,hour,59))).toBe(state);
});
for(const [hour,state] of [[8,'morning'],[14,'day'],[19,'evening'],[23,'sleeping']]){
  test(`${state} art and desktop interactions`,async({page})=>{
    await page.clock.setFixedTime(new Date(`2026-09-16T${String(hour).padStart(2,'0')}:00:00-04:00`));
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto('/');
    await expect(page.locator('#loading')).toBeHidden();
    await expect(page.locator('#world')).toHaveAttribute('data-room-state',state);
    await expect(page.locator('#sleeping-hannah')).toBeVisible({visible:state==='sleeping'});
    await page.screenshot({path:`test-results/time-${state}-desktop.png`});
    await page.locator('#plant-trigger').click();
    await expect(page.locator('#plant-whisper')).toBeVisible();
    await page.locator('#cat-memory-trigger').click();
    await expect(page.locator('#cat-memory')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#cat-memory')).toBeHidden();
  });
}
test('crosses 10pm and 6am without refresh or resetting progression',async({page})=>{
  await page.clock.install({time:new Date('2026-09-16T21:59:58-04:00')});
  await page.goto('/');
  await expect(page.locator('#loading')).toBeHidden();
  const first=await page.evaluate(()=>localStorage.getItem('plantFirstVisit'));
  await page.clock.runFor(4100);
  await expect(page.locator('#world')).toHaveAttribute('data-room-state','sleeping');
  await expect(page.locator('#sleeping-hannah')).toBeVisible();
  await page.clock.setSystemTime(new Date('2026-09-17T05:59:59-04:00'));
  await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
  await page.clock.runFor(4000);
  await expect(page.locator('#world')).toHaveAttribute('data-room-state','morning');
  await expect(page.locator('#sleeping-hannah')).toBeHidden();
  expect(await page.evaluate(()=>localStorage.getItem('plantFirstVisit'))).toBe(first);
  expect(await moduleState(page,'return m.growingPlant.stage')).toBe(2);
});
test('night dreams stay asleep, cooldown, star message once and memory replay',async({page})=>{
  await page.clock.setFixedTime(new Date('2026-09-16T23:00:00-04:00'));
  await page.goto('/'); await expect(page.locator('#loading')).toBeHidden();
  await page.locator('#sleeping-hannah').click();
  const bubble=page.locator('#room-whisper');
  await expect(bubble).toBeVisible();
  const first=await bubble.textContent();
  await page.locator('#sleeping-hannah').click();
  await expect(bubble).toHaveText(first);
  await expect(page.locator('#world')).toHaveAttribute('data-room-state','sleeping');
  await expect(bubble).toBeHidden({timeout:3000});
  await page.locator('#night-window').click();
  await expect(bubble).toHaveText('make a wish ♡');
  await page.waitForTimeout(200);
  await page.screenshot({path:'test-results/time-shooting-star.png'});
  expect(await page.evaluate(()=>localStorage.getItem('shootingStarMessageSeen'))).toBe('true');
  await page.reload(); await expect(page.locator('#loading')).toBeHidden();
  await page.locator('#night-window').click(); await expect(bubble).toBeHidden();
  expect(await moduleState(page,'return m.nightInteractions.starAt')).toBeGreaterThanOrEqual(0);
  for(let i=0;i<2;i++) {
    await page.locator('#cat-memory-trigger').click();
    await expect(page.locator('#cat-memory')).toBeHidden();
    await expect(page.locator('#cat-memory')).toBeVisible();
    await page.keyboard.press('Escape');
  }
});
for(const state of ['morning','day','evening','sleeping'])test(`${state} mobile portrait crop and taps`,async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce',timezoneId:'America/Toronto'});
  const page=await context.newPage();
  const h={morning:'08',day:'14',evening:'19',sleeping:'23'}[state];
  await page.clock.setFixedTime(new Date(`2026-09-16T${h}:00:00-04:00`));
  await page.goto('http://127.0.0.1:5173'); await expect(page.locator('#loading')).toBeHidden();
  await page.screenshot({path:`test-results/time-${state}-mobile.png`});
  const camera=await page.locator('#camera').boundingBox();
  expect(camera.height).toBeGreaterThanOrEqual(844);
  expect(camera.width).toBeGreaterThan(1200);
  await page.locator('#plant-trigger').tap(); await expect(page.locator('#plant-whisper')).toBeVisible();
  if(state==='sleeping') {
    await page.locator('#sleeping-hannah').tap(); await expect(page.locator('#room-whisper')).toBeVisible();
    const w=await page.locator('#night-window').boundingBox();
    expect(w.x+w.width).toBeGreaterThan(20);
    await page.touchscreen.tap(Math.min(390,w.x+w.width)-5,w.y+w.height/2);
    await expect(page.locator('#room-whisper')).toHaveText('make a wish ♡');
  }
  const cat=await page.locator('#cat-memory-trigger').boundingBox();
  await page.touchscreen.tap(Math.min(390,cat.x+cat.width)-8,cat.y+cat.height/2);
  await expect(page.locator('#cat-memory')).toBeVisible();
  const card=await page.locator('#cat-memory').boundingBox();
  expect(card.x).toBeGreaterThanOrEqual(0);expect(card.x+card.width).toBeLessThanOrEqual(390);
  expect(card.y+card.height).toBeLessThanOrEqual(844);
  await context.close();
});
test('local timezone, storage denied, reduced motion night stays static',async({browser})=>{
  const context=await browser.newContext({timezoneId:'Asia/Tokyo',reducedMotion:'reduce'});
  const page=await context.newPage();
  await page.clock.setFixedTime(new Date('2026-09-16T14:00:00Z'));
  await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('denied');}}));
  await page.goto('http://127.0.0.1:5173');await expect(page.locator('#loading')).toBeHidden();
  await expect(page.locator('#world')).toHaveAttribute('data-room-state','sleeping');
  const pixels=()=>page.locator('#scene').evaluate(c=>c.toDataURL());
  const a=await pixels();
  await page.locator('#night-window').click();await expect(page.locator('#room-whisper')).toHaveText('make a wish ♡');
  await page.locator('#sleeping-hannah').click();
  const b=await pixels();expect(a).toBe(b);
  await context.close();
});
