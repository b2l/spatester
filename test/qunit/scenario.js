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

        asserter.expect("#my-div").to.have.text('');
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
        asserter.expect("#my-div2").to.have.text('');
    });

    // When
    demoTestSuite.run();
});

asyncTest("Scenario.exec with error should emit an error message ", function() {

    // Then
    TestSuite.prototype.onTestExecError = function() {
        ok(true, "Error event has been caught" );
        start();
    };

    TestSuite.prototype.onTestSuccess = function() {
        ok(false, "Unexpected test-sucess event has been caught" );
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
        scenario.exec(function() {
            document.querySelector('#unknown-element').setAttribute('title', 'toto');
        });

        asserter.expect('body').to.have.attr('title');
    });

    // When
    demoTestSuite.run();
});


asyncTest("Scenario.* with error (unexisting node) should emit an error message", function() {

    // Then
    TestSuite.prototype.onTestExecError = function() {
        ok(true, "Error event has been caught" );
        start();
    };

    TestSuite.prototype.onTestSuccess = function() {
        ok(false, "Unexpected test-sucess event has been caught. En error should have been throw before !" );
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
        // Click on a node which is not in the dom
        scenario.click('#another-div');

        // An error should have interrupt the test before we arrive here
        asserter.expect('body').to.have.attr('title');
    });

    // When
    demoTestSuite.run();

});