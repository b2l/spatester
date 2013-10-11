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

asyncTest("wait on existing element", function() {
    // Then
    TestSuite.prototype.onTestSuccess = function() {
        ok(true, "test-success event has been fired" );    
        start();
    };
    TestSuite.prototype.onTestExecError = function() {
        ok(false, "Unexpected test-error event has been fired" );    
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
            setTimeout(function() {
                var myDiv = document.createElement("div");
                myDiv.setAttribute("id", "my-div");
                document.body.appendChild(myDiv);
            }, 10);
        });
        scenario.wait("#my-div");

        asserter.expect("#my-div").to.exist();
    });

    // When
    demoTestSuite.run();
});


asyncTest("wait on unexisting element", function() {

    // Then
    TestSuite.prototype.onTestSuccess = function() {
        ok(false, "Unexpected test-success event has been fired" );    
        start();
    };
    TestSuite.prototype.onTestExecError = function() {
        ok(true, "error event has been fired" );
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

    demoTestSuite.addTest("test wait for unexisting element", function(scenario, asserter) {
        scenario.wait("#my-div2");
        asserter.expect("#my-div2").not.to.exist();
    });

    // When
    demoTestSuite.run();
});
