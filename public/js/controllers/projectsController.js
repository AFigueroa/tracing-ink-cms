// Projects Controller
app.controller("projectsController", [ "$scope", "$rootScope", "$location", "$http", "$routeParams",
function($scope, $rootScope, $location, $http, $routeParams){
    
    if($scope.project){
        
        // Erase the value of project within scope
        $scope.project = null;
    
    }
    
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
            var thisUser = {
                _id : user.data._id,
                cName : user.data.cName
            };
            
            if ($routeParams.projectId) {
            
                var project = {
                    cName : user.data.cName,
                    projectId : $routeParams.projectId 
                };
                
                // Request the project based on the projectId selected
                $http.post("/api/getProject", project).then(function(project){

                    project = project.data
                    
                    // Format the date and time data
                    project.due = new Date(project.dueDate.year, project.dueDate.month - 1, project.dueDate.day);
                    
                    if(project.dueDate.hour && project.dueDate.minute){
                        
                        project.dueTime = new Date(project.dueDate.year, project.dueDate.month - 1, project.dueDate.day, project.dueDate.militaryHour, project.dueDate.minute, 0);
                    
                    }
                    
                    // For each member in this project store th _id in an array
                    var thisProjectsMembers = [];
                    
                    for (var i = 0; i <= project.members.length - 1; i++){
                    
                        thisProjectsMembers.push(project.members[i]._id);
                        
                    }
                    
                    // This data is used by the edit form to know which users are already assigned to this project
                    $rootScope.thisProjectsMembers = thisProjectsMembers;
                    
                    $rootScope.project = project;

                    $rootScope.projectMembers = project.members;

                });
                
            } else {
                
                $rootScope.project = null;
                
            }
            
            // Send a request to the server to add a Client
            $http.post("/api/getProjects", thisUser).then(function(projects){
                
                projects = projects.data;
                $rootScope.projects = projects;
                
                // Set false as the deafult value for if there is a completed task
                $rootScope.completedProject = false;
                $rootScope.activeProject = false;

                // For each task count all that are completed. If there are completed stop and scope.completed is true
                for (i = 0; i <= projects.length - 1; i++) {

                    if (projects[i].completed === true && projects[i].active === 1) {

                        // A completed task has been found
                        $rootScope.completedProject = true;

                    }else if (projects[i].completed === false && projects[i].active === 1) {

                        // An active task has been found
                        $rootScope.activeProject = true;
                    }

                }
                                
            });
            
            $http.post("/api/getTeam", thisUser).then(function(members){
                
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
            
            var members = {
                members : $scope.project.members
            };
            
            // Get the data for all the selected team members
            $http.post("/api/getMembers", members).then(function(members){
                
                // Load the team members within the front-end scope
                $scope.project.members = members.data;
                    
                // Send a request to the server to add a Client
                $http.post("/api/addProject", $scope.project).then(function(project){
    
                    if (project.data){

                        $scope.project = null;
                        $location.path("/projects");

                    }else{

                        console.log("Something went wrong");

                    }
                
                });
                 
            });
        
        }
    }
    
    $scope.updateProject = function () {
        
        // Check if the form was succesfully submitted
        if ($scope.project) {
            
            $scope.project.members = $scope.thisProjectsMembers;
            // Send a request to the server to update a Task
            $http.post("/api/updateProject", $scope.project).then( function (err, project) {
    
                console.log(project, err);
                if (project.data){
                    
                }else{
                
                    console.log("Something went wrong");
                    
                }
                
            });
            $scope.project = null;
            $location.path("/projects");
        }
    
    };
    
    // This Function is activated on a form submission in update task
    $scope.completeProject = function(projectId) {

       if(!projectId){
           
           return false;
           
       }
        
        var project = {
            projectId : projectId
        }
        
        // Send a request to the server to Delete a selected Task based on _id
        $http.post("/api/completeProject", project).then(function(res){

            if (res.data){
                
                // Get the new projects
                
                // Get the user data from the server
                var user = $http.get("/api/getUser").then(function(user){

                    // Check for team members for this company
                    var thisUser = {
                        _id : user.data._id,
                        cName : user.data.cName
                    };
                
                
                    // Send a request to the server to add a Client
                    $http.post("/api/getProjects", thisUser).then(function(projects){

                        projects = projects.data;
                        $rootScope.projects = projects;

                        // Set false as the deafult value for if there is a completed task
                        $rootScope.completedProject = false;
                        $rootScope.activeProject = false;

                        // For each task count all that are completed. If there are completed stop and scope.completed is true
                        for (i = 0; i <= projects.length - 1; i++) {

                            if (projects[i].completed === true && projects[i].active === 1) {

                                // A completed task has been found
                                $rootScope.completedProject = true;

                            }else if (projects[i].completed === false && projects[i].active === 1) {

                                // An active task has been found
                                $rootScope.activeProject = true;
                            }

                        }

                        $location.path("/projects");
                    });

                });
                
            }else{

                console.log("Something went wrong");

            }

        });
        
    }
    
    $scope.activateProject = function(projectId) {

       if(!projectId){
           
           return false;
           
       }
        
        var project = {
            projectId : projectId
        }
        
        // Send a request to the server to Delete a selected Task based on _id
        $http.post("/api/activateProject", project).then(function(res){

            if (res.data){
                
                // Get the new projects
                
                // Get the user data from the server
                var user = $http.get("/api/getUser").then(function(user){

                    // Check for team members for this company
                    var thisUser = {
                        _id : user.data._id,
                        cName : user.data.cName
                    };


                    // Send a request to the server to add a Client
                    $http.post("/api/getProjects", thisUser).then(function(projects){

                        projects = projects.data;
                        $rootScope.projects = projects;

                        // Set false as the deafult value for if there is a completed task
                        $rootScope.completedProject = false;
                        $rootScope.activeProject = false;

                        // For each task count all that are completed. If there are completed stop and scope.completed is true
                        for (i = 0; i <= projects.length - 1; i++) {

                            if (projects[i].completed === true && projects[i].active === 1) {

                                // A completed task has been found
                                $rootScope.completedProject = true;

                            }else if (projects[i].completed === false && projects[i].active === 1) {

                                // An active task has been found
                                $rootScope.activeProject = true;
                            }

                        }

                        $location.path("/projects");
                    });

                });


            }else{

                console.log("Something went wrong");

            }

        });
        
    }
    
    
    $scope.deleteProject = function(projectId) {

       if(!projectId){
           
           return false;
           
       }
        
        var project = {
            projectId : projectId
        }
        
        // Send a request to the server to Delete a selected Task based on _id
        $http.post("/api/deleteProject", project).then(function(res){

            if (res.data){
                
                // Get the new projects
                
                // Get the user data from the server
                $http.get("/api/getUser").then(function(user){

                    // Check for team members for this company
                    var thisUser = {
                        _id : user.data._id,
                        cName : user.data.cName
                    };


                    // Send a request to the server to add a Client
                    $http.post("/api/getProjects", thisUser).then(function(projects){

                        projects = projects.data;
                        $rootScope.projects = projects;

                        // Set false as the deafult value for if there is a completed task
                        $rootScope.completedProject = false;
                        $rootScope.activeProject = false;

                        // For each task count all that are completed. If there are completed stop and scope.completed is true
                        for (i = 0; i <= projects.length - 1; i++) {

                            if (projects[i].completed === true && projects[i].active === 1) {

                                // A completed task has been found
                                $rootScope.completedProject = true;

                            }else if (projects[i].completed === false && projects[i].active === 1) {

                                // An active task has been found
                                $rootScope.activeProject = true;
                            }

                        }

                        $location.path("/projects");
                    });

                });


            }else{

                console.log("Something went wrong");

            }

        });
        
    }
    
}]);