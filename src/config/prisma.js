const { PrismaClient } = require('../generated/prisma/client')
const { PrismaMariaDb } = require('@prisma/adapter-mariadb')
require('dotenv').config()

const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
    database: process.env.DATABASE_NAME,
    connectionLimit: 5
})

const prisma = new PrismaClient({ adapter })

module.exports = prisma