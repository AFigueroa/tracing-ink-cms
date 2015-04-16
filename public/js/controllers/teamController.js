app.controller("teamController", [ "$scope", "$rootScope", "$location",
function($scope, $rootScope, $location){
    
    $rootScope.authData = false;
    $scope = null;
    // Set the title of the page
    $rootScope.title = "Team";
    
    var checkClass = $('.side-nav').hasClass('open'); // True if nav is open
          
    if (checkClass) {

        $('.side-nav').removeClass('open');
        $('.views-section').removeClass('open');

    }
}]);