<script setup lang="ts">
import type { Property } from '~~/types'

/**
 * "Welcome", the orb with the mark on it, and the greeting.
 *
 * Layer order matches the Figma: glow, then the orb, then the copy, then the
 * bottom scrim, then the contour art. The scrim sitting above the copy is what
 * dims the last line of the greeting, which is why the greeting itself is a
 * flat #FFFFFF rather than a per-line fade.
 *
 * <VoiceControls> is a sibling that paints after this section, so the two
 * buttons stay clear of the scrim and stay pinned while the project scrolls.
 */
defineProps<{ property: Property | null; pending: boolean }>()

/* Same as the onboarding screen: preload the hero's own texture, matched to
   the canvas's credentials mode. */
useHead({
  link: [{ rel: 'preload', as: 'image', href: '/media/orb-welcome-1024.webp', crossorigin: 'anonymous', fetchpriority: 'high' }],
})

const agent = useAgent()
const listening = computed(() => agent.mode.value === 'listening')
const thinking = computed(() => agent.mode.value === 'thinking')
</script>

<template>
  <section
    class="hero relative isolate flex flex-col items-center overflow-hidden"
    :aria-label="`Rechitta, your agent for ${property?.name ?? 'this project'}`"
  >
    <!-- Teal glow, full bleed so it never shows an edge. -->
    <img
      src="/media/glow-welcome.webp"
      alt=""
      width="400"
      height="500"
      aria-hidden="true"
      class="pointer-events-none absolute left-1/2 top-0 -z-10 h-auto w-[max(100vw,25rem)] max-w-none -translate-x-1/2"
    >

    <h2 class="relative mt-7 text-[1.25rem] font-normal leading-none text-white">
      Welcome <span aria-hidden="true">👋</span>
    </h2>

    <div class="relative mt-[3.25rem] w-full">
      <!-- The orb is the live shader rather than the flat export, because the
           brief wants it reacting to the microphone. Its texture is the same
           artwork, pulled from the supplied render, so it matches the design
           and still moves. The export carried a flat 54% alpha, but that is
           the flattened render's layer opacity, not a value to reapply on top
           of a lighten blend: lighten already drops the black surround, and
           re-dimming to 54% crushed the orb to nothing. Measured against the
           design at full opacity. -->
      <div
        class="orb pointer-events-none absolute left-1/2 top-0 -z-10 aspect-square w-[min(96%,26rem)] -translate-x-1/2 lg:w-[min(42svh,28rem)] -translate-y-[22%] mix-blend-lighten"
      >
        <OrbCanvas
          texture="/media/orb-welcome-1024.webp"
          :bands="agent.mic.bands"
          :mode="thinking ? 'thinking' : listening ? 'listening' : 'idle'"
        />
      </div>

      <img
        src="/media/mark.webp"
        alt=""
        width="344"
        height="304"
        class="relative mx-auto block h-auto w-11"
      >

      <p v-if="pending" class="mt-[14px] space-y-2">
        <span class="skeleton mx-auto block h-3 w-[60%] rounded-full" />
        <span class="skeleton mx-auto block h-3 w-[72%] rounded-full" />
      </p>
      <p
        v-else-if="property"
        class="relative mx-auto mt-[14px] max-w-[15rem] whitespace-pre-line text-center text-[0.75rem] font-normal leading-[1.375rem] text-white"
      >
        {{ property.greeting }}
      </p>
    </div>

    <!-- Contour art, on top as it is in the file. -->
    <img
      src="/media/lines-welcome.svg"
      alt=""
      width="400"
      height="586"
      aria-hidden="true"
      class="pointer-events-none absolute left-1/2 top-0 h-auto w-[max(100vw,25rem)] max-w-none -translate-x-1/2 mix-blend-color-dodge opacity-20"
    >
  </section>
</template>

<style scoped>
/*
 * The frame's own fill. Sampled down the left edge of the supplied screenshot,
 * where the teal is strongest, then set as a base so the glow artwork only has
 * to supply the radial shape on top of it. Replace with the Figma fill when we
 * have it.
 */
.hero {
  height: 100%;
  padding-bottom: 1.5rem;
  background: linear-gradient(
    180deg,
    #06161a 0%,
    #08222a 14%,
    #082028 34%,
    #061318 62%,
    #000203 84%,
    #000203 100%
  );
}

@media (min-width: 64rem) {
  .hero::before {
    content: '';
    position: absolute;
    inset: -10% -5% 0;
    z-index: -1;
    pointer-events: none;
    background:
      radial-gradient(52% 58% at 50% 46%, rgb(132 78 204 / 0.2), transparent 64%),
      radial-gradient(96% 76% at 50% 52%, rgb(18 118 148 / 0.17), transparent 72%);
  }

  .hero {
    background: linear-gradient(
      180deg,
      #06161a 0%,
      #08222a 12%,
      #082028 32%,
      rgb(6 19 24 / 0.55) 58%,
      rgb(3 8 11 / 0.2) 80%,
      transparent 100%
    );
  }
}

/*
 * The orb runs past the foot of the hero so the two controls read as sitting
 * on its lower curve, and it dissolves rather than ending on an edge.
 */
.orb {
  -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 72%, transparent 100%);
  mask-image: linear-gradient(to bottom, #000 0%, #000 72%, transparent 100%);
}
</style>
