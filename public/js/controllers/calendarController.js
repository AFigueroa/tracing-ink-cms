app.controller("calendarController", [ "$scope", "$rootScope", "$location", "$http", "$location",
function($scope, $rootScope, $location, $http, $location){
    
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
    $rootScope.title = "Tracing Ink | Calendar";
    $rootScope.pageTitle = "Calendar";
    
    var checkClass = $('.side-nav').hasClass('open'); // True if nav is open
          
    if (checkClass) {

        $('.side-nav').removeClass('open');
        $('.views-section').removeClass('open');

    }
}]);