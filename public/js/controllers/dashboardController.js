app.controller("dashboardController", [ "$scope", "$rootScope", "$location", "$http",
function($scope, $rootScope, $location, $http){
    
    var user = $http.get("/api/getUser").then(function(user){
        $rootScope.user = user.data;
    });
    
    var authData = $rootScope.authData;
    //console.log(authData);
    
    if (authData === true){
        //console.log("authenticated");
        //console.log($rootScope.user);
    }else{
        //console.log("not authenticated");
        $location.path('/');
    }
    
    // Set the title of the page
    $rootScope.title = "Dashboard";
    $rootScope.pageTitle = "Dashboard";

}]);
