const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
require('dotenv').config();

const SALT_ROUNDS = process.env.NODE_ENV === 'test' ? 1 : 10

const register = async (req, res, next) => {
    try {
        const {name, email, password} = req.body;

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const existing = await prisma.user.findUnique({ where: { email } })

        if (existing) {
            return res.status(409).json({ message: 'Email already taken' })
        }

        const user = await prisma.user.create({
            data: {
                name, email, password: hashedPassword
            }
        })

        delete user.password;

        res.status(201).json({
            message: 'User created',
            user
        })
    } catch (err) {
        next(err)
    }
}

// Helper to generate tokens
const generateTokens = (userId) => {
    const accessToken = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: '15m'
    });

    const refreshToken = jwt.sign({userId}, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '7d'
    });

    return { accessToken, refreshToken }
}

const login = async (req, res, next) => {
    try {
        const {email, password} = req.body;

        const user = await prisma.user.findUnique({where: {email}});

        if (!user) {
            return res.status(404).json({message: 'User not found'})
        }

        // compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({message: 'Invalid credentials'});
        }

        // generate JWT token
        // const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET, {expiresIn: '7d'})

        const {accessToken, refreshToken} = generateTokens(user.id);

        // ✅ Correct
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        })

        res.status(200).json({message: 'Login successful', accessToken, refreshToken});

    } catch (err) {
        next(err)
    }

}

const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body

        if (!refreshToken) {
            return res.status(401).json({
                message: 'Refresh token required'
            })
        }

        const stored = await prisma.refreshToken.findUnique({where: {token: refreshToken}})

        if (!stored || stored.token < new Date()) {
            return res.status(401).json({
                message: 'Invalid or expired refresh token'
            })
        }

        // verify signature
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)

        // issue new token
        const accessToken = jwt.sign({userId: decoded.userId}, process.env.JWT_SECRET, {
            expiresIn: '15m'
        })

        return res.json({ accessToken })
        
    } catch (err) {
        return res.status(401).json({
            message: 'Invalid or expired refresh token'
        })
    }
}

// Delete refresh token
const logout = async (req, res, next) => {
    try {
        const {refreshToken} = req.body

        await prisma.refreshToken.deleteMany({where: {token: refreshToken}})

        return res.json({ message: 'Logged out successfully' })

    } catch (err) {
        next(err)
    }
}

module.exports = {
    register,
    login,
    refresh,
    logout
}