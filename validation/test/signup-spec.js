describe('paintberi sign-up app', function() {
    var emailInp = element(by.model('user.email'));
    var dobInp = element(by.model('user.dob'));
    var lastNameInp = element(by.model('user.lastName'));

    function addEmail(text) {
        emailInp.sendKeys(text);
    }

    function validateDob(elem) {
    	//page rendered, no alert
    	expect(elem.isPresent()).toEqual(false);

    	//valid date, no alert
    	dobInp.sendKeys('11/15/1994');
    	expect(elem.isPresent()).toEqual(false);

    	//clear input, alert
    	dobInp.clear();
    	expect(elem.isPresent()).toEqual(true);

    	//spaces input, alert
    	dobInp.sendKeys('    ');
    	expect(elem.isPresent()).toEqual(true);
    }    

    beforeEach(function() {
       browser.get('http://localhost:8000');
    });

    it('must have display warning if email is not valid', function() {
        var emailAlertValid = element(by.id('emailValidAlert'));
        var emailAlertReqd = element(by.id('emailReqdAlert'));

        expect(emailAlertReqd.isPresent()).toEqual(false);

        addEmail('test');
        expect(emailAlertValid.getText()).toEqual('Not valid email');

        emailInp.clear();
        expect(emailAlertReqd.getText()).toEqual('Email is required');

        addEmail('test@test.com');
        expect(emailAlertValid.isPresent()).toEqual(false);
        expect(emailAlertReqd.isPresent()).toEqual(false);
    });

    //test for required birth date
    it('must have display warning if birth date is not present', function () {
    	var dobReq = element(by.id('dobReqAlert'));

    	validateDob(dobReq);

		//type an invalid date -> no error
    	dobInp.sendKeys('11/15/05');
    	expect(dobReq.isPresent()).toEqual(false);
    });

    //test for 13 years or older 
    it('must have display warning if user is not 13 or older', function () {
    	var dobValid = element(by.id('dobValidAlert'));

    	validateDob(dobValid);

		//type an invalid date -> no error
    	dobInp.sendKeys('11/15/05');
    	expect(dobValid.isPresent()).toEqual(true);
    });

    //test for required last name
    it('must display warning if last name is not present', function () {
    	var lastNameReq = element(by.id('lastNameAlert'));

    	expect(lastNameReq.isPresent()).toEqual(false);

    	lastNameInp.sendKeys('Lastname');
		expect(lastNameReq.isPresent()).toEqual(false);    	

		lastNameInp.sendKeys('Lastname');
		lastNameInp.clear();
		expect(lastNameReq.isPresent()).toEqual(true);    			

		lastNameInp.sendKeys('    ');
		expect(lastNameReq.isPresent()).toEqual(true);    	
    });
});