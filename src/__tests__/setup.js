const {execSync} = require('child_process')
const prisma = require('../config/prisma')

// run all migrations on test DB before test
beforeAll(async () => {
    // Create test database if it doesn't exist
    execSync(`mysql -u root -e "CREATE DATABASE IF NOT EXISTS jest_test"`)

    execSync('npx prisma migrate deploy', {
        env: {
            ...process.env,
            DATABASE_URL: process.env.TEST_DATABASE_URL
        }
    })
})

// clean tables before each test
beforeEach(async () => {
    await prisma.task.deleteMany()
    await prisma.user.deleteMany()
})

//disconnect after all test
afterAll(async () => {
    await prisma.$disconnect()
})