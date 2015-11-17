describe('FormControl', function () {
	beforeEach(module('ValidationApp'));
	
	var $controller;

	beforeEach(inject(function(_$controller_){
    	// The injector unwraps the underscores (_) from around the parameter names when matching
    	$controller = _$controller_;
  	}));	

	describe('$scope.checkPasswordStrength', function () {
		var $scope = {};
      	var controller = $controller('FormController', { $scope: $scope });

		function checkPassword($scope, password, strength) {
			$scope.user.password = password;
      		$scope.checkPasswordStrength();
      		expect($scope.strength).toEqual(strength);
		}

		it('must accurately determine password strength', function () {
			checkPassword('', 0);
			checkPassword('hello', 20);
			checkPassword('hello5', 40);
			checkPassword('hello5!', 60);
			checkPassword('Hello5!', 80);
			checkPassword('helloeightchars', 40);
			checkPassword('Helloeightchars5!', 100);
		});

	});
});