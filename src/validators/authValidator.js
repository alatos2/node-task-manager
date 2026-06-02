const {z} = require('zod')

const registerSchema = z.object({
    name: z.string().min(2, 'Name must not be less than two characters'),
    email: z.string().email('Invalid Email Address'),
    password: z.string().min(6, 'Password must be at least 6 characters')
})

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
})

module.exports = {
    registerSchema,
    loginSchema
}