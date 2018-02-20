const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Connection to Mongoose
mongoose.connect('mongodb://localhost/jobs');
const db = mongoose.connection;

