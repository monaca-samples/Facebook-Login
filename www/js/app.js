ons.bootstrap()
.service('StorageService', function() {    
    var setLoginUser = function(user_info) {
        window.localStorage.login_user = JSON.stringify(user_info);
    };

    var getLoginUser = function(){
        return JSON.parse(window.localStorage.login_user || '{}');
    };

    return {
        getLoginUser: getLoginUser,
        setLoginUser: setLoginUser
    };
})

.controller('HomeCtrl', function($scope, StorageService, $http, $q) {
    var CheckLoginStatus = function(){
        window.facebookConnectPlugin.getLoginStatus(
            function(data){
                if(data.authResponse){
                    console.log('Login info is found!');
                    myNavigator.pushPage('profile.html');
                }else{
                    console.log('No login info is found!');
                }
            },
            function(e){
                LoginError(e);
            }
        );
    }
    
    ons.ready(function() {
        CheckLoginStatus();
    });
    
    var GetProfileInfo = function (authResponse) {
        var info = $q.defer();
    
        facebookConnectPlugin.api('/me?fields=email,name&access_token=' + authResponse.accessToken, null,
            function (response) {
                info.resolve(response);
            },
            function (response) {
                info.reject(response);
            }
        );
        return info.promise;
    };
    
    var LoginSuccess = function(response){
        var authResponse = response.authResponse;
        
        GetProfileInfo(authResponse).then(function(user) {
            StorageService.setLoginUser({
                name: user.name,
                id: user.id,
                email: user.email,
                profile_url: "https://graph.facebook.com/" + authResponse.userID + "/picture?type=large"
            });
            myNavigator.pushPage('profile.html');
        }, function(error){
            console.log('Error retrieving user profile' + JSON.stringify(error));
        });
        
    };
    
    var LoginError = function(error){
        console.log('Login Error: ' + JSON.stringify(error));
        // When "User cancelled dialog" error appears
        if (error.errorCode === "4201"){
            CheckLoginStatus();
        }
    };
    
    $scope.Login = function(){
        facebookConnectPlugin.login(['email', 'public_profile'], LoginSuccess, LoginError);
    }
    
    
})
.controller('ProfileCtrl', function($scope, StorageService, $http, $q) {
    $scope.user = StorageService.getLoginUser();
    
    var LogoutFromFacebook = function(){
        facebookConnectPlugin.logout(
            function() {
                console.log('Successful logout!');
                myNavigator.resetToPage("home.html");
            },
            function(error) {
                console.log('Error logging out: ' + JSON.stringify(error));
            }
        );
    }
    
    $scope.Logout = function(){
        ons.notification.confirm({
            message: "Are you sure you want to log out?",
            title: 'Facebook Demo',
            buttonLabels: ["Yes", "No"],
            callback: function(idx) {
            switch (idx) {
                case 0:
                    LogoutFromFacebook();
                case 1:
                    break;
                break;
            }
          }
        });
    }
});


