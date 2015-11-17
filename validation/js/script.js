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
        $scope.loginSuccess = false;

        $scope.signup = function() {
            $scope.loginSuccess = true;
            console.log('done');
        }
    })
    //checks birthday month making sure its a valid month number.
    .directive('checkBirthdate', function() {
        return {
            require: 'ngModel',
            link: function(scope, elem, attrs, controller) {
                controller.$validators.checkBirthdate = function(modelValue) {
                    var userDate = Date.parse(modelValue);
                    if (!isNaN(userDate)) {
                        var thirteen = 13 * 365 * 24 * 3600 * 1000;
                        return (userDate <= Date.now() - thirteen);
                    }
                    return false;
                }
            }
        }
    })
    .directive('isMatching', function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, elem, attrs, controller) {
                controller.$validators.isMatching = function(value) {
                    console.log(value);
                    console.log(scope.$eval(attrs.isMatching));
                    return value == scope.$eval(attrs.isMatching);
                }
            }
        }
    });