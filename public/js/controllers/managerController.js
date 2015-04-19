app.controller("managerController", [ "$scope", "$rootScope", "$location","$http","$routeParams",
function($scope, $rootScope, $location, $http, $routeParams){
    
    var checkClass = $('.side-nav').hasClass('open'); // True if nav is open
          
    if (checkClass) {

        $('.side-nav').removeClass('open');
        $('.views-section').removeClass('open');

    };
    
    var manager= {
        cName: $routeParams
    };
    
    $http.post("/api/decrypt", manager).then(function(data){
        //console.log(data);
    });
    
    // Set the title of the page
    $rootScope.title = "Tracing Ink | Register";

//    $scope.submit = function() {
//
//        if ($scope.user) {
//
//            //Submission values
//            //console.log($scope.user);
//
//            $http.post("/api/login", $scope.user).then(function(user){
//
//                //console.log(user.data);
//
//                if (user.data){
//
//
//                    var userData = {
//                        "_id": user.data._id,
//                        "fname": user.data.fname,
//                        "lname": user.data.lname,
//                        "email": user.data.email,
//                        "phone": user.data.phone,
//                        "type": user.data.type,
//                    };
//
//                    if (userData.type === "1"){
//
//                        // User is master admin
//
//                        $rootScope.admin = true;
//                    }
//                    $rootScope.user = userData;
//
//                    $rootScope.authData = true;
//
//                    // Redirect to the Dashboard  
//                    $location.path('/dashboard');
//
//                }else{
//                   // Redirect to login
//                    $location.path('/'); 
//                }
//          });
//
//        }else{
//
//            // Redirect to login
//            $location.path('/');
//
//        }
//    };
    
}]);