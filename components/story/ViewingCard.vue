<script setup lang="ts">
import type { Property } from '~~/types'
import type { BookingResult } from '~~/server/api/booking.post'
import { normaliseError, type NormalisedError } from '~/composables/useApi'

/**
 * The closing card of the project story, built to the Figma tokens.
 *
 * The frame gives the card a 387px height, but that is a hug value from a
 * fixed 400px artboard. Here the card is a centred flex column on a 12px gap
 * with 32px padding, so it keeps the design's rhythm and still grows when the
 * copy wraps differently or the reader has scaled their text up.
 */
defineProps<{ property: Property | null }>()

const { announce } = useAnnouncer()
const { $api } = useNuxtApp()

const booking = ref(false)
const booked = ref<BookingResult | null>(null)
const bookingError = ref<NormalisedError | null>(null)

/* The mask is referenced by id, so it has to survive being rendered twice. */
const maskId = useId()

async function book() {
  booking.value = true
  bookingError.value = null
  try {
    booked.value = await $api<BookingResult>('/api/booking', { method: 'POST' })
    announce(`Viewing requested. Reference ${booked.value.reference}.`)
  } catch (e) {
    bookingError.value = normaliseError(e)
    announce(bookingError.value.message)
  } finally {
    booking.value = false
  }
}
</script>

<template>
  <!-- The shell still puts a gutter on the content column. This band owns its
       own 24px from the design, so it cancels that inherited gutter. Goes away
       once the screen 3 container is rebuilt. -->
  <section class="-mx-[var(--shell-gutter)] bg-[#091115] px-6 py-5 lg:mx-0 lg:mt-[clamp(0.75rem,3svh,1.5rem)] lg:bg-transparent lg:py-0">
    <!-- 387px as a floor rather than a fixed height: it measures exactly 387
         with the design's content, and cannot clip if the copy wraps onto
         another line or the reader has scaled their text up. -->
    <div
      class="flex min-h-[387px] flex-col items-center justify-center gap-3 rounded-2xl border border-[#C9A961]/10 bg-white/[0.03] p-8 text-center backdrop-blur-[20px] lg:min-h-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none"
    >
      <Transition
        mode="out-in"
        enter-active-class="transition duration-350 ease-[var(--ease-out-expo)]"
        enter-from-class="opacity-0 translate-y-2"
        leave-active-class="transition duration-150"
        leave-to-class="opacity-0"
      >
        <!-- Confirmed -->
        <div v-if="booked" key="done" class="flex flex-col items-center gap-3">
          <span
            class="grid size-16 place-items-center rounded-full bg-[#C9A961]/10 text-[#C9A961] lg:hidden"
            aria-hidden="true"
          >
            <svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="m5 12.5 4.5 4.5L19 7.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>

          <h2 class="text-[1.25rem] font-normal leading-8 text-white">Viewing requested</h2>
          <p class="text-[0.875rem] font-normal leading-5 text-[#9CA3AF]">{{ booked.message }}</p>
          <p class="tabular text-[0.75rem] font-normal leading-4 text-[#6B7280]">
            Reference {{ booked.reference }}
          </p>
        </div>

        <!-- Default -->
        <div v-else key="cta" class="flex flex-col items-center gap-3">
          <!-- The badge is one 64px disc with the calendar knocked through it,
               exactly as the artwork is drawn, but as vector so it stays sharp. -->
          <svg class="size-16 lg:hidden" viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <circle cx="32" cy="32" r="32" fill="#C9A961" fill-opacity="0.1" />
            <mask :id="maskId" maskUnits="userSpaceOnUse" x="22" y="20" width="20" height="24">
              <g transform="translate(22 20)">
                <g fill="#fff">
                  <rect x="4" width="3" height="5" rx="1.5" />
                  <rect x="13" width="3" height="5" rx="1.5" />
                  <path d="M0 4.1A1.1 1.1 0 0 1 1.1 3h17.8A1.1 1.1 0 0 1 20 4.1V7H0V4.1Z" />
                  <path d="M0 9h20v13.9a1.1 1.1 0 0 1-1.1 1.1H1.1A1.1 1.1 0 0 1 0 22.9V9Z" />
                </g>
                <path
                  d="m6 15.4 3.1 4 5.2-7.3"
                  stroke="#000"
                  stroke-width="2.3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </g>
            </mask>
            <rect x="22" y="20" width="20" height="24" fill="#fff" :mask="`url(#${maskId})`" />
          </svg>

          <h2 class="text-[1.25rem] font-normal leading-8 text-white lg:hidden">Schedule Private Viewing</h2>

          <p class="cta-line text-[0.8125rem] font-normal leading-5 text-[#9CA3AF]">
            Seen enough? Walk {{ property?.name ?? 'the project' }} with Sara.
          </p>

          <p class="text-[0.875rem] font-normal leading-5 text-[#9CA3AF] lg:hidden">
            Experience {{ property?.name ?? 'the project' }} with our exclusive tour
          </p>

          <UiAppButton
            class="h-11 w-[12.875rem] max-w-full gap-2 p-3"
            :loading="booking"
            @click="book"
          >
            Book Appointment
            <svg class="size-4 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
              <path d="M4 10h11m0 0-4-4m4 4-4 4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </UiAppButton>

          <UiStateMessage
            v-if="bookingError"
            tone="error"
            compact
            class="w-full text-left"
            title="That didn't go through"
            :body="bookingError.message"
          >
            <template #actions>
              <UiAppButton size="sm" variant="secondary" @click="book">Try again</UiAppButton>
            </template>
          </UiStateMessage>

          <p class="text-[0.75rem] font-normal leading-4 text-[#6B7280] lg:hidden">
            {{ property?.developer ?? 'Prestige Properties Group' }}
          </p>
        </div>
      </Transition>
    </div>
  </section>
</template>

<style scoped>
/* The closing line is a nicety, so it steps aside on a short screen rather
   than pushing the button below the fold. */
.cta-line {
  display: none;
}

@media (min-width: 64rem) and (min-height: 52rem) {
  .cta-line {
    display: block;
  }
}
</style>
