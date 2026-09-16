# a little world of your own

Hannah’s 640 × 360 pixel-art room, built with Vite and vanilla JavaScript. No remote runtime services or animation libraries.

## Run

```sh
npm install
npm run dev
npm test
npm run build
```

The development URL is http://localhost:5173. The static build is in `dist/`.

## Local time

`src/room-time.js` reads the browser's local `Date.getHours()`: morning 06–11, day 12–16, evening 17–21, sleeping 22–05. It schedules the next boundary and checks at least every 30 seconds for device clock/timezone changes. Returning to the tab also rechecks. No server clock, visible time display, or mode toggle is used.

`src/main.js` preloads the artwork and composes one room canvas. Lighting fades over 1.6 seconds; changes between awake and sleeping poses use a brief ordered pixel dissolve. Animation uses a separate pauseable clock, integer positions and a frame rate below 30 fps. Hidden tabs suspend rendering. Reduced motion skips movement and transitions and stops the idle loop.

The original sunset artwork remains the evening room. Morning/day variants have natural lighting and an unlit lamp. Night has an illuminated Toronto skyline, moonlight, warm lamps, and a separate sleeping pose on a pillow under the quilt. The envelope, letter data, modal and letter-only logic have been removed.

## Discoveries

- The cat memory remains a single cream stationery card using the supplied childhood-cat asset unchanged. Its night reaction briefly opens one eye; closing and reopening replays it. Keyboard controls and Escape work in every state.
- Sleeping Hannah responds with a short dream whisper and a cooldown without waking. The window creates a stepped shooting star. The first wish message is remembered with `shootingStarMessageSeen`; later stars still work. Storage denial degrades gracefully.
- The shelf plant retains five distinct sprites and its separate calendar-day persistence: `plantFirstVisit`, `plantLastStage`, `plantBloomSeen`. Changing room time never resets growth. Growth waits until the plant is visible; reduced motion reveals the new stage directly.

## Mobile and accessibility

The room covers the viewport without letterboxing. Portrait retains horizontal drag exploration; nighttime framing shifts slightly toward the cat/window while preserving the sleeping face and plant. User-panned positions are retained across time changes. Hotspots stay attached to artwork coordinates, with minimum 44px dimensions. Pointer taps do not trigger keyboard camera framing; keyboard focus brings offscreen controls into view. Dragging across a hotspot never activates it. Memory cards and whispers clamp to the viewport.

## Artwork and verification

- `artwork/source/room-*.png`: generated time-of-day sources and the sleeping idle edit.
- `artwork/PROMPTS.md`: exact prompts and built-in imagegen provenance.
- `public/art/time/`: production room images and registered animation patches.
- `scripts/prepare-time.mjs`: nearest-neighbour preparation and local animation masks.
- `src/night-interactions.js`: nighttime discoveries, cooldowns and wish persistence.
- `src/cat-memory.js`, `src/growing-plant.js`: independent persistent interactions.

`npm run art:prepare` rebuilds production assets from the checked-in sources. Tests cover local-hour boundaries, live 10pm/6am changes, timezones, unchanged memory image, plant progression, night interactions, reduced motion, storage denial, mobile crops/taps/panning, loading failures and hidden-tab suspension. Screenshots are saved in `test-results/`. `node scripts/review-frames.mjs` captures enlarged eyelid frames with the dev server running.
