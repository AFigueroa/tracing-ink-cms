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
            
            if(!$rootScope.user.myConversations){
                $rootScope.user.myConversations = [];
            }
            
            // Get the tasks associated to this user.
            myConversations = {
                
                myConversations : $rootScope.user.myConversations,   
                cName : $rootScope.user.cName

            };
            
            $http.post("/api/getMyConversations", myConversations).then(function(conversations){
                
                console.log("Conversations",conversations);
//                if (conversations.data){
//                    // Members found
//                    
//                    // Load the team members within the front-end scope
//                    $rootScope.conversations = conversations.data;
//
//                }else{
//                    // No members found
//                    
//                    // Set teamMembers as an empty array
//                    $rootScope.conversations = [];
//                    
//                };
                
            });
        
        });
        
    }else{
        
        // User is Logged OFF
        $location.path('/');
        
    }
    
    // This Function is activated on a form submission in Add task route
    $scope.addConversation = function() {

        // Check if the form was succesfully submitted
        if ($scope.conversation) {
            
            // Initiate a message object to turn the string submission of message into an object with the data from the user that submitted it
            var message = {};
            
            
            // If no recipients where selected initiate an empty array as the submission
            if(!$scope.conversation.recipients){

                $scope.conversation.recipients = [];
            
            }
            
            
            // Push the current user's id to the recipients object
            $scope.conversation.recipients.push($scope.user._id);
            
            // Configure the data of the message submitted
            message.body = $scope.conversation.message;
            message.userId = $scope.user._id;
            message.gravatarUrl = $scope.user.gravatarUrl;
            message.fname = $scope.user.fname;
            message.lname = $scope.user.lname;
            message.email = $scope.user.email;
            
            // Replace the old data of message with the new one
            $scope.conversation.message = message;

            // Send a request to the server to add a Task
            $http.post("/api/addConversation", $scope.conversation);
            
            $scope.conversation = null;
            $location.path("/conversations");
        }
    }
}]);