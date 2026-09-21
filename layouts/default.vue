<script setup lang="ts">
/**
 * The product shell. On a phone it is a single column: hero, pinned controls,
 * then content. From 64rem it becomes a full-width split, with the agent held
 * on the left and the content scrolling on the right.
 *
 * The aside is the same on every screen inside this layout, so the agent is
 * always there to ask another question, whether you are reading the project
 * or an answer.
 */
const route = useRoute()
const { property, propertyPending } = useProject()

/* On a phone the answer screen replaces the welcome block, as in the design.
   On a wide screen there is room for both, so the agent stays put. */
const asideDesktopOnly = computed(() => route.path === '/ask')

/* On a phone the welcome block scrolls away like any other content. Once most
   of it has gone, the controls compact into a pill with a small live orb, so
   the agent is still one tap away without a third of the screen reserved for
   it. Driven by an observer rather than scroll maths, so it costs nothing. */
const agentEl = ref<HTMLElement | null>(null)
const compact = ref(false)
let io: IntersectionObserver | null = null
onMounted(() => {
  if (!agentEl.value) return
  io = new IntersectionObserver(
    ([entry]) => {
      compact.value = !entry || entry.intersectionRatio < 0.35
    },
    { threshold: [0, 0.35, 1] },
  )
  io.observe(agentEl.value)
})
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <div class="flex min-h-[100svh] flex-col">
    <!-- A quiet trigger for the mock server note. The answer's own bar owns the
         top-left corner on that route, so it steps aside there. -->
    <StoryMockServerPanel v-if="!asideDesktopOnly" />

    <div class="app-shell flex-1" :class="asideDesktopOnly ? 'app-shell--aside-wide' : ''">
      <aside ref="agentEl" class="app-shell__agent">
        <div class="app-shell__agent-inner">
          <VoiceAgentHero :property="property" :pending="propertyPending" />
        </div>
      </aside>

      <!-- A sibling of the aside and the content, not a child of either: a
           sticky element cannot escape its own parent, and these have to stay
           pinned while the whole project scrolls past them. -->
      <VoiceControls class="app-shell__dock" :compact="compact" />

      <main id="main" class="app-shell__content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
:root,
.app-shell {
  --hero-h: 40svh;
}

.app-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  width: 100%;
}

/*
 * Phone: the welcome block takes the top two fifths and scrolls away with the
 * page. The controls sit centred on the seam between it and the first card,
 * half over each, and stay pinned near the top once the block has gone. They
 * are a sibling of both the agent and the content because a sticky element
 * cannot escape its own parent.
 */
@media (max-width: 63.999rem) {
  .app-shell__agent {
    height: var(--hero-h);
  }

  .app-shell__agent-inner {
    height: 100%;
  }

  .app-shell__dock {
    position: sticky;
    top: 0.75rem;
    z-index: 30;
    margin-block: -1.625rem;
  }

  .app-shell__content {
    padding-top: 0;
  }

  .app-shell--aside-wide .app-shell__content {
    padding-top: 0;
  }
}

.app-shell__dock {
  grid-column: 1;
}

/* The welcome hero is full bleed on a phone and manages its own insets. The
   gutter only comes back in the split layout, where the pane has real edges. */
.app-shell__agent-inner {
  padding-inline: 0;
}

.app-shell__content {
  min-width: 0;
  padding-inline: var(--shell-gutter);
}

/* The answer stands alone: nothing is pinned and nothing is reserved, because
   its own bar carries the back arrow and the microphone. */
.app-shell--aside-wide .app-shell__agent,
.app-shell--aside-wide .app-shell__dock {
  display: none;
}

@media (min-width: 64rem) {
  /*
   * Desktop is the same story told in one column rather than a split: the
   * agent holds the upper half of the screen, the project runs beneath it as a
   * horizontal strip, and the booking button closes it out.
   */
  .app-shell {
    grid-template-columns: minmax(0, 1fr);
    align-content: start;
  }

  /* The whole screen is one view: agent, strip and the CTA all fit without
     the page scrolling, so the sizes are held in viewport units. */
  .app-shell {
    min-height: 100svh;
  }

  .app-shell__agent {
    height: 46svh;
    min-height: 16rem;
  }

  .app-shell__agent-inner {
    height: 100%;
    padding-inline: 0;
  }

  .app-shell__dock {
    position: relative;
    z-index: 30;
    margin-top: -1.25rem;
    margin-bottom: clamp(0.5rem, 2svh, 1.25rem);
  }

  .app-shell__content {
    padding-block: 0 clamp(1rem, 2vw, 1.75rem);
    padding-inline: 0;
  }
}

</style>
