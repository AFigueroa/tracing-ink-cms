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
var fs = require('fs');
var Email = require('email').Email;
var crypto = require("crypto"),
    algorithm = 'aes-256-ctr',
    password = 'n123oDHri1VCodqdaD';


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
                
        pass= encrypt(pass);
        pass= String(pass);
        
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

// Decrypt data
app.post('/api/decryptManager', function (req, res) {
    if(req.param('cName') && req.param('inviteId')){
        
        var cName = decrypt(req.param('cName'));
        var inviteId = decrypt(req.param('inviteId'));

        var manager = {
            cName: cName,
            inviteId: inviteId
        };

        res.send(manager);
        
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
                  
                var id = uid.v4();
                var inviteId = uid.v4();  
                var invitedBy =  user.fname+" "+user.lname;
                var invitedByEmail =  user.email;
                  
                var now = new time.Date();
                now = now.setTimezone("America/New_York");
                now = now.toString();
                 
                var emailMsg = 'Thank you for choosing Tracing Ink. Register here:  http://localhost:3000/#/addManager/'+encrypt(cName)+'/'+encrypt(inviteId);  
        
                // Proceed to add 

                // Insert into the db
                db.clients.save({        
                    _id: id,                     
                    cName: cName,
                    dateCreated: now,
                    active: 1
                });
                  
                // Add an invite within the system for the newly invited user  
                db.clients.update(
                { _id: id },
                { $push:{
                        invites: [
                            {_id: inviteId , email: email, invitedBy: invitedBy, invitedByEmail: invitedByEmail }
                        ]
                    }
                }
                );
            
                
                  var myMsg = new Email({
                    from: "afigueroa@tracingink.com",
                    to:   email,
                    subject: "Tracing Ink: Registration Invite",
                    body: emailMsg
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

function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}
 
function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

httpServer.listen(3000, function() {
  console.log('Express server listening on port 3000');
});
