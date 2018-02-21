const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
	extended: true
}));

// Connection to Mongoose
mongoose.connect('mongodb://localhost:27017/jobs');
const db = mongoose.connection;

// Mongoose Schema
const Schema = mongoose.Schema;
const jobSchema = new Schema({
	title: {type: String, required: true},
	company: {type: String, required: true},
	location: {type: String, required: true},
	url: {type: String, required: true},
	description: String,
	jobType: [{type: String}],
	coverLetter: Boolean,
});

//Mongoose Model
const Job = mongoose.model('Job', jobSchema);

//routes
app.get('/', (req,res) => {
	Job.find()
		.then((doc) => {
			console.log("data recieved, yay");
			res.render('index', {jobs: doc});
		});  
});

app.post('/addJob', (req, res) => {
	const newJob = {
		title: req.body.jobTitle,
		company: req.body.company,
		location: req.body.location,
		url: req.body.jobUrl,
		description: req.body.description,
		jobType: req.body.jobType,
		coverLetter: req.body.coverLetter,
	};

	const data = new Job(newJob);
	data.save();
	

	res.redirect('/');
});


// Opening up the port to run the App
app.listen(3000, () => {
	console.log("server is up at PORT 3000")
});
