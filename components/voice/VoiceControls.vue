<script setup lang="ts">
/**
 * The message and audio controls. This is the one thing that stays pinned
 * while the project scrolls, so it also carries the live transcript: once the
 * orb has scrolled away you can still see what Rechitta is hearing.
 */
/** Pill chrome and a small live orb once the welcome block has scrolled away. */
defineProps<{ compact?: boolean }>()

const agent = useAgent()
const uid = useId()
const typing = ref(false)
const input = ref<HTMLInputElement | null>(null)

const listening = computed(() => agent.mode.value === 'listening')
const thinking = computed(() => agent.mode.value === 'thinking')
const active = computed(() => listening.value || thinking.value)

async function toggleTyping() {
  typing.value = !typing.value
  if (typing.value) {
    if (listening.value) agent.cancelListening()
    await nextTick()
    input.value?.focus()
  }
}

function submitTyped() {
  if (!agent.draft.value.trim()) return
  void agent.submit(agent.draft.value)
  typing.value = false
}

function onMicClick() {
  if (listening.value) void agent.stopListening()
  else void agent.startListening()
}

/** Escape always gets you out of listening, wherever focus happens to be. */
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && listening.value) {
    e.preventDefault()
    agent.cancelListening()
    return
  }
  const t = e.target as HTMLElement | null
  if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return
  if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault()
    onMicClick()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="dock">
    <div class="dock__inner" :class="{ 'dock__inner--wide': active, 'dock__inner--compact': compact }">
      <Transition
        enter-active-class="transition duration-300 ease-[var(--ease-out-expo)]"
        enter-from-class="opacity-0 scale-75"
        leave-active-class="transition duration-200"
        leave-to-class="opacity-0 scale-75"
      >
        <span v-if="compact" class="grid size-9 shrink-0 place-items-center" aria-hidden="true">
          <OrbCanvas :bands="agent.mic.bands" :mode="active ? 'listening' : 'idle'" :gain="0.5" />
        </span>
      </Transition>

      <button
        type="button"
        class="grid size-10 shrink-0 place-items-center rounded-full bg-[#222222]/70 text-[#D5D5D5] transition-colors hover:bg-[#222222]/90 hover:text-white"
        :aria-pressed="typing"
        aria-label="Type a question instead"
        @click="toggleTyping"
      >
        <svg class="size-[22px]" viewBox="6 6 28 28" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true">
          <mask :id="`${uid}-chat`" maskUnits="userSpaceOnUse" x="6" y="6" width="28" height="28">
            <rect x="6" y="6" width="28" height="28" fill="#fff" />
            <path d="M13 10H18A3 3 0 0 1 21 13V16A3 3 0 0 1 18 19H14L10 23.5V13A3 3 0 0 1 13 10Z" fill="#000" stroke="#000" stroke-width="5" />
          </mask>
          <path d="M21 18H27.5A3 3 0 0 1 30.5 21V30L26 26.5H21A3 3 0 0 1 18 23.5V21A3 3 0 0 1 21 18Z" :mask="`url(#${uid}-chat)`" />
          <path d="M13 10H18A3 3 0 0 1 21 13V16A3 3 0 0 1 18 19H14L10 23.5V13A3 3 0 0 1 13 10Z" />
        </svg>
      </button>

      <button
        type="button"
        class="relative grid size-10 shrink-0 place-items-center rounded-full transition-colors"
        :class="
          listening
            ? 'bg-white text-ink-1000'
            : 'bg-[#222222]/70 text-[#D5D5D5] hover:bg-[#222222]/90 hover:text-white'
        "
        :disabled="thinking"
        :aria-pressed="listening"
        :aria-label="listening ? 'Stop listening and send' : 'Ask Rechitta with your voice'"
        @click="onMicClick"
      >
        <span
          v-if="listening"
          class="absolute inset-0 rounded-full border border-white/45 motion-safe:animate-[ping-soft_1.8s_ease-out_infinite]"
          aria-hidden="true"
        />
        <svg v-if="!listening" class="size-[22px]" viewBox="6 6 28 28" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <rect x="17" y="10" width="6" height="14" rx="3" />
          <path d="M13 19v2a7 7 0 0 0 14 0v-2M20 28v2.5" stroke-linecap="round" />
        </svg>
        <svg v-else class="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <rect x="6" y="6" width="12" height="12" rx="2.5" />
        </svg>
      </button>

      <!-- Live status, so the transcript survives the orb scrolling away -->
      <p v-if="listening" class="min-w-0 flex-1 truncate text-sm text-white">
        {{ agent.liveTranscript.value || 'Listening…' }}
      </p>
      <p v-else-if="thinking" class="flex min-w-0 flex-1 items-center gap-2 text-sm text-white/78">
        <span class="flex gap-1" aria-hidden="true">
          <span
            v-for="i in 3"
            :key="i"
            class="size-1.5 rounded-full bg-white/70 motion-safe:animate-[bounce-dot_1.1s_ease-in-out_infinite]"
            :style="{ animationDelay: `${i * 0.13}s` }"
          />
        </span>
        Thinking
      </p>

      <button
        v-if="listening"
        type="button"
        class="grid size-10 shrink-0 place-items-center rounded-full bg-[#222222]/70 text-[#D5D5D5] transition-colors hover:bg-[#222222]/90 hover:text-white"
        aria-label="Cancel listening"
        @click="agent.cancelListening()"
      >
        <svg class="size-[1.05rem]" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path d="m5.5 5.5 9 9m0-9-9 9" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <div class="dock__overlay">
    <Transition
      enter-active-class="transition duration-250 ease-[var(--ease-out-expo)]"
      enter-from-class="opacity-0 -translate-y-1"
      leave-active-class="transition duration-150"
      leave-to-class="opacity-0"
    >
      <form v-if="typing" class="mx-auto flex w-full max-w-md gap-2" @submit.prevent="submitTyped">
        <label for="agent-input" class="sr-only">Ask Rechitta a question</label>
        <input
          id="agent-input"
          ref="input"
          v-model="agent.draft.value"
          type="text"
          autocomplete="off"
          placeholder="Ask about price, yield, handover…"
          class="h-10 min-w-0 flex-1 rounded-full border border-white/14 bg-ink-1000/80 px-4 text-sm backdrop-blur placeholder:text-white/45 focus:border-white/30 focus:outline-none focus-visible:outline-2 focus-visible:outline-gold-300"
        >
        <UiAppButton type="submit" size="sm" :disabled="!agent.draft.value.trim()">Ask</UiAppButton>
      </form>
    </Transition>

    <UiStateMessage
      v-if="agent.micNotice.value"
      tone="info"
      compact
      class="mx-auto mt-2 w-full max-w-md text-left"
      title="About the microphone"
      :body="agent.micNotice.value"
    >
      <template #actions>
        <UiAppButton size="sm" variant="secondary" @click="toggleTyping">Type instead</UiAppButton>
      </template>
    </UiStateMessage>
    </div>
  </div>
</template>

<style scoped>
/*
 * The controls straddle the seam between the hero and the first card, half over
 * each, and stay pinned from there as the project scrolls under them.
 */
/*
 * The control is the one thing on the page that changes size while you use it:
 * listening widens it, typing adds a field, a denied microphone adds a notice.
 * None of that is allowed to move the page, so the dock reserves the height of
 * its tallest state and everything below the buttons floats in an overlay.
 */
.dock {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 3.25rem;
  padding-inline: var(--shell-gutter);
}

.dock__overlay {
  position: absolute;
  top: calc(100% - 0.25rem);
  left: 0;
  right: 0;
  padding-inline: var(--shell-gutter);
}

/* In the split layout the agent pane is already held on screen, so the dock
   has nothing to stick to and can sit in flow. */
@media (min-width: 64rem) {
  .dock {
    position: static;
  }
}

/* At rest this is just the two circles on a 16px gap, as in the design. The
   pill chrome only appears once there is a transcript to keep legible. */
.dock__inner {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: fit-content;
  max-width: 100%;
  margin-inline: auto;
  border-radius: 999px;
  transition:
    width 250ms var(--ease-out-expo),
    padding 250ms var(--ease-out-expo),
    gap 250ms var(--ease-out-expo),
    background-color 250ms var(--ease-out-expo),
    border-color 250ms var(--ease-out-expo);
  border: 1px solid transparent;
}

.dock__inner--compact {
  gap: 0.75rem;
  padding: 0.3rem 0.75rem 0.3rem 0.3rem;
  border: 1px solid rgb(255 255 255 / 0.09);
  background: rgb(6 10 14 / 0.74);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
}

.dock__inner--wide {
  width: min(100%, 34rem);
  gap: 0.6rem;
  padding: 0.3rem;
  border: 1px solid rgb(255 255 255 / 0.09);
  background: rgb(6 10 14 / 0.74);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
}

.dock__inner--wide {
  padding-inline: 0.3rem 0.85rem;
}

@keyframes ping-soft {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.55);
    opacity: 0;
  }
}
@keyframes bounce-dot {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  50% {
    transform: translateY(-4px);
    opacity: 1;
  }
}
</style>
