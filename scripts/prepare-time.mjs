import sharp from 'sharp';
import fs from 'node:fs/promises';
const root = 'public/art/time';
await fs.mkdir(root, { recursive: true });
const grid = path => sharp(path).resize(640, 360, { kernel: 'nearest' }).ensureAlpha().raw().toBuffer();
const original = await grid('public/art/idle/room.png');
const manifest = JSON.parse(await fs.readFile('public/art/idle/manifest.json', 'utf8'));
const clamp = n => Math.max(0, Math.min(255, n));
for (const state of ['morning', 'day', 'sleeping']) {
  const pixels = await grid(`artwork/source/room-${state}.png`);
  await sharp(pixels, { raw: { width: 640, height: 360, channels: 4 } }).png().toFile(`${root}/${state}.png`);
  await fs.mkdir(`${root}/${state}`, { recursive: true });
  // Transfer only the existing local animation differences into the new lighting.
  // This retains the destination frame's colours instead of flashing sunset patches.
  for (const [name, { x, y, w, h }] of Object.entries(manifest)) {
    if (name === 'steam-clean') continue;
    const patch = await sharp(`public/art/idle/${name}.png`).ensureAlpha().raw().toBuffer();
    for (let j=0;j<h;j++) for(let i=0;i<w;i++) {
      const p=(j*w+i)*4, b=((y+j)*640+x+i)*4;
      for(let c=0;c<3;c++) patch[p+c]=clamp(pixels[b+c]+patch[p+c]-original[b+c]);
    }
    await sharp(patch,{raw:{width:w,height:h,channels:4}}).png().toFile(`${root}/${state}/${name}.png`);
  }
  const head = await sharp('public/art/memory/cat-recognition.png').ensureAlpha().raw().toBuffer();
  for(let j=0;j<36;j++) for(let i=0;i<46;i++) {
    const p=(j*46+i)*4,b=((199+j)*640+229+i)*4;
    for(let c=0;c<3;c++) head[p+c]=clamp(pixels[b+c]+head[p+c]-original[b+c]);
  }
  await sharp(head,{raw:{width:46,height:36,channels:4}}).png().toFile(`${root}/${state}/cat-recognition.png`);
}
// Registered nighttime frame: extract small irregular regions only, never the whole idle frame.
const night = await grid('artwork/source/room-sleeping-idle.png');
function inside(x,y,points) {
  let hit=false;
  for(let i=0,j=points.length-1;i<points.length;j=i++) {
    const a=points[i],b=points[j];
    if((a[1]>y)!==(b[1]>y) && x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]) hit=!hit;
  }
  return hit;
}
async function patch(name,x,y,w,h,points) {
  const data=Buffer.alloc(w*h*4);
  for(let j=0;j<h;j++) for(let i=0;i<w;i++) if(inside(x+i+.5,y+j+.5,points)) {
    const b=((y+j)*640+x+i)*4;
    night.copy(data,(j*w+i)*4,b,b+4);
  }
  await sharp(data,{raw:{width:w,height:h,channels:4}}).png().toFile(`${root}/sleeping/${name}.png`);
}
await patch('cat-recognition',229,199,46,36,[[234,201],[245,207],[256,207],[268,201],[271,216],[274,227],[264,232],[240,233],[230,227],[234,215]]);
await patch('cat-ear',234,199,13,15,[[234,199],[245,203],[246,212],[235,213]]);
await patch('blanket-breath',293,186,54,29,[[293,195],[305,186],[323,190],[333,196],[347,209],[338,215],[310,207]]);
console.log('Prepared local-time rooms and registered animation layers.');
