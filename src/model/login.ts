import { z } from 'zod'

export interface loginTokenType {
    id: number,
    email: string,
    role: string
}

declare global {
    namespace Express {
        interface Request {
            user: loginTokenType,
        }
    }
}

export const loginSchema = z.object({
    email: z.string(),
    password: z.string().min(1).max(20)
})

export const userRegistrationSchema = z.object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(8, "Password should be at least 8 characters").max(16, "Password should be at most 15 characters"),
    role: z.string(),
});

export type UserRegistrationType = z.infer<typeof userRegistrationSchema>;
export type loginType = z.infer<typeof loginSchema>
