// Clients Controller
app.controller("clientsController", [ "$scope", "$rootScope", "$location", "$http", 
function($scope, $rootScope, $location, $http){
    
    // Check if the Side Nav is open or not
    var checkClass = $('.side-nav').hasClass('open'); // True if nav is open
    
    // Check if true or false
    if (checkClass) {

        // The side Nav is Open
        
        // Remove "open" class from the side nav and from the views section
        $('.side-nav').removeClass('open');
        $('.views-section').removeClass('open');

    };
    
    // Prepare to check if the user is logged On
    var authData = $rootScope.authData;
    
    // Check if the user is logged On
    if (authData === true){
        
        // Prepare to check the user type
        var userType= $rootScope.user.type;
        
        // Check if user is Master Admin
        if (userType === "1"){
            
            // User is Master Admin
            $rootScope.admin = true;
            
            // Set the title of the page
            $rootScope.title = "Tracing Ink | Clients";
            $rootScope.pageTitle = "Clients";
            
            // The user is Master Admin
            
            // Get all active Clients
            $http.get("/api/getClients").then(function(clients){
                 
                // Check if active clients where found
                if (clients){
                    
                    // Store the sanitized Client information within scope
                    $rootScope.clients = clients.data;

                }else{
                    
                    // No Clients where found
        
                }
            });
            
            
        }else{
            
            // User doesn't have enough privileges.
            $location.path('/');
        }
        
        
    }else{
        //console.log("not authenticated");
        $location.path('/');
    }
    
    // This Function is activated on a form submission in Add Client route
    $scope.addClient = function() {
         
        // Check if the form was succesfully submitted
        if ($scope.client) {
            
            // Client object is within scope
            
            // Send a request to the server to add a Client
            $http.post("/api/addClient", $scope.client).then(function(client){
                
                // Check if the Add Client method was successful
                if (client){
                    
                    console.log(client);
                    // Client was added successfully
                    
                    // Redirect to the Clients List
                    $location.path('/clients');


                }else{
                    
                    // Client was NOT added
                    
                }
            });
        }
    };   
}]);