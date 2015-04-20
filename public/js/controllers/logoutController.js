app.controller("logoutController", [ "$scope", "$rootScope", "$location",'$http',
function($scope, $rootScope, $location, $http){
    
    $rootScope.authData = false;
    $scope = null;
    $rootScope = null;
    
    $http.get("/api/logout").then(function(res){
        console.log(res);
    });
}]);