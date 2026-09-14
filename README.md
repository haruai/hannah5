# a little bouquet for you ♡

An interactive pixel-art bedroom with a 640 × 360 virtual canvas. Built with Vite and vanilla JavaScript, without animation libraries, remote runtime services, or game UI.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:5173. `npm run build` creates the static site in `dist/`; `npm run preview` previews it.

## Personalize the letter

Edit **public/letter.json**. `title`, `paragraphs`, and `signature` are rendered as plain text. The letter contains the supplied personal message.

## Living scene

The existing room composition and black cat are preserved. Most of the illustration is static. Registered, irregularly masked patches swap at fixed integer coordinates; no whole-character movement, rectangular distortion, or runtime artwork warping is used.

- Eyes: open → half → closed → half → open in 310 ms, every 4–8 seconds; occasional double blink.
- Breathing: independently timed 3.6–4.9 second cycles for shoulder fabric and cat chest. Faces, hands, paws, mattress contact and shadows remain fixed.
- Local details: a loose hair lock, one vine leaf, one blossom cluster, a tulip, a ribbon tail, and a rare sleeping ear twitch, each with its own schedule.
- Steam: five discrete frames in two variants, with varying cycle durations. Baked-in steam is removed only from the mug's immediate background.
- Window: isolated city lights and three tiny water glints. One drifting petal at a time, with 4–15 seconds of quiet after it disappears. The sunset stays unchanged.
- Bouquet: occasional single sparkle. One extra sparkle after the first letter close.
- Envelope: only the heart seal responds on hover/touch or gives a brief idle pulse every 8–15 seconds, until opened. The envelope and its shadow stay on the bed.

Timings use a pauseable scene clock and independent random deadlines. Rendering is capped below 30 fps. Hidden tabs stop the scene and pause paper animations; reduced motion uses a static image, stops the idle render loop, and opens/closes the letter immediately. All scene patches decode before the loading screen disappears.

## Letter interaction

Ten integer-rasterized envelope frames show seal release, flap opening and rising paper. The paper unfolds from the envelope's screen location; the complete opening takes approximately 1.2 seconds. Closing folds the paper back and reverses the envelope frames in approximately 0.65 seconds.

Close with ×, outside click, or Escape, including during opening. Keyboard focus returns to the envelope. Letter content scrolls on small screens.

Desktop framing is preserved. Below 1024px, the camera uses full-viewport cover sizing with separate mobile, small-mobile and tablet modes. Portrait starts on Hannah and the envelope, with the cat’s head at the left edge. Drag horizontally to explore the cat or bouquet. This preserves the original artwork proportions without letterboxing or rearranging the room. Landscape uses a wide crop. The viewport tracks dynamic mobile browser chrome with `100dvh`.

## Artwork and source

- `artwork/source/`: original generated artwork and animation edit sources.
- `artwork/PROMPTS.md`: exact prompts and built-in imagegen provenance.
- `public/art/idle/`: production room, transparent local patches and coordinate manifest.
- `scripts/prepare-art.mjs`: base 640 × 360 art, registered black cat edit and eye crops.
- `scripts/prepare-decor.mjs`: Hannah’s wall name and supplied portrait artwork, applied only to selected wall regions.
- `scripts/prepare-idle.mjs`: fixed-coordinate masks, steam cleanup and idle assets.
- `src/idle.js`: independent schedules, events and breathing/frame selection.
- `src/sprites.js`: authored pixel matrices and integer-rasterized envelope, steam, petal and sparkle frames. These are created once before rendering.
- `src/camera.js`: responsive cover framing, bounded horizontal portrait panning, keyboard focus framing and viewport resize handling.
- `src/main.js`: preload, canvas composition, scene clock and letter lifecycle.

Regenerate production artwork with `npm run art:prepare` after editing sources. Generated edits are cropped and masked; unselected room pixels are preserved.

## Verification

```sh
npx playwright install chromium # only if Chromium is missing
npm test
npm run build
```

Browser tests cover a real 20-second desktop run, localized motion, event timing, loading/errors, desktop/mobile opening and closing, touch, keyboard focus, interrupted openings, first-close behavior, reduced motion changes, and hidden-tab suspension. Review screenshots and a recorded desktop video are written to `test-results/`.

With the dev server running, `node scripts/review-frames.mjs` also captures enlarged eyelid frames and letter sequence screenshots for visual inspection.

## Childhood cat memory

The sleeping cat has an invisible, keyboard-accessible hit area. Hover gives one tiny heart and a local breathing lift; clicking or tapping plays a 1.32-second ear/head/blink/heart sequence, then reveals a single cream memory card. Its placement avoids the face, bouquet, envelope and wall portraits, and clamps to the viewport. The close control and Escape restore focus; closing then clicking again replays the sequence. Opening the letter dismisses the memory and disables its hit area until the letter closes.

`src/cat-memory.js` and `src/cat-memory.css` contain this feature. It uses the existing scene clock, pixel heart and ear/chest patches. Reduced motion immediately reveals the card. `public/art/memory/childhood-cat.png` is the supplied artwork copied byte for byte; it is not regenerated. `scripts/prepare-memory.mjs` extracts only the separate scene-cat recognition frame. Tests cover source-image integrity, desktop replay, mobile tapping/placement, reduced motion, focus and letter coexistence.

Mobile camera checks include 390 × 844, 393 × 852, 430 × 932, landscape, tablet and desktop. Hotspots use artwork-relative percentages with 44px minimum tap dimensions. The mobile letter uses 92% viewport width and at most 88dvh, scrolling internally. Dragging across a hotspot does not activate it.
