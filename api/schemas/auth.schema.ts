import { z } from "zod"

export const userSchema =z.object({
    id:z.number(),
    email:z.string()
})

export const registerResponseSchema = z.object({
    success:z.boolean(),
    token: z.string().regex(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,'Invalid JWT token format'),
    user: userSchema
})

export type registerResponse = z.infer<typeof registerResponseSchema>;