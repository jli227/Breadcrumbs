angular.module('BreadcrumbsApp', ['ui.router'])
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('welcome', {
                url: '/welcome',
                templateUrl: 'views/welcome.html',
                controller: 'WelcomeController'
            })
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
        $urlRouterProvider.otherwise('/welcome');
    })
    .controller('WelcomeController', function($scope) {        
        
    })
    .controller('LoginController', function ($scope) {
        $scope.login = function () {
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
            //ena's clientID
            var clientID = 'e2fad0935d07402c9c5a68287915d997';
            //ena's redirectURL
            var redirectUrl = 'http://localhost:8000/insta-oauth.html';

            var url = 'https://instagram.com/oauth/authorize/?client_id=' + 
                        clientID + '&redirect_uri=' + 
                        redirectUrl + '&response_type=token';
            window.location.href = url;
        }
    })
    .controller('MainController', function ($scope) {
        $scope.accessToken = window.localStorage.getItem('accessToken');
        console.log($scope.accessToken);
    });