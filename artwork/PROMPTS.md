# Production artwork provenance

Tool: built-in `image_gen.imagegen` (not the CLI/API fallback).
Reference: user-supplied `a5d7660d-7e54-45f2-ad47-24b7e8f587b3.png`.

## Room — source/room.png

Create production pixel art bedroom environment asset for interactive website, using attached image as master reference. Output only the upper room illustration as a wide landscape 16:9 image, no reference-sheet panels or border or labels below. Recreate room composition and character extremely closely: sunset Toronto window left, cherry blossoms, pink quilt bed, girl center lying chin in hands long brown hair dark sweater feet raised white socks, sleeping calico to left, huge pink tulip rose bouquet right with pink wrapping tag for you heart, lamp matcha plants books right. Wall frame text exactly 'a little bouquet\nfor you ♡' and below 'just a little something i made for you :)'. CRITICAL remove the envelope AND the small prompt below it entirely, leave uninterrupted pink quilt in that region in front of girl for runtime interactive envelope sprite. Keep girl and cat and flowers in environment for perfect contact shadows; facial animation will be separate overlays. Crisp true pixel art on consistent approximately 640x360 virtual grid. Restrained highly detailed gorgeous warm peach pink sunset lighting, dark plum outlines. No smooth anime, no UI. Entire output is room illustration, no swatches or sprite examples.

## Closed blink — source/blink-closed.png

Precise object edit of supplied pixel-art room. Keep entire image EXACTLY identical in composition dimensions colors and every pixel possible. Change ONLY the girl's eyes to gently CLOSED eyes mid blink, natural soft curved dark lash lines, warm peach skin eyelids. Her head, face outline, nose, mouth, hands, hair, surroundings must stay exactly same size position shape. Do not redraw rest of room. Output same full 16:9 room image with only closed eyes changed. This is a registered blink animation frame.

## Half blink — source/blink-half.png

Precise edit for registered sprite animation. Maintain this entire image identically. Change ONLY girl's eyes to half-closed, midway through a blink. Upper eyelids cover top half of brown irises, soft expression. Preserve exact head position, eye position, colors, lighting, nose, mouth, outline, hands, hair and every other area of room. Output same full room and dimensions. Do not change anything else.

Only the registered eye patches from the blink images ship to browsers; the rest of each generated variant is discarded from runtime composition. The runtime envelope, steam, sparkles, and petals are code-native pixel sprites.

## Black cat edit — source/black-cat.png

Tool: built-in `image_gen.imagegen`. Edit reference: `source/room.png`.

Precise localized artwork edit: change ONLY the sleeping calico cat on the bed beside the girl into an entirely BLACK CAT. Preserve exactly the cat's sleeping curled pose, closed eyes, cute face, ears, paws, outline, size, location, contact shadow and pixel density. Fur must be black/very dark charcoal with subtle plum shading and warm sunset rim highlights; no white or orange fur patches. Maintain the pink nose and readable closed eyes. CRITICAL keep EVERY OTHER part of this room image exactly unchanged, including girl, her face, bed, bouquet, text, furniture, window, composition, dimensions and lighting. This is a registered game environment so absolutely no repositioning or redesign. Output the same full image with only the cat's fur coloration edited.

Only the registered 95 × 38 cat region is applied to the original room grid. `public/art/cat.png` is extracted from this updated composition, keeping the breathing and ear animation consistent.

## Inhale and local details — source/idle-inhale.png

Tool: built-in `image_gen.imagegen`. Reference: `source/black-cat.png`.

Registered idle animation frame edit of attached pixel-art bedroom. Preserve composition, girl identity, face position and open eyes, feet, all furniture, text, bouquet structure, black sleeping cat. Output identical dimensions full room. ONLY tiny localized changes for inhale frame: girl's sweater shoulder fabric at lower left and right of her face rises ONE virtual pixel (~2-3 actual image pixels), face hands elbows and all mattress contact points fixed. Black cat's upper back/chest silhouette expands upward ONE virtual pixel, head paws belly contact stay fixed. Two loose outer hair strands on window side change curvature by ONE virtual pixel, rest of hair fixed. One tulip at far left of bouquet tips one pixel, one small ribbon tail at lower right bends one pixel, one dangling plant leaf near window tips one pixel, one small cherry blossom cluster near upper left window shifts one pixel. No global changes. Pixel-art matching exact palette shadows outlines. No whole-object movement. Do not change eye expression, skin, letters, skyline, room lighting. This must be a nearly identical sprite frame with restrained local handdrawn changes.

## Ear twitch and clean steam region — source/idle-ear-steam.png

Tool: built-in `image_gen.imagegen`. Reference: `source/black-cat.png`.

Registered pixel-art room animation asset edit. Keep attached scene perfectly identical in dimensions, composition, color, girl and all objects. Change ONLY two tiny areas: (1) sleeping BLACK CAT's upper left ear (the ear nearer girl raised foot) tilts inward by ONE virtual pixel for a tiny sleeping ear twitch. Cat eyes stay shut, fur black, face body paws pose unchanged. (2) REMOVE ALL steam above matcha mug at bottom right (approximately x1460-1520 y560-640 in this 1672x941 image), reconstruct the exact wooden table/background behind it. Leave mug rim and mug itself exactly unchanged. Steam will be separate animated sprites later. Preserve warm palette and exact pixel density. No other edits or movement anywhere. Output same full room image.

`prepare-idle.mjs` selects irregular local regions from these edits and emits transparent fixed-coordinate patches. Neither generated frame replaces the room. Only the cleaned steam region is applied to the resting background. Eyelid masks exclude eyebrows and cheeks. The code-native sprites in `src/sprites.js` are rasterized with integer scanlines and Bresenham edges, avoiding antialiased vector edges.

## Hannah wall decor — source/hannah-decor.png

Tool: built-in `image_gen.imagegen`. Edit target: `source/black-cat.png`. Insert references: user-supplied `Codex Image Sep 13, 2026, 07_20_30 PM.png` (woman with golden dog) and `Codex Image Sep 13, 2026, 07_21_21 PM.png` (black cat).

Precise personalized decor edit of IMAGE 1 bedroom. IMAGE 1 is exact room edit target, IMAGE 2 is supplied portrait artwork of woman in striped shirt with golden dog for photo-frame contents, IMAGE 3 is supplied black cat portrait for photo-frame contents. Keep entire bedroom composition EXACTLY unchanged: sleeping girl, black sleeping cat, bouquet, furniture, window, bed, lighting, main large wall sign text, shelves. Change ONLY framed wall decor: replace the small portrait frame directly LEFT of the large 'a little bouquet for you' wall sign (near x760 y200) with a miniature of IMAGE 2, preserving recognizable striped top, brown hair and golden dog. Replace its neighboring small frame (near x824 y195) with a miniature of IMAGE 3 black cat with yellow/green eyes. Also replace the upper small city picture at x770 y95 with IMAGE 2. Keep frames physically mounted and their shapes positions perspective same, tint photos naturally with room pink sunset light, match exact pixel grid. Add name exactly 'Hannah ♡' in delicate warm pink pixel-neon handwriting on the upper wall ABOVE the large main sign, centered around x1070 y46. May replace the two small top-center landscape pictures occupying that name region to make room for the name; do not move the main wall sign or other furnishings. No 'Haru' anywhere. No annotations, arrows, example panels or UI. Output exact same room dimensions and framing. Tiny targeted edits only; everything else must be identical.

## Lower portrait refinement — source/hannah-portrait-frame.png

Tool: built-in `image_gen.imagegen`. Edit target: `source/hannah-decor.png`; insert reference: supplied woman-and-dog artwork.

Precise single frame content edit. Image 1 is room target; image 2 is artwork to insert. ONLY replace the flower illustration inside the tall narrow wall frame at x760..813 y196..284 (left of the large main wall sign, below the black cat framed portrait) with a miniature version of Image 2, showing brown-haired woman in striped shirt looking down at golden dog. Fill this frame interior with that supplied artwork, preserving frame wooden border, size, perspective and lighting. Do not put flowers in this frame. Keep the name 'Hannah ♡', all other frames, whole room, girl's face, sleeping black cat, bouquet, dimensions and EVERY other pixel unchanged. Same full room output dimensions. Exact single frame content replacement only.

`prepare-decor.mjs` applies only five registered wall regions before idle assets are compiled. Animated regions do not overlap this decor. The production composite is `public/art/idle/room.png`.

## Cat recognition — source/cat-recognition.png

Tool: built-in `image_gen.imagegen`. Reference: `source/black-cat.png`. This edit is used only for the room cat’s animation; the memory photograph is the unmodified user-supplied image.

Create a registered pixel-art animation frame from this exact bedroom. Change ONLY the small sleeping black cat on bed: its head rises by just ONE virtual pixel (2-3 source pixels) and its eyes gently open halfway, showing tiny muted golden eyes in a sleepy friendly recognition expression. Keep its black fur, pink nose, cute facial proportions, head size, curled body and paws completely unchanged. Keep every other room pixel identical. No large movement, no sitting up. Head region is around x600-716 y530-608 in 1672x941 image. Preserve all original bed and cat contact shadows and warm sunset lighting. Output identical full room dimensions; only tiny cat head/eyelid alteration. This is a sprite frame, not a redesign.

The local head patch is saved to `public/art/memory/cat-recognition.png`. The memory photograph is copied directly from the supplied `Codex Image Sep 13, 2026, 07_21_21 PM.png` to `public/art/memory/childhood-cat.png`.

## Main wall sign wording — source/world-sign.png

Tool: built-in `image_gen.imagegen`; reference: `source/hannah-decor.png`.

Precise text replacement edit. Change ONLY lettering INSIDE the large rectangular framed wall sign near upper center-right (x895..1285 y100..267). Replace 'a little bouquet for you ♡' with exact lowercase text 'a little world\nof your own' arranged as two balanced centered lines, in the SAME dark dusty-plum pixel lettering style and size. Remove the smaller subtitle 'just a little something i made for you :)' entirely, restoring plain pink sign paper beneath. No subtitle or heart after the new wording. Keep delicate flower ornaments at side edges of frame, same wooden frame, sunset shadows, perspective, pink paper. Keep 'Hannah ♡' above sign exactly unchanged. Do not change any other pixel, cat, girl, flowers, furniture, photos or lighting. Output same full image dimensions. Only change this sign interior text.

Only the registered sign interior at (344,43), size 145 × 53, is applied by `prepare-decor.mjs`. Production composite: `public/art/idle/room.png`.

## Quiet growing plant — source/plant-stages.png

Tool: built-in `image_gen.imagegen`. Style reference: `public/art/idle/room.png`.

Production sprite sheet on genuinely TRANSPARENT background. Reference image is STYLE AND PALETTE ONLY, do not reproduce room. One horizontal strip of FIVE distinct tiny potted plant growth sprites, equal-width cells, same baseline, pot identical size and position in every cell. Each sprite designed for a 24x32 pixel cell in a 16-bit cozy pixel-art game. Hard crisp square pixels, dark plum outlines, muted dark olive/green leaves, warm peach highlights from left, tiny dusty pink ceramic pot with rim and soft mauve shadow, matching reference palette exactly. Stages left to right: 1 very small sprout with two tiny leaves; 2 slightly taller stem with 4 leaves; 3 healthy fuller plant with 6 leaves; 4 fuller mature foliage with ONE closed small pink bud at top; 5 same mature foliage with ONE small open pink flower at top. Growth from stage1 height14pixels to stage5 height28pixels, pot consistently10pixels wide7pixels high. No labels, numbers, UI, text, floor, background, shelf, glow or shadows outside sprites. Five sprites ONLY, evenly spaced in one row. Native pixel-art design, not smooth illustration. Keep stage5 foliage modest, not bushy dominant. Transparent pixels around each separate sprite; do not draw a checkerboard.

Five separate transparent production sprites are registered by their pot anchors and saved as `public/art/plant/stage-1.png` through `stage-5.png`. The tiny supporting shelf is drawn on the same integer pixel grid at runtime.


## Local-time room variants (built-in imagegen)

Edit target for day and sleeping: `public/art/idle/room.png`. Morning uses `artwork/source/room-day.png`; sleeping idle uses `artwork/source/room-sleeping.png`. Outputs are saved under `artwork/source/room-*.png` and prepared in `public/art/time/` by `scripts/prepare-time.mjs`. The current evening scene is retained.

### sleeping

Use case: precise-object-edit. Edit target: attached existing 640x360 pixel game bedroom, retain exact composition, framing, camera and ALL furniture/object positions. Create a registered nighttime variant of this SAME room, 16:9. True 16-bit pixel art, crisp pixels. Change outside the window to deep navy violet night sky, Toronto CN Tower and illuminated skyline in exactly existing positions, small moon high in open sky, a few tiny stars, dark water reflections. No sun. Cool blue-violet shadows throughout room, warm amber bedside lamp and fairy lights ON, neon Hannah heart slightly dimmer, roses remain legible. Major required pose change: same brown-haired young adult Hannah now asleep lying comfortably sideways, her head on a pale pink pillow approximately centered at x340 y184 on 640x360 grid, closed eyes, relaxed face, hair spread on pillow. Her body extends left under the existing pink quilt, remove the raised feet and original hand-supported awake head completely. Keep her face visible around original girl area, no girl farther right into bouquet. Pink blanket covers her body, quilt remains natural. The black cat stays in EXACT current x179..274 y197..235 area, curled up with closed eyes beside her. Keep bouquet, pictures, name, sign reading "a little world of your own", desk, window frames, lamp, bedding and all other objects precisely registered and recognizable. Bed has NO envelope, letter, extra text, UI, or new decoration. Do not zoom, shift, redesign or enlarge anything. Return only finished artwork.

### day

Use case: lighting-weather. Edit target attached existing 640x360 pixel game bedroom. Make a registered daytime version of exactly this image. Preserve every character pose and all object positions and framing exactly. Change sunset outside to clear bright blue daytime sky with soft small pale clouds, Toronto CN Tower skyline visible at same positions, blue water with daylight reflections. NO sun disk. Change lighting to natural daylight, cooler shadows and less orange/pink, cozy pink bedding still pink. Right bedside lamp OFF (cream unlit lampshade), fairy lights OFF. Hannah and black cat unchanged same exact position and pixel style. Keep wall pictures and exact name Hannah and sign "a little world of your own". No envelope, UI, labels, extra objects. Crisp 16-bit pixel artwork at same 16:9 composition. Return only artwork.

### morning

Use case: lighting-weather. Edit target attached DAY bedroom, preserve the EXACT framing, positions, character and every pixel-art object. Make it early morning: pale blue sky with soft peach pink light near horizon, gentle clouds, same Toronto skyline and water. Peaceful soft natural light, slightly cooler shadows, pink quilt, plants fresh. Bedside lamp and fairy lights OFF as in reference. Same awake lounging Hannah and sleeping black cat, absolutely no change to their poses, shapes, eyes or positions. Same crisp 16-bit art. Keep all pictures, exact text and furniture. No envelope or new objects. Only change morning lighting and sky.

### sleeping-idle

Use case: precise-object-edit. Edit target attached sleeping bedroom game artwork. Create a single registered animation frame. Preserve every pixel and ALL positions except two TINY local changes: (1) a small section of pink blanket over sleeping Hannah's left shoulder/chest around x302..336 y190..211 of a 640x360 grid lifts by ONE pixel as she inhales; eyes stay closed, head remains resting on pillow at same place. (2) the black cat at x179..274 y197..235 twitches its left ear ONE pixel, and opens JUST ONE eye to a tiny sleepy amber slit, other eye stays closed, slightly annoyed sleepy expression. No moving the cat head more than ONE pixel. Keep all surrounding room lighting, night sky, objects, girl identity, palette, blanket and composition unchanged. No new objects or text. This is a nearly identical frame for a subtle 16-bit animation.
