import sharp from 'sharp';
// Apply only personalized wall decor. The rest of the room remains byte-identical.
const grid=async path=>sharp(path).resize(640,360,{kernel:'nearest'}).png().toBuffer();
const decor=await grid('artwork/source/hannah-decor.png');
const portrait=await grid('artwork/source/hannah-portrait-frame.png');
const sign=await grid('artwork/source/world-sign.png');
const regions=[
  [sign,344,43,145,53], // updated wall sign interior and removed subtitle
  [decor,349,0,104,39], // Hannah name in the former upper landscape-picture area
  [decor,299,0,30,35], // woman and dog, upper frame
  [decor,292,36,29,33], // black cat portrait
  [decor,314,72,21,27], // small black cat portrait
  [portrait,289,72,24,38], // woman and dog, lower portrait frame
];
const layers=[];
for(const [source,left,top,width,height] of regions)layers.push({input:await sharp(source).extract({left,top,width,height}).png().toBuffer(),left,top});
const room=await sharp('public/art/room-grid.png').composite(layers).png().toBuffer();
await sharp(room).toFile('public/art/room-grid.png');
