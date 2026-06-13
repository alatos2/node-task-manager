const express = require('express');
const {errorHandler} = require('./middleware/errorMiddleware')

const app = express();

// Middleware to parse JSOn bodies
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.json({
        message: 'Task Manager API is running 🚀'
    })
});

const v1Routes = require('./routes/v1/index')
app.use('/api/v1', v1Routes)
// app.use('/api/v2', v2Routes)  // 👈 v1 still works for old clients

// global error handler
app.use(errorHandler)

module.exports = app;
