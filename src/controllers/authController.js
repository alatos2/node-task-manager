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
        const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET, {expiresIn: '7d'})

        res.status(200).json({message: 'Login successful', token});
    } catch (err) {
        next(err)
    }

}

module.exports = {
    register,
    login
}