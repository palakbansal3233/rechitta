<script setup lang="ts">
/**
 * A small trigger in the top-left corner that opens a note about the mock
 * server, with the state controls.
 *
 * The brief asks for a mock server that supports the complete flow with
 * realistic data and states. This makes it visible without competing with the
 * design: a quiet pill, and a panel that only exists while it is open. The
 * chosen state is kept for the session and sent on every request as
 * `x-mock-scenario` (see plugins/api.ts).
 */
const scenario = useState<string | null>('mock-scenario', () => null)
const { load } = useProject()

const open = ref(false)
const panelId = useId()
const root = ref<HTMLElement | null>(null)

const SCENARIOS: { id: string | null; label: string; hint: string }[] = [
  { id: null, label: 'Normal', hint: 'median latency with ±40% jitter' },
  { id: 'slow', label: 'Slow', hint: 'about 4.5× the latency, so the skeletons show' },
  { id: 'empty', label: 'Empty', hint: 'lists come back with nothing in them' },
  { id: 'error', label: 'Error', hint: 'every endpoint answers 500' },
  { id: 'offline', label: 'Offline', hint: '503, as if the connection dropped' },
]

const ENDPOINTS = [
  ['GET', '/api/property', 'the project, developer and advisor'],
  ['GET', '/api/chapters', 'the seven story chapters'],
  ['GET', '/api/suggestions', 'starter questions'],
  ['POST', '/api/query', 'matches the question to an answer'],
  ['POST', '/api/booking', 'confirms a viewing and returns a reference'],
] as const

const current = computed(() => SCENARIOS.find((s) => s.id === scenario.value) ?? SCENARIOS[0]!)

function pick(id: string | null) {
  scenario.value = id
  load()
}

/* Escape and a click outside both close it, like any small popover. */
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) open.value = false
}
function onPointer(e: PointerEvent) {
  if (open.value && root.value && !root.value.contains(e.target as Node)) open.value = false
}
onMounted(() => {
  window.addEventListener('keydown', onKey)
  window.addEventListener('pointerdown', onPointer)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('pointerdown', onPointer)
})
</script>

<template>
  <div ref="root" class="fixed left-3 top-3 z-50">
    <button
      type="button"
      class="flex h-[22px] items-center gap-1.5 rounded-full border border-white/12 bg-ink-1000/60 pl-2 pr-2.5 font-ui text-[0.625rem] font-medium tracking-wide text-white/55 backdrop-blur-md transition-colors hover:border-white/30 hover:text-white/90"
      :aria-expanded="open"
      :aria-controls="panelId"
      @click="open = !open"
    >
      <span
        class="size-1.5 rounded-full"
        :class="scenario ? 'bg-[#C9A961]' : 'bg-teal-400'"
        aria-hidden="true"
      />
      <!-- Below 375px the compact controls reach this corner, so only the dot stays. -->
      <span class="hidden min-[375px]:inline">Mock server<span v-if="scenario" class="text-white/40">&nbsp;· {{ current.label }}</span></span>
      <span class="sr-only min-[375px]:hidden">Mock server</span>
    </button>

    <Transition
      enter-active-class="transition duration-200 ease-[var(--ease-out-expo)]"
      enter-from-class="opacity-0 -translate-y-1"
      leave-active-class="transition duration-150"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="open"
        :id="panelId"
        role="dialog"
        aria-label="Mock server"
        class="mt-2 w-[min(22rem,calc(100vw-1.5rem))] rounded-lg border border-white/10 bg-ink-1000/92 p-4 text-left shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl"
      >
        <p class="text-[0.8125rem] leading-relaxed text-white/70">
          Everything here comes from a mock server inside the app, as Nitro routes under
          <code class="text-white/85">server/api/</code>. Each response gets realistic latency,
          jitter, failures and empty results added. Pick a state and the page reloads its data
          against it.
        </p>

        <ul class="mt-3 space-y-1 font-mono text-[0.6875rem] text-white/60">
          <li v-for="[method, path, note] in ENDPOINTS" :key="path" class="flex flex-wrap gap-x-2">
            <span class="w-9 shrink-0 text-[#C9A961]">{{ method }}</span>
            <span class="text-white/85">{{ path }}</span>
            <span class="w-full font-sans text-white/45 sm:w-auto">{{ note }}</span>
          </li>
        </ul>

        <p class="mt-4 text-[0.625rem] uppercase tracking-[1px] text-white/50">Server state</p>
        <div class="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Mock server state">
          <button
            v-for="s in SCENARIOS"
            :key="s.label"
            type="button"
            class="rounded-full border px-2.5 py-1 font-ui text-[0.6875rem] transition-colors"
            :class="
              s.id === scenario
                ? 'border-[#C9A961]/60 bg-[#C9A961]/15 text-white'
                : 'border-white/14 bg-white/[0.04] text-white/70 hover:border-white/30 hover:text-white'
            "
            :aria-pressed="s.id === scenario"
            @click="pick(s.id)"
          >
            {{ s.label }}
          </button>
        </div>
        <p class="mt-2 text-[0.6875rem] leading-relaxed text-white/50">{{ current.hint }}.</p>
        <p class="mt-3 text-[0.6875rem] leading-relaxed text-white/40">
          Or add <code class="text-white/60">?scenario=slow</code>,
          <code class="text-white/60">error</code>, <code class="text-white/60">empty</code> or
          <code class="text-white/60">offline</code> to any page URL.
        </p>
      </div>
    </Transition>
  </div>
</template>
