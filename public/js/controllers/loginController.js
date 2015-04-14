app.controller("loginController", [ "$scope", "$rootScope", "$location","$http",
function($scope, $rootScope, $location, $http){
    
    
    // Set the title of the page
    $rootScope.title = "Login";
    
    $scope.submit = function() {
        if ($scope.user) {
          console.log($scope.user);
          $http.post("/api/login", $scope.user).then(function(data){
            console.log(data);
          });
        }
    };
    
}]);