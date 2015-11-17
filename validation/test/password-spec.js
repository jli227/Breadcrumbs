describe('FormControl', function () {
	beforeEach(module('ValidationApp'));
	
	var $controller;

	beforeEach(inject(function(_$controller_){
    	$controller = _$controller_;
  	}));	

	describe('$scope.checkPasswordStrength', function () {
		function checkPassword(scope, password, strength) {
			scope.user.password = password;
      		scope.checkPasswordStrength();
      		expect(scope.strength).toEqual(strength);
		}

		it('must accurately determine password strength', function () {
			var $scope = {};
			$controller('FormController', { $scope: $scope });

			checkPassword($scope, '', 0);
			checkPassword($scope, 'hello', 20);
			checkPassword($scope, 'hello5', 40);
			checkPassword($scope, 'hello5!', 60);
			checkPassword($scope, 'Hello5!', 80);
			checkPassword($scope, 'helloeightchars', 40);
			checkPassword($scope, 'Helloeightchars5!', 100);
		});

	});
});