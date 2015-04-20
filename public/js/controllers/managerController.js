app.controller("managerController", [ "$scope", "$rootScope", "$location","$http","$routeParams",
function($scope, $rootScope, $location, $http, $routeParams){
    
    $rootScope.authData = null;
    
    var checkClass = $('.side-nav').hasClass('open'); // True if nav is open
          
    if (checkClass) {

        $('.side-nav').removeClass('open');
        $('.views-section').removeClass('open');

    };
        
    var cName=  $routeParams.cName;
    var inviteId= $routeParams.inviteId;
    
    var manager = {
        cName : cName,
        inviteId : inviteId
    };
    
    $http.post("/api/decryptManager", manager).then(function(invite){
        
        if (invite){
                        
            var active = invite.data.active;
            if (active === 1){

                // Set the title of the page
                $rootScope.title = "Tracing Ink | Register";
                
                var cName = invite.data.cName;
                var inviteId = invite.data._id;
                var email = invite.data.email;
                var invitedBy = invite.data.invitedBy;
                var invitedByEmail = invite.data.invitedByEmail;
                
                var manager = {
                    inviteId:inviteId,
                    cName:cName,
                    email:email,
                    invitedBy:invitedBy,
                    invitedByEmail:invitedByEmail
                };
                
                $rootScope.manager = manager;
                
            }else{
                // Invite is Expired
                $location.path('/');
            }
            
        }else{
            // No invite found redirect to login for now
            $location.path('/');
        }
    
    });

    $scope.registerManager = function() {

        if ($scope.manager) {
            
            var fname = $scope.manager.fname;
            var cName = $scope.manager.cName;
            var lname = $scope.manager.lname;
            var email = $scope.manager.email;
            var pass = $scope.manager.pass;
            var repass = $scope.manager.repass;
            var inviteId = $rootScope.manager.inviteId;
            var invitedBy = $rootScope.manager.invitedBy;
            var invitedByEmail = $rootScope.manager.invitedByEmail;

            if(cName && fname && lname && email && pass && repass && inviteId && invitedBy && invitedByEmail){
                
                if(pass === repass){
                    
                    var manager = {
                        fname:fname,
                        lname:lname,
                        cName:cName,
                        email:email,
                        pass:pass,
                        repass:repass,
                        inviteId:inviteId,
                        invitedBy:invitedBy,
                        invitedByEmail:invitedByEmail
                    };
                    console.log('passwords match');
                    $http.post("/api/registerManager", manager).then(function(user){
                        console.log(user);
                    });
                    
                }else{
                    //Passwords dont match
                }
                
            }else{
                // Missing Fields
            }
            
            

        }else{

            // Redirect to login
            $location.path('/');

        }
    };
    
}]);