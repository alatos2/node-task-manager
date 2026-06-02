const express = require('express');
const router = express.Router();
const {protect} = require('../middleware/authMiddleware');
const {
    createTask,
    getTasks,
    updateTask,
    deleteTask
} = require('../controllers/taskController');

const {validate} = require('../middleware/validateMiddleware')
const {createTaskValidator, updateTaskValidator} = require('../validators/taskValidator')

router.post('/', protect, validate(createTaskValidator), createTask);
router.get('/', protect, getTasks);
router.put('/:id', protect, validate(updateTaskValidator), updateTask)
router.delete('/:id', protect, deleteTask);

module.exports = router