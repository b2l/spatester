var Asserter = require('./asserter');
var Scenario = require('./scenario');
var MicroEE = require('microee');

var test = [];
var results = {
    failed: 0,
    passed: 0,
    total: 0,
    tests: []
};

var TestSuite = function TestSuite(name, params) {
    this.name = name;
    params = params || {};
    this.setUp = params.setUp || function(){};
    this.tearDown = params.tearDown || function(){};
    this.timeout = params.defaultTimeout || 2000;
    this.verbose = params.verbose || false;
    this.socket = null

    this.tests = [];
};

TestSuite.prototype.setSocket = function(socket) {
    this.socket = socket;

    this.scenario = new Scenario(name, {
        timeout: this.timeout,
        verbose: this.verbose
    });
    this.asserter = new Asserter(this.scenario);

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
    this.scenario.run();
};

TestSuite.prototype.onTestFail = function onTestFail(test, e) {
//    this.emit('test.fail');
    this.socket.emit('test-result', testemTestResult(test, e, false));
};
TestSuite.prototype.onTestSuccess = function onTestSuccess(test, e) {
//    this.emit('test.success');
    this.socket.emit('test-result', testemTestResult(test, e, true));
};

TestSuite.prototype.onProcessError = function onProcessError(test, e) {
    this.socket.emit('test-result', testemTestResult(test, e, false));
    this.socket.emit('all-test-results', results);
};

TestSuite.prototype.onTestsStart = function onTestsStart() {
    this.socket.emit('tests-start');
};

TestSuite.prototype.onTestsEnd = function onTestsEnd() {
    this.socket.emit('all-test-results', results);
};

MicroEE.mixin(TestSuite);

module.exports = {
    TestSuite : TestSuite
};

function testemTestResult(test, e, testStatus) {
    results.total++;
    var result = {
        passed: 0,
        failed: 0,
        total: 1,
        id: 0,
        name: test.name || "",
        items: []
    };

    if (testStatus) {
        result.passed++;
        results.passed++;
    } else {
        result.failed++;
        results.failed++;
        result.items.push({
            passed: false,
            message: test.name || "",
            stack: e.stack ? e.stack : undefined
        });
    }

    results.tests.push(result);

    return result;
}
