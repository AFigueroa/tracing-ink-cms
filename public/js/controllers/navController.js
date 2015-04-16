app.controller("navController", [ "$scope", "$rootScope", "$location",
function($scope, $rootScope, $location){
    
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