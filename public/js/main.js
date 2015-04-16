// Initiate the AngularJS module.
var app = angular.module("tracingInk", ["ngRoute"]);

app.run(function($http, $rootScope){
    var auth = $http.get("/api/authCheck").then(function(auth){
        $rootScope.authData = auth.data;
        //console.log($rootScope.authData);
    });
    
});

// Configure the app's routes
app.config(['$routeProvider','$locationProvider', function ($routeProvider, $locationProvider){

    // Routes
    $routeProvider

    // Home
    .when('/', {
      templateUrl:"views/login.html",
      controller: "loginController"
    })
  
    // Dashboard
    .when('/dashboard', {
      templateUrl:"views/dashboard.html",
      controller: "dashboardController"
    })
  
    // Logout
    .when('/logout', {
      templateUrl:"views/login.html",
      controller: "logoutController"
    })
  
  
}]);