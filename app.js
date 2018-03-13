const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const session = require('express-session');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
	extended: true
}));

//use sessions for tracking logins
app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false
}));

// Connection to Mongoose
mongoose.connect('mongodb://localhost:27017/jobs');
const db = mongoose.connection;

// Mongoose Schema for Jobs
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


// Mongoose Schema for Users
var UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  passwordConf: {
    type: String,
    required: true,
  }
});

//authenticate input against database
UserSchema.statics.authenticate = function (email, password, callback) {
  User.findOne({ email: email })
    .exec(function (err, user) {
      if (err) {
        return callback(err)
      } else if (!user) {
        var err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }
      bcrypt.compare(password, user.password, function (err, result) {
        if (result === true) {
          return callback(null, user);
        } else {
          return callback();
        }
      })
    });
}

//hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
	var user = this;
	bcrypt.hash(user.password, 10, function (err, hash){
		if (err) {
			return next(err);
		}
		user.password = hash;
		next();
	})
});

var User = mongoose.model('User', UserSchema);

app.get('/users', (req, res) => {
	res.render('users');
});

// Post route for register
app.post('/register', (req, res, next) => {
	// confirm that user typed same password twice
  if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }
	if (req.body.email && req.body.username && req.body.password && req.body.passwordConf) {
		var userData = {
			email: req.body.email,
			username: req.body.username,
			password: req.body.password,
			passwordConf: req.body.passwordConf,
		}

		//use schema.create to insert data into the db
		User.create(userData, function (err, user) {
			if (err) {
				return next(err)
			} else {
				req.session.userId = user._id;
				return res.redirect('/');
			}
		});
	} else if (req.body.loginUser && req.body.loginPassword) {
			User.authenticate(req.body.loginUser, req.body.loginPassword, function (error, user) {
				if (error || !user) {
					var err = new Error('Wrong email or password.');
					err.status = 401;
					return next(err);
				} else {
					req.session.userId = user._id;
					let user = user[req.session["userId"]];
					console.log(user);
					return res.redirect('/', {user: user});
				}
			});
		} else {
			var err = new Error('All fields required.');
			err.status = 400;
			return next(err);
		}
});

// Logout 
app.get('/logout', (req,res,next) => {
	if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});


// Opening up the port to run the App
app.listen(3000, () => {
	console.log("server is up at PORT 3000")
});
