import { chapters } from '../utils/data'
import { mockRespond } from '../utils/mock'
import type { Chapter } from '~~/types'

export default defineEventHandler((event) =>
  mockRespond<Chapter[]>(event, 480, () => chapters, []),
)
