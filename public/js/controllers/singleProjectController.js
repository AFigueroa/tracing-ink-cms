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
            
            if($routeParams.taskId){
                
                var taskId = $routeParams.taskId;
                
                // Create the Project object 
                var task = {
                    cName : cName,
                    projectId : projectId,
                    taskId : taskId
                };
                
                
                $http.post("/api/getTask", task).then(function(task){

                    task = task.data;
                    task.due = new Date(task.dueDate.year, task.dueDate.month - 1, task.dueDate.day);
                    
                    if(task.dueDate.hour && task.dueDate.minute){
                        
                        task.dueTime = new Date(task.dueDate.year, task.dueDate.month - 1, task.dueDate.day, task.dueDate.militaryHour, task.dueDate.minute, 0);
                    
                    }
                    
                    $rootScope.task = task;

                });
                
            }else{
                
                $rootScope.task = null;
                
            }
            
            // Create the Project object 
            var project = {
                cName : cName,
                projectId : projectId
            };

            // Request the project based on the projectId selected
            $http.post("/api/getProject", project).then(function(project){
                
                project = project.data;
                $rootScope.project = project;

                $rootScope.projectMembers = project.members;
                                                
            });
            
            // Re-create the Project object 
            project = {
                cName : cName,
                projectId : projectId
            };
            
            // Request the Tasks based on the projectId selected
            $http.post("/api/getTasks", project).then(function(tasks){
                
                tasks = tasks.data;
                
                // Store the task's data within scope
                $rootScope.tasks = tasks;
                
                // Set false as the deafult value for if there is a completed task
                $rootScope.completedTask = false;
                $rootScope.activeTask = false;

                // For each task count all that are completed. If there are completed stop and scope.completed is true
                for (i = 0; i <= tasks.length - 1; i++) {

                    if (tasks[i].completed === true && tasks[i].active === 1) {

                        // A completed task has been found
                        $rootScope.completedTask = true;

                    }else if (tasks[i].completed === false && tasks[i].active === 1) {

                        // An active task has been found
                        $rootScope.activeTask = true;
                    }

                }
                            
                
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
            $scope.task.projectName = $scope.project.name;
            
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
    
    // This Function is activated on a form submission in update task
    $scope.updateTask = function() {

        // Check if the form was succesfully submitted
        if ($scope.task) {
                        
            // Send a request to the server to update a Task
            $http.post("/api/updatetask", $scope.task).then(function(task){
    
                if (task.data){
                    
                    // Create the Project object 
                    var project = {
                        cName : $scope.user.cName,
                        projectId : $scope.project._id
                    };

                    // Request the Tasks based on the projectId selected
                    $http.post("/api/getTasks", project).then(function(tasks){

                        tasks = tasks.data;
                        $rootScope.tasks = tasks;

                        // Set false as the deafult value for if there is a completed task
                        $rootScope.completedTask = false;
                        $rootScope.activeTask = false;

                        // For each task count all that are completed. If there are completed stop and scope.completed is true
                        for (i = 0; i <= tasks.length - 1; i++) {

                            if (tasks[i].completed === true && tasks[i].active === 1) {

                                // A completed task has been found
                                $rootScope.completedTask = true;

                            }else if (tasks[i].completed === false && tasks[i].active === 1) {

                                // An active task has been found
                                $rootScope.activeTask = true;
                            }

                        }

                    });
                    
                    $scope.task = null;
                    $location.path("/project/"+$scope.project._id);
                    
                }else{
                
                    console.log("Something went wrong");
                    
                }
                
            });
        }
    }
    
    // This Function is activated on a form submission in update task
    $scope.deleteTask = function(taskId) {

       if(!taskId){
           
           return false;
           
       }
        
        var task = {
            taskId : taskId
        }
        
        // Send a request to the server to Delete a selected Task based on _id
        $http.post("/api/deleteTask", task).then(function(res){

            if (res.data){
                
                // Create the Project object 
                var project = {
                    cName : $scope.user.cName,
                    projectId : $scope.project._id
                };
                
                // Request the Tasks based on the projectId selected
                $http.post("/api/getTasks", project).then(function(tasks){

                    tasks = tasks.data;
                    $rootScope.tasks = tasks;
                    
                    // Set false as the deafult value for if there is a completed task
                    $rootScope.completedTask = false;
                    $rootScope.activeTask = false;

                    // For each task count all that are completed. If there are completed stop and scope.completed is true
                    for (i = 0; i <= tasks.length - 1; i++) {

                        if (tasks[i].completed === true && tasks[i].active === 1) {

                            // A completed task has been found
                            $rootScope.completedTask = true;

                        }else if (tasks[i].completed === false && tasks[i].active === 1) {

                            // An active task has been found
                            $rootScope.activeTask = true;
                        }

                    }

                });
                
                $location.path("/project/"+$scope.project._id);

            }else{

                console.log("Something went wrong");

            }

        });
        
    }
    
    // This Function is activated on a form submission in update task
    $scope.completeTask = function(taskId) {

       if(!taskId){
           
           return false;
           
       }
        
        var task = {
            taskId : taskId
        }
        
        // Send a request to the server to Delete a selected Task based on _id
        $http.post("/api/completeTask", task).then(function(res){

            if (res.data){
                
                // Create the Project object 
                var project = {
                    cName : $scope.user.cName,
                    projectId : $scope.project._id
                };
                
                // Request the Tasks based on the projectId selected
                $http.post("/api/getTasks", project).then(function(tasks){

                    tasks = tasks.data;
                    $rootScope.tasks = tasks;
                    
                    // Set false as the deafult value for if there is a completed task
                    $rootScope.completedTask = false;
                    $rootScope.activeTask = false;

                    // For each task count all that are completed. If there are completed stop and scope.completed is true
                    for (i = 0; i <= tasks.length - 1; i++) {

                        if (tasks[i].completed === true && tasks[i].active === 1) {

                            // A completed task has been found
                            $rootScope.completedTask = true;

                        }else if (tasks[i].completed === false && tasks[i].active === 1) {

                            // An active task has been found
                            $rootScope.activeTask = true;
                        }

                    }

                });
                
                $location.path("/project/"+$scope.project._id);

            }else{

                console.log("Something went wrong");

            }

        });
        
    }
    
    // This Function is activated on a form submission in update task
    $scope.activateTask = function(taskId) {

       if(!taskId){
           
           return false;
           
       }
        
        var task = {
            taskId : taskId
        }
        
        // Send a request to the server to Delete a selected Task based on _id
        $http.post("/api/activateTask", task).then(function(res){

            if (res.data){
                
                // Create the Project object 
                var project = {
                    cName : $scope.user.cName,
                    projectId : $scope.project._id
                };
                
                // Request the Tasks based on the projectId selected
                $http.post("/api/getTasks", project).then(function(tasks){

                    tasks = tasks.data;
                    $rootScope.tasks = tasks;
                    
                    // Set false as the deafult value for if there is a completed task
                    $rootScope.completedTask = false;
                    $rootScope.activeTask = false;

                    // For each task count all that are completed. If there are completed stop and scope.completed is true
                    for (i = 0; i <= tasks.length - 1; i++) {

                        if (tasks[i].completed === true && tasks[i].active === 1) {

                            // A completed task has been found
                            $rootScope.completedTask = true;

                        }else if (tasks[i].completed === false && tasks[i].active === 1) {

                            // An active task has been found
                            $rootScope.activeTask = true;
                        }

                    }

                });
                
                $location.path("/project/"+$scope.project._id);

            }else{

                console.log("Something went wrong");

            }

        });
        
    }
}]);