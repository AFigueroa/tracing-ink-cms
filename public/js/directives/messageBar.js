// Messaging bottom bar
app.directive('messageBar', [
function() {
    return {
        templateUrl: '/views/messageBar.html',
    
        controller: function($scope, $rootScope, $location, $http) {
            
            // Check if the user is logged in or not
            var auth = $http.get("/api/authCheck").then(function(auth){

                // Gather the logged in value as $rootScope
                $rootScope.authData = auth.data;

            });
            
            // Check session authData
            var authData = $rootScope.authData;

            if (authData === true){

                // User is logged in
                var user = $http.get("/api/getUser").then(function(user){

                    // Store the user's data within scope
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

                    }else if(userType === 3){

                        // User is master admin
                        $rootScope.member = true;

                    }
                    
                    user = user.data;
                    
                    if (user){
                        console.log(user.fname);
                        // Check for team members for this company
                        cName = {cName:user.cName};

                        // Load all the contacts available and their messages
                        $http.post("/api/getTeam", cName).then(function(members){

                            // Check if request was succesful
                            if (members.data){
                                // Members found

                                // Load the team members within the front-end scope
                                $rootScope.teamMembers = members.data;

                                var teamMembers = $rootScope.teamMembers;

                                // Request for all the messages for each member found
                                $http.post("/api/getMessages", teamMembers)
                                .then(function(messages){


                                    console.log(messages.data);

                                }); 

                            }else{
                                // No members found

                                // Set teamMembers as an empty array
                                $rootScope.teamMembers = [];

                            };
                        });

                    }else{
                    
                        // User is logged OFF
                        $rootScope.authData = false;
                        
                    }

                });

            }else{

                // User is logged OFF
                $rootScope.authData = false;

            }
            
            
            // Message a specific member
            $scope.messageMember = function(message){
                console.log(message);
            };
    
        }
    };
}]);