// Messages Controller
app.controller("conversationsController", [ "$scope", "$rootScope", "$location", "$http",
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
    
    // Check session authData
    var authData = $rootScope.authData;
    
    if (authData === true){
        
        // User is logged ON
        
        // Get the user data from the server
        var user = $http.get("/api/getUser").then(function(user){
            
            // Store the data within the $rootScope
            $rootScope.user = user.data;
            
            // Set the title of the page
            $rootScope.title = "Tracing Ink | Conversations ";
            $rootScope.pageTitle = "Conversations";
            $rootScope.pageTitleUrl = "#/conversations";
            
            // Check for team members for this company
            cName = {cName:user.data.cName};
            
            $http.post("/api/getTeam", cName).then(function(members){
                
                if (members.data){
                    // Members found
                    
                    // Load the team members within the front-end scope
                    $rootScope.teamMembers = members.data;

                }else{
                    // No members found
                    
                    // Set teamMembers as an empty array
                    $rootScope.teamMembers = [];
                    
                };
                
            });
        
        });
        
    }else{
        
        // User is Logged OFF
        $location.path('/');
        
    }
}]);