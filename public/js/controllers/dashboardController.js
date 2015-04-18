app.controller("dashboardController", [ "$scope", "$rootScope", "$location", "$http",
function($scope, $rootScope, $location, $http){
    
    var authData = $rootScope.authData;
    
    if (authData === true){
       
        // Set the title of the page
        $rootScope.title = "Tracing Ink | Dashboard";
        $rootScope.pageTitle = "Dashboard";
    
    }else{
    
        $location.path('/');
    }    

}]);
