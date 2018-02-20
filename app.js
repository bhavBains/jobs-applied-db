const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
	extended: true
}));

// Connection to Mongoose
mongoose.connect('mongodb://localhost:27017/jobs');
const db = mongoose.connection;

//routes
app.get('/', (req,res) => {
  res.render('index');
});

app.listen(3000, () => {
	console.log("server is up at PORT 3000")
});
