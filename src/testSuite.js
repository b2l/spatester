var Asserter = require('./asserter');
var Scenario = require('./scenario');
var MicroEE = require('microee');

var TestSuite = function TestSuite(name, params) {
    this.name = name;
    params = params || {};
    this.setUp = params.setUp || function(){};
    this.tearDown = params.tearDown || function(){};
    this.timeout = params.defaultTimeout || 2000;
    this.verbose = params.verbose || false;
    this.tests = [];

    this.scenario = new Scenario(name, {
        timeout: this.timeout,
        verbose: this.verbose
    });

    this.asserter = new Asserter(this.scenario);
};

TestSuite.prototype.bindEvent = function() {
    this.scenario.on('tests-start', this.onTestsStart.bind(this));
    this.scenario.on('tests-end', this.onTestsEnd.bind(this));
    this.scenario.on('test-success', this.onTestSuccess.bind(this));
    this.scenario.on('test-error', this.onTestFail.bind(this));
    this.scenario.on('error', this.onProcessError.bind(this));
};

TestSuite.prototype.addTest = function(name, test)  {
    this.scenario.registerTestName(name);

    this.tests.push(test);


    this.scenario.exec(this.setUp);
    test.call(this, this.scenario, this.asserter);
    this.scenario.exec(this.tearDown);
};

TestSuite.prototype.run = function()  {
    this.bindEvent();
    this.scenario.run();
};

TestSuite.prototype.onTestsStart = function() {};
TestSuite.prototype.onTestsEnd = function() {};
TestSuite.prototype.onTestSuccess = function() {};
TestSuite.prototype.onTestFail = function() {};
TestSuite.prototype.onProcessError = function() {};

MicroEE.mixin(TestSuite);

module.exports = {
    TestSuite : TestSuite
};
