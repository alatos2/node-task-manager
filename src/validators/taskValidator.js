const {z} = require('zod')

const createTaskValidator = z.object({
    title: z.string().min(1, 'Title is required').max(255),
    description: z.string().optional()
})

const updateTaskValidator = z.object({
    title: z.string().min(1, 'Title is required').max().optional(),
    description: z.string().optional()
})

module.exports = {
    createTaskValidator,
    updateTaskValidator
}