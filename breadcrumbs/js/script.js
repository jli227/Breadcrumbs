angular.module('BreadcrumbsApp', ['ui.router'])
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('welcome', {
                url: '/welcome',
                templateUrl: 'views/welcome.html',
                controller: 'WelcomeController'
            });
        $urlRouterProvider.otherwise('/welcome');
    })
    .controller('WelcomeController', function($scope) {
    });