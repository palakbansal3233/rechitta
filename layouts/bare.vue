<script setup lang="ts">
/**
 * No chrome: the onboarding screens are full-bleed in the design. The slot is
 * still wrapped in a `main` landmark so the app-wide skip link has somewhere
 * to land on these routes too.
 */
</script>

<template>
  <main id="main">
    <slot />
  </main>
</template>
