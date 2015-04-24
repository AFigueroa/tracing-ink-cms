// Manager Controller
app.controller("memberController", [ "$scope", "$rootScope", "$location","$http","$routeParams",
function($scope, $rootScope, $location, $http, $routeParams){
    
    // Make sure the session is logged off
    $rootScope.authData = null;
    
    // Check if the Side Nav is open or not
    var checkClass = $('.side-nav').hasClass('open'); // True if nav is open
    
    // Check if true or false
    if (checkClass) {

        // The side Nav is Open
        
        // Remove "open" class from the side nav and from the views section
        $('.side-nav').removeClass('open');
        $('.views-section').removeClass('open');

    };
     
    // Get the values of the URL Get submission
    var cName=  $routeParams.cName;
    var inviteId= $routeParams.inviteId;
    
    // Check if all submissions are present
    if(cName && inviteId){
        
        // Submission values are present
        
        // Create the Manager object 
        var member = {
            cName : cName,
            inviteId : inviteId
        };
        
        //console.log(manager);
        
        // Send the encrypted values of the submission to the server
        $http.post("/api/decryptMember", member).then(function(invite){
            
            // Check if an invite was found
            if (invite){
                                
                // Get the value for "Active" from the invite's data
                var active = invite.data.active;
                
                // Check if the invite is active
                if (active === 1){
                    
                    // The invite is active
                    var cName = invite.data.cName; // Company Name
                    var inviteId = invite.data._id; // Invitation Id
                    var email = invite.data.email; // Invited User's Email
                    var invitedBy = invite.data.invitedBy; // Invitation Sender's Full Name
                    var invitedByEmail = invite.data.invitedByEmail; // Invitation Sender's Email

                    // Create a manager object with the data available so far
                    var manager = {
                        inviteId:inviteId,
                        cName:cName,
                        email:email,
                        invitedBy:invitedBy,
                        invitedByEmail:invitedByEmail
                    };

                    // Store the manager's data within scope
                    $rootScope.manager = manager;
                    
                    // Set the title of the page
                    $rootScope.title = "Tracing Ink | Register";

                }else{
                    
                    // Invite is Expired
                    //$location.path('/');
                    
                    //console.log(manager);
                }

            }else{
                
                // No invite found redirect to login for now
                $location.path('/');
                
            }
        });
        
    }else{
        
        // Missing submission values
        $location.path('/');
        
    }
    
    // Register Manager
    $scope.addMember = function() {
    // This method will send the values of the form to the server to...
    // add them to the database and create a new user with the type of manager
        
        // Check if the form was submitted successfully
        if ($scope.manager) {
            
            // Form submitted succesfully
            
            // Get all the values
            var fname = $scope.manager.fname;
            var cName = $scope.manager.cName;
            var lname = $scope.manager.lname;
            var email = $scope.manager.email;
            var phone = $scope.manager.phone;
            var pass = $scope.manager.pass;
            var repass = $scope.manager.repass;
            var inviteId = $scope.manager.inviteId;
            var invitedBy = $scope.manager.invitedBy;
            var invitedByEmail = $scope.manager.invitedByEmail;

            // Check if any neccessary value is missing
            if(cName && fname && lname && email && pass && repass && inviteId && invitedBy && invitedByEmail && phone){
                
                // All values submitted
                
                // Check if passwords match
                if(pass === repass){
                    
                    // Passwords match
                    
                    // Make a request to the server to add the manager to users
                    $http.post("/api/addMember", $scope.manager).then(function(user){
                        
                        console.log(user);
                        // Check if post was successful
                        if (user.data){

                            // Post was successful
                            
                            user = user.data;

                            // Gather the sanitized user data and store it within an object
                            var userData = {
                                "_id": user._id,
                                "fname": user.fname,
                                "cName": user.cName,
                                "lname": user.lname,
                                "email": user.email,
                                "phone": user.phone,
                                "type": user.type
                            };

                            // Check if the user is a master admin
                            if (userData.type === "1"){

                                // User is master admin
                                $rootScope.admin = true;

                            } else if(userData.type === 2){
                                
                                // User is master admin
                                $rootScope.manager = true;
                            
                            } else if(userData.type === 3){
                                
                                // User is master admin
                                $rootScope.member = true;
                            
                            };

                            // Store the user data within the $rootScope
                            $rootScope.user = userData;

                            // Set the scope's authdata value to true
                            $rootScope.authData = true;

                            // Redirect to the Dashboard  
                            $location.path('/dashboard');

                        }else{

                           // No user found
                            //$location.path('/'); 

                        }
                        
                    });
                    
                }else{
                    
                    //Passwords dont match
                    
                }
                
            }else{
                
                // Missing Fields
                
            }
            
        }else{

            // No Submission 

        }
    }; 
    
}]);

