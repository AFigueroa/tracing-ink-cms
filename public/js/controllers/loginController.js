app.controller("loginController", [ "$scope", "$rootScope", "$location","$http",
function($scope, $rootScope, $location, $http){
    
    if ($rootScope.authData === true){
        // User is already logged in
        
        // Redirect to the Dashboard  
        $location.path('/dashboard');
        
    }else{
    
        // Set the title of the page
        $rootScope.title = "Login";

        $scope.submit = function() {

            if ($scope.user) {

                //Submission values
                //console.log($scope.user);

                $http.post("/api/login", $scope.user).then(function(user){

                    //console.log(user.data);

                    if (user.data){

                        $rootScope.user = user;
                        $rootScope.authData = true;

                        // Redirect to the Dashboard  
                        $location.path('/dashboard');

                    }else{
                       // Redirect to login
                        $location.path('/'); 
                    }
              });

            }else{

                // Redirect to login
                $location.path('/');

            }
        };
    }
}]);