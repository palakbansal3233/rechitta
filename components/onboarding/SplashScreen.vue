<script setup lang="ts">
import type { Property } from '~~/types'

/**
 * Frame "01 · Splash". Lives at `/`, so it is always reachable by URL.
 *
 * On a phone this is the Figma frame exactly: a 400px column on 24px margins,
 * everything centred, and every vertical gap a given value rather than a guess:
 *
 *   headline  120  (three 40px lines)
 *   gap        15
 *   paragraph  72  (three 24px lines)
 *   gap        59
 *   mark      163
 *   gap        95
 *   card       95
 *
 * which lands the card at y=628, exactly where the design puts it.
 *
 * From 64rem it becomes an editorial split rather than that column stretched:
 * the type runs down the left at a size a wide screen can carry, and the mark
 * holds the right half on its own with the glow bleeding off the edge. The
 * four blocks are siblings so the grid can place them, which is why the mark
 * is not nested inside the copy.
 */
defineProps<{ property: Property | null; pending: boolean }>()

const SCREEN_LABEL = 'Meet Rechitta'

/* The mark leans toward the cursor on a wide screen. */
const tilt = usePointerTilt()
</script>

<template>
  <div class="splash bg-ink-1000" role="region" :aria-label="SCREEN_LABEL">
    <div class="splash__copy text-center lg:text-left">
      <p class="text-[1.25rem] font-thin leading-[2.5rem] text-white lg:mb-1 lg:text-[1.5rem] lg:leading-none">
        Meet
      </p>
      <h1 class="text-[1.75rem] leading-[2.5rem] text-white lg:text-[clamp(2.75rem,4.4vw,4.5rem)] lg:leading-[1.04]">
        <span class="block font-bold">Rechitta</span>
        <span class="block font-normal">Your AI Agent</span>
      </h1>

      <p
        class="mx-auto mt-[15px] max-w-[20.875rem] text-[0.875rem] font-light leading-[1.5rem] text-[#A3A3A3] lg:mx-0 lg:mt-7 lg:max-w-[30rem] lg:text-[1.0625rem] lg:leading-[1.75]"
      >
        She guides your investment journey, answers your questions into a conversation, honest
        answers, plain language, no sales pitch.
      </p>
    </div>

    <!-- The mark, with its glow behind it. Both are supplied artwork. -->
    <div ref="tilt" class="splash__art tilt relative mb-[95px] mt-[59px] flex justify-center lg:m-0">
      <img
        src="/media/glow.webp"
        alt=""
        width="400"
        height="841"
        aria-hidden="true"
        class="pointer-events-none absolute left-1/2 top-1/2 h-auto w-[max(100vw,25rem)] max-w-none -translate-x-1/2 -translate-y-1/2 lg:w-[max(52vw,40rem)]"
      >
      <img
        src="/media/glass-r.webp"
        alt=""
        width="498"
        height="513"
        fetchpriority="high"
        class="relative h-auto w-[45%] motion-safe:animate-[float_7s_ease-in-out_infinite] lg:w-[min(100%,32rem)]"
      >
    </div>

    <div class="splash__card">
      <div v-if="pending" class="skeleton min-h-[95px] rounded-lg" />
      <div
        v-else-if="property"
        class="relative flex min-h-[95px] items-center gap-2 rounded-lg bg-[#171717] px-4 py-3 text-left"
      >
        <span class="absolute -right-1 -top-1 size-4 rounded-full bg-[#FF3A3A]" aria-hidden="true" />
        <img
          :src="`${property.advisor.avatar}-160.webp`"
          :alt="`Portrait of ${property.advisor.name}`"
          width="160"
          height="160"
          class="size-14 shrink-0 rounded-full object-cover"
        >
        <span class="min-w-0">
          <span class="block truncate font-display text-[1.125rem] leading-none text-white">
            {{ property.advisor.name }}
          </span>
          <span class="mt-1 block truncate text-[0.6875rem] leading-[1.125rem] text-[#A1A1A1]">
            {{ property.advisor.company }} · {{ property.advisor.role }}
          </span>
          <span class="mt-2 block text-[0.6875rem] italic leading-[1.125rem] text-white">
            1 new note for you
          </span>
        </span>
      </div>
    </div>

    <div class="splash__footer flex items-center justify-between gap-4">
      <UiAppButton variant="ghost" size="sm" class="-ml-3 whitespace-nowrap" to="/properties">
        Skip
      </UiAppButton>

      <UiProgressDots :total="3" :current="0" label="Introduction progress" />

      <UiAppButton variant="brand" class="h-11 w-[6.25rem] gap-2 p-3" to="/onboarding">
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
      src="/media/lines-splash.svg"
      alt=""
      width="400"
      height="699"
      aria-hidden="true"
      class="splash__lines pointer-events-none absolute left-1/2 top-0 h-auto w-[max(100vw,25rem)] max-w-none -translate-x-1/2 mix-blend-color-dodge opacity-[0.10]"
    >
  </div>
</template>

<style scoped>
/*
 * Phone: the 400px frame on 24px margins, centred once the viewport is wider.
 * The top offset stands in for the design's status bar, which on a real device
 * is the browser's own chrome rather than something the page draws.
 */
.splash {
  position: relative;
  display: flex;
  min-height: 100svh;
  flex-direction: column;
  overflow: hidden;
}

.splash__copy,
.splash__art,
.splash__card,
.splash__footer {
  width: 100%;
  max-width: 25rem;
  margin-inline: auto;
  padding-inline: 1.5rem;
}

.splash__copy {
  padding-top: max(3.5rem, env(safe-area-inset-top) + 1.5rem);
}

.splash__footer {
  margin-top: auto;
  padding-top: 1.5rem;
  padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
}

/* Desktop: type left, mark right, both holding half the screen. */
@media (min-width: 64rem) {
  .splash {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
    grid-template-rows: auto auto auto;
    align-content: center;
    column-gap: clamp(2rem, 5vw, 5.5rem);
    padding: clamp(2rem, 5vh, 4rem) clamp(2.5rem, 6vw, 7rem);
  }

  .splash__copy,
  .splash__art,
  .splash__card,
  .splash__footer {
    max-width: none;
    margin-inline: 0;
    padding-inline: 0;
  }

  .splash__copy {
    grid-area: 1 / 1;
    max-width: 34rem;
    padding-top: 0;
  }

  .splash__card {
    grid-area: 2 / 1;
    max-width: 24rem;
    margin-top: 2.5rem;
  }

  .splash__footer {
    grid-area: 3 / 1;
    max-width: 24rem;
    margin-top: 3rem;
    padding-top: 0;
    padding-bottom: 0;
  }

  .splash__art {
    grid-area: 1 / 2 / 4 / 3;
    align-self: center;
  }

  /* The contour art is drawn for a 400px frame; on a wide screen it only has
     to graze the top edge rather than run the height of the page. */
  .splash__lines {
    width: max(100vw, 25rem);
    opacity: 0.07;
  }
}

/*
 * The lean is applied here and the float below stays on the image itself, so
 * the two transforms compose instead of overwriting one another.
 */
.tilt {
  transform: perspective(1100px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))
    translate3d(var(--tilt-dx, 0), var(--tilt-dy, 0), 0);
  transform-style: preserve-3d;
  will-change: transform;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(-2%);
  }
  50% {
    transform: translateY(2%);
  }
}
</style>
