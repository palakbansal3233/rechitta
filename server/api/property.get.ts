import { property } from '../utils/data'
import { mockRespond } from '../utils/mock'

export default defineEventHandler((event) =>
  mockRespond(event, 220, () => property),
)
