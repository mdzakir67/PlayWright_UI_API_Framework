import {number, z } from "zod"

export const userSchema =z.object({
    id:z.number(),
    email:z.email()
})

export const currentUserSchema = z.object({
    userId:z.number(),
    email:z.email(),
    iat:z.number(),
    exp:z.number()
})

export const RegisterResponseSchema = z.object({
    success:z.boolean(),
    token: z.string().regex(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,'Invalid JWT token format'),
    user: userSchema
})

export const LogInUserResponseSchema = z.object({
  success:z.boolean(),
    token: z.string().regex(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,'Invalid JWT token format'),
    user: userSchema
})

export const CurrentLoggedInUserSchema = z.object({
    success:z.boolean(),
    user: currentUserSchema
})

export type RegisterUserResponse = z.infer<typeof RegisterResponseSchema>;
export type LogInUserResponse = z.infer<typeof LogInUserResponseSchema>;
export type CurrentLoggedInUserResponse = z.infer<typeof CurrentLoggedInUserSchema>;