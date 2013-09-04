
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
//
//Asserter.prototype.assertEqual = function(actual, expected, description) {
//    var assertion = function() {
//
//        var v1 = actual;
//        var v2 = expected;
//
//        if ( typeof actual === "function" ) {
//            v1 = actual();
//        }
//        if ( typeof expected === "function" ) {
//            v2 = expected();
//        }
//
//        if (v1 !== v2) {
//            throw new Error("expecting '" + v2 + "' but is '" + v1 + "'");
//        }
//    };
//
//    this.scenario.pushAssert(assertion, description);
//};
//
//Asserter.prototype.assertEqualAsync = function(actual, expected, description) {
//
//    var waitFor = function() {
//        var v1 = null;
//        var v2 = null;
//
//        if ( typeof actual === "function" ) {
//            v1 = actual();
//        } else {
//            v1 = actual;
//        }
//        if ( typeof expected === "function" ) {
//            v2 = expected();
//        } else {
//            v2 = expected;
//        }
//
//        if (v1 !== v2) {
//            throw new Error("expecting " + v2 + " but is " + v1);
//        }
//    };
//
//    this.scenario.pushAssert( {
//        waitFor: waitFor,
//        description: description
//    });
//};

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