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

// Mongo DB
var collections = ["users", "projects", "clients", "invites", "memberInvites"];
var db = require("mongojs").connect("mongodb://127.0.0.1/tracing-ink", collections);

// Express JS
var app = express();
var httpServer = http.createServer(app);

// Views Directory Location
app.use('/public/views', express.static('/public/views'));

// Extra configuration
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

// Set Public directory as the static folder
app.use(express.static('./public'));

// Create Session Credentials
app.use(session({
    secret: 'blind porcupine',
    key: 'sid',
    resave: true,
    saveUninitialized: true
}));

// This is needed for the forms to work
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


/*=================================
             API Routes
=================================*/

// Login Action
app.post('/api/login', function (req, res) {
// This routes logs the user in using a email and password submission    

    // Gather the values of the submission
    var email = req.param('email');
    var pass = req.param('pass');
    
    // Look in the users collection for a match in email and get the users data.
    db.users.findOne({email: email}, function (err, user) {
        
        //Check if a user was found 
        if (!user) {

            // User was not found redirect...
            res.send(false);

        } else {
            // A user was found
            
            // Encrypt the passwords
            pass= encrypt(pass);
            pass= String(pass);

            // Compare the encrypted passwords
            if (user.pass === pass) {
                
                // Passwords match
                
                // Create Session to know the system the user is logged in
                req.session.logged = 1; 
                
                // Create a session for the Users privilege level 
                req.session.userType = user.type;
                
                // Create a session with the found user's data
                req.session.user = {
                    "_id" : user._id,
                    "fname" : user.fname,
                    "cName" : user.cName,
                    "lname" : user.lname,
                    "email" : user.email,
                    "phone" : user.phone,
                    "type" : user.type
                };
                
                // Sanitize the user data
                user = req.session.user;
                
                // Send the sanitized user data to the front-end
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
// When called, this route will logout the user in the back-end
    
    // Clear all session variables
    req.session.logged = 0;
    req.session.userId = null;
    
    req.session = null;
    
    // Send a success message to the front-end
    res.send(true);
    
});

// Check Authentication Route  
app.get('/api/authCheck', function (req, res) {
// This route will check on the server if the user is logged on and will respond true or false to the front-end
    
    // Check if the logged session variable is true
    if (req.session.logged === 1) {
        
        // Logged On
        res.send(true);

    }else{
        
        // Logged Off
        res.send(false);

    }
});

// Get User Data Route 
app.get('/api/getUser', function (req, res) {
// This route will get the Sanitized user's data from the server and will serve it to the front-end
    
    // Check if the user is logged in and has data
    if (req.session.user && req.session.logged === 1) {
        
        // Store the user session data in a local variable
        user = req.session.user;
        
        // Send the user data to the front-end
        res.send(user);

    }else{
        
        // The user is logged off or there is corrupted data
        res.send(false);
        
    }
});

// Get Clients
app.get('/api/getClients', function (req, res) {
// This route will get the clients data from the database IF the user is a master admin
    
    // Check if the user is a master admin and is logged on
    if (req.session.userType === "1" && req.session.logged === 1) {
        
        // The user is a master admin and is logged on
        var active = 1;
        
        // Look in the Database and find all Active clients
        db.clients.find({active:active}, function(err, clients){
            
            // Check if there was any errors
            if (!err){
                
                // No errors
                
                // Send the clients data to the front-end
                res.send(clients);

            }else{
                // Query errors found
                
                res.send(false);

            }

        });

    }else{
        
        // User is either not logged in or is not an admin
        res.send(false);
        
    }
});

// Get Team Members
app.post('/api/getTeam', function (req, res) {
// This route will get the clients data from the database IF the user is a master admin
    
    // Check if the user is logged on
    if (req.session.logged === 1 && req.param("cName")) {
        
        var cName = req.param("cName");
        
        // The user is a master admin and is logged on
        var active = 1;
        
        // Look in the Database and find all Active clients
        db.clients.findOne({active:active, cName:cName}, function(err, clients){
            
            // Check if there was any errors
            if (!err){
                
                // No errors
                
                // Send the clients data to the front-end
                res.send(clients.members);

            }else{
                // Query errors found
                
                res.send(false);

            }

        });

    }else{
        
        // User is either not logged in or is not an admin
        res.send(false);
        
    }
});

// Get Projects
app.post('/api/getProjects', function (req, res) {
// This route will get the clients data from the database IF the user is a master admin
    
    // Check if the user is logged on
    if (req.session.logged === 1 && req.param("cName")) {
        
        var cName = req.param("cName");
        
        // The user is a master admin and is logged on
        var active = 1;
        
        // Look in the Database and find all Active clients
        db.projects.find({active:active, cName:cName}, function(err, projects){
            
            // Check if there was any errors
            if (!err){
                
                // No errors
                
                // Send the clients data to the front-end
                res.send(projects);

            }else{
                // Query errors found
                
                res.send(false);

            }

        });

    }else{
        
        // User is either not logged in or is not an admin
        res.send(false);
        
    }
});


// Get Messages
app.post('/api/getMessages', function (req, res) {
    
    // Check if the user is logged on
    if (req.session.logged === 1 && req.param("teamMembers")) {
    
        var contacts = req.param("teamMembers");

        res.send(contacts);
        
    }else{
        res.send(false);
    }
    
});

// Decrypt Manager Data
app.post('/api/decryptManager', function (req, res) {
// This route triggers when a user accepts a Tracing Ink Client invite.
// The url the user clicks on contains two encrypted keys which the server...
// will decrypt and compare to authenticate the invitation.
    
    // Clear all session variables
    req.session.logged = 0;
    req.session.userId = null;
    
    req.session = null;
    
    // Verify if both keys are present
    if(req.param('cName') && req.param('inviteId')){
        
        // Decrypt the submissions and store them in local variables
        var cName = decrypt(req.param('cName'));
        var inviteId = decrypt(req.param('inviteId'));
        
        // Confirm invite Id is in the database.
        db.invites.findOne({_id: inviteId}, function (err, invite) {
                if(!invite){
                  
                        // No member invites
                        res.send(false);
                
                }else{
                    
                    // Send the invite's data to the front-end
                    res.send(invite);
                
                }
          });
        
    }else{
        
        // Submission is missing a key
        res.send(false);
        
    }
});

// Decrypt Member Data
app.post('/api/decryptMember', function (req, res) {
// This route triggers when a user accepts a Tracing Ink Client invite.
// The url the user clicks on contains two encrypted keys which the server...
// will decrypt and compare to authenticate the invitation.
    
    // Clear all session variables
    req.session.logged = 0;
    req.session.userId = null;
    
    req.session = null;
    
    // Verify if both keys are present
    if(req.param('cName') && req.param('inviteId')){
        
        // Decrypt the submissions and store them in local variables
        var cName = decrypt(req.param('cName'));
        var inviteId = decrypt(req.param('inviteId'));
        
        // Confirm invite Id is in the database.
        db.memberInvites.findOne({_id: inviteId}, function (err, invite) {
                if(!invite){
                    
                    // Submission is missing a key
                    res.send(false);
                
                }else{
                    
                    // Send the invite's data to the front-end
                    res.send(invite);
                
                }
          });
        
    }else{
        
        // Submission is missing a key
        res.send(false);
        
    }
});

// Add Manager Route
app.post('/api/addManager', function (req, res) {
    
    // Get all the values from the submission
    var cName= req.param('cName');
    var fname= req.param('fname');
    var lname= req.param('lname');
    var email= req.param('email');
    var phone= req.param('phone');
    var inviteId= req.param('inviteId');
    var invitedBy= req.param('invitedBy');
    var invitedByEmail= req.param('invitedByEmail');
    var pass= req.param('pass');
    var repass= req.param('repass');
    var id = uid.v4(); // Create Manager Id

    // Check if any field is missing
    if(cName && email && inviteId && invitedBy && invitedByEmail && pass && repass && fname && lname && phone){
        
        // Found all fields
       
        if(pass === repass){
                        
            // Passwords match
            
            // Encrypt the password
            pass = encrypt(pass);

            // Create a Manager object with the data submitted
            var manager = {
                _id:id,
                type:2,
                fname:fname,
                lname:lname,
                cName:cName,
                pass:pass,
                email:email,
                phone:phone,
                invitedBy:invitedBy,
                invitedByEmail:invitedByEmail
            };
            console.log(manager);
            // Check if theres an active invite with the same Id
            db.invites.find({_id:inviteId, active:1}, function(err, invite){
                
                if(!err){
                    
                    if(invite){

                        // An active invite has been found
                        
                        // Check if email is taken
                        db.users.findOne({email:email}, function(err, user){
                        
                            if (!err){
                                // No Errors
                                if(!user){
                                    
                                    // No user found with the same email
                                    
                                    // Add the manager data to the database
                                    db.users.save(manager, function(err, user){

                                        if(!err){

                                            // Check if theres an active invite with the same Id
                                            db.invites.update({_id:inviteId, active:1},{$set:{active:0}}, function(err, invite){

                                                if(!err){

                                                    if(invite){

                                                        // Invite Successfully deleted

                                                        // Sanitize the manager data to send to the front-end

                                                        manager = {
                                                            _id:id,
                                                            type:2,
                                                            fname:fname,
                                                            lname:lname,
                                                            cName:cName,
                                                            email:email,
                                                            phone:phone
                                                        };

                                                        // Check if theres an active invite with the same Id
                                                        db.clients.update({cName:cName, active:1},{$push:{members:manager}}, function(err, member){

                                                            // Check if errors
                                                            if(!err){

                                                                // Check if succesfull
                                                                if(member){

                                                                    // Create Session to know the system the user is logged in
                                                                    req.session.logged = 1; 

                                                                    // Create a session for the Users privilege level 
                                                                    req.session.userType = manager.type;
                                                                    req.session.user = manager;

                                                                    // Send the manager data to the front-end
                                                                    res.send(manager);

                                                                }else{
                                                                    console.log("Member not added");
                                                                    // Member not added
                                                                    res.send(false);

                                                                }

                                                            }else{
                                                                console.log("An error ocurred with the DB");
                                                                // An error occurred
                                                                res.send(false);

                                                            }

                                                        });



                                                    }else{
                                                        console.log("No active invite found");
                                                        // No active invite found
                                                        res.send(false);

                                                    }   

                                                }else{
                                                    console.log("An error ocurred with the DB");
                                                    // An error ocurred with the DB
                                                    res.send(false);
                                                }

                                            });

                                        }else{
                                            console.log("An error ocurred with the DB");
                                            // An error ocurred with the DB
                                            res.send(false);

                                        }

                                    });
                            
                                }else{
                                    console.log("An user has been found with that email");
                                    // An user has been found with that email
                                    res.send(false);

                                }
                            
                            }else{
                                console.log("An error ocurred with the DB");
                                // An error ocurred with the DB
                                res.send(false);
                                
                            }
                            
                        });

                    }else{
                        console.log("No active invite found");
                        // No active invite found
                        res.send(false);

                    }   
                    
                }else{
                    console.log("An error ocurred with the DB");
                    // An error ocurred with the DB
                    res.send(false);
                }
                
                
            });
            
        }else{
            
            // Passwords don't match
            res.send(false);
        }
        
    }else{
        
        // There where fields missing
        res.send(false);   
    
    }  
});

// Add Member Route
app.post('/api/addMember', function (req, res) {
    
    // Get all the values from the submission
    var cName= req.param('cName');
    var fname= req.param('fname');
    var lname= req.param('lname');
    var email= req.param('email');
    var phone= req.param('phone');
    var inviteId= req.param('inviteId');
    var invitedBy= req.param('invitedBy');
    var invitedByEmail= req.param('invitedByEmail');
    var pass= req.param('pass');
    var repass= req.param('repass');
    var id = uid.v4(); // Create Manager Id

    // Check if any field is missing
    if(cName && email && inviteId && invitedBy && invitedByEmail && pass && repass && fname && lname && phone){
        
        // Found all fields
       
        if(pass === repass){
                        
            // Passwords match
            
            // Encrypt the password
            pass = encrypt(pass);

            // Create a Manager object with the data submitted
            var manager = {
                _id:id,
                type:3,
                fname:fname,
                lname:lname,
                cName:cName,
                pass:pass,
                email:email,
                phone:phone,
                invitedBy:invitedBy,
                invitedByEmail:invitedByEmail
            };
            
            // Check if theres an active invite with the same Id
            db.memberInvites.find({_id:inviteId, active:1}, function(err, invite){
                
                if(!err){
                    
                    if(invite){
                        
                        // An active invite has been found
                        
                        // Check if email is taken
                        db.users.findOne({email:email}, function(err, user){
                        
                            if (!err){
                                // No Errors
                                if(!user){
                                    
                                    // No user found with the same email
                                    
                                    // Add the manager data to the database
                                    db.users.save(manager, function(err, user){

                                        if(!err){

                                            // Check if theres an active invite with the same Id
                                            db.memberInvites.update({_id:inviteId, active:1},{$set:{active:0}}, function(err, invite){

                                                if(!err){

                                                    if(invite){

                                                        // Invite Successfully deleted

                                                        // Sanitize the manager data to send to the front-end

                                                        manager = {
                                                            _id:id,
                                                            type:3,
                                                            fname:fname,
                                                            lname:lname,
                                                            cName:cName,
                                                            email:email,
                                                            phone:phone
                                                        };

                                                        // Check if theres an active invite with the same Id
                                                        db.clients.update({cName:cName, active:1},{$push:{members:manager}}, function(err, member){

                                                            // Check if errors
                                                            if(!err){

                                                                // Check if succesfull
                                                                if(member){

                                                                    // Create Session to know the system the user is logged in
                                                                    req.session.logged = 1; 

                                                                    // Create a session for the Users privilege level 
                                                                    req.session.userType = manager.type;
                                                                    req.session.user = manager;

                                                                    // Send the manager data to the front-end
                                                                    res.send(manager);

                                                                }else{
                                                                    console.log("Member not added");
                                                                    // Member not added
                                                                    res.send(false);

                                                                }

                                                            }else{
                                                                console.log("An error ocurred with the DB");
                                                                // An error occurred
                                                                res.send(false);

                                                            }

                                                        });



                                                    }else{
                                                        console.log("No active invite found");
                                                        // No active invite found
                                                        res.send(false);

                                                    }   

                                                }else{
                                                    console.log("An error ocurred with the DB");
                                                    // An error ocurred with the DB
                                                    res.send(false);
                                                }

                                            });

                                        }else{
                                            console.log("An error ocurred with the DB");
                                            // An error ocurred with the DB
                                            res.send(false);

                                        }

                                    });
                            
                                }else{
                                    console.log("An error ocurred with the DB");
                                    // An user has been found with that email
                                    res.send(false);

                                }
                            
                            }else{
                                console.log("An error ocurred with the DB");
                                // An error ocurred with the DB
                                res.send(false);
                                
                            }
                            
                        });

                    }else{

                        // No active invite found
                        res.send(false);

                    }   
                    
                }else{
                    console.log("An error ocurred with the DB");
                    // An error ocurred with the DB
                    res.send(false);
                }
                
                
            });
            
        }else{
            console.log("Passwords don't match");
            // Passwords don't match
            res.send(false);
        }
        
    }else{
        console.log("There where fields missing");
        // There where fields missing
        res.send(false);   
    
    }  
});

// Add Client Route
app.post('/api/addClient', function (req, res) {
// This route will add a client when an admin sends a post submission
    
    // Check if the user is a master admin and is logged on
    if (req.session.userType === "1" && req.session.logged === 1) {
        
        // Check if there's user data within the session
        if (req.session.user) {
            
            // Store the user data
            user = req.session.user;

            // Store the form submission values
            var email=req.param('email');
            var cName=req.param('cName');
            
            // Check if either field was left empty
            if( email == "" || cName == ""){
                
                // One form value was left empty
                res.send(false);
                
            }else{
                
                // All fields were submitted
                
                // Query the database to see if there is already a Client if the name submitted
                db.clients.findOne({cName: cName}, function(err, client){
                    
                    // Check if there were errors
                    if (!err){
                        
                        // No errors
                        
                        // Check if a Client was found or not
                        if (!client){
                            
                            // Query the database to see if there is already a Client if the name submitted
                            db.users.findOne({email: email}, function(err, oldUser){

                                // Check if there were errors
                                if (!err){

                                    // No errors

                                    // Check if a Client was found or not
                                    if (!oldUser){
                                        
                                        // No client found nor was the email already in use
                            
                                        // Create the values for the new Client from the data available so far
                                        var id = uid.v4(); // Client Id
                                        var inviteId = uid.v4();  // Invite Id
                                        var invitedBy =  user.fname+" "+user.lname; 
                                        var invitedByEmail =  user.email;

                                        // Timestamp
                                        var now = new time.Date(); 
                                        now = now.setTimezone("America/New_York");
                                        now = now.toString();

                                        // Email Body to be sent as Invite
                                        var emailMsg = 'Thank you for choosing Tracing Ink. Register here:  http://localhost:80/#/addManager/'+encrypt(cName)+'/'+encrypt(inviteId);

                                        // Create the new Email Object
                                        var myMsg = new Email({
                                            from: "afigueroa@tracingink.com",
                                            to:   email,
                                            subject: "Tracing Ink: Registration Invite",
                                            body: emailMsg
                                        });

                                        // Create a Client object to store in the database
                                        var client = {        
                                            _id: id,                     
                                            cName: cName,
                                            dateCreated: now,
                                            active: 1
                                        };

                                        // Save the new Client data in to the database
                                        db.clients.save(client);

                                        // Create a Invite object to store in the database
                                        var invite = {
                                            _id: inviteId,
                                            cName: cName,
                                            dateCreated: now,
                                            active: 1,
                                            email: email,
                                            invitedBy: invitedBy,
                                            invitedByEmail: invitedByEmail
                                        };

                                        // Save the new Invite data in to the database  
                                        db.invites.save(invite);

                                        // Send the invite Email
                                        myMsg.send(function(err){

                                            // Check if there where any errors
                                            if(err){

                                                // Errors found

                                                // Send error to the front-end
                                                res.send(err);

                                            }

                                        });

                                        // Respond to the front-end with a Success message
                                        res.send(true);
                                        
                                    }else{
                                        
                                        // A user was found cannot invite another
                                        res.send(false);
                                        
                                    }
                                }else{
                                    
                                    // Query errors found
                                    res.send(false);
                                    
                                }
                            });
                            
                        }else {
                            
                            // Query errors found
                            res.send(false);

                        }

                    }else{
                        
                        // A Client was found. Client Name must be unique
                        res.send(false);
                        
                    } 
                });
            }
        }else{
            
            // No user data was found
            res.send(false);
            
        }
    }else{
        
        // The user is either not logged on or is not an master admin
        res.send(false);
        
    }
});

// Add Project Route
app.post('/api/addProject', function (req, res) {
// This route will add a client when an admin sends a post submission
    
    // Check if the user is a master admin and is logged on
    if (req.session.logged === 1) {
    

        // Store the form submission values
        var name=req.param('name');
        var description=req.param('description');
        var cName=req.param('cName');
        var members=req.param('members');
        var dueDate=req.param('dueDate');
        var projectId = uid.v4(); // Project Id

        // Check if either field was left empty
        if( name == "" || description == "" || cName == ""){

            // One form value was left empty
            res.send(false);

        }
        
        var project = {
            _id : projectId,
            name : name,
            cName : cName,
            description : description,
            members : members,
            dueDate : dueDate,
            active : 1
        };
        
        db.projects.insert(project, function(project){
            
            if(project){
                res.send(true);    
            }

        });

        // One form value was left empty
        res.send(true);
                
            
        
    }
});
// Invite Member
app.post('/api/inviteMember', function (req, res) {
    
    // Gether the submission values
    var email = req.param('email');
    var invitedBy = req.param('invitedBy');
    var invitedByEmail = req.param('invitedByEmail');
    var cName = req.param('cName');
    var inviteId = uid.v4(); // Invite Id
    
    // Timestamp
    var now = new time.Date(); 
    now = now.setTimezone("America/New_York");
    now = now.toString();

    // Verify if all fields are present
    if(email && invitedBy && invitedByEmail && cName){

        // Query the database to see if there is already a Client if the name submitted
        db.users.findOne({email: email}, function(err, user){
            
            if(!err){
                
                if(!user){
                    
                    // Create a Invite object to store in the database
                    var invite = {
                        _id: inviteId,
                        cName: cName,
                        dateCreated: now,
                        active: 1,
                        email: email,
                        invitedBy: invitedBy,
                        invitedByEmail: invitedByEmail
                    };

                    // Confirm invite Id is in the database.
                    db.memberInvites.save(invite, function (err, invite) {

                        if(!err){

                            // No errors

                            if(invite){

                                // Invite saved succesfully

                                // Email Body to be sent as Invite
                                var emailMsg = invitedBy+" has invited you to join "+cName+"'s Team at Tracing Ink. Click here to register:  http://localhost:80/#/addMember/"+encrypt(cName)+"/"+encrypt(inviteId);

                                // Create the new Email Object
                                var myMsg = new Email({
                                    from: "donotreply@tracingink.com",
                                    to:   email,
                                    subject: "Tracing Ink: Registration Invite",
                                    body: emailMsg
                                });

                                // Send the invite Email
                                myMsg.send(function(err){

                                    // Check if there where any errors
                                    if(err){

                                        // Errors found

                                        // Send error to the front-end
                                        res.send(err);

                                    }

                                });

                                // Send the invite's data to the front-end
                                res.send(invite);    

                            }else{

                                // Invite not sent
                                res.send(false);

                            }
                        }else{

                            // Error happened
                            res.send(false);

                        }
                    });
            
                }else{

                    // An existing user has beend found
                    res.send(false);
                }
            
            }else{
                
                // Error happened
                res.send(false);
                
            }
        
        });
        
    }else{
        
        // Submission is missing a key
        res.send(false);
        
    }
});

/*=================================
           Server Methods
=================================*/

// Server's Encrypt Method
function encrypt(text){
// Uses Node JS's built-in encryption system, Crypto, to encrypt the data supplied
    
    // Cipher the data and use the secret key
    var cipher = crypto.createCipher(algorithm,password);
    
    // Configure the Cipher
    var crypted = cipher.update(text,'utf8','hex');
    
    // Finalize the encrypted string
    crypted += cipher.final('hex');
    
    // Return the encrypted data
    return crypted;
    
}
 
// Server's Decrypt Method
function decrypt(text){
// Uses Node JS's built-in encryption system, Crypto, to decrypt the data supplied
    
    // Decipher the data using the secret key
    var decipher = crypto.createDecipher(algorithm,password);
    
    // Configure the Cipher
    var dec = decipher.update(text,'hex','utf8');
    
    // Finalize the decryption
    dec += decipher.final('utf8');
    
    // Return the decrypted data
    // Return the decrypted data
    return dec;
}

/*=================================
           Server Processes
=================================*/

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});

/*=================================
          Activate Server
=================================*/

httpServer.listen(3000, function() {
  console.log('Express server listening on port 3000');
});
