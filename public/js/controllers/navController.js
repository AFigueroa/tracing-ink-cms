// Navigation Controller (Side Navigation and Top Navigation)
app.controller("navController", [ "$scope", "$rootScope", "$location", "$http",
function($scope, $rootScope, $location, $http){
    
    // Request the user's data from the server
    var user = $http.get("/api/getUser").then(function(user){
        
        // Check if a user was found
        if (user){
            
            // Store the users's data within scope
            $rootScope.user = user.data;
            
            // Get the user type
            var userType= $rootScope.user.type;
        
            // Check if the user is Master Admin
            if (userType === "1" ){

                // User is Master Admin
                $rootScope.admin = true;

            }
        }
    });
    
    // Open and Close the Side nav
    $scope.toggleSideNav = function(){
    // This method removes or places the class open on the side navigation and the Angular views section.
        
        // Check if Side Navigation has class "open"
        var checkClass = $('.side-nav').hasClass('open'); // True if nav is open
         
        // Check if Open or Closed 
        if (checkClass) {
            
            // Side Navigation is Open
            
            // Remove Class Open
            $('.side-nav').removeClass('open');
            $('.views-section').removeClass('open');
              
        } else {
            
            // Side Navigation is Closed
            
            // Add Class Open
            $('.side-nav').addClass('open');
            $('.views-section').addClass('open');
      
        }
    };
    
}]);