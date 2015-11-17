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

        $scope.checkPasswordStrength = function () {
            console.log($scope.user.password);
            //password strength algorithm
            //0 = no password entered
            //1 = all lowercase
            //+1 if uppercase exists
            //+1 if number exists
            //+1 if symbol exists -> which symbols do we want to consider?
            //+1 for longer length -> what length is considered "long"?
            //total = 5
            
            //set the resulting strength to this variable
            var result = 1;
            //convert to percent
            $scope.strength = (result / 5) * 100;
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