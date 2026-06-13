const request = require('supertest')
const app = require('../app')
const prisma = require('../config/prisma')

// Helper to register and login, returns token
const getAuthToken = async () => {
  await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Tosin Alabi',
      email: 'tosin@test.com',
      password: 'password123'
    })

  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: 'tosin@test.com',
      password: 'password123'
    })

  return res.body.token
}

describe('Task Routes', () => {

  describe('POST /api/v1/tasks', () => {

    it('should create a task successfully', async () => {
      const token = await getAuthToken()

      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Learn Node.js',
          description: 'Build a REST API'
        })

      expect(res.status).toBe(201)
      expect(res.body.task.title).toBe('Learn Node.js')
      expect(res.body.task.completed).toBe(false)
    })

    it('should fail without a token', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .send({ title: 'Learn Node.js' })

      expect(res.status).toBe(401)
      expect(res.body.message).toBe('No token provided')
    })

    it('should fail with invalid data', async () => {
      const token = await getAuthToken()

      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '' })

      expect(res.status).toBe(422)
      expect(res.body.errors).toBeDefined()
    })

  })

  describe('GET /api/v1/tasks', () => {

    it('should return paginated tasks', async () => {
      const token = await getAuthToken()

      // Create 3 tasks
      await request(app).post('/api/v1/tasks').set('Authorization', `Bearer ${token}`).send({ title: 'Task 1' })
      await request(app).post('/api/v1/tasks').set('Authorization', `Bearer ${token}`).send({ title: 'Task 2' })
      await request(app).post('/api/v1/tasks').set('Authorization', `Bearer ${token}`).send({ title: 'Task 3' })

      const res = await request(app)
        .get('/api/v1/tasks?page=1&limit=2')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.data.length).toBe(2)
      expect(res.body.meta.total).toBe(3)
      expect(res.body.meta.totalPages).toBe(2)
      expect(res.body.meta.hasNextPage).toBe(true)
      expect(res.body.meta.hasPrevPage).toBe(false)
    })

    it('should fail without a token', async () => {
      const res = await request(app).get('/api/v1/tasks')

      expect(res.status).toBe(401)
    })

  })

  describe('PUT /api/v1/tasks/:id', () => {

    it('should update a task successfully', async () => {
      const token = await getAuthToken()

      // Create a task first
      const created = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Original title' })

      console.log('Created task:', created.body)
      const taskId = created.body.task.id
      console.log('Task ID:', taskId, typeof taskId)

      const res = await request(app)
        .put(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated title' })

      expect(res.status).toBe(200)
      expect(res.body.task.title).toBe('Updated title')
    })

  })

  describe('DELETE /api/v1/tasks/:id', () => {

    it('should delete a task successfully', async () => {
      const token = await getAuthToken()

      // Create a task first
      const created = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Task to delete' })

      const taskId = created.body.task.id

      const res = await request(app)
        .delete(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.message).toBe('Task deleted successfully')

      // Verify it's gone from DB
      const task = await prisma.task.findUnique({ where: { id: taskId } })
      expect(task).toBeNull()
    })

  })

})