var TestSuite = require('../../src/testSuite').TestSuite;

asyncTest( "wait on existing element", function() {

    TestSuite.prototype.onTestSuccess = function() {
        ok(true, "test-success event has been fired" );    
        start();
    };
    TestSuite.prototype.onProcessError = function() {
        ok(false, "Unexpected test-error event has been fired" );    
        start();
    };

    var demoTestSuite = new TestSuite("demo test suite", {
        setUp: function() {
        },
        tearDown: function() {
        },
        defaultTimeout: 100
    });

    demoTestSuite.addTest("test wait for existing element", function(scenario, asserter) {
        scenario.exec(function() {
            var myDiv = document.createElement("div");
            myDiv.setAttribute("id", "my-div");
            document.body.appendChild(myDiv);
        });
        scenario.wait("#my-div");
        asserter.assertThat("#my-div").to.have.text('');
    });

    demoTestSuite.run();
});


asyncTest( "wait on unexisting element", function() {

    TestSuite.prototype.onTestSuccess = function() {
        ok(false, "Unexpected test-success event has been fired" );    
        start();
    };
    TestSuite.prototype.onProcessError = function() {
        ok(true, "error event has been fired" );
        start();
    };

    var demoTestSuite = new TestSuite("demo test suite", {
        setUp: function() {
        },
        tearDown: function() {
        },
        defaultTimeout: 100
    });

    demoTestSuite.addTest("test wait for unexisting element", function(scenario, asserter) {
        scenario.wait("#my-div2");
        asserter.assertThat("#my-div2").to.have.text('');
    });

    demoTestSuite.run();
});