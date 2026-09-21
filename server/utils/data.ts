import type {
  Advisor,
  Answer,
  Chapter,
  ImageAsset,
  PaymentMilestone,
  Property,
  Slot,
  StatTile,
  Unit,
} from '~~/types'
import { LQIP } from './lqip'

const img = (name: string, alt: string, width: number, height: number): ImageAsset => ({
  name,
  alt,
  width,
  height,
  lqip: LQIP[name] ?? '',
})

export const advisor: Advisor = {
  name: 'Sara Rahman',
  role: 'Senior Advisor',
  company: 'Prestige Group',
  note: 'I have held unit #G24 for you until Friday. Ask Rechitta anything before we speak.',
  avatar: '/media/advisor',
}

export const property: Property = {
  id: 'berkeley-square-north',
  name: 'Berkeley Square North',
  developer: 'Prestige Properties Group',
  district: 'Jumeirah Village Circle',
  city: 'Dubai',
  tagline: 'A quiet address in the middle of everything.',
  handover: 'Q3 2026',
  completion: 64,
  priceFrom: 'AED 1.68M',
  priceFromLabel: 'Studios to 3 bed',
  /* The design sets the first sentence on its own line and lets the rest wrap,
     so the copy carries an explicit break rather than relying on box width. */
  greeting:
    "Hello Aryaman! I'm Rechitta.\nYour broker asked me to speak with you, because buying your first home is one of life's biggest decisions.",
  advisor,
}

export const chapters: Chapter[] = [
  {
    id: 'overview',
    query: 'Tell me about this investment',
    eyebrow: 'The overview',
    title: 'Berkeley Square North',
    statLabel: 'Handover',
    statValue: 'Q3 2026',
    image: img('overview', 'The pool deck and glass facade of Berkeley Square North at dusk', 800, 531),
    body: 'Two towers of 312 homes around a landscaped podium, built by Prestige Properties Group and 64% complete. Escrow-backed, RERA registered, and handed over furnished to shell-and-core plus kitchens.',
    facts: [
      { label: 'Homes', value: '312' },
      { label: 'Towers', value: '2' },
      { label: 'Built', value: '64%' },
      { label: 'Escrow', value: 'RERA 8841' },
    ],
  },
  {
    id: 'vision',
    query: 'Give me a summary of the Dubai 2040 vision',
    eyebrow: 'The vision',
    title: 'Dubai 2040',
    statLabel: 'Journey towards',
    statValue: 'Sustainability',
    image: img('vision', 'Aerial view of the Jumeirah Village Circle community at golden hour', 1335, 753),
    body: 'The Dubai 2040 Urban Master Plan doubles green and recreational space and puts 55% of the population within 800m of transit. Berkeley Square North sits inside one of the five designated urban centres.',
    facts: [
      { label: 'Green space', value: '+105%' },
      { label: 'Near transit', value: '55% of city' },
      { label: 'Plan horizon', value: '2040' },
    ],
  },
  {
    id: 'location',
    query: 'Where is it and what is the commute?',
    eyebrow: 'Location & connectivity',
    title: 'Jumeirah Village Circle',
    statLabel: 'Prime',
    statValue: 'Location',
    image: img('location', 'A Dubai Metro train crossing the city skyline', 1600, 1067),
    body: 'Eighteen minutes to Dubai Marina, twenty-two to Downtown, and four minutes to the Al Khail Road interchange. The Metro Blue Line station at JVC South is scheduled to open the year after handover.',
    facts: [
      { label: 'Dubai Marina', value: '18 min' },
      { label: 'Downtown', value: '22 min' },
      { label: 'DXB airport', value: '27 min' },
      { label: 'Metro (2027)', value: '6 min walk' },
    ],
  },
  {
    id: 'details',
    query: 'Show me the two bed layouts and sizes',
    eyebrow: 'The details',
    title: 'The Perfect Home',
    statLabel: 'Starting from',
    statValue: '1,489 sqft',
    image: img('details', 'A pale oak and stone kitchen with integrated appliances', 2000, 1460),
    body: 'Full-height glazing, engineered oak floors, and a Bosch kitchen as standard. Two-bedroom layouts run 1,489 to 2,300 sqft, each with a utility room and a 110 sqft balcony.',
    facts: [
      { label: '2 bed', value: '1,489-2,300 sqft' },
      { label: 'Ceilings', value: '3.1 m' },
      { label: 'Kitchen', value: 'Bosch, fitted' },
      { label: 'Parking', value: '1-2 bays' },
    ],
  },
  {
    id: 'pricing',
    query: 'What is the payment plan?',
    eyebrow: 'Pricing & payment',
    title: 'The Plans',
    statLabel: 'Est. value',
    statValue: 'AED 2.8M',
    image: img('pricing', 'A home office with warm lighting and a sculptural wall panel', 2000, 1501),
    body: 'A 60/40 plan: 20% on booking, 40% across construction milestones, 40% on handover. No DLD waiver, but the developer covers the 4% transfer fee on units released this quarter.',
    facts: [
      { label: 'Booking', value: '20%' },
      { label: 'During build', value: '40%' },
      { label: 'On handover', value: '40%' },
      { label: 'DLD fee', value: 'Developer pays' },
    ],
  },
  {
    id: 'returns',
    query: 'What is the rental yield and appreciation?',
    eyebrow: 'Returns & investment',
    title: 'The Numbers',
    statLabel: 'Rental ROI',
    statValue: '12.73%',
    image: img('returns', 'A living room at night with a wide screen and ring pendant lights', 2000, 997),
    body: 'JVC two-bedroom stock let at an average AED 165,000 in the last twelve months against a 2.8M entry. Gross yield of 12.73%, net of service charges closer to 8.9%.',
    facts: [
      { label: 'Gross yield', value: '12.73%' },
      { label: 'Net yield', value: '8.9%' },
      { label: 'Avg. rent', value: 'AED 165k/yr' },
      { label: 'Service charge', value: 'AED 14/sqft' },
    ],
  },
  {
    id: 'amenities',
    query: 'What amenities and facilities are there?',
    eyebrow: 'Amenities',
    title: 'The Life Here',
    statLabel: 'Shared space',
    statValue: '48,000 sqft',
    image: img('amenities', 'The landscaped courtyard and palm-lined facade of the residences', 1024, 683),
    body: 'A 25m lap pool, a 4,000 sqft gym, two padel courts, a residents lounge and a supervised kids club. Retail on the ground floor includes a pharmacy, a clinic and a Spinneys.',
    facts: [
      { label: 'Pool', value: '25 m' },
      { label: 'Gym', value: '4,000 sqft' },
      { label: 'Padel', value: '2 courts' },
      { label: 'Retail', value: '11 units' },
    ],
  },
]

export const units: Unit[] = [
  {
    id: 'u-528-5',
    code: '#528',
    beds: 2,
    floor: 'Floor 5',
    sqft: 1511,
    price: 'AED 2.016M',
    note: 'Corner unit, park view',
    available: true,
  },
  {
    id: 'u-528-3',
    code: '#528',
    beds: 2,
    floor: 'Floor 3',
    sqft: 1489,
    price: 'AED 1.97M',
    note: 'Podium view, released this week',
    available: true,
  },
  {
    id: 'u-g24',
    code: '#G24',
    beds: 2,
    floor: 'Ground',
    sqft: 1620,
    price: 'AED 1.68M',
    note: 'Private pool, held for you until Friday',
    available: true,
  },
  {
    id: 'u-1104',
    code: '#1104',
    beds: 3,
    floor: 'Floor 11',
    sqft: 2300,
    price: 'AED 3.24M',
    note: 'Skyline view, last 3 bed on this stack',
    available: false,
  },
]

const overviewTiles: StatTile[] = [
  { label: 'Investment from', value: 'AED 2.8M', caption: '2 bed · 1,489-2,300 sqft' },
  { label: 'Handover', value: 'Q3 2026', caption: '64% completed' },
  { label: 'Market appreciation', value: '+17.5%', caption: 'AED 2.2B in 2026 · 5.7B in 2031', tone: 'positive' },
  { label: 'Rental ROI', value: '12.73%', caption: '2.2x five-year appreciation', tone: 'positive' },
]

const milestones: PaymentMilestone[] = [
  { label: 'On booking', percent: 20, due: 'Today' },
  { label: 'Structure complete', percent: 20, due: 'Mar 2026' },
  { label: 'Facade complete', percent: 10, due: 'Jul 2026' },
  { label: 'Fit-out complete', percent: 10, due: 'Nov 2026' },
  { label: 'On handover', percent: 40, due: 'Q3 2026' },
]

const skyline = img('skyline', 'The Dubai skyline at sunset seen from the north', 1600, 1066)

/**
 * A tiny intent matcher. Not clever on purpose: each intent owns a set of
 * trigger words, the best-scoring intent wins, and anything under the
 * threshold falls through to the unresolved answer so the empty state is
 * reachable by simply asking something off-topic.
 */
interface Intent {
  id: string
  triggers: string[]
  build: (query: string) => Answer
}

const intents: Intent[] = [
  {
    id: 'overview',
    triggers: ['overview', 'summary', 'tell me about', 'investment', 'worth', 'good buy', 'first'],
    build: (query) => ({
      id: 'a-overview',
      heading: 'Project Overview',
      query,
      summary:
        'Berkeley Square North is a 312-home development in Jumeirah Village Circle, 64% built and handing over in Q3 2026. Two-bedroom homes start at AED 1.97M and the area has returned 12.73% gross on rent over the last year.',
      hero: skyline,
      cards: [
        { kind: 'stats', title: 'Project Overview', tiles: overviewTiles },
        {
          kind: 'units',
          title: 'Available Homes',
          units: units.filter((u) => u.available),
        },
        {
          kind: 'note',
          title: 'What I would watch',
          body: 'Two things would change my answer here.',
          bullets: [
            'JVC has 6,400 units completing in 2026, which puts short-term pressure on rents.',
            'The 12.73% figure is gross. Service charges take it to roughly 8.9% net.',
            'Handover slipped once already, from Q1 to Q3 2026.',
          ],
        },
      ],
      followUps: ['What is the payment plan?', 'Show me two-bed units', 'How does this compare to Dubai Marina?'],
    }),
  },
  {
    id: 'payment',
    triggers: ['payment', 'plan', 'instal', 'deposit', 'mortgage', 'finance', 'down payment', 'pay'],
    build: (query) => ({
      id: 'a-payment',
      heading: 'Payment & Pricing',
      query,
      summary:
        'It is a 60/40 plan. You pay 20% to book, 40% across four construction milestones, and the remaining 40% on handover in Q3 2026. The developer is covering the 4% DLD transfer fee on units released this quarter.',
      hero: img('pricing', 'A home office with warm lighting and a sculptural wall panel', 2000, 1501),
      cards: [
        {
          kind: 'payment',
          title: 'Payment schedule',
          milestones,
          footnote: 'Based on unit #528, Floor 3 at AED 1.97M. Figures exclude the 2% agency fee.',
        },
        {
          kind: 'stats',
          title: 'What that means in cash',
          tiles: [
            { label: 'Due today', value: 'AED 394,000', caption: '20% booking deposit' },
            { label: 'During construction', value: 'AED 788,000', caption: 'Across four milestones' },
            { label: 'On handover', value: 'AED 788,000', caption: 'Mortgageable at this point' },
            { label: 'DLD fee', value: 'AED 0', caption: 'Developer pays the 4%', tone: 'positive' },
          ],
        },
      ],
      followUps: ['Can I mortgage the handover payment?', 'What are the service charges?', 'Book a viewing'],
    }),
  },
  {
    id: 'units',
    triggers: ['unit', 'available', '2 bed', 'two bed', '3 bed', 'apartment', 'floor plan', 'layout', 'sqft', 'size'],
    build: (query) => ({
      id: 'a-units',
      heading: 'Available Homes',
      query,
      summary:
        'Three homes are releasable today and one is already under offer. The ground-floor #G24 with the private pool is the one your advisor has held for you.',
      hero: img('details', 'A pale oak and stone kitchen with integrated appliances', 2000, 1460),
      cards: [
        { kind: 'units', title: 'The Homes', units },
        {
          kind: 'stats',
          title: 'Across the two-bed stock',
          tiles: [
            { label: 'Smallest', value: '1,489 sqft', caption: 'Floor 3, podium view' },
            { label: 'Largest', value: '2,300 sqft', caption: 'Floor 11, 3 bed' },
            { label: 'Price per sqft', value: 'AED 1,323', caption: 'Area average is 1,410', tone: 'positive' },
            { label: 'Balcony', value: '110 sqft', caption: 'Standard on every 2 bed' },
          ],
        },
      ],
      followUps: ['What is the payment plan?', 'Tell me about the amenities', 'Book a viewing'],
    }),
  },
  {
    id: 'location',
    triggers: ['location', 'where', 'commute', 'metro', 'school', 'near', 'proximity', 'connect', 'drive'],
    build: (query) => ({
      id: 'a-location',
      heading: 'Location & Connectivity',
      query,
      summary:
        'Jumeirah Village Circle, four minutes from the Al Khail Road interchange. Eighteen minutes to Dubai Marina, twenty-two to Downtown. Three schools rated Good or better are inside a ten-minute drive, and the Blue Line metro station opens in 2027.',
      hero: img('location', 'A Dubai Metro train crossing the city skyline', 1600, 1067),
      cards: [
        {
          kind: 'stats',
          title: 'Getting around',
          tiles: [
            { label: 'Dubai Marina', value: '18 min', caption: 'By car, off-peak' },
            { label: 'Downtown', value: '22 min', caption: 'By car, off-peak' },
            { label: 'DXB airport', value: '27 min', caption: 'Via Al Khail Road' },
            { label: 'Metro, Blue Line', value: '2027', caption: 'JVC South, 6 min walk' },
          ],
        },
        {
          kind: 'note',
          title: 'Schools within 10 minutes',
          body: 'KHDA ratings from the 2025 inspection cycle.',
          bullets: [
            'JSS International School: Good, 6 min',
            'Nord Anglia Dubai: Outstanding, 9 min',
            'Sunmarke School: Very Good, 10 min',
          ],
        },
      ],
      followUps: ['What are the service charges?', 'Show me available units', 'What is the rental yield?'],
    }),
  },
  {
    id: 'returns',
    triggers: ['roi', 'yield', 'rent', 'return', 'appreciat', 'resale', 'price history', 'capital'],
    build: (query) => ({
      id: 'a-returns',
      heading: 'Returns & Investment',
      query,
      summary:
        'Two-bedroom homes in JVC let at an average AED 165,000 last year. Against a 2.8M entry that is 12.73% gross, or about 8.9% net once the AED 14 per sqft service charge is out. Capital values are up 17.5% over three years.',
      hero: img('returns', 'A living room at night with a wide screen and ring pendant lights', 2000, 997),
      cards: [
        {
          kind: 'stats',
          title: 'Returns',
          tiles: [
            { label: 'Gross yield', value: '12.73%', caption: 'AED 165k rent on 2.8M', tone: 'positive' },
            { label: 'Net yield', value: '8.9%', caption: 'After AED 14/sqft service charge' },
            { label: '3-year appreciation', value: '+17.5%', caption: 'JVC two-bed median', tone: 'positive' },
            { label: 'Days on market', value: '41', caption: 'Down from 63 in 2024' },
          ],
        },
        {
          kind: 'note',
          title: 'The honest caveat',
          body: 'I would not underwrite 12.73% for the full hold period.',
          bullets: [
            '6,400 units complete in JVC during 2026, which is a lot of new supply.',
            'The 2024-25 rental spike was unusual; a 9-10% gross is the safer planning number.',
            'Service charges have risen 6% a year in this district since 2022.',
          ],
        },
      ],
      followUps: ['What is the payment plan?', 'Show me available units', 'Book a viewing'],
    }),
  },
  {
    id: 'amenities',
    triggers: ['amenit', 'pool', 'gym', 'facilit', 'life', 'community', 'padel', 'kids'],
    build: (query) => ({
      id: 'a-amenities',
      heading: 'Amenities',
      query,
      summary:
        '48,000 sqft of shared space on the podium: a 25m lap pool, a 4,000 sqft gym, two padel courts, a residents lounge and a supervised kids club. Eleven retail units on the ground floor including a clinic and a Spinneys.',
      hero: img('amenities', 'The landscaped courtyard and palm-lined facade of the residences', 1024, 683),
      cards: [
        {
          kind: 'stats',
          title: 'On the podium',
          tiles: [
            { label: 'Shared space', value: '48,000 sqft' , caption: 'Across two podium levels' },
            { label: 'Lap pool', value: '25 m', caption: 'Plus a separate kids pool' },
            { label: 'Gym', value: '4,000 sqft', caption: 'Technogym, 24 hours' },
            { label: 'Service charge', value: 'AED 14/sqft', caption: 'Covers all of the above' },
          ],
        },
      ],
      followUps: ['What are the service charges?', 'Show me available units', 'Where exactly is it?'],
    }),
  },
]

export function answerFor(rawQuery: string): Answer {
  const query = rawQuery.trim().replace(/\s+/g, ' ')
  const haystack = query.toLowerCase()

  let best: { intent: Intent; score: number } | null = null
  for (const intent of intents) {
    let score = 0
    for (const trigger of intent.triggers) {
      if (haystack.includes(trigger)) score += trigger.length
    }
    if (score > 0 && (!best || score > best.score)) best = { intent, score }
  }

  if (!best) {
    return {
      id: 'a-unresolved',
      heading: "I don't have that one",
      query,
      unresolved: true,
      summary:
        "I could not find that in the Berkeley Square North file. I only answer on this project, so I will not guess. Sara can pick this up in a viewing, or try one of these.",
      hero: skyline,
      cards: [],
      followUps: [
        'What is the payment plan?',
        'What is the rental yield?',
        'Show me available two-bed units',
        'How far is the metro?',
      ],
    }
  }

  return best.intent.build(query)
}

export const suggestions: string[] = [
  'Is there a 2-bed available?',
  "What's the price history?",
  'What is proximity to good schools',
  'Show me the floor plan',
  'How does the payment plan work?',
]

function nextSlots(): Slot[] {
  const out: Slot[] = []
  const base = new Date()
  base.setHours(0, 0, 0, 0)
  const times = ['10:00', '12:30', '16:00', '18:30']
  let added = 0
  for (let dayOffset = 1; added < 8 && dayOffset < 12; dayOffset++) {
    const d = new Date(base)
    d.setDate(d.getDate() + dayOffset)
    if (d.getDay() === 0) continue // Sunday is not a viewing day in Dubai
    for (const time of times) {
      if (added >= 8) break
      const [h, m] = time.split(':').map(Number)
      const slot = new Date(d)
      slot.setHours(h!, m!, 0, 0)
      out.push({
        id: `slot-${slot.getTime()}`,
        iso: slot.toISOString(),
        day: slot.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
        time,
        remaining: 1 + ((added + dayOffset) % 3),
      })
      added++
    }
  }
  return out
}

export function slots(): Slot[] {
  return nextSlots()
}
