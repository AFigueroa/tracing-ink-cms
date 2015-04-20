app.controller("dashboardController", [ "$scope", "$rootScope", "$location", "$http",
function($scope, $rootScope, $location, $http){
    
    var user = $http.get("/api/getUser").then(function(user){
        $rootScope.user = user.data;
    });
    
    var authData = $rootScope.authData;
    
    if (authData === true){
        
        var userType= $rootScope.user.type;
        
        if (userType === "1"){
            
            // User is Master Admin
            $rootScope.admin = true;  
            
        }
        
        // Set the title of the page
        $rootScope.title = "Tracing Ink | Dashboard";
        $rootScope.pageTitle = "Dashboard"; 
    
    }else{
    
        $location.path('/');
    }    

}]);
