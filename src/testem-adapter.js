var TestSuite = require('./testSuite').TestSuite;

Testem.useCustomAdapter(function (socket) {
    init(socket);
});

function init(testemSocket) {

    var test = [];
    var results = {
        failed: 0,
        passed: 0,
        total: 0,
        tests: []
    };

    TestSuite.prototype.onTestFail = function onTestFail(test, e) {
        testemSocket.emit('test-result', testemTestResult(test, e, false));
    };
    TestSuite.prototype.onTestSuccess = function onTestSuccess(test, e) {
        testemSocket.emit('test-result', testemTestResult(test, e, true));
    };

    TestSuite.prototype.onProcessError = function onProcessError(test, e) {
        testemSocket.emit('all-test-results', results);
    };

    TestSuite.prototype.onTestsStart = function onTestsStart() {
        testemSocket.emit('tests-start');
    };

    TestSuite.prototype.onTestsEnd = function onTestsEnd() {
        testemSocket.emit('all-test-results', results);
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

}