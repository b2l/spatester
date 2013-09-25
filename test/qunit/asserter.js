var TestSuite = require('../../src/testSuite').TestSuite;

var proto;
// Save the TestSuite prototype before each Test
QUnit.testStart(function() {
    proto = TestSuite.prototype;
});
// Restore the TestSuite prototype after each Test
QUnit.testDone(function() {
    TestSuite.prototype = proto;
});

asyncTest("Fail test assert.**.exist() should give us a human readable message", function() {
    // Then
    TestSuite.prototype.onTestSuccess = function() {
        ok(false, "Test should not pass")
        start();
    };
    TestSuite.prototype.onTestFail = function(action, e) {
        var expectedMessage = "Expect #my-div to have attribute title";
        equal(e.message, expectedMessage, "failed assertion give us a great message");
        start();
    };

    // Given
    var demoTestSuite = new TestSuite("demo test suite", {
        setUp: function() {
        },
        tearDown: function() {
        },
        timeout: 100
    });

    demoTestSuite.addTest("test wait for existing element", function(scenario, asserter) {
        scenario.exec(function() {
            var div = document.createElement('div');
            div.setAttribute('id', 'my-div');
            document.body.appendChild(div);
        });

        asserter.expect("#my-div").to.have.attr('title');

        scenario.exec(function() {
            var div = document.getElementById('my-div');
            document.body.removeChild(div);
        });
    });

    // When
    demoTestSuite.run();
});


asyncTest("Fail test assert.**.not.exist() should give us a human readable message", function() {
    // Then
    TestSuite.prototype.onTestSuccess = function() {
        ok(false, "Test should not pass")
        start();
    };
    TestSuite.prototype.onTestFail = function(action, e) {
        var expectedMessage = "Expect #my-div not to have attribute id";
        equal(e.message, expectedMessage, "failed assertion give us a great message");
        start();
    };

    // Given
    var demoTestSuite = new TestSuite("demo test suite", {
        setUp: function() {
        },
        tearDown: function() {
        },
        timeout: 100
    });

    demoTestSuite.addTest("test wait for existing element", function(scenario, asserter) {
        scenario.exec(function() {
            var div = document.createElement('div');
            div.setAttribute('id', 'my-div');
            document.body.appendChild(div);
        });

        asserter.expect("#my-div").not.to.have.attr('id');
    });

    // When
    demoTestSuite.run();
});
