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
            $rootScope.userType = userType ;
                        
            // Check if user is master admin
            if (userType === "1"){

                // User is Master Admin
                $rootScope.admin = true;  

            } else if(userType === 2){
                    
                // User is master admin
                $rootScope.manager = true;

            }else if(userType === 3){
                    
                // User is master admin
                $rootScope.member = true;

            }
            
            // Set the title of the page
            $rootScope.title = $rootScope.user.cName+"'s | Team";
            $rootScope.pageTitle = "Team Members";
            $rootScope.pageTitleUrl = "#/team";
        
            // Check for team members for this company
            cName = {cName:user.data.cName};
            
            $http.post("/api/getTeam", cName).then(function(members){
                
                if (members.data){
                    // Members found
                    
                    // Load the team members within the front-end scope
                    $rootScope.teamMembers = members.data;

                }else{
                    // No members found
                    
                    // Set teamMembers as an empty array
                    $rootScope.teamMembers = [];
                    
                };
                
            });
            
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
                    email: angular.lowercase($scope.member.email)
                };
                
                // Send a request to the server to invite a member
                $http.post("/api/inviteMember", member).then(function(member){

                    // Check if the Add Client method was successful
                    if (member){

                        if(member.data === false){
                            
                            // An error occurred
                        
                        }else{
                            
                            // Member was invited successfully
                            $rootScope.thisMember = member.data.email;

                            // Redirect to the Invite Success
                            $location.path('/inviteSuccess');
                        
                        };
                        
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
    
    
    // Open and Close the Side nav
    $scope.toggleBtmNav = function(){
    // This method removes or places the class open on the side navigation and the Angular views section.
        
        // Check if Side Navigation has class "open"
        var checkClass = $('#btm-nav').hasClass('showing'); // True if nav is open
         
        // Check if Open or Closed 
        if (checkClass) {
            
            // Side Navigation is Open
            
            // Remove Class Open
            $('#btm-nav').removeClass('showing');
              
        } else {
            
            // Side Navigation is Closed
            
            // Add Class Open
            $('#btm-nav').addClass('showing');
    
        }
    };
}]);