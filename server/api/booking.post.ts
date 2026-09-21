import { advisor } from '../utils/data'
import { mockRespond } from '../utils/mock'

export interface BookingResult {
  reference: string
  advisorName: string
  message: string
}

/**
 * The design ends on a "Schedule Private Viewing" card with a single button
 * and no following screen, so this is deliberately a one-shot request rather
 * than a slot picker: it returns the confirmation the card swaps into.
 */
export default defineEventHandler((event) =>
  mockRespond<BookingResult>(event, 900, () => ({
    reference: 'BSN-' + Math.random().toString(36).slice(2, 7).toUpperCase(),
    advisorName: advisor.name,
    message: `${advisor.name} will call you within the hour to fix a time.`,
  })),
)
