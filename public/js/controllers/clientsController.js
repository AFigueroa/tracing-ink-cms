app.controller("clientsController", [ "$scope", "$rootScope", "$location", "$http", "$location",
function($scope, $rootScope, $location, $http, $location){
    
    var checkClass = $('.side-nav').hasClass('open'); // True if nav is open
          
    if (checkClass) {

        $('.side-nav').removeClass('open');
        $('.views-section').removeClass('open');

    }
    
    
    var authData = $rootScope.authData;
    //console.log(authData);
    
    if (authData === true){
        
        //console.log($rootScope.user.type);
        
        var userType= $rootScope.user.type;
        
        if (userType === "1"){
            
            $http.get("/api/getClients").then(function(clients){
                    
                    if (clients){

                        $rootScope.clients = clients.data;
                        
                    }else{
                        //console.log("no clients");
                    }
            });
            
            // User is Master Admin
            $rootScope.admin = true;
            // Set the title of the page
            $rootScope.title = "Tracing Ink | Clients";
            $rootScope.pageTitle = "Clients";
            
            
            $scope.addClient = function() {
                
                if ($scope.client) {
                    
                    $http.post("/api/addClient", $scope.client).then(function(client){
                    
                        if (client){
                            
                            //console.log("true");
                            $location.path('/clients');


                        }else{
                           
//                            console.log("no client");
                        }
                  });
                }
            }
        }else{
            
            // User doesn't have enough privileges.
            $location.path('/');
        }
        
        
    }else{
        //console.log("not authenticated");
        $location.path('/');
    }   
    
}]);