// Team Controller
app.controller("teamController", [ "$scope", "$rootScope", "$location", "$http",
function($scope, $rootScope, $location, $http){
    
    // Check if the Side Nav is open or not
    var checkClass = $('.side-nav').hasClass('open'); // True if nav is open
    
    // Check if true or false
    if (checkClass) {

        // The side Nav is Open
        
        // Remove "open" class from the side nav and from the views section
        $('.side-nav').removeClass('open');
        $('.views-section').removeClass('open');

    };
    
    // Check session authData
    var authData = $rootScope.authData;
    
    if (authData === true){
        
        // User is logged ON
        
        // Get the user data from the server
        var user = $http.get("/api/getUser").then(function(user){
            
            // Store the data within the $rootScope
            $rootScope.user = user.data;
            
            // Get the user's type
            var userType= $rootScope.user.type;
            
            // Check if user is master admin
            if (userType === "1"){

                // User is Master Admin
                $rootScope.admin = true;  

            } else if(userType === 2){
                    
                // User is master admin
                $rootScope.manager = true;

            }
            
            // Set the title of the page
            $rootScope.title = $rootScope.user.cName+"'s | Team";
            $rootScope.pageTitle = "Team Members";
        
        });
        
    }else{
        
        // User is Logged OFF
        $location.path('/');
        
    }
    
    // This Function is activated on a form submission in Invite Member route
    $scope.inviteMember = function() {
         
        // Check if the form was succesfully submitted
        if ($scope.member) {
            
            // Form submitted
            var cName = $scope.user.cName;
            var invitedBy = $scope.user.fname+" "+$scope.user.lname;
            var invitedByEmail = $scope.user.email;
            
            if (cName && invitedBy && invitedByEmail){
            
                var member = {
                    cName: cName,
                    invitedBy: invitedBy,
                    invitedByEmail: invitedByEmail,
                    email: $scope.member.email
                };
                
                // Send a request to the server to invite a member
                $http.post("/api/inviteMember", member).then(function(member){

                    // Check if the Add Client method was successful
                    if (member){

                        console.log(member);
                        // Client was added successfully

                        // Redirect to the Clients List
                        //$location.path('/inviteSuccess');


                    }else{

                        // Invite was NOT sent

                    }
                });
            }else{
                // Missing user data
            };
        }else{
            
            // Form not submitted
            
        }
    };
}]);