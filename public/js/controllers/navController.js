app.controller("navController", [ "$scope", "$rootScope", "$location", "$http",
function($scope, $rootScope, $location, $http){
    
    var user = $http.get("/api/getUser").then(function(user){
        $rootScope.user = user.data;
        
        if (user){
            
            var userType= $rootScope.user.type;
        
            if (userType === "1" ){

                // User is Master Admin
                $rootScope.admin = true;

            }
        }
    });
    
    
    
    $scope.toggleSideNav = function(){
        
        var checkClass = $('.side-nav').hasClass('open'); // True if nav is open
          
          if (checkClass) {
        
              $('.side-nav').removeClass('open');
              $('.views-section').removeClass('open');
              
          } else {
            
              $('.side-nav').addClass('open');
              $('.views-section').addClass('open');
              
          }
    };
    
}]);