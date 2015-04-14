app.controller("dashboardController", [ "$scope", "$rootScope", "$location",
function($scope, $rootScope, $firebase, $firebaseAuth, $location){
    
    var authData = $rootScope.authData;
    
    if (authData === true){
        console.log("authenticated");
    }else{
        console.log("not authenticated");
    }
    
    // Set the title of the page
    $rootScope.title = "Dashboard";


}]);
