angular.module('BreadcrumbsApp', ['ui.router'])
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'views/login.html',
                controller: 'LoginController'
            })
            .state('main', {
                url: '/main',
                templateUrl: 'views/main.html',
                controller: 'MainController'
            });
        $urlRouterProvider.otherwise('/login');
    })
    .controller('LoginController', function($scope) {
        $scope.login = function() {
        /*
            This part requires some customization (just for this stage of development)
            the clientID and redirectURL are mine (ena's), yours will probs be different

            1. go to https://www.instagram.com/developer/
            2. sign in
            3. click "Manage Clients" in the navbar on the upper right
            4. register a client 
            5. fill out things in 'Details' tab
            6. go to the 'Security' tab, uncheck 'Disable implicit OAuth' **important**
            7. register
            8. update the variables below, 
                maybe we should just comment out each others while we are developing?
         */

            //TODO create paintberi instagram account to make universal clientID

            //ena's clientID
            //var clientID = 'e2fad0935d07402c9c5a68287915d997';
            //ena's redirectURL
            //var redirectUrl = 'http://localhost:8000/insta-oauth.html';

            //vince's client stuff
            var clientID = 'ab1c06711b0046b995f3b42fd2ee5b33';
            var redirectUrl = 'http://localhost:8000/paintberi/breadcrumbs/insta-oauth.html';

            var url = 'https://instagram.com/oauth/authorize/?client_id=' + 
                        clientID + '&redirect_uri=' + 
                        redirectUrl + '&response_type=token';

            window.location.href = url;
        }
    })
    .controller('MainController', function($scope) {
        // retrieve access token from local storage
        var accessToken = window.localStorage.getItem('accessToken');

        // base URL for self
        var instaBase = 'https://api.instagram.com/v1/users/self/?access_token=';

        // bypass security
        var urlEnd = '&callback=?';

        // get current user data from Instagram
        $.getJSON(instaBase + accessToken + urlEnd,
            function(response) {
                console.log(response.data);
                $scope.currentUser = {
                    name: response.data.username,
                    id: response.data.id,
                    profPic: response.data.profile_picture
                };

                if (!$scope.$$phase) {
                    $scope.$apply();
                }
        });
    });