// Projects Controller
app.controller("projectsController", [ "$scope", "$rootScope", "$location", "$http",
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
            
            // Check for team members for this company
            cName = {cName:user.data.cName};
            
            // Send a request to the server to add a Client
            $http.post("/api/getProjects", cName).then(function(projects){
                
                projects = projects.data;
                
                $rootScope.projects = projects;
                                
            });
            
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
            
            
            // Store the data within the $rootScope
            $rootScope.user = user.data;
            
            // Set the title of the page
            $rootScope.title = "Tracing Ink | Projects";
            $rootScope.pageTitle = "Projects";
            $rootScope.pageTitleUrl = "#/projects";
        
        });
        
    }else{
        
        // User is Logged OFF
        $location.path('/');
        
    }
    
    // This Function is activated on a form submission in Add Client route
    $scope.addProject = function() {

        // Check if the form was succesfully submitted
        if ($scope.project) {
            
            // Client object is within scope
            $scope.project.cName = $scope.user.cName;
            $scope.project.manager = {
                _id: $scope.user._id,
                fname: $scope.user.fname,
                lname: $scope.user.lname
            };
            
            // If no members within scope establish an empty array
            if (!$scope.project.members){
                $scope.project.members = [];
                
            }
            
            $scope.project.members.push($scope.user._id);
            
            // Send a request to the server to add a Client
            $http.post("/api/addProject", $scope.project).then(function(project){
    
                
                if (project.data){
                    
                    $scope.project = null;
                    $location.path("/projects");
                    
                }else{
                
                    console.log("Something went wrong");
                    
                }
                
            });
        }
    }
}]);