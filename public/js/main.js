// Initiate the AngularJS module.
var app = angular.module("tracingInk", ["ngRoute"]);

app.run(function($http, $rootScope){
    var auth = $http.get("/api/authCheck").then(function(auth){
        $rootScope.authData = auth.data;
        //console.log($rootScope.authData);
    });
    
    var checkClass = $('.side-nav').hasClass('open'); // True if nav is open
          
    if (checkClass) {

        $('.side-nav').removeClass('open');
        $('.views-section').removeClass('open');

    };
    
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
    
    // Dashboard
    .when('/clients', {
      templateUrl:"views/clients.html",
      controller: "clientsController"
    })
    
    // Team
    .when('/team', {
      templateUrl:"views/team.html",
      controller: "teamController"
    })
    
    // Projects
    .when('/projects', {
      templateUrl:"views/projects.html",
      controller: "projectsController"
    })
    
    // Calendar
    .when('/calendar', {
      templateUrl:"views/calendar.html",
      controller: "calendarController"
    })
    
    // Messages
    .when('/messages', {
      templateUrl:"views/messages.html",
      controller: "messagesController"
    })
  
    // Logout
    .when('/logout', {
      templateUrl:"views/login.html",
      controller: "logoutController"
    })
  
  
}]);