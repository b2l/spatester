var Asserter = require('./asserter');
var Scenario = require('./scenario');

var TestSuite = function TestSuite(name, params) {
    this.name = name;
    this.setUp = params.setUp || function(){};
    this.tearDown = params.tearDown || function(){};

    this.tests = [];
};

TestSuite.prototype.setSocket = function(socket) {
    this.scenario = new Scenario(name,socket);
    this.asserter = new Asserter(this.scenario);
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

module.exports = {
    TestSuite : TestSuite
};
