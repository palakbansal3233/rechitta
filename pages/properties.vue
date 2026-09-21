<script setup lang="ts">
const { property, chapters, chaptersPending, chaptersError, propertyError, load, loadChapters } =
  useProject()
const agent = useAgent()

/* Leaving the answer behind when you come back to the project. */
onMounted(() => {
  if (agent.answer.value) agent.clearAnswer()
})

useHead({
  title: computed(() =>
    property.value ? `${property.value.name} · Rechitta` : 'Rechitta, your AI property agent',
  ),
})
</script>

<template>
  <div>
    <UiStateMessage
      v-if="propertyError"
      tone="error"
      class="mt-4"
      title="We couldn't reach Rechitta"
      :body="propertyError.message"
    >
      <template #actions>
        <UiAppButton size="sm" @click="load">Try again</UiAppButton>
      </template>
    </UiStateMessage>

    <template v-else>
      <h1 class="sr-only">
        {{
          property
            ? `${property.name}, ${property.district}, ${property.city}`
            : 'Berkeley Square North'
        }}, explored with Rechitta, your AI property agent
      </h1>

      <StoryStream
        :chapters="chapters"
        :property="property"
        :pending="chaptersPending"
        :error="chaptersError"
        @retry="loadChapters"
      />
    </template>
  </div>
</template>
