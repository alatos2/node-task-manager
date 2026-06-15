const express = require('express');
const router = express.Router();
const {login, register, refresh, logout} = require('../../controllers/authController');
const {validate} = require('../../middleware/validateMiddleware')
const {registerSchema, loginSchema} = require('../../validators/authValidator')
const { authLimiter } = require('../../middleware/rateLimitMiddleware')

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);

module.exports = router