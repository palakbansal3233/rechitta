/**
 * Contracts shared by the mock server and the client.
 * Server handlers import these too, so a change to the shape breaks the
 * build on both sides at once.
 */

export type Scenario = 'ok' | 'slow' | 'error' | 'empty' | 'offline'

export interface ImageAsset {
  /** Base name; the client composes the srcset from `-800/-1280/-1920.webp`. */
  name: string
  alt: string
  width: number
  height: number
  /** ~1KB inline JPEG used for the blur-up placeholder. */
  lqip: string
}

export interface Advisor {
  name: string
  role: string
  company: string
  note: string
  avatar: string
}

export interface Property {
  id: string
  name: string
  developer: string
  district: string
  city: string
  tagline: string
  handover: string
  completion: number
  priceFrom: string
  priceFromLabel: string
  greeting: string
  advisor: Advisor
}

export interface Chapter {
  /** The question this card opens, so the destination lives in the data
      rather than depending on the intent matcher guessing from the title. */
  query: string
  id: string
  eyebrow: string
  title: string
  statLabel: string
  statValue: string
  image: ImageAsset
  body: string
  facts: { label: string; value: string }[]
}

export interface StatTile {
  label: string
  value: string
  caption: string
  /** Rendered as a positive/neutral tint on the value. */
  tone?: 'default' | 'positive'
}

export interface Unit {
  id: string
  code: string
  beds: number
  floor: string
  sqft: number
  price: string
  note: string
  available: boolean
}

export interface PaymentMilestone {
  label: string
  percent: number
  due: string
}

export type AnswerCard =
  | { kind: 'stats'; title: string; tiles: StatTile[] }
  | { kind: 'units'; title: string; units: Unit[] }
  | { kind: 'payment'; title: string; milestones: PaymentMilestone[]; footnote: string }
  | { kind: 'note'; title: string; body: string; bullets: string[] }

export interface Answer {
  id: string
  /** What the agent heard, normalised. */
  query: string
  /** Title for the answer surface, specific to the question that was asked. */
  heading: string
  /** One-paragraph spoken reply shown above the cards. */
  summary: string
  hero: ImageAsset
  cards: AnswerCard[]
  followUps: string[]
  /** Populated when the agent could not match the question. */
  unresolved?: boolean
}

export interface Slot {
  id: string
  iso: string
  day: string
  time: string
  remaining: number
}

export interface BookingRequest {
  slotId: string
  name: string
  email: string
  phone?: string
  notes?: string
}

export interface BookingResult {
  reference: string
  slot: Slot
  advisor: Advisor
  calendarHint: string
}

export interface ApiError {
  code: 'server_error' | 'validation_error' | 'not_found' | 'offline'
  message: string
  fields?: Record<string, string>
}
