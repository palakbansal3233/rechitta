<script setup lang="ts">
/**
 * Frame "02 · Onboarding". Lives at `/microphone`.
 *
 * Built to the Figma measurements on a 400px frame. The vertical rhythm is
 * given: 48 from the top, heading, 18, paragraph, 48, label, 11, orb. That
 * lands the orb at y=313 in the frame, which is where the design puts it.
 *
 * The chips are decorative. Only the first one's geometry is specified; the
 * rest are placed to match the arrangement in the design, as proportions of
 * the orb block so they travel with it at any width.
 */
const emit = defineEmits<{ granted: []; skipped: [] }>()

const SCREEN_LABEL = 'Microphone access'
const mic = useMicrophone()

/* The orb leans toward the cursor; the chips ride a little further, so the
   two read as separate planes rather than one flat picture. */
const tilt = usePointerTilt()
const { announce } = useAnnouncer()

const requesting = ref(false)
const notice = ref<string | null>(null)

/** left/top are percentages of the orb block, so they scale with it. */
const CHIPS = [
  { text: 'Is there a 2-bed available…', left: '18.4%', top: '6.2%', angle: '-3.74deg' },
  { text: "What's the price history?", left: '37.25%', top: '29%', angle: '-2.6deg' },
  { text: 'What is proximity to good schools', left: '7.75%', top: '47.6%', angle: '-3.2deg' },
  { text: 'Show me the floor plan', left: '43.25%', top: '71.3%', angle: '-2.1deg' },
  { text: 'How does the payment plan work…', left: '21.75%', top: '90.9%', angle: '-3.4deg' },
]

onMounted(() => void mic.probe())

async function enableMic() {
  requesting.value = true
  notice.value = null
  const ok = await mic.request()
  requesting.value = false
  if (ok) {
    mic.release()
    emit('granted')
    return
  }
  notice.value = mic.errorMessage.value
  announce(notice.value ?? 'Microphone unavailable.')
}
</script>

<template>
  <div
    class="screen bg-ink-1000"
    role="region"
    :aria-label="SCREEN_LABEL"
  >
    <!-- Background glows, supplied artwork. The side glow peaks at its own
         right edge, so it is anchored right: the bright point lands on the
         screen edge rather than as a seam in the middle. -->
    <img
      src="/media/glow-top.webp"
      alt=""
      width="400"
      height="500"
      aria-hidden="true"
      class="screen__glow pointer-events-none absolute left-1/2 top-0 h-auto w-[max(100vw,25rem)] max-w-none -translate-x-1/2"
    >
    <img
      src="/media/glow-side.webp"
      alt=""
      width="303"
      height="506"
      aria-hidden="true"
      class="screen__glow pointer-events-none absolute bottom-0 right-0 h-auto w-[max(76vw,19rem)] max-w-none"
    >

    <div class="screen__shade" aria-hidden="true" />

    <div class="screen__copy relative">
      <h1 class="text-center text-[1.75rem] font-normal leading-none text-white lg:text-left lg:text-[clamp(2.25rem,3.4vw,3.5rem)] lg:leading-[1.06]">
        Speak to Discover
      </h1>

      <p
        class="mx-auto mt-[18px] w-[14.875rem] text-center text-[0.875rem] font-light leading-[1.375rem] text-[#A3A3A3] lg:mx-0 lg:mt-6 lg:w-full lg:max-w-[28rem] lg:text-left lg:text-[1.0625rem] lg:leading-[1.7]"
      >
        Allow microphone access to search properties naturally, just as you would speak to an agent.
      </p>

      <p
        class="mx-auto mt-[48px] w-[10rem] text-center text-[0.75rem] font-normal uppercase leading-[1.25rem] tracking-[1px] text-white lg:mx-0 lg:mt-9 lg:w-auto lg:text-left"
      >
        You can ask Rechitta anything
      </p>

      <!-- Orb and chips. Full-bleed within the frame: the orb sits 6px from
           each edge in the design, so this block breaks the page gutter. -->
    </div>

    <div ref="tilt" class="screen__art orb-block mt-[11px]">
        <img
          src="/media/orb-chips.webp"
          alt=""
          width="400"
          height="316"
          aria-hidden="true"
          fetchpriority="high"
          class="orb-art absolute left-[1.5%] top-0 w-[97%] mix-blend-lighten opacity-[0.64]"
        >

        <span
          v-for="chip in CHIPS"
          :key="chip.text"
          class="chip absolute inline-flex w-max items-center rounded-[16px_16px_16px_2px] border border-[#FFFFFF0D] bg-[#2A2A2A66] px-4 py-2.5 text-[0.75rem] font-medium leading-4 text-[#F3F4F6E5] backdrop-blur-[12px]"
          :style="{ left: chip.left, top: chip.top, '--chip-angle': chip.angle }"
        >
          “{{ chip.text }}”
        </span>
      </div>

    <div class="screen__aside">
      <!-- Privacy note -->
      <div
        class="mt-[79px] flex gap-3 rounded-lg border border-[#FFFFFF0D] bg-[#2A2A2A66] p-3 backdrop-blur-[4px] lg:mt-0"
      >
        <svg
          class="mt-0.5 size-3.5 shrink-0"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M6.56251 0C6.68829 0 6.81407 0.0273437 6.92892 0.0792969L12.0777 2.26406C12.6793 2.51836 13.1277 3.11172 13.125 3.82812C13.1113 6.54063 11.9957 11.5035 7.28439 13.7594C6.82775 13.9781 6.29728 13.9781 5.84064 13.7594C1.12931 11.5035 0.0136843 6.54063 1.24373e-05 3.82812C-0.00272194 3.11172 0.445716 2.51836 1.04728 2.26406L6.19884 0.0792969C6.31095 0.0273437 6.43673 0 6.56251 0ZM6.56251 1.82656V12.1625C10.3359 10.3359 11.3504 6.2918 11.375 3.86641L6.56251 1.82656Z"
            fill="white"
          />
        </svg>
        <p class="text-[0.8125rem] leading-5 text-[#9CA3AF]">
          Your voice data is processed securely and never stored without your explicit permission.
          <a
            href="https://www.rechitta.com/privacy"
            class="block text-[0.75rem] leading-5 underline underline-offset-2"
          >
            Privacy Policy
          </a>
        </p>
      </div>

      <UiStateMessage
        v-if="notice"
        tone="error"
        compact
        class="mt-4 text-left"
        title="Microphone unavailable"
        :body="notice"
      />
    </div>

    <!-- Footer, identical to the splash screen -->
    <div class="screen__footer relative flex items-center justify-between gap-4">
      <UiAppButton variant="ghost" size="sm" class="-ml-3 whitespace-nowrap" @click="emit('skipped')">
        Skip
      </UiAppButton>

      <UiProgressDots :total="3" :current="0" label="Introduction progress" />

      <UiAppButton
        variant="brand"
        class="h-11 w-[6.25rem] gap-2 p-3"
        :loading="requesting"
        @click="enableMic"
      >
        Next
        <svg class="size-4 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
          <path d="M4 10h11m0 0-4-4m4 4-4 4" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </UiAppButton>
    </div>

    <!-- Contour art. Sits above everything as it does in the file, with the
         blend mode and opacity moved onto the element so it composites with
         the page rather than only within the SVG's own stacking context. -->
    <img
      src="/media/lines-mic.svg"
      alt=""
      width="400"
      height="727"
      aria-hidden="true"
      class="pointer-events-none absolute left-1/2 top-0 h-auto w-[max(100vw,25rem)] max-w-none -translate-x-1/2 mix-blend-color-dodge opacity-[0.09]"
    >
  </div>
</template>

<style scoped>
.screen {
  position: relative;
  display: flex;
  min-height: 100svh;
  flex-direction: column;
  overflow: hidden;
}

.screen__copy,
.screen__aside,
.screen__footer {
  width: 100%;
  max-width: 25rem;
  margin-inline: auto;
  padding-inline: 1.5rem;
}

.screen__copy {
  padding-top: max(3rem, env(safe-area-inset-top) + 1rem);
}

.screen__footer {
  margin-top: auto;
  padding-top: 1.5rem;
  padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
}

/* The design's 79px sits above the privacy note. Below about 824px of viewport
   the frame does not fit, so that gap absorbs the shortfall down to 40px rather
   than the screen scrolling by a few pixels. Desktop keeps its own value. */
@media (max-width: 63.999rem) {
  .screen__aside > div:first-child {
    margin-top: clamp(2.5rem, 100svh - 745px, 79px);
  }
}

/*
 * The orb sits 6px from each frame edge, so this block spans the full frame
 * rather than the gutter. Its aspect ratio holds the design's 400x307, which
 * lets every chip be placed as a percentage and scale with it.
 */
.orb-block {
  position: relative;
  aspect-ratio: 400 / 307;
}

.screen__art {
  width: 100%;
  max-width: 25rem;
  margin-inline: auto;
}

/*
 * The lean is applied to the artwork itself, never to a wrapper around it. A
 * transformed ancestor is a stacking context, and mix-blend-mode only reaches
 * the backdrop inside its own context, so wrapping this would strand the orb's
 * black surround as an opaque rectangle instead of letting it drop out.
 */
.orb-art {
  transform: perspective(1200px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))
    translate3d(var(--tilt-dx, 0), var(--tilt-dy, 0), 0);
  will-change: transform;
}

/* The chips sit on a nearer plane, so they travel further than the orb. */
.chip {
  transform: rotate(var(--chip-angle))
    translate3d(calc(var(--tilt-dx, 0px) * 0.45), calc(var(--tilt-dy, 0px) * 0.45), 0);
}

.screen__shade {
  display: none;
}

/* Desktop: the ask on the left, the orb and its questions holding the right. */
@media (min-width: 64rem) {
  /* An even darkening across the whole screen, not a pool behind the orb.
     The supplied glows are teal, and spread over a wide viewport they cast the
     page green, so they are pulled back here and the room goes black. */
  .screen__shade {
    position: absolute;
    inset: 0;
    display: block;
    pointer-events: none;
    background: rgb(0 0 0 / 0.58);
  }

  .screen__glow {
    opacity: 0.45;
  }

  /*
   * Order here comes from the DOM, not from z-index. The shade sits after the
   * glows and before the content, and every one of these is positioned, so
   * they already paint on top of it. Giving them a z-index would make each one
   * a stacking context, and the orb's mix-blend-mode cannot reach a backdrop
   * outside its own context: the black surround would stop dropping out.
   */
  .screen__copy,
  .screen__art,
  .screen__aside,
  .screen__footer {
    position: relative;
  }

  .screen {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.08fr);
    grid-template-rows: auto auto auto;
    align-content: center;
    column-gap: clamp(2rem, 5vw, 5rem);
    padding: clamp(2rem, 5vh, 4rem) clamp(2.5rem, 6vw, 6rem);
  }

  .screen__copy,
  .screen__aside,
  .screen__footer,
  .screen__art {
    max-width: none;
    margin-inline: 0;
    padding-inline: 0;
  }

  .screen__copy {
    grid-area: 1 / 1;
    max-width: 32rem;
    padding-top: 0;
  }

  .screen__aside {
    grid-area: 2 / 1;
    max-width: 26rem;
    margin-top: 2.25rem;
  }

  .screen__footer {
    grid-area: 3 / 1;
    max-width: 26rem;
    margin-top: 2.5rem;
    padding-top: 0;
    padding-bottom: 0;
  }

  .screen__art {
    grid-area: 1 / 2 / 4 / 3;
    align-self: center;
    margin-top: 0;
  }
}
</style>
