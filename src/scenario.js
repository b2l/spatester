var actions = require('./actions');
var MicroEE = require('microee');

function Scenario(label, params) {
    params = params || {};

    this.label = label;
    this._actions = [];
    this.timeout = params.timeout;
    this.verbose = params.verbose;

    this.results = {
        failed: 0,
        passed: 0,
        total: 0,
        tests: []
    };
}

Scenario.prototype = {
    click: function (selector, waitForSelector) {
        var callerLine = this._getCallerLine(new Error());
        this._actions.push(new actions.ClickAction(selector, waitForSelector, callerLine));
        return this;
    },
    keyboard: function (selector, action, chromeCode, ffCode) {
        var callerLine = this._getCallerLine(new Error());
        this._actions.push(new actions.KeyboardAction(selector, action, chromeCode, ffCode, callerLine));
        return this;
    },
    fill: function (selector, value, waitForSelector) {
        var callerLine = this._getCallerLine(new Error());
        this._actions.push(new actions.FillAction(selector, value, waitForSelector, callerLine));
        return this.wait(selector + "[value='" + value + "']");
    },
    select: function (listSelector, value, waitForSelector) {
        var callerLine = this._getCallerLine(new Error());
        this._actions.push(new actions.SelectAction(listSelector, value, waitForSelector, callerLine));
        return this;
    },
    wait: function (selector) {
        var callerLine = this._getCallerLine(new Error());
        this._actions.push(new actions.WaitAction(selector, callerLine));
        return this;
    },
    exec: function (fn) {
        this._actions.push(new actions.ExecAction(fn));
        return this;
    },
    debug: function() {
        this._actions.push(new actions.DebugAction());
        return this;
    },
    registerTestName: function(name) {
        var scenario = this;
        this._actions.push(new actions.ExecAction(function() {
            scenario.currentTest = name;
        }));
    },
    run: function () {
        this.startTime = new Date().getTime();
        this.emit("tests-start");
        this._process(0);
    },

    pushAssert: function (assertFunction, description) {
        var callerLine = this._getCallerLine(new Error());
        this._actions.push(new actions.TestAction({ test: assertFunction, description: description}, callerLine));
        return this;
    },

    _getCallerLine: function (error) {
        if (error.stack) {
            return error.stack.split("\n")[1];
        }
        return "\nDon't test on that shit !";
    },

    _process: function (index) {
        var action = this._actions[index];
        var scenario = this;

        if (!action) {
            this.emit('tests-end')
        }
        else if (action.waitFor) {
            this._processWaitFor(scenario, index, action);
        }
        else if (action instanceof actions.TestAction) {
            this._processTestAction(scenario, index, action);
        }
        else {
            this._processAction(scenario, index, action);
        }
    },

    _processAction: function (scenario, index, action) {
        try {
            if (this.verbose) {
                console.log(action.toString());
            }
            action.exec();
            scenario._process(index + 1);
        } catch (e) {
            if (this.verbose) {
                console.log("ERROR action " + action);
            }
            this._onError(scenario, index, action, e);
        }
    },

    _processTestAction: function (scenario, index, action) {
        try {
            action.exec();
            this.emit('test-success', action);
            scenario._process(index + 1);
        } catch (e) {
            this.emit('test-error', action, e);
        }
    },

    _processWaitFor: function (scenario, index, action) {
        var start = new Date().getTime();

        if (this.verbose) {
            console.log(action.toString());
        }
        setTimeout(function timeout() {
            try {
                if (this.verbose) {
                    console.log(action.toString());
                }
                action.waitFor();
                scenario._process(index + 1);
            } catch (e) {
                if (new Date().getTime() - start > this.timeout) {
                    if (this.verbose) {
                        console.log("Wait for timeout")
                    }
                    this._onError(scenario, index, action, e);
                } else {
                    setTimeout(timeout, 100);
                }
            }
        }.bind(this), 200);
    },

    _onSuccess: function (scenario, index, action) {
    },

    _onError: function (scenario, index, action, e) {
        this.emit('error', action, e);
    }
};

MicroEE.mixin(Scenario);

module.exports = Scenario;