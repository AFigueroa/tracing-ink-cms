// Login Controller
app.controller("loginController", [ "$scope", "$rootScope", "$location","$http",
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
    
    // Check if the user is logged in already
    if ($rootScope.authData === true){
        
        // User is already logged in
        
        // Redirect to the Dashboard  
        $location.path('/dashboard');
        
    }else{
    
        // Set the title of the page
        $rootScope.title = "Tracing Ink | Login";
        
    }
    
    // Login the user Method 
    $scope.login = function() {
    // This method runs upon the form submission and will send the form values to the back-end
        
        // Check if the form was filled out properly
        if ($scope.user) {
            
            // Make the email submission lowercase
            $scope.user.email = angular.lowercase($scope.user.email);
            console.log($scope.user.email);
            
            // Post the form submissions to the server
            $http.post("/api/login", $scope.user).then(function(user){
                
                // Check if post was successful
                if (user.data){
                    
                    // A user was found
                    
                    // Gather the sanitized user data and store it within an object
                    var userData = {
                        "_id": user.data._id,
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
                        
                    }else if(userData.type === 3){
                    
                        // User is master admin
                        $rootScope.member = true;
                        
                    }
                    
                    // Store the user data within the $rootScope
                    $rootScope.user = userData;
                                        
                    // Set the scope's authdata value to true
                    $rootScope.authData = true;

                    // Redirect to the Dashboard  
                    $location.path('/dashboard');

                }else{
                    
                   // No user found
                    $location.path('/'); 
                    
                }
          });

        }else{

            // Form fields are not submitted properly
            $location.path('/');

        }
    };
}]);