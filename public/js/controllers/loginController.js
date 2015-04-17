app.controller("loginController", [ "$scope", "$rootScope", "$location","$http",
function($scope, $rootScope, $location, $http){
    
    var checkClass = $('.side-nav').hasClass('open'); // True if nav is open
          
    if (checkClass) {

        $('.side-nav').removeClass('open');
        $('.views-section').removeClass('open');

    };
    
    if ($rootScope.authData === true){
        // User is already logged in
        
        // Redirect to the Dashboard  
        $location.path('/dashboard');
        
    }else{
    
        // Set the title of the page
        $rootScope.title = "Tracing Ink | Login";

        $scope.submit = function() {

            if ($scope.user) {

                //Submission values
                //console.log($scope.user);

                $http.post("/api/login", $scope.user).then(function(user){

                    //console.log(user.data);

                    if (user.data){
                        
                        
                        var userData = {
                            "_id": user.data._id,
                            "fname": user.data.fname,
                            "lname": user.data.lname,
                            "email": user.data.email,
                            "phone": user.data.phone,
                            "type": user.data.type,
                        };
                        
                        $rootScope.user = userData;
                        
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