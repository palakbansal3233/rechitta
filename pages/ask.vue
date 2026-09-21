<script setup lang="ts">
/**
 * The answer lives at its own URL, so it can be linked, refreshed and left
 * with the browser's back button. The query string is the source of truth:
 * the request is driven from the route, not from whatever clicked it.
 */
const route = useRoute()
const agent = useAgent()

const query = computed(() => String(route.query.q ?? '').trim())

watch(
  query,
  (q) => {
    if (!q) {
      void navigateTo('/properties', { replace: true })
      return
    }
    void agent.ask(q)
  },
  { immediate: true },
)

useHead({ title: computed(() => (query.value ? `“${query.value}” · Rechitta` : 'Rechitta')) })
</script>

<template>
  <div>
    <h1 class="sr-only">Rechitta's answer to “{{ query }}”</h1>

    <div v-if="agent.mode.value === 'thinking'" class="space-y-3">
      <div class="skeleton h-16 rounded-lg" />
      <div class="skeleton h-[clamp(14rem,40vh,26rem)] rounded-[var(--radius-card)]" />
      <div class="skeleton h-48 rounded-[var(--radius-card)]" />
      <p class="sr-only">Rechitta is preparing an answer.</p>
    </div>

    <UiStateMessage
      v-else-if="agent.mode.value === 'failed' && agent.error.value"
      tone="error"
      title="Rechitta couldn't answer that"
      :body="agent.error.value.message"
    >
      <template #actions>
        <UiAppButton size="sm" @click="agent.retry()">Try again</UiAppButton>
        <UiAppButton size="sm" variant="ghost" to="/properties">Back to the project</UiAppButton>
      </template>
    </UiStateMessage>

    <AnswerView v-else-if="agent.answer.value" />
  </div>
</template>
