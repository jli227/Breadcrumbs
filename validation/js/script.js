angular.module('ValidationApp', ['ui.router'])
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('form', {
                url: '/form',
                templateUrl: 'views/form.html',
                controller: 'FormController'
            });

        $urlRouterProvider.otherwise('/form');
    })
    .controller('FormController', function($scope) {

    });