import { z } from 'zod'

export const organisationSearchSchema = z.object({
    query: z.string().trim().max(255),
})
