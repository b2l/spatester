var TestSuite = require('./testSuite').TestSuite;


window.Testem.useCustomAdapter(function (socket) {
    init(socket);
});

function init(testemSocket) {

    var test = [];
    var id = 0;
    var results = {
        failed: 0,
        passed: 0,
        total: 0,
        tests: []
    };

    TestSuite.prototype.onTestFail = function onTestFail(test, e) {
        var testResult = testemTestResult.call(this, test, e, false);
        testemSocket.emit('test-result', testResult);
        testemSocket.emit('all-test-results', results);
    };
    TestSuite.prototype.onTestSuccess = function onTestSuccess(test, e) {
        testemSocket.emit('test-result', testemTestResult.call(this, test, e, true));
    };

    TestSuite.prototype.onTestExecError = function (action, e) {
        var testResult = testemTestResult.call(this, action, e, false);
        testemSocket.emit('test-result', testResult);
        testemSocket.emit('error', [this.scenario.currentTest, e.message, "Stack ", action.callerLine].join('\n'));
        testemSocket.emit('all-test-results', results);

    };

    TestSuite.prototype.onTestsStart = function onTestsStart() {
        testemSocket.emit('tests-start');
    };

    TestSuite.prototype.onTestsEnd = function onTestsEnd() {
        testemSocket.emit('all-test-results', results);
    };

    function testemTestResult(test, e, testStatus) {
        var result = {
            passed: 0,
            failed: 0,
            total: 1,
            id: id,
            name: this.name + " -> " + this.scenario.currentTest + " -> " + test.name || "",
            items: []
        };

        results.total++;

        if (testStatus) {
            result.passed++;
            results.passed++;
        } else {
            results.failed++;
            result.failed++;
            result.items.push({
                passed: false,
                message: e.message,
                stack: test.callerLine ? test.callerLine : undefined
            });
        }

        results.tests.push(result);

        id++;

        return result;
    }

}

module.exports = TestSuite;