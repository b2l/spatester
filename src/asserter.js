
function Asserter (scenario) {
    this.scenario = scenario;
}

Asserter.prototype.assertTrue =  function (assertFunction, description) {

    this.scenario.pushAssert(
        function() {
            if (!assertFunction()) {
                throw new Error("Assertion failed : " + description);
            }

        },
        description
    );

};


Asserter.prototype.assertFalse =  function (assertFunction, description) {

    this.scenario.pushAssert(
        function() {
            if (assertFunction()) {
                throw new Error("Assertion failed : " + description);
            }
        },
        description
    );

};

Asserter.prototype.assertNodeContains = function(nodeSelector, expectedContent, description) {
    var assertion = function() {
        var content = document.querySelector(nodeSelector).innerText || document.querySelector(nodeSelector).textcontent ;

        var regExp = new RegExp(expectedContent);
        if (regExp.test(content)) {
            throw new Error("expecting " + expectedContent + " but is " + content);
        }
    };

    this.scenario.pushAssert( {
        test: assertion,
        description: description
    });
};

Asserter.prototype.count = function (selector) {
    return function() {
        return document.querySelectorAll(selector).length;
    };
};

Asserter.prototype.value = function (selector) {
    return function() {
        return document.querySelector(selector).value;
    };
};

module.exports = Asserter;