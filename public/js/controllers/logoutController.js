app.controller("logoutController", [ "$scope", "$rootScope", "$location",
function($scope, $rootScope, $location){
    
    $rootScope.authData = false;
    $scope = null;
    $rootScope = null;
    
}]);