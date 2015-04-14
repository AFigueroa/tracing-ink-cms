app.controller("dashboardController", [ "$scope", "$rootScope", "$location",
function($scope, $rootScope, $location){
    
    var authData = $rootScope.authData;
    console.log(authData);
    
    if (authData === true){
        console.log("authenticated");
        console.log($scope.user);
    }else{
        console.log("not authenticated");
        $location.path('/');
    }
    
    // Set the title of the page
    $rootScope.title = "Dashboard";


}]);
