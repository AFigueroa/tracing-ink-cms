var bodyParser = require('body-parser');
var express = require('express');
var hashids = require('hashids');
var http = require('http');
var ejs = require('ejs');
var mongo = require('mongojs');
var uid = require('node-uuid');
var cookieSession = require('cookie-session');
var cookieParser = require('cookie-parser');
var passport = require('passport'), LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var moment = require('moment');

var collections = ["users"];
var db = require("mongojs").connect("mongodb://178.62.137.35/figdevelopmentdb", collections);

var app = express();
var httpServer = http.createServer(app);


app.use('/views', express.static('/views'));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('./public'));
app.use(session({secret: 'blind porcupine',
key: 'sid',
resave: true,
saveUninitialized: true
}));
app.set('view engine', 'ejs');

// If you delete this WW3 will become a reality
app.use(bodyParser.json());
// This is needed for the forms to work
app.use(bodyParser.urlencoded({extended: false}));

/*=================================
Initial Route
=================================*/

// Home Route
app.get('/', function (req, res) {
  /*
  This route will query all posts in the mongo posts collection
  and load a post with it's corresponding comments
  */
  var userId = 0;
  if (req.session.logged) {

    var logged = req.session.logged;
    userId = req.session.userId;

  } else {
    req.session.logged = 0;
    userId = 0;
  }
  // On success...
  res.render('index', {
    title: 'Home',
    logged: req.session.logged,
    userId: userId
  });

});


/*=================================
User Routes
=================================*/

// Dashboard
app.get('/users/dashboard', function (req, res) {

  if (req.session.logged === 1) {

    if (req.session.userId) {

      if (req.session.fname) {

        // Found a unique userId and fname
        db.users.findOne({_id: req.session.userId}, function (err, user) {
          //The user is logged in...
          res.render('dashboard', {
            title: 'My Dashboard',
            logged: req.session.logged,
            fname: req.session.fname,
            userId: req.session.userId
          });
        });
      } else {
        // No fname found
        res.redirect('login');
      }

    } else {
      // No userId found
      res.redirect('login');
    }

  } else {

    // User is not looged in, redirect to login page
    res.redirect('/users/login');
  }
});

// Login
app.get('/users/login', function (req, res) {

  if (req.session.logged === 1) {

    // The user is already logged in...
    res.redirect('/users/dashboard');

  } else {

    // Not logged yet
    res.render('login', {
      title: 'Login',
      logged: req.session.logged
    });
  }

});

// Login Action
app.post('/users/loginaction', function (req, res) {

  // Gather the values of the submission
  var email = req.param('email');
  var pass = req.param('pass');

  db.users.findOne({email: email}, function (err, user) {

    if (!user) {

      // User was not found redirect...
      res.redirect('/users/login');

    } else {

      // On success...
      if (user.pass === pass) {

        req.session.logged = 1;
        req.session.userId = user._id;
        req.session.fname = user.fname;

        // Render the dashboard
        res.redirect('/users/dashboard');

      } else {
        // Wrong password
        res.redirect('/users/login');
      }

    }
  });
});

// Signup
app.get('/users/signup', function (req, res) {

  // On success...
  res.render('signup', {
    title: 'Create Account',
    logged: req.session.logged
  });
});

// Signup Action
app.post('/users/signupaction', function (req, res) {

  // Gather the values of the submission
  var email=req.param('email');
  var phone=req.param('phone');
  var fname=req.param('fname');
  var lname=req.param('lname');
  var pass=req.param('pass');
  var repass=req.param('repass');

  if( email == ""
    || phone == ""
    || fname == ""
    || lname == ""
    || pass == ""
    || repass == ""
    || pass != repass
  ){
    res.redirect('/users/signup');
  }else{

    db.users.findOne({email: email}, function(err, user){
      if (!user){
        var id = uid.v4();
        // Proceed to add
        console.log('An existing user was NOT found. Proceding to INSERT...');
        // Insert into the db
        db.users.save
        (
        {
          _id: id,
          email: email,
          phone: phone,
          fname: fname,
          lname: lname,
          pass: pass
        }
      );


      // Session for logged is TRUE
      req.session.logged = 1;
      req.session.userId = id;
      req.session.fname = fname;

      // On success...
      res.render('signupsuccess', {
        title: 'Success',
        email: email,
        userId: id,
        fname: fname,
        logged: req.session.logged
      });

    }else{
      // User found
      req.session.logged = 0;
      console.log(req.session.logged);
      console.log('An existing user WAS found. Proceeding to LOGIN...');
      res.redirect('/users/login');
    }
  });
}
});

app.get('/users/logout', function (req, res) {
  req.session.logged = 0;
  req.session.userId = null;
  res.redirect('/');
});

// Logout Action
app.get('/users/logout', function (req, res) {
  req.session.logged = 0;
  req.session.userId = null;
  res.redirect('/');
})


httpServer.listen(3000, function() {
  console.log('Express server listening on port 3000');
});
