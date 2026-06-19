const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middlewares/error.middleware');
const { success } = require('./utils/response');


// Routes
const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(cors());
app.use(express.json());


// Mount routes
app.use('/api/auth', authRoutes);

app.use(errorHandler);

module.exports = app;