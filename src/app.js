require('dotenv').config();
const express = require('express');

const app = express();

// Middleware to parse JSOn bodies
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.json({
        message: 'Task Manager API is running 🚀'
    })
});

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes)

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
})