const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

// Central route registry
app.use('/api', require('./routes/index'));

app.use(errorHandler);

module.exports = app;