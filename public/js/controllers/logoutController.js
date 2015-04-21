// Logout Controller
app.controller("logoutController", [ "$scope", "$rootScope", "$location",'$http',
function($scope, $rootScope, $location, $http){
    
    // Set the scope variable for authenticated to false
    $rootScope.authData = false;
    
    // Reset $scope
    $scope = null;
    
    // Reset $rootScope
    $rootScope = null;
    
    // Send a message to the back-end to clear the session data
    $http.get("/api/logout");
    
}]);