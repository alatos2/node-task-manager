const errorHandler = (err, req, res, next) => {
    console.error(err.stack)
  
    // Prisma unique constraint error
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'A record with that value already exists' })
    }
  
    // Prisma record not found
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Record not found' })
    }
  
    // Default error
    res.status(err.status || 500).json({
      message: err.message || 'Internal server error'
    })
  }
  
  module.exports = { errorHandler }