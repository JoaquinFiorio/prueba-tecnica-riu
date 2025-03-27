const express = require('express');
const app = express();
const userRoutes = require('./riu');

app.use('/riu', userRoutes);

module.exports = app;