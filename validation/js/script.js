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

        $scope.reset = function () {
            $scope.user = {};
            $scope.strength = 0;
        }

        $scope.signup = function() {
            $scope.loginSuccess = true;
        };

        $scope.checkPasswordStrength = function () {
            //password strength algorithm
            //0 = no password entered
            //1 = all lowercase
            //+1 if uppercase exists
            //+1 if number exists
            //+1 if symbol exists -> which symbols do we want to consider?
            //+1 for longer length -> what length is considered "long"?
            //total = 5

            // sets amount of characters for safe password
            var safeLength = 8;

            // checks if password has been erased
            var erasedPassword = $scope.user.password != undefined;

            // checks the password against these boolean statements
            var passwordChecks = [
                erasedPassword && /[a-z]/.test($scope.user.password), // checks for lowercase letters
                /[A-Z]/.test($scope.user.password), // checks for uppercase letters
                /\d/.test($scope.user.password), // checks for numbers
                /\W/.test($scope.user.password), // checks for symbols
                erasedPassword && $scope.user.password.length >= safeLength];
            
            // total score given to the user password
            var result = passwordChecks.reduce(function(count, item) {
                if (item) {
                    return count += 1;
                }
                return count;
            });

            //convert to percent
            $scope.strength = (result / passwordChecks.length) * 100;
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