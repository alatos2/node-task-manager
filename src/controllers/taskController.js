const store = (req, res) => {
    const {title, description} = req.body;

    // db

    res.status(201).json({
        message: 'Task created!',
        task
    });
}

module.exports = {
    store
}