// Single Project Controller
app.controller("singleProjectController", [ "$scope", "$rootScope", "$location", "$http", "$routeParams",
function($scope, $rootScope, $location, $http, $routeParams){
    
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
            
            // The Project Id
            var projectId=  $routeParams.projectId;
            
            // Store the Company name
            cName = user.data.cName;
            
            // Create the Project object 
            var project = {
                cName : cName,
                projectId : projectId
            };

            // Request the project based on the projectId selected
            $http.post("/api/getProject", project).then(function(project){
                
                project = project.data;
                
                console.log(project);
                
                $rootScope.project = project;
                                
            });
            
            // Reformat Company name to query for all team members
            cName = {cName:user.data.cName};
            
            // Request the team data
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
            $rootScope.title = "Tracing Ink | Single Project";
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