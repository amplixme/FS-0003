const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middlewares/error.middleware');
const { success } = require('./utils/response');

const app = express();

app.use(cors());
app.use(express.json());



app.use(errorHandler);

module.exports = app;