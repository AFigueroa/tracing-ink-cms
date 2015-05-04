// Initiate the AngularJS module.
var app = angular.module("tracingInk", ["ngRoute","checklist-model"]);

// This runs everytime a route is called by the front-end
app.run(function($http, $rootScope){
    
    // Check if the user is logged in or not
    var auth = $http.get("/api/authCheck").then(function(auth){
        
        // Gather the logged in value as $rootScope
        $rootScope.authData = auth.data;
        
    });
    
    // Check if the server has any user data
    var user = $http.get("/api/getUser").then(function(user){
        
        // Gather the user's data in $rootScope
        $rootScope.user = user.data;
        
        // Verify User's Privilege level
        var userType= $rootScope.user.type;
        
        if (userType === "1"){

            // User is Master Admin
            $rootScope.admin = true;  

        }
        
    });
    
    // Check if the Side Nav is open or not
    var checkClass = $('.side-nav').hasClass('open'); // True if nav is open
    
    // Check if true or false
    if (checkClass) {
        
        // The side Nav is Open
        
        // Remove "open" class from the side nav and from the views section
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
    
    // Show All Clients
    .when('/clients', {
      templateUrl:"views/clients.html",
      controller: "clientsController"
    })
    
    // Add Clients Form
    .when('/addClient', {
      templateUrl:"views/addClient.html",
      controller: "clientsController"
    })
    
    // Add Manager Form
    .when('/addManager/:cName/:inviteId', {
      templateUrl:"views/addManager.html",
      controller: "managerController"
    })
    
    // Add Member Form
    .when('/addMember/:cName/:inviteId', {
      templateUrl:"views/addMember.html",
      controller: "memberController"
    })
    
    // Invite Member Form
    .when('/inviteMember', {
      templateUrl:"views/inviteMember.html",
      controller: "teamController"
    })
    
    // Add Member Form
    .when('/newProject', {
      templateUrl:"views/newProject.html",
      controller: "projectsController"
    })
    
    // Add Member Form
    .when('/inviteSuccess', {
      templateUrl:"views/inviteSuccess.html",
      controller: "teamController"
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