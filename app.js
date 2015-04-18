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
var time = require('time');
var Email = require('email').Email


/*=================================
          Configuration
=================================*/

var collections = ["users", "clients"];
var db = require("mongojs").connect("mongodb://127.0.0.1/tracing-ink", collections);

var app = express();
var httpServer = http.createServer(app);

app.use('/public/views', express.static('/public/views'));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('./public'));
app.use(session({
    secret: 'blind porcupine',
    key: 'sid',
    resave: true,
    saveUninitialized: true
}));

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
        req.session.userType = user.type;
        // Send the user data to the dashboard view
        res.send(user);
          

      } else {
        // Wrong password
        res.send(false);
      }

    }
  });
});

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

// Get Clients
app.get('/api/getClients', function (req, res) {
    
  if (req.session.userType === "1") {
      var active = 1;
      db.clients.find({active:active}, function(err, clients){
        
        if (!err){
            
            res.send(clients);
            
        }else{
            
            res.send(false);
            
        }
      
      });
      
  }else{
    res.send(false);
  }
  
});

// Add a Client
app.post('/api/addClient', function (req, res) {
  if (req.session.user) {
      
      user = req.session.user;
      
      var email=req.param('email');
      var cName=req.param('cName');
      
      
      if( email == "" || cName == ""){
        res.redirect('/addClient');
      }else{

        db.clients.findOne({cName: cName}, function(err, client){
          if (!client){
              
              if (!err){
              
                console.log("no errors");
                
                var id = uid.v4();
                  
                var now = new time.Date();
                now = now.setTimezone("America/New_York");
                  
                now = now.toString();

                // Proceed to add 

                // Insert into the db
                db.clients.save({        
                    _id: id,          
                    email: email,           
                    cName: cName,
                    dateCreated: now,
                    active: 1
                });
            
                
                  var myMsg = new Email({
                    from: "tracing.ink.co@gmail.com",
                    to:   email,
                    subject: "Tracing Ink: Registration Invite",
                    body: "Thank you for choosing Tracing Ink. Please use the following link to"
                });
                  
                myMsg.send();
                  
                res.send(true);
              }else {
                  
                res.send(false);
              
              }

        }else{
          res.send(false);
        }
      });
      }
  }else{
    res.send(false);
  }
  
});

httpServer.listen(3000, function() {
  console.log('Express server listening on port 3000');
});
