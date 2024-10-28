import { z } from 'zod'

export const signInSchema = z.object({
    code: z.string(),
    password: z.string()
})