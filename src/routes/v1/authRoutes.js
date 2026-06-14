const express = require('express');
const router = express.Router();
const {login, register} = require('../../controllers/authController');
const {validate} = require('../../middleware/validateMiddleware')
const {registerSchema, loginSchema} = require('../../validators/authValidator')
const { authLimiter } = require('../../middleware/rateLimitMiddleware')

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);

module.exports = router