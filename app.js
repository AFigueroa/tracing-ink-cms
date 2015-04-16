/*=================================
              Modules
=================================*/

var bodyParser = require('body-parser');
var express = require('express');
var hashids = require('hashids');
var http = require('http');
var mongo = require('mongojs');
var uid = require('node-uuid');
var cookieSession = require('cookie-session');
var cookieParser = require('cookie-parser');
var passport = require('passport'), LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var moment = require('moment');


/*=================================
          Configuration
=================================*/

var collections = ["users"];
var db = require("mongojs").connect("mongodb://127.0.0.1/tracing-ink", collections);

var app = express();
var httpServer = http.createServer(app);

app.use('/public/views', express.static('/public/views'));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('./public'));
app.use(session({secret: 'blind porcupine',
key: 'sid',
resave: true,
saveUninitialized: true
}));

// If you delete this WW3 will become a reality
app.use(bodyParser.json());
// This is needed for the forms to work
app.use(bodyParser.urlencoded({extended: false}));


/*=================================
            Routes
=================================*/

// Login Action
app.post('/api/login', function (req, res) {

  // Gather the values of the submission
  var email = req.param('email');
  var pass = req.param('pass');

  db.users.findOne({email: email}, function (err, user) {

    if (!user) {

      // User was not found redirect...
      res.send(false);

    } else {

      // On success...
      if (user.pass === pass) {

        req.session.logged = 1;
        req.session.user = {
            "_id" : user._id,
            "fname" : user.fname,
            "lname" : user.lname,
            "email" : user.email,
            "phone" : user.phone,
            "type" : user.type
        }
        
        // Send the user data to the dashboard view
        res.send(user);
          

      } else {
        // Wrong password
        res.send(false);
      }

    }
  });
});

///*=================================
//        Register Route
//=================================*/
//
//// Register Action
//app.post('/api/register', function (req, res) {
//
//  // Gather the values of the submission
//  var email=req.param('email');
//  var phone=req.param('phone');
//  var fname=req.param('fname');
//  var lname=req.param('lname');
//  var pass=req.param('pass');
//  var repass=req.param('repass');
//
//  if( email == ""
//    || phone == ""
//    || fname == ""
//    || lname == ""
//    || pass == ""
//    || repass == ""
//    || pass != repass
//  ){
//    res.redirect('/register');
//  }else{
//
//    db.users.findOne({email: email}, function(err, user){
//      if (!user){
//        
//          var id = uid.v4();
//          
//          // Proceed to add 
//          console.log('An existing user was NOT found. Proceding to INSERT...');
//        
//          // Insert into the db
//          db.users.save({        
//              _id: id,          
//              email: email,           
//              phone: phone,               
//              fname: fname,          
//              lname: lname,          
//              pass: pass
//          });
//
//
//          // Session for logged is TRUE
//          req.session.logged = 1;
//          req.session.userId = id;
//          req.session.fname = fname;
//
//          // On success...
//          // Send the user data to the dashboard view
//          res.send(user);
//
//    }else{
//      // User found
//      req.session.logged = 0;
//      console.log(req.session.logged);
//      console.log('An existing user WAS found. Proceeding to LOGIN...');
//      res.send(false);
//    }
//  });
//}
//});

// Logout Route 
app.get('/api/logout', function (req, res) {
  req.session.logged = 0;
  req.session.userId = null;
  res.send(true);
});

// Authentication Route 
app.get('/api/authCheck', function (req, res) {
  if (req.session.logged === 1) {
      
    res.send(true);
      
  }else{
      
    res.send(false);
      
  }
  
});

// Get User Data Route 
app.get('/api/getUser', function (req, res) {
  if (req.session.user) {
      
      user = req.session.user;
      res.send(user);
      
  }else{
    res.send(false);
  }
  
});

/*=================================
        Protected Routes
=================================*/

// Dashboard
app.get('/dashboard', function (req, res) {

  if (req.session.logged === 1) {

    if (req.session.userId) {

      if (req.session.fname) {

        // Found a unique userId and fname
        db.users.findOne({_id: req.session.userId}, function (err, user) {
          
            //The user is logged in...
            res.render('/public/views/dashboard', {
                title: 'My Dashboard',
                logged: req.session.logged,
                fname: req.session.fname,
                userId: req.session.userId
            });
        });
      } else {
        // No fname found
        res.redirect('/');
      }

    } else {
      // No userId found
      res.redirect('/');
    }

  } else {

    // User is not logged in, redirect to login page
    res.redirect('/');
  }
});


httpServer.listen(3000, function() {
  console.log('Express server listening on port 3000');
});
