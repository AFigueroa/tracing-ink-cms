app.controller("logoutController", [ "$scope", "$rootScope", "$location",
function($scope, $rootScope, $location){
    
    $rootScope.authData = false;
    $scope = null;
    // Set the title of the page
    $rootScope.title = "Logging out";
    

}]);