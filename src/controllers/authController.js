const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const register = async (req, res) => {
    const {name, email, password} = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name, email, password: hashedPassword
        }
    })

    res.status(201).json({
        message: 'User created',
        user
    })
}

const login = async (req, res) => {
    const {email, password} = req.body;

    const user = await prisma.user.findUnique({where: {email}});

    if (!user) {
        return res.status(404).json({message: 'User not found'})
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status('401').json({message: 'Invalid credentials'});
    }

    // generate JWT token
    const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET, {expiresIn: '7d'})

    res.status(200).json({message: 'Login successful', token});

}

module.exports = {
    register,
    login
}