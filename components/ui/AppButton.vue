<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'brand' | 'secondary' | 'ghost' | 'quiet'
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean
    disabled?: boolean
    type?: 'button' | 'submit'
    as?: 'button' | 'a'
    href?: string
    /** Renders a NuxtLink instead, for navigation that must be a real link. */
    to?: string
    block?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
    type: 'button',
    as: 'button',
    href: undefined,
    to: undefined,
    block: false,
  },
)

const base =
  'relative inline-flex items-center justify-center rounded-full font-ui font-medium leading-5 ' +
  'transition-[transform,background-color,border-color,color,opacity] duration-200 ease-[var(--ease-out-expo)] ' +
  'active:scale-[0.975] disabled:pointer-events-none disabled:opacity-45 select-none'

const variants: Record<string, string> = {
  primary: 'bg-white text-[#292929] hover:bg-gold-200',
  brand: 'bg-brand-600 text-white hover:bg-brand-500',
  secondary: 'border border-white/16 bg-white/6 text-white hover:bg-white/12 hover:border-white/28',
  ghost: 'text-muted-500 hover:text-white hover:bg-white/8',
  quiet: 'text-white/54 hover:text-white underline underline-offset-4 decoration-white/25 hover:decoration-white/60',
}

const sizes: Record<string, string> = {
  sm: 'h-9 gap-1.5 px-3 text-[0.875rem]',
  md: 'h-11 gap-2 px-3 text-[0.875rem]',
  lg: 'h-12 gap-2 px-5 text-[0.9375rem]',
}

/* Resolved in setup, not inline in the template: `resolveComponent` used as a
   template expression leaves an unresolved <nuxtlink> custom element behind,
   which looks right but is not a link and cannot be focused. */
const NuxtLinkComponent = resolveComponent('NuxtLink')

const classes = computed(() => [
  base,
  variants[props.variant],
  props.variant === 'quiet' ? 'h-auto gap-1.5 px-0' : sizes[props.size],
  props.block ? 'w-full' : '',
])
</script>

<template>
  <component
    :is="to ? NuxtLinkComponent : as === 'a' ? 'a' : 'button'"
    :to="to"
    :href="!to && as === 'a' ? href : undefined"
    :type="to || as === 'a' ? undefined : type"
    :disabled="to || as === 'a' ? undefined : disabled || loading"
    :aria-busy="loading ? 'true' : undefined"
    :class="classes"
  >
    <span
      v-if="loading"
      class="absolute inset-0 grid place-items-center"
      aria-hidden="true"
    >
      <span class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70" />
    </span>
    <span class="contents" :class="loading ? 'invisible' : ''"><slot /></span>
  </component>
</template>
