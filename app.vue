<script setup lang="ts">
import { AgentKey, createAgentSession } from '~/composables/useAgentSession'

/* One agent session for the whole app, so the microphone, the transcript and
   the current answer survive navigation between screens. */
provide(AgentKey, createAgentSession())

const { message } = useAnnouncer()

/* `?scenario=` on any page URL selects a mock-server scenario for the session,
   so every loading, empty and error state is reachable from a link. Read here,
   before the first fetch below, and sent by the `$api` plugin on each call. */
const route = useRoute()
const scenario = useState<string | null>('mock-scenario', () => null)
watch(
  () => route.query.scenario,
  (value) => {
    if (typeof value === 'string') scenario.value = value || null
  },
  { immediate: true },
)

const { load } = useProject()
onMounted(load)
</script>

<template>
  <div class="min-h-[100svh] bg-ink-950">
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-ink-1000"
    >
      Skip to content
    </a>

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- One polite live region for the whole app. -->
    <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">{{ message }}</p>
  </div>
</template>
