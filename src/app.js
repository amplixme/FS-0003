const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middlewares/error.middleware');
const { success } = require('./utils/response');
const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.use(errorHandler);

module.exports = app;
