// Dashboard Controller
app.controller("dashboardController", [ "$scope", "$rootScope", "$location", "$http",
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
    
    // Set the title of the page
    $rootScope.title = "Tracing Ink | Dashboard";
    $rootScope.pageTitle = "Dashboard";
    $rootScope.pageTitleUrl = "#/dashboard";
    
    // Check session authData
    var authData = $rootScope.authData;
    
    if (authData === true){
        
        $http.get("/api/getUser").then(function(user){
            
            // Store the user's data within scope
            $rootScope.user = user.data;
            
            // Get the user's type
            var userType= $rootScope.user.type;
            
            // Check if user is master admin
            if (userType === "1"){

                // User is Master Admin
                $rootScope.admin = true;  

            } else if(userType === 2){
                    
                // User is master admin
                $rootScope.manager = true;

            }else if(userType === 3){
                    
                // User is master admin
                $rootScope.member = true;

            }

            var thisTask = {}
            var myTask = [];
            
            for (var i = 0; i <= $rootScope.user.myTasks.length - 1; i++){
                
                // Get the tasks associated to this user.
                thisTask = {
                    cName : $rootScope.user.cName,   
                    taskId : $rootScope.user.myTasks[i]

                };
                
                // Request the Tasks based on the projectId selected
                myTask = $http.post("/api/getMyTask", thisTask).then(function(task){

                    task = task.data;

                    //console.log("One Task: ",task);

                    return task;
                    
                    
                    
                });
                
                console.log(myTask.$$state.value);
                
            } 
        
        });
         
    }else{
        
        // User is logged OFF
        $location.path('/');
        
    }    
}]);
