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

export const userChangePasswordSchema = z.object({
    email: z.string().email("Please enter a valid id"),
    password: z.string().min(4, "Password should be at least 4 characters").max(16, "Password should be at most 15 characters"),
});

export type userChangePasswordSchemaType = z.infer<typeof userChangePasswordSchema>;
export type loginType = z.infer<typeof loginSchema>
