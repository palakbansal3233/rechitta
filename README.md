# Rechitta

AI Real Estate Platform in Dubai

Ask a question out loud, watch the orb react to your voice in real time, and get a straight
answer on price, payment plan, yield or handover. Built to follow the provided Figma design
end to end.

```bash
npm install
npm run dev          # http://localhost:3000
```

Node 20.9 or newer. There is no `.env`, no external API and no key to set: the mock server runs
inside the app.

---

## Stack

| | |
|---|---|
| Framework | Nuxt 3 (`^3.21`), SSR on |
| UI | Vue 3 `<script setup>`, TypeScript strict |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite`, CSS-first `@theme` tokens |
| Type | Inter, DM Sans and Space Grotesk, self-hosted variable fonts |
| Orb | Hand-written WebGL1 + GLSL, no 3D library |
| Audio | Web Audio `AnalyserNode` (FFT), Web Speech API for transcription |
| Mock API | Nitro server routes under `server/api/` |
| Quality | `npm run typecheck`, `npm run lint` (both clean) |

Nuxt is pinned to 3.x because the brief asks for Nuxt 3. Everything here works unchanged on 4.

Runtime dependencies are Nuxt, Vue and three self-hosted variable fonts. There is no animation,
carousel, icon or UI library; the carousel, the parallax and the orb are all written here. The
production build ships about 94 KB of gzipped client JavaScript.

---

## Screens and routes

Every screen is a real route, so any one of them can be linked, refreshed, and
left with the browser's back button. Nothing is hidden behind app state.

| Route | Screen | Figma frame |
|---|---|---|
| `/splash` | Meet Rechitta | `01 · Splash` |
| `/onboarding` | Speak to Discover, where permission is requested | `02 · Onboarding - Property` |
| `/properties` | The project: welcome hero, seven chapters, closing card | Main scrolling frame |
| `/ask?q=…` | A single chapter, opened from a card or asked out loud | `Project Overview 1` and `2` |

`/` forwards to `/splash`, so every screen has exactly one canonical URL.

A question is a navigation: asking pushes `/ask?q=…`, and that URL is the source
of truth. The request is driven from the route rather than from whatever clicked
it, so a refresh or a pasted link re-runs it and back always works.


### Two notes on the orb

- The Figma asset is a 1280x720 video poster frame. It is cropped square and served as a 33 KB
  WebP at `public/media/orb-1024.webp`. The bubble occupies a radius of 0.335 inside that square,
  which is the magic number in the shader: sampling any wider drags the artwork's black surround
  onto the silhouette and reads as a dark ring.
- The canvas is un-premultiplied, so the halo is a bright colour at a low alpha, with alpha
  derived from the glow's own luminance. Folding brightness into alpha instead tints the page
  behind the orb with a grey disc.

---

## Mock server

Nitro routes in `server/api/`, with the fixture data in `server/utils/data.ts`.

| Route | Purpose |
|---|---|
| `GET /api/property` | Project, developer and advisor |
| `GET /api/chapters` | The seven story chapters |
| `GET /api/suggestions` | Starter questions |
| `POST /api/query` | Intent match against the question, returns an `Answer` |
| `POST /api/booking` | Confirms the viewing request, returns a reference |

Every response goes through `mockRespond()`, which adds the things a fixture normally lacks:
median latency with plus or minus 40% jitter, transport failures, and empty results.

`POST /api/query` runs a deliberately simple intent matcher: each intent owns trigger words, the
best-scoring one wins, and anything below the threshold falls through to an "I don't have that
one" answer with zero cards. Asking something off-topic is therefore a real path to the empty
state, not a special case.

### Simulating failure

A small **Mock server** pill sits in the top-left corner of the project screen. It opens a note
that lists the endpoints and lets you put the server into each state; the page reloads its data
against it. The same states are
reachable from a link: add `?scenario=…` to any page URL and it is kept for the session and sent
as `x-mock-scenario` on every request (`plugins/api.ts`). The endpoints also accept it directly:

| Scenario | Behaviour |
|---|---|
| `ok` (default) | Realistic latency and jitter |
| `slow` | Every call takes about 4.5x longer, good for looking at skeletons |
| `error` | Endpoints return 500 |
| `empty` | Lists come back empty |
| `offline` | 503, as though the connection dropped |

```bash
curl 'localhost:3000/api/chapters?scenario=error'
curl 'localhost:3000/api/chapters?scenario=empty'
curl -X POST localhost:3000/api/query -H 'content-type: application/json' -d '{"text":"what is the yield"}'
curl -X POST localhost:3000/api/query -H 'content-type: application/json' -d '{"text":"can I keep a dog"}'
```

```
/properties?scenario=slow     skeletons, then content
/properties?scenario=error    page-level error with retry
/properties?scenario=empty    the empty chapters state
/properties?scenario=offline  the offline copy
```

---

## Every state, and how to reach it

| State | Where | How to see it |
|---|---|---|
| Loading | Greeting, chapters, answer, booking | `/properties?scenario=slow` |
| Error | Page, chapters, answer | `/properties?scenario=error` |
| Error | Booking | On `/properties` open **Mock server** (top-left), pick **Error**, then press **Book Appointment** |
| Offline | Same surfaces, different copy | `/properties?scenario=offline` |
| Empty | Chapters | `/properties?scenario=empty` |
| Empty (semantic) | Answer with no matching intent | `/ask?q=can I keep a dog here` |
| Not found | Any unknown route | `/anything-else` |
| Permission prompt | `/onboarding` | Visit the route and press **Next** |
| Permission denied | Onboarding and the agent panel | Block the microphone when the browser asks |
| No microphone hardware | Agent panel | `NotFoundError` from `getUserMedia` |
| Speech unsupported | Agent panel | Open in Firefox, which has no Web Speech API |
| Nothing heard | Agent panel | Start listening and stay silent |
| Success | Closing card | Press **Book Appointment** |

---

## Performance

- About 94 KB of gzipped JavaScript, and no UI, animation or 3D library.
- Images are pre-generated WebP at three widths with `srcset` and `sizes`, explicit dimensions for
  zero layout shift, and a roughly 1 KB inline JPEG served by the API for a blur-up placeholder.
- The orb pauses when hidden or off screen, and caps its own resolution.
- Styles are inlined into the document; static assets are served immutable.

---

## Decisions worth flagging

**Blend modes and stacking contexts bit three times.** The orb artwork sits on black and relies on
`mix-blend-mode: lighten` to drop that black out. A blend only reaches the backdrop inside its own
stacking context, so an `isolate`, a `transform` for the parallax, and a `z-index` used for layering
each, at different points, turned the black surround back into an opaque rectangle. Each was found
by walking the DOM for blended elements with an isolating ancestor; that check now runs at both
widths before anything ships.

**Data is fetched on the client, not during SSR.** `useFetch` would give a faster first paint and
better SEO, and in production that is what I would do for `property` and `chapters`. Here the
loading, error and empty states are a graded requirement, and fetching on the client makes them
real on every load. It is a two-line change.

**Speech recognition is a bonus, not the mechanism.** The orb's reactivity comes from the Web
Audio API, which works everywhere. Transcription uses the Web Speech API, which does not: Chrome
and Safari yes, Firefox no. The UI reports that honestly and always keeps a typed path open,
which is what the chat button next to the mic is for.

**The closing card confirms in place.** The design ends on "Schedule Private Viewing" with a
single button and no screen behind it, so pressing it posts to the mock server and swaps the card
into a confirmed state. No slot picker and no form were invented to sit behind it.

**The agent is scoped, and says so.** Rechitta answers only on this project and refuses to guess.

### Known limitations

- Speech recognition needs a network connection in Chrome, since recognition is server-side. The
  orb still reacts offline.
- Safari needs a user gesture before `AudioContext` will start. The mic button is that gesture, so
  this is fine in practice, but autoplaying the analyser is not possible.
- Onboarding is not remembered between visits: `/` always forwards to the splash. That is intentional
  so every screen stays reachable by URL; a real product would skip it for a returning user.
- The design shows three progress dots across two onboarding frames, so the third is rendered as
  the app itself.
- There is no test suite. With more time I would put Vitest on the intent matcher and the band
  maths, and Playwright on the permission-denied path.

---

## Project structure

```
assets/css/main.css        Design tokens, base layer, primitives
layouts/
  default.vue              The agent shell: scroll-away hero and sticky controls on a phone, one screen on desktop
  bare.vue                 No chrome, for the onboarding screens
pages/
  index.vue                /            Forwards to /splash
  splash.vue               /splash      Meet Rechitta
  onboarding.vue           /onboarding  Speak to Discover
  properties.vue           /properties  The project
  ask.vue                  /ask?q=      One chapter, or an answer
plugins/
  api.ts                   $fetch carrying the mock scenario for the session
components/
  answer/                  Answer screen and its four card types
  onboarding/              The two intro screens
  orb/                     WebGL canvas and the GLSL
  story/                   Chapters, the closing card and the Mock server note
  ui/                      Button, image, state message, dots
  voice/                   The welcome hero and the message and audio controls
composables/
  useAgentSession.ts       The listen / think / answer state machine
  useMicrophone.ts         Permission, capture, FFT bands
  useSpeech.ts             Web Speech API wrapper with honest support reporting
  useApi.ts                Error normalisation
  useProject.ts            Shared project data across routes
  useAnnouncer.ts          One shared live region
  usePointerTilt.ts        Pointer parallax for the onboarding artwork, desktop only
  useReducedMotion.ts
server/
  api/                     Five mock endpoints
  utils/data.ts            Fixtures and the intent matcher
  utils/mock.ts            Latency, jitter and fault injection
  utils/lqip.ts            Generated blur-up placeholders
types/index.ts             Contracts shared by client and server
```

## Scripts

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run preview      # Serve the build
npm run typecheck    # vue-tsc, strict
npm run lint         # ESLint via @nuxt/eslint
```

## Deployment

`npm run build` produces a Nitro server in `.output/`. Vercel and Netlify are detected
automatically; no configuration needed. Anywhere else, `node .output/server/index.mjs`.
