const request = require('supertest')
const app = require('../app')
const prisma = require('../config/prisma')

describe('Auth Routes', () => {

  describe('POST /api/v1/auth/register', () => {

    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Tosin Alabi',
          email: 'tosin@test.com',
          password: 'password123'
        })

      expect(res.status).toBe(201)
      expect(res.body.message).toBe('User created')
      expect(res.body.user.email).toBe('tosin@test.com')
      expect(res.body.user.password).toBeUndefined() // password never exposed
    })

    it('should fail with invalid data', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'T',
          email: 'notanemail',
          password: '123'
        })

      expect(res.status).toBe(422)
      expect(res.body.errors).toBeDefined()
    })

    it('should fail with duplicate email', async () => {
      // Create user first
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Tosin Alabi',
          email: 'tosin@test.com',
          password: 'password123'
        })

      // Try registering again with same email
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Tosin Alabi',
          email: 'tosin@test.com',
          password: 'password123'
        })

      expect(res.status).toBe(409)
      expect(res.body.message).toBe('Email already taken')
    })

  })

  describe('POST /api/v1/auth/login', () => {

    beforeEach(async () => {
      // Create a user before each login test
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Tosin Alabi',
          email: 'tosin@test.com',
          password: 'password123'
        })
    })

    it('should login successfully and return a token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'tosin@test.com',
          password: 'password123'
        })

      expect(res.status).toBe(200)
      expect(res.body.token).toBeDefined()
    })

    it('should fail with wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'tosin@test.com',
          password: 'wrongpassword'
        })

      expect(res.status).toBe(401)
      expect(res.body.message).toBe('Invalid credentials')
    })

  })

})