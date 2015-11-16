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

        $scope.user = {};

    })
    .directive('checkBirthdate', function () {
        return {
            require: 'ngModel',
            link: function (scope, elem, attrs, controller) {
                controller.$validators.checkBirthdate = function (modelValue) {
                    var userDate = Date.parse(modelValue);
                    if (userDate != NaN) {
                        var thirteen = 13 * 365 * 24 * 3600 * 1000;                        
                        return (userDate <= Date.now() - thirteen);
                    }  
                    return false;                  
                }
            }
        }
    });
