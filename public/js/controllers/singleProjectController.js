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
                $rootScope.project = project;
                $rootScope.tasks = project.tasks;
                $rootScope.projectMembers = project.members;
                                
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
    
    // This Function is activated on a form submission in Add task route
    $scope.addTask = function() {

        // Check if the form was succesfully submitted
        if ($scope.task) {
            
            // Task object is within scope
            $scope.task.cName = $scope.user.cName;
            $scope.task.projectId = $scope.project._id;
            
            $scope.task.creator = {
                _id: $scope.user._id,
                fname: $scope.user.fname,
                lname: $scope.user.lname
            };
            
            if (!$scope.task.members){
                $scope.task.members = [];
                
            }
            
            $scope.task.members.push($scope.user._id);
            
            // Send a request to the server to add a Task
            $http.post("/api/addtask", $scope.task).then(function(task){
    
                
                if (task.data){
                    $scope.task = null;
                    $location.path("/project/"+$scope.project._id);
                    
                }else{
                
                    console.log("Something went wrong");
                    
                }
                
            });
        }
    }
}]);