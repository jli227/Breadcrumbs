describe('paintberi sign-up app', function() {
    var emailInp = element(by.model('user.email'));

    function addEmail(text) {
        emailInp.sendKeys(text);
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
});