/*=================================
              Modules
=================================*/

var bodyParser = require('body-parser');
var express = require('express'),
    cors = require('cors');
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
var collections = ["users", "projects", "clients", "invites", "memberInvites", "tasks", "conversations"];
var db = require("mongojs").connect("mongodb://127.0.0.1/tracing-ink", collections);

// Express JS
var app = express();

// Enable Cors 
app.use(cors());

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
            pass = encrypt(pass);
            pass = String(pass);

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
                    "gravatarUrl" : user.gravatarUrl,
                    "phone" : user.phone,
                    "myTasks" : user.myTasks,
                    "myConversations" : user.myConversations,
                    "myConversations" : user.myConversations,
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

    } else {
        
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
        db.clients.find({active:active}, function (err, clients) {
            
            // Check if there was any errors
            if (!err) {
            
                // No errors
                
                // Send the clients data to the front-end
                res.send(clients);

            } else {
                // Query errors found
                
                res.send(false);

            }

        });

    } else {
        
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
        db.clients.findOne({active : active, cName : cName}, function (err, clients) {
            
            // Check if there was any errors
            if (!err) {
                
                // No errors
                
                // Send the clients data to the front-end
                res.send(clients.members);

            } else {
                // Query errors found
                
                res.send(false);

            }

        });

    } else {
        
        // User is either not logged in or is not an admin
        res.send(false);
        
    }
});

// Get Project Members
app.post('/api/getMembers', function (req, res) {
    
    // Check if the user is logged on
    if (req.session.logged === 1 && req.param("members")) {
        
        var members = req.param("members");
        
        var active = 1;
        
        db.users.find({_id : {$in: members}}, function (err, members) {
            
            // Check if there was any errors
            if (!err) {

                var sanitizedMembers = [],
                    thisMember = {};    
                
                // For each member, sanitize the data
                for (var i = 0; i <= members.length - 1; i++) {
                
                    thisMember = {};
                    
                    thisMember.fname = members[i].fname;
                    thisMember.lname = members[i].lname;
                    thisMember.type = members[i].type;
                    thisMember._id = members[i]._id;
                    thisMember.cName = members[i].cName;
                    thisMember.phone = members[i].phone;
                    thisMember.email = members[i].email;
                    
                    sanitizedMembers.push(thisMember);
                }

                // Send the members data to the front-end
                res.send(sanitizedMembers);

            } else {
                // Query errors found
                
                res.send(false);

            }

        });

    } else {
        
        // User is either not logged in or is not an admin
        res.send(false);
        
    }
});

// Get Projects
app.post('/api/getProjects', function (req, res) {
    
    // Check if the user is logged on
    if (req.session.logged === 1 && req.param("cName") && req.param("_id")) {
        
        var cName = req.param("cName"),
            userId = req.param("_id"),
            myProjects = [],
            i = 0,
            active = 1;
        
        // Search for all projects that have the id of this user as a member
        db.projects.find({active : active, cName : cName}, {members : {$elemMatch : {_id : userId}}}, function(err, projects) {
            
            // Check if there was any errors
            if (!err) {
                
                // For each project, check if there's a member which would mean that this user is assigned
                for (i = 0; i <= projects.length - 1; i++) {
                
                    // If members in this project
                    if(projects[i].members){
                        
                        // Push the id to myProjects array
                        myProjects.push(projects[i]._id);
                    
                    }
                    
                }
                    
                // Find all projects whose id's are in this the myProjects array
                db.projects.find({_id : {$in : myProjects}}, function (err, myProjectsData) {
                
                    if(!err && myProjectsData){
                    
                        // Send the clients data to the front-end
                        res.send(myProjectsData);
                    
                    }
                    
                });
                
                

            } else {
                // Query errors found
                
                res.send(false);

            }

        });

    } else {
        
        // User is either not logged in or is not an admin
        res.send(false);
        
    }
});


// Get Single Project
app.post('/api/getProject', function (req, res) {
// This route will get the clients data from the database IF the user is a master admin
    
    // Check if the user is logged on
    if (req.session.logged === 1 && req.param("cName")) {
        
        var cName = req.param("cName");
        var projectId = req.param("projectId");
        
        // The user is a master admin and is logged on
        var active = 1;
        
        // Look in the Database and find all Active clients
        db.projects.findOne({active : active, cName : cName, _id : projectId}, function (err, project) {
            
            // Check if there was any errors
            if (!err) {
                
                // No errors
                
                // Send the clients data to the front-end
                res.send(project);

            } else {
                // Query errors found
                res.send(false);

            }

        });

    } else {
        
        // User is either not logged in or is not an admin
        res.send(false);
        
    }
});



// Get Single Task
app.post('/api/getTask', function (req, res) {
// This route will get the clients data from the database IF the user is a master admin
    
    // Check if the user is logged on
    if (req.session.logged === 1 && req.param("cName") && req.param("taskId") && req.param("projectId")) {
        
        var cName = req.param("cName");
        var taskId = req.param("taskId");
        var projectId = req.param("projectId");
        
        // The user is a master admin and is logged on
        var active = 1;
        
        // Look in the Database and find all Active clients
        db.tasks.findOne({active : active, cName : cName, projectId : projectId, _id : taskId}, function (err, task) {
            
            // Check if there was any errors
            if (!err) {
                
                // No errors
                                
                // Found the task load it to the front-end
                res.send(task);
                        

            } else {
                // Query errors found
                res.send(false);

            }

        });

    } else {
        
        // User is either not logged in or is not an admin
        res.send(false);
        
    }
});

// Get A Project's Tasks
app.post('/api/getTasks', function (req, res) {
    
    // Check if the user is logged on
    if (req.session.logged === 1 && req.param("cName")) {
        
        var cName = req.param("cName");
        var projectId = req.param("projectId");
        
        // The user is a master admin and is logged on
        var active = 1;
        
        // Look in the Database and find all Active clients
        db.tasks.find({active : active, cName : cName, projectId : projectId}, function (err, tasks) {
            
            // Check if there was any errors
            if (!err) {
                
                // No errors
                
                // Send the Tasks data to the front-end
                res.send(tasks);

            } else {
                // Query errors found
                res.send(false);

            }

        });

    } else {
        
        // User is either not logged in or is not an admin
        res.send(false);
        
    }
});

// Get A Project's Tasks
app.post('/api/getMyTasks', function (req, res) {
    
    // Check if the user is logged on
    if (req.session.logged === 1 && req.param("cName")) {
        
        var tasks = req.param("tasks");
        var cName = req.param("cName");
        var active = 1;
        
        // Create an array of just the ids of every element in tasks
        var taskIds = [];
        
        for (var i = 0; i <= tasks.length - 1; i++) {
            
            taskIds.push(tasks[i]._id);    
        
        }
            
        db.tasks.find({_id : {$in : taskIds}, active : active, completed : false}, function (err, myTasks) {

            // Check if there was any errors
            if (!err && myTasks) {

                res.send(myTasks);

            }

        });
              
    } else {
        
        // User is either not logged in or is not an admin
        res.send(false);
        
    }
});

// Get this user's Conversations
app.post('/api/getMyConversations', function (req, res) {
    
    // Check if the user is logged on
    if (req.session.logged === 1 && req.param("cName")) {
        
        var active = 1;
        
        db.conversations.find({recipients : {$elemMatch: {_id : req.session.user._id} }, active : active}, function (err, myConversations) {

            console.log(err);
            // Check if there was any errors
            if (!err && myConversations) {
                
                var myConversationsIds = [];
                
                for(var i = 0; i <= myConversations.length - 1; i++){
                
                    myConversationsIds.push(myConversations[i]._id);
                    
                }
                
                db.conversations.find({_id : {$in : myConversationsIds}}, function (err, myFinalConversations) {
                    
                    res.send(myFinalConversations);

                });

            } else {
            
                res.send(err);
            }

        });
              
    } else {
        
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
    if (req.param('cName') && req.param('inviteId')) {
        
        // Decrypt the submissions and store them in local variables
        var cName = decrypt(req.param('cName'));
        var inviteId = decrypt(req.param('inviteId'));
        
        // Confirm invite Id is in the database.
        db.invites.findOne({_id : inviteId}, function (err, invite) {
                
            if (!invite) {
                  
                // No member invites
                res.send(false);

            } else {

                // Send the invite's data to the front-end
                res.send(invite);

            }
          });
        
    } else {
        
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
    if (req.param('cName') && req.param('inviteId')) {
        
        // Decrypt the submissions and store them in local variables
        var cName = decrypt(req.param('cName'));
        var inviteId = decrypt(req.param('inviteId'));
        
        // Confirm invite Id is in the database.
        db.memberInvites.findOne({_id : inviteId}, function (err, invite) {
                
            if (!invite) {
                    
                // Submission is missing a key
                res.send(false);

            } else {

                // Send the invite's data to the front-end
                res.send(invite);

            }
        });
        
    } else {
        
        // Submission is missing a key
        res.send(false);
        
    }
});

// Add Manager Route
app.post('/api/addManager', function (req, res) {
    
    // Get all the values from the submission
    var cName = req.param('cName');
    var fname = req.param('fname');
    var lname = req.param('lname');
    var email = req.param('email');
    var phone = req.param('phone');
    var inviteId = req.param('inviteId');
    var invitedBy = req.param('invitedBy');
    var invitedByEmail = req.param('invitedByEmail');
    var pass = req.param('pass');
    var repass = req.param('repass');
    var id = uid.v4(); // Create Manager Id

    // Check if any field is missing
    if (cName && email && inviteId && invitedBy && invitedByEmail && pass && repass && fname && lname && phone) {
        
        // Found all fields
       
        if (pass === repass) {
                        
            // Passwords match
            
            // Prepare the gravatar url for this user
                var gravatarUrl = crypto.createHash('md5')
                    .update(email)
                    .digest('hex');
                
            gravatarUrl = "http://www.gravatar.com/avatar/" + gravatarUrl + "?d=retro";
                        
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
                gravatarUrl:gravatarUrl,
                active:1,
                invitedBy:invitedBy,
                invitedByEmail:invitedByEmail
            };

            // Check if theres an active invite with the same Id
            db.invites.find({_id : inviteId, active : 1}, function (err, invite) {
                
                if (!err) {
                    
                    if (invite) {

                        // An active invite has been found
                        
                        // Check if email is taken
                        db.users.findOne({email : email}, function (err, user) {
                        
                            if (!err) {
                                // No Errors
                                if (!user) {
                                    
                                    // No user found with the same email
                                    
                                    // Add the manager data to the database
                                    db.users.save(manager, function (err, user) {

                                        if (!err) {

                                            // Check if theres an active invite with the same Id
                                            db.invites.update({_id : inviteId, active : 1},{$set : {active : 0}}, function (err, invite) {

                                                if (!err) {

                                                    if (invite) {

                                                        // Invite Successfully deleted

                                                        // Sanitize the manager data to send to the front-end

                                                        manager = {
                                                            _id:id,
                                                            type:2,
                                                            fname:fname,
                                                            lname:lname,
                                                            cName:cName,
                                                            gravatarUrl:gravatarUrl,
                                                            email:email,
                                                            phone:phone
                                                        };

                                                        // Check if theres an active invite with the same Id
                                                        db.clients.update({cName : cName, active : 1},{$push : {members : manager}}, function(err, member){

                                                            // Check if errors
                                                            if (!err) {

                                                                // Check if succesfull
                                                                if (member) {

                                                                    // Create Session to know the system the user is logged in
                                                                    req.session.logged = 1; 

                                                                    // Create a session for the Users privilege level 
                                                                    req.session.userType = manager.type;
                                                                    req.session.user = manager;

                                                                    // Send the manager data to the front-end
                                                                    res.send(manager);

                                                                } else {
                                                                    
                                                                    // Member not added
                                                                    res.send(false);

                                                                }

                                                            } else {
                                                                
                                                                // An error occurred
                                                                res.send(false);

                                                            }

                                                        });



                                                    } else {
                                                        
                                                        // No active invite found
                                                        res.send(false);

                                                    }   

                                                } else {
                                                    
                                                    // An error ocurred with the DB
                                                    res.send(false);
                                                }

                                            });

                                        } else {

                                            // An error ocurred with the DB
                                            res.send(false);

                                        }

                                    });
                            
                                } else {

                                    // An user has been found with that email
                                    res.send(false);

                                }
                            
                            } else {

                                // An error ocurred with the DB
                                res.send(false);
                                
                            }
                            
                        });

                    } else {

                        // No active invite found
                        res.send(false);

                    }   
                    
                } else {

                    // An error ocurred with the DB
                    res.send(false);
                }
                
                
            });
            
        } else {
            
            // Passwords don't match
            res.send(false);
        }
        
    } else {
        
        // There where fields missing
        res.send(false);   
    
    }  
});

// Add Member Route
app.post('/api/addMember', function (req, res) {
    
    // Get all the values from the submission
    var cName = req.param('cName');
    var fname = req.param('fname');
    var lname = req.param('lname');
    var email = req.param('email');
    var phone = req.param('phone');
    var inviteId = req.param('inviteId');
    var invitedBy = req.param('invitedBy');
    var invitedByEmail = req.param('invitedByEmail');
    var pass = req.param('pass');
    var repass = req.param('repass');
    var id = uid.v4(); // Create Manager Id

    // Check if any field is missing
    if (cName && email && inviteId && invitedBy && invitedByEmail && pass && repass && fname && lname && phone) {
        
        // Found all fields
       
        if (pass === repass) {
                        
            // Passwords match
            
            // Prepare the gravatar url for this user
            var gravatarUrl = crypto.createHash('md5')
                .update(email)
                .digest('hex');

            gravatarUrl = "http://www.gravatar.com/avatar/" + gravatarUrl + "?d=retro";
                        
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
                gravatarUrl:gravatarUrl,
                active : 1,
                invitedBy:invitedBy,
                invitedByEmail:invitedByEmail
            };
            
            // Check if theres an active invite with the same Id
            db.memberInvites.find({_id : inviteId, active : 1}, function (err, invite) {
                
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
                                                            gravatarUrl:gravatarUrl,
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
                                        var emailMsg = 'Thank you for choosing Tracing Ink. Register here:  http://tracingink.com/#/addManager/'+encrypt(cName)+'/'+encrypt(inviteId);

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


/*=================================
        CONVERSATIONS CRUD
=================================*/

// Add Converation Route
app.post('/api/addConversation', function (req, res) {
    
    // Check if the user is logged on
    if (req.session.logged === 1) {
        
        var subject = req.param('subject'),
            message = req.param('message'),
            recipients = req.param('recipients'),
            conversation = {},
            messages = [];
        
        
        // Store the subject and recipients of the conversation
        conversation.subject = subject;
        conversation._id = uid.v4();
        conversation.active = 1;
        conversation.recipients = recipients;
        
        // Create the messages array in the conversation object
        conversation.messages = messages;
        
        // Push the message object into the messages array
        conversation.messages.push(message);
        
        var newRecipients = [];
        
        // For each recipient add the conversation id to myConversations
        for(var i = 0; i <= recipients.length - 1; i++){
        
            var myConversation = {
                _id: conversation._id
            };
            
            var newRecipient = {
                _id : recipients[i]
            };
            
            newRecipients.push(newRecipient);
            
            db.users.update({_id : recipients[i]}, {$push : {myConversations: myConversation}}, function (data, err) {
                
                if(err){
                    
                    res.send(false);
                }
            
            });
            
        }
        
        conversation.recipients = newRecipients;
        
        // Look in the users collection for a match in email and get the users data.
        db.users.findOne({email: req.session.user.email}, function (err, user) {

            //Check if a user was found 
            if (!user) {

                // User was not found redirect...
                res.send(false);

            } else {
                
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
                    "gravatarUrl" : user.gravatarUrl,
                    "phone" : user.phone,
                    "myTasks" : user.myTasks,
                    "myConversations" : user.myConversations,
                    "type" : user.type
                };

                // Sanitize the user data
                user = req.session.user;

                // Send the sanitized user data to the front-end
                res.send(user);
               
            }
        });
        
        db.conversations.insert(conversation);
        
        res.send(conversation);
        
    }
    
    
    
});


/*=================================
           PROJECTS CRUD
=================================*/

// Add Project Route
app.post('/api/addProject', function (req, res) {
// This route will add a client when an admin sends a post submission
    
    // Check if the user is a master admin and is logged on
    if (req.session.logged === 1) {
    

        // Store the form submission values
        var projectId = uid.v4(); // Project Id
        var name=req.param('name');
        var description=req.param('description');
        var cName=req.param('cName');
        var members=req.param('members');
        var manager=req.param('manager');
        var dueDate=req.param('dueDate');
        var dueTime=req.param('dueTime');
        
        console.log(members);
        
        if(dueDate){
            
            dueDate = dueDate.split("-").map(function (val) { return val; });
            var getDay = dueDate[2].split("T").map(function (val) { return val; });
            
            var date = {};
            date.year = dueDate[0];
            date.month = dueDate[1];
            date.day = getDay[0];
            
            if(dueTime){
            
                dueTime = dueTime.split("T").map(function (val) { return val; });
                dueTime = dueTime[1].split(":").map(function (val) { return val; });

                date.hour = dueTime[0]; 
                date.minute = dueTime[1]; 
                
                if(date.hour == 00){ date.hour = 07; date.militaryHour = 19; date.hourFormat = "PM" }
                if(date.hour == 01){ date.hour = 08; date.militaryHour = 20; date.hourFormat = "PM" }
                if(date.hour == 02){ date.hour = 09; date.militaryHour = 21; date.hourFormat = "PM" }
                if(date.hour == 03){ date.hour = 10; date.militaryHour = 22; date.hourFormat = "PM" }
                if(date.hour == 04){ date.hour = 11; date.militaryHour = 23; date.hourFormat = "PM" }
                if(date.hour == 05){ date.hour = 12; date.militaryHour = 00; date.hourFormat = "AM" }
                if(date.hour == 06){ date.hour = 01; date.militaryHour = 01; date.hourFormat = "AM" }
                if(date.hour == 07){ date.hour = 02; date.militaryHour = 02; date.hourFormat = "AM" }
                if(date.hour == 08){ date.hour = 03; date.militaryHour = 03; date.hourFormat = "AM" }
                if(date.hour == 09){ date.hour = 04; date.militaryHour = 04; date.hourFormat = "AM" }
                if(date.hour == 10){ date.hour = 05; date.militaryHour = 05; date.hourFormat = "AM" }
                if(date.hour == 11){ date.hour = 06; date.militaryHour = 06; date.hourFormat = "AM" }
                if(date.hour == 12){ date.hour = 07; date.militaryHour = 07; date.hourFormat = "AM" }
                if(date.hour == 13){ date.hour = 08; date.militaryHour = 08; date.hourFormat = "AM" }
                if(date.hour == 14){ date.hour = 09; date.militaryHour = 09; date.hourFormat = "AM" }
                if(date.hour == 15){ date.hour = 10; date.militaryHour = 10; date.hourFormat = "AM" }
                if(date.hour == 16){ date.hour = 11; date.militaryHour = 11; date.hourFormat = "AM" }
                if(date.hour == 17){ date.hour = 12; date.militaryHour = 12; date.hourFormat = "PM" }
                if(date.hour == 18){ date.hour = 01; date.militaryHour = 13; date.hourFormat = "PM" }
                if(date.hour == 19){ date.hour = 02; date.militaryHour = 14; date.hourFormat = "PM" }
                if(date.hour == 20){ date.hour = 03; date.militaryHour = 15; date.hourFormat = "PM" }
                if(date.hour == 21){ date.hour = 04; date.militaryHour = 16; date.hourFormat = "PM" }
                if(date.hour == 22){ date.hour = 05; date.militaryHour = 17; date.hourFormat = "PM" }
                if(date.hour == 23){ date.hour = 06; date.militaryHour = 18; date.hourFormat = "PM" }

                
            }
            
            dueDate = date;

        }else{
        
            dueTime = null;
            
        }
        
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
            manager : manager,
            dueDate : dueDate,
            active : 1,
            completed : false
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

// Update Project Route
app.post('/api/updateProject', function (req, res) {
    
    if (req.session.logged === 1) {
        
        // Store the form submission values
        var name=req.param('name');
        var description=req.param('description');
        var cName=req.param('cName');
        var members=req.param('members');
        var creator=req.param('creator');
        var dueDate=req.param('due');
        var dueTime=req.param('dueTime');
        var projectId = req.param('_id'); // Task Id

        // Get the values of the old members.
        db.projects.findOne({_id : projectId}, function(err, thisProject){
            if (!err && thisProject){
                
                // Get the old members
                var oldMembers = [];
                
                for(var i = 0; i <= thisProject.members.length - 1; i++){
                    
                    oldMembers.push(thisProject.members[i]._id);
                
                }
                
                // Develop an algorithm to compare two arrays and determine which elements where removed and which where added.
                
                // Initiate an array of member that exist in both lists.
                var toBeKept = [];
                
                // Initiate a to be removed array of member Ids
                var toBeRemoved = [];
                
                // Initiate for those members that didn't exists before in array. We will copy the new members and remove from it any that are to be kept or removed, leaving an array of only the new members to be added.
                var toBeAdded = members;
                
                
                // Develop an algorithm to compare two arrays and determine which elements where removed and which where added.
                
                // For each old member, determine which members are to be removed
                for (var i = 0; i <= oldMembers.length - 1; i++){
                    
                    // On this iteration of oldMembers loop over new members to verify if the values exist.
                    for (var n = 0; n <= members.length - 1; n++ ){
                    
                        // Check if values are identical
                        if(oldMembers[i] == members[n]){
                        
                            // Member exists in both arrays, no need to update this one
                            toBeKept.push(oldMembers[i]);
                            
                            // Set the value from the array of added to false, that member doesnt need updating.
                            toBeAdded[n] = false;
                            
                            // No need to keep looping, we know that the value is to be kept.
                            break;
                            
                        }else{
                        
                            // Ids dont match
                            
                            // Check if it's the last value
                            if(n == members.length - 1){
                                
                                // Value for oldMembers[i] not present in new array
                                toBeRemoved.push(oldMembers[i]);
                            
                                // Set the value from the array of added to false, that member doesnt need updating.
                                toBeAdded[n] = false;
                            
                            }
                        }
                    
                        
                    }
                
                }
                
                console.log("To be removed: ", toBeRemoved);
                
                console.log("To be kept: ", toBeKept);
                
                // Initiate an array to store the non-false values of the toBeAdded array
                var cleanedToBeAdded = [];
                
                // Loop over the toBeAdded array
                for (var e = 0; e <= toBeAdded.length - 1; e++){
                    
                    // Verify if this value is false
                    if(toBeAdded[e] != false){
                        
                        // The value is not false, push it to the cleaned array
                        cleanedToBeAdded.push(toBeAdded[e]);
                    
                    }
                
                }
                
                console.log("To be added (cleaned): ", cleanedToBeAdded);
                
                // Update the toBeAdded array with the clean array
                toBeAdded = cleanedToBeAdded;
                
                // If toBeRemoved is not empty
                if(toBeRemoved.length != 0){
                    
                    // For all users in the toBeRemoved list. Remove this taskId from myTasks.
                    for (i = 0; i <= toBeRemoved.length - 1; i++){
                        
                        db.projects.update({_id : projectId}, {$pull : {members : {_id : toBeRemoved[i] }}});
                        
                    }
                    
                }
                
                // If toBeRemoved is not empty
                if(toBeAdded.length != 0){
                    
                    // Find the data for each member to be added
                    db.users.find({_id : {$in: toBeAdded}}, function (err, members) {
            
                        // Check if there was any errors
                        if (!err) {

                            var sanitizedMembers = [],
                                thisMember = {};    

                            // For each member, sanitize the data
                            for (var i = 0; i <= members.length - 1; i++) {

                                thisMember = {};

                                thisMember.fname = members[i].fname;
                                thisMember.lname = members[i].lname;
                                thisMember.type = members[i].type;
                                thisMember._id = members[i]._id;
                                thisMember.cName = members[i].cName;
                                thisMember.phone = members[i].phone;
                                thisMember.email = members[i].email;

                                sanitizedMembers.push(thisMember);
                            }
                            
                            // For all users in the toBeAdded list. Remove this taskId from myTasks.
                            for (i = 0; i <= sanitizedMembers.length - 1; i++){

                                db.projects.update({_id : projectId}, {$push : {members : sanitizedMembers[i]}});

                            }
                            
                        } else {
                            // Query errors found

                            res.send(false);

                        }

                    });
                    
                }
                            
            }else{
            
                // Something went wrong
                res.send(false);
                
            }
            
        });
        
        
        
        
        // Check if either field was left empty
        if( name == "" || description == "" || cName == ""){

            // One form value was left empty
            res.send(false);

        }
        
        if(dueDate){
            
            dueDate = dueDate.split("-").map(function (val) { return val; });
            var getDay = dueDate[2].split("T").map(function (val) { return val; });
            
            var date = {};
            date.year = dueDate[0];
            date.month = dueDate[1];
            date.day = getDay[0];
            
            if(dueTime){
            
                dueTime = dueTime.split("T").map(function (val) { return val; });
                dueTime = dueTime[1].split(":").map(function (val) { return val; });

                var thisHour = dueTime[0]; 
                date.minute = dueTime[1]; 
                
                if(thisHour == 00){ date.hour = 07; date.militaryHour = 19; date.hourFormat = "PM" }
                if(thisHour == 01){ date.hour = 08; date.militaryHour = 20; date.hourFormat = "PM" }
                if(thisHour == 02){ date.hour = 09; date.militaryHour = 21; date.hourFormat = "PM" }
                if(thisHour == 03){ date.hour = 10; date.militaryHour = 22; date.hourFormat = "PM" }
                if(thisHour == 04){ date.hour = 11; date.militaryHour = 23; date.hourFormat = "PM" }
                if(thisHour == 05){ date.hour = 12; date.militaryHour = 00; date.hourFormat = "AM" }
                if(thisHour == 06){ date.hour = 01; date.militaryHour = 01; date.hourFormat = "AM" }
                if(thisHour == 07){ date.hour = 02; date.militaryHour = 02; date.hourFormat = "AM" }
                if(thisHour == 08){ date.hour = 03; date.militaryHour = 03; date.hourFormat = "AM" }
                if(thisHour == 09){ date.hour = 04; date.militaryHour = 04; date.hourFormat = "AM" }
                if(thisHour == 10){ date.hour = 05; date.militaryHour = 05; date.hourFormat = "AM" }
                if(thisHour == 11){ date.hour = 06; date.militaryHour = 06; date.hourFormat = "AM" }
                if(thisHour == 12){ date.hour = 07; date.militaryHour = 07; date.hourFormat = "AM" }
                if(thisHour == 13){ date.hour = 08; date.militaryHour = 08; date.hourFormat = "AM" }
                if(thisHour == 14){ date.hour = 09; date.militaryHour = 09; date.hourFormat = "AM" }
                if(thisHour == 15){ date.hour = 10; date.militaryHour = 10; date.hourFormat = "AM" }
                if(thisHour == 16){ date.hour = 11; date.militaryHour = 11; date.hourFormat = "AM" }
                if(thisHour == 17){ date.hour = 12; date.militaryHour = 12; date.hourFormat = "PM" }
                if(thisHour == 18){ date.hour = 01; date.militaryHour = 13; date.hourFormat = "PM" }
                if(thisHour == 19){ date.hour = 02; date.militaryHour = 14; date.hourFormat = "PM" }
                if(thisHour == 20){ date.hour = 03; date.militaryHour = 15; date.hourFormat = "PM" }
                if(thisHour == 21){ date.hour = 04; date.militaryHour = 16; date.hourFormat = "PM" }
                if(thisHour == 22){ date.hour = 05; date.militaryHour = 17; date.hourFormat = "PM" }
                if(thisHour == 23){ date.hour = 06; date.militaryHour = 18; date.hourFormat = "PM" }
                
            }
            
            dueDate = date;

        }else{
        
            dueTime = null;
            
        }
        console.log(dueDate);
        
        db.projects.update({_id : projectId}, { $set:{
            
                name:name,
                description:description,
                dueDate:dueDate
            
        }}, function(task, err){

                if(!err){
                    
                    res.send(true);    
                    
                }else{
                    
                    console.log(err);
                    
                }
            }
        );
        
    }
});

// Complete Task Route
app.post('/api/completeProject', function (req, res) {
// This route will add a client when an admin sends a post submission
    
    // Check if the user is a master admin and is logged on
    if (req.session.logged === 1) {
        
        // Store the form submission values
        var projectId=req.param('projectId');

        // Check if either field was left empty
        if( projectId == ""){

            // One form value was left empty
            res.send(false);

        }
        
        db.projects.update({_id : projectId}, { $set : {
                completed : true
            }}, function (task, err) {

                if (!err) {
                    
                    res.send(true); 
                    
                } else {
                    
                    console.log(err);
                    
                }
            }
        );

        // One form value was left empty
        res.send(true);
                
            
        
    }
});

// Activate Completed Task Route
app.post('/api/activateProject', function (req, res) {
// This route will add a client when an admin sends a post submission
    
    // Check if the user is a master admin and is logged on
    if (req.session.logged === 1) {
        
        // Store the form submission values
        var projectId=req.param('projectId');

        // Check if either field was left empty
        if( projectId == ""){

            // One form value was left empty
            res.send(false);

        }
        
        db.projects.update({_id : projectId}, { $set : {
                completed : false
            }}, function (task, err) {

                if (!err) {
                    
                    res.send(true);    
                    
                } else {
                    
                    console.log(err);
                    
                }
            }
        );

        // One form value was left empty
        res.send(true);
        
    }
});


// Delete Task Route
app.post('/api/deleteProject', function (req, res) {
// This route will add a client when an admin sends a post submission
    
    // Check if the user is a master admin and is logged on
    if (req.session.logged === 1) {
        
        // Store the form submission values
        var projectId=req.param('projectId');

        // Check if either field was left empty
        if( projectId == ""){

            // One form value was left empty
            res.send(false);

        }
        
        db.projects.update({_id : projectId}, { $set : {
                active : 0
            }}, function (err, project) {

                res.send(true);    
                
            }
        );            
        
    }
});


/*=================================
           TASKS CRUD
=================================*/

// Add Project Route
app.post('/api/addTask', function (req, res) {
// This route will add a client when an admin sends a post submission
    
    // Check if the user is a master admin and is logged on
    if (req.session.logged === 1) {
        
        // Store the form submission values
        var name=req.param('name');
        var description=req.param('description');
        var cName=req.param('cName');
        var members=req.param('members');
        var creator=req.param('creator');
        var projectId=req.param('projectId');
        var projectName=req.param('projectName');
        var taskId = uid.v4(); // Task Id
        var dueTime=req.param('dueTime');
        var dueDate=req.param('due');

        // Check if either field was left empty
        if( name == "" || description == "" || cName == ""){

            // One form value was left empty
            res.send(false);

        }
        
         if(dueDate){
            
            dueDate = dueDate.split("-").map(function (val) { return val; });
            var getDay = dueDate[2].split("T").map(function (val) { return val; });
            
            var date = {};
            date.year = dueDate[0];
            date.month = dueDate[1];
            date.day = getDay[0];
            
            if(dueTime){
            
                dueTime = dueTime.split("T").map(function (val) { return val; });
                dueTime = dueTime[1].split(":").map(function (val) { return val; });

                date.hour = dueTime[0]; 
                date.minute = dueTime[1]; 
                
                if(date.hour == 00){ date.hour = 07; date.militaryHour = 19; date.hourFormat = "PM" }
                if(date.hour == 01){ date.hour = 08; date.militaryHour = 20; date.hourFormat = "PM" }
                if(date.hour == 02){ date.hour = 09; date.militaryHour = 21; date.hourFormat = "PM" }
                if(date.hour == 03){ date.hour = 10; date.militaryHour = 22; date.hourFormat = "PM" }
                if(date.hour == 04){ date.hour = 11; date.militaryHour = 23; date.hourFormat = "PM" }
                if(date.hour == 05){ date.hour = 12; date.militaryHour = 00; date.hourFormat = "AM" }
                if(date.hour == 06){ date.hour = 01; date.militaryHour = 01; date.hourFormat = "AM" }
                if(date.hour == 07){ date.hour = 02; date.militaryHour = 02; date.hourFormat = "AM" }
                if(date.hour == 08){ date.hour = 03; date.militaryHour = 03; date.hourFormat = "AM" }
                if(date.hour == 09){ date.hour = 04; date.militaryHour = 04; date.hourFormat = "AM" }
                if(date.hour == 10){ date.hour = 05; date.militaryHour = 05; date.hourFormat = "AM" }
                if(date.hour == 11){ date.hour = 06; date.militaryHour = 06; date.hourFormat = "AM" }
                if(date.hour == 12){ date.hour = 07; date.militaryHour = 07; date.hourFormat = "AM" }
                if(date.hour == 13){ date.hour = 08; date.militaryHour = 08; date.hourFormat = "AM" }
                if(date.hour == 14){ date.hour = 09; date.militaryHour = 09; date.hourFormat = "AM" }
                if(date.hour == 15){ date.hour = 10; date.militaryHour = 10; date.hourFormat = "AM" }
                if(date.hour == 16){ date.hour = 11; date.militaryHour = 11; date.hourFormat = "AM" }
                if(date.hour == 17){ date.hour = 12; date.militaryHour = 12; date.hourFormat = "PM" }
                if(date.hour == 18){ date.hour = 01; date.militaryHour = 13; date.hourFormat = "PM" }
                if(date.hour == 19){ date.hour = 02; date.militaryHour = 14; date.hourFormat = "PM" }
                if(date.hour == 20){ date.hour = 03; date.militaryHour = 15; date.hourFormat = "PM" }
                if(date.hour == 21){ date.hour = 04; date.militaryHour = 16; date.hourFormat = "PM" }
                if(date.hour == 22){ date.hour = 05; date.militaryHour = 17; date.hourFormat = "PM" }
                if(date.hour == 23){ date.hour = 06; date.militaryHour = 18; date.hourFormat = "PM" }
                
                
            }
            
            dueDate = date;

        }else{
        
            dueTime = null;
            
        }
        
        // For each member add the task Id to myTasks
        for(var i = 0; i <= members.length - 1; i++){
        
            task = {
                _id: taskId
            };
            
            db.users.update({_id : members[i]}, {$push : {myTasks: task}}, function (task, err) {
                
                if(err){
                    
                    res.send(false);
                }
            
            });
            
        }
        
        var task = {
            _id : taskId,
            projectId: projectId,
            projectName: projectName,
            name : name,
            cName : cName,
            description : description,
            members : members,
            creator : creator,
            dueDate : dueDate,
            completed : false,
            active : 1
        };
        
        db.tasks.insert(task, function(task, err){
            
            if(!err){
                res.send(true);    
            }else{
                console.log(err);
            }

        });

        // One form value was left empty
        res.send(true);
                
            
        
    }
});

// Update Task Route
app.post('/api/updateTask', function (req, res) {
    
    if (req.session.logged === 1) {
        
        // Store the form submission values
        var name=req.param('name');
        var description=req.param('description');
        var cName=req.param('cName');
        var members=req.param('members');
        var creator=req.param('creator');
        var dueDate=req.param('due');
        var dueTime=req.param('dueTime');
        var projectId=req.param('projectId');
        var taskId = req.param('_id'); // Task Id

        // Get the values of the old members.
        db.tasks.findOne({_id : taskId}, function(err, thisTask){
            if (!err && thisTask){
                
                // Get the old members
                var oldMembers = thisTask.members;

                // Develop an algorithm to compare two arrays and determine which elements where removed and which where added.
                
                // Initiate an array of member that exist in both lists.
                var toBeKept = [];
                
                // Initiate a to be removed array of member Ids
                var toBeRemoved = [];
                
                // Initiate for those members that didn't exists before in array. We will copy the new members and remove from it any that are to be kept or removed, leaving an array of only the new members to be added.
                var toBeAdded = members;
                
                
                // Develop an algorithm to compare two arrays and determine which elements where removed and which where added.
                
                // For each old member, determine which members are to be removed
                for (var i = 0; i <= oldMembers.length - 1; i++){
                    
                    // On this iteration of oldMembers loop over new members to verify if the values exist.
                    for (var n = 0; n <= members.length - 1; n++ ){
                    
                        // Check if values are identical
                        if(oldMembers[i] == members[n]){
                        
                            // Member exists in both arrays, no need to update this one
                            toBeKept.push(oldMembers[i]);
                            
                            // Set the value from the array of added to false, that member doesnt need updating.
                            toBeAdded[n] = false;
                            
                            // No need to keep looping, we know that the value is to be kept.
                            break;
                            
                        }else{
                        
                            // Ids dont match
                            
                            // Check if it's the last value
                            if(n == members.length - 1){
                                
                                // Value for oldMembers[i] not present in new array
                                toBeRemoved.push(oldMembers[i]);
                            
                                // Set the value from the array of added to false, that member doesnt need updating.
                                toBeAdded[n] = false;
                            
                            }
                        }
                    
                        
                    }
                
                }
                
                // Initiate an array to store the non-false values of the toBeAdded array
                var cleanedToBeAdded = [];
                
                // Loop over the toBeAdded array
                for (var e = 0; e <= toBeAdded.length - 1; e++){
                    
                    // Verify if this value is false
                    if(toBeAdded[e] != false){
                        
                        // The value is not false, push it to the cleaned array
                        cleanedToBeAdded.push(toBeAdded[e]);
                    
                    }
                
                }
                
                // Update the toBeAdded array with the clean array
                toBeAdded = cleanedToBeAdded;
                
                // If toBeRemoved is not empty
                if(toBeRemoved.length != 0){
                    
                    // For all users in the toBeRemoved list. Remove this taskId from myTasks.
                    for (i = 0; i <= toBeRemoved.length - 1; i++){
                        
                        db.users.update({_id : toBeRemoved[i]}, {$pull : {myTasks : {_id : taskId }}});
                        
                    }
                    
                }
                
                // If toBeRemoved is not empty
                if(toBeAdded.length != 0){
                    var newMyTask = {
                        _id : taskId
                    };
                    // For all users in the toBeAdded list. Remove this taskId from myTasks.
                    for (i = 0; i <= toBeAdded.length - 1; i++){
                        
                        db.users.update({_id : toBeAdded[i]}, {$push : {myTasks : newMyTask}});
                        
                    }
                    
                }
                            
            }else{
            
                // Something went wrong
                res.send(false);
                
            }
            
        });
        
        
        
        
        // Check if either field was left empty
        if( name == "" || description == "" || cName == ""){

            // One form value was left empty
            res.send(false);

        }
        
        if(dueDate){
            
            dueDate = dueDate.split("-").map(function (val) { return val; });
            var getDay = dueDate[2].split("T").map(function (val) { return val; });
            
            var date = {};
            date.year = dueDate[0];
            date.month = dueDate[1];
            date.day = getDay[0];
            
            if(dueTime){
            
                dueTime = dueTime.split("T").map(function (val) { return val; });
                dueTime = dueTime[1].split(":").map(function (val) { return val; });

                var thisHour = dueTime[0]; 
                date.minute = dueTime[1]; 
                
                if(thisHour == 00){ date.hour = 07; date.militaryHour = 19; date.hourFormat = "PM" }
                if(thisHour == 01){ date.hour = 08; date.militaryHour = 20; date.hourFormat = "PM" }
                if(thisHour == 02){ date.hour = 09; date.militaryHour = 21; date.hourFormat = "PM" }
                if(thisHour == 03){ date.hour = 10; date.militaryHour = 22; date.hourFormat = "PM" }
                if(thisHour == 04){ date.hour = 11; date.militaryHour = 23; date.hourFormat = "PM" }
                if(thisHour == 05){ date.hour = 12; date.militaryHour = 00; date.hourFormat = "AM" }
                if(thisHour == 06){ date.hour = 01; date.militaryHour = 01; date.hourFormat = "AM" }
                if(thisHour == 07){ date.hour = 02; date.militaryHour = 02; date.hourFormat = "AM" }
                if(thisHour == 08){ date.hour = 03; date.militaryHour = 03; date.hourFormat = "AM" }
                if(thisHour == 09){ date.hour = 04; date.militaryHour = 04; date.hourFormat = "AM" }
                if(thisHour == 10){ date.hour = 05; date.militaryHour = 05; date.hourFormat = "AM" }
                if(thisHour == 11){ date.hour = 06; date.militaryHour = 06; date.hourFormat = "AM" }
                if(thisHour == 12){ date.hour = 07; date.militaryHour = 07; date.hourFormat = "AM" }
                if(thisHour == 13){ date.hour = 08; date.militaryHour = 08; date.hourFormat = "AM" }
                if(thisHour == 14){ date.hour = 09; date.militaryHour = 09; date.hourFormat = "AM" }
                if(thisHour == 15){ date.hour = 10; date.militaryHour = 10; date.hourFormat = "AM" }
                if(thisHour == 16){ date.hour = 11; date.militaryHour = 11; date.hourFormat = "AM" }
                if(thisHour == 17){ date.hour = 12; date.militaryHour = 12; date.hourFormat = "PM" }
                if(thisHour == 18){ date.hour = 01; date.militaryHour = 13; date.hourFormat = "PM" }
                if(thisHour == 19){ date.hour = 02; date.militaryHour = 14; date.hourFormat = "PM" }
                if(thisHour == 20){ date.hour = 03; date.militaryHour = 15; date.hourFormat = "PM" }
                if(thisHour == 21){ date.hour = 04; date.militaryHour = 16; date.hourFormat = "PM" }
                if(thisHour == 22){ date.hour = 05; date.militaryHour = 17; date.hourFormat = "PM" }
                if(thisHour == 23){ date.hour = 06; date.militaryHour = 18; date.hourFormat = "PM" }
                
            }
            
            dueDate = date;

        }else{
        
            dueTime = null;
            
        }
        
        
        db.tasks.update({_id:taskId}, { $set:{
                name:name,
                description:description,
                members:members,
                dueDate:dueDate
        }}, function(task, err){

                if(!err){
                    res.send(true);    
                }else{
                    console.log(err);
                }
            }
        );

        // One form value was left empty
        res.send(true);
                
            
        
    }
});


// Delete Task Route
app.post('/api/deleteTask', function (req, res) {
// This route will add a client when an admin sends a post submission
    
    // Check if the user is a master admin and is logged on
    if (req.session.logged === 1) {
        
        // Store the form submission values
        var taskId=req.param('taskId');

        // Check if either field was left empty
        if( taskId == ""){

            // One form value was left empty
            res.send(false);

        }
//        
//        db.users.find( { }, { myTasks : { $elemMatch : { _id : taskId }}}, function(users){
//            
//            console.log(users);
//            
//            res.send(true); 
//        });
        
        db.tasks.update({_id:taskId}, { $set:{
                active:0
            }}, function(task, err){

                if(!err){
                    res.send(true);    
                }else{
                    console.log(err);
                }
            }
        );            
        
    }
});


// Complete Task Route
app.post('/api/completeTask', function (req, res) {
// This route will add a client when an admin sends a post submission
    
    // Check if the user is a master admin and is logged on
    if (req.session.logged === 1) {
        
        // Store the form submission values
        var taskId=req.param('taskId');

        // Check if either field was left empty
        if( taskId == ""){

            // One form value was left empty
            res.send(false);

        }
        
        db.tasks.update({_id:taskId}, { $set:{
                completed:true
            }}, function(task, err){

                if(!err){
                    res.send(true);    
                }else{
                    console.log(err);
                }
            }
        );

        // One form value was left empty
        res.send(true);
                
            
        
    }
});

// Activate Completed Task Route
app.post('/api/activateTask', function (req, res) {
// This route will add a client when an admin sends a post submission
    
    // Check if the user is a master admin and is logged on
    if (req.session.logged === 1) {
        
        // Store the form submission values
        var taskId=req.param('taskId');

        // Check if either field was left empty
        if( taskId == ""){

            // One form value was left empty
            res.send(false);

        }
        
        db.tasks.update({_id:taskId}, { $set:{
                completed:false
            }}, function(task, err){

                if(!err){
                    res.send(true);    
                }else{
                    console.log(err);
                }
            }
        );

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
                                var emailMsg = invitedBy+" has invited you to join "+cName+"'s Team at Tracing Ink. Click here to register:  http://tracingink.com/#/addMember/"+encrypt(cName)+"/"+encrypt(inviteId);

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
