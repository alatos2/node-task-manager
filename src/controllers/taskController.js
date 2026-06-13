const prisma = require('../config/prisma');

const createTask = async (req, res, next) => {
    try {
        const {title, description} = req.body;

        const {userId} = req.user;

        const task = await prisma.task.create({
            data: {
                title, description, userId
            }
        })

        res.status(201).json({
            message: 'Task created',
            task
        })
    } catch (err) {
        next(err)
    }
}

const getTasks = async (req, res, next) => {
    try {
        const {userId} = req.user;
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10

        const skip = (page - 1) * limit

        const total = await prisma.task.count({ where: { userId } })
        const totalPages = Math.ceil(total / limit)

        const tasks = await prisma.task.findMany({
            where: {userId: userId},
            take: limit,
            skip: skip
        });

        return res.status(200).json({
            data: tasks,
            meta: {
                total,
                page,
                limit,
                totalPages,// 👈 how would you calculate total pages from total and limit?
                hasNextPage: page < totalPages,// 👈 is there a next page?
                hasPrevPage: page > 1// 👈 is there a previous page?
            }});
    } catch (err) {
        next(err)
    }
}

const deleteTask = async (req, res, next) => {
    try {
        const {id} = req.params;

        await prisma.task.delete({where: {id: parseInt(id)}});

        return res.status(200).json({message: 'Task successfully deleted'});
    } catch (err) {
        next(err)
    }
}

const updateTask = async (req, res, next) => {
    try {
        const {title, description} = req.body;

        const {id} = req.params;

        const task = await prisma.task.update({
            where: {id: parseInt(id)},
            data: {
                title: title,
                description: description
            }
        });

        return res.status(200).json({message: 'Update successful', task})
    } catch (err) {
        next(err)
    }
}



module.exports = {
    createTask,
    deleteTask,
    getTasks,
    updateTask
}