var actions = require('./actions');

function Scenario(label, socket) {
    this.label = label;
    this._actions = [];
    this.socket = socket;
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
    dblclick: function (selector, waitForSelector) {
        var callerLine = this._getCallerLine(new Error());
        this._actions.push(new actions.DoubleClickAction(selector, waitForSelector, callerLine));
        return this;
    },
    keyboard: function (selector, action, chromeCode, ffCode, shiftKeyArg) {
        var callerLine = this._getCallerLine(new Error());
        this._actions.push(new actions.KeyboardAction(selector, action, chromeCode, ffCode, shiftKeyArg, callerLine));
        return this;
    },
    keyboardNoChromeNoIE: function () { //FIXME les keyboards events ne fonctionnent pas bien sous IE et Chrome, il faudrait trouver un polyfill
        var event = document.createEvent("KeyboardEvent");
            return !event.initKeyboardEvent;
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
    registerTestName: function(name) {
        var scenario = this;
        this._actions.push(new actions.ExecAction(function() {
            scenario.currentTest = name;
        }));
    },
    run: function () {
        this.startTime = new Date().getTime();
        this.socket.emit("tests-start");
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
            this.socket.emit("all-test-results", this.results);
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
            action.exec();
            scenario._process(index + 1);
        } catch (e) {
            this._onError(scenario, index, action, e);
        }
    },

    _processTestAction: function (scenario, index, action) {
        try {
            action.exec();
            this._onSuccess(scenario, index, action);
            scenario._process(index + 1);
        } catch (e) {
            this._onError(scenario, index, action, e);
        }
    },

    _processWaitFor: function (scenario, index, action) {
        var start = new Date().getTime();
        var that = this;
        setTimeout(function timeout() {
            try {
                action.waitFor();
                if (action instanceof actions.TestAction) {
                    that._onSuccess(scenario, index, action);
                }
                scenario._process(index + 1);
            } catch (e) {
                if (new Date().getTime() - start > 2000) {
                    that._onError(scenario, index, action, e);
                } else {
                    setTimeout(timeout, 100);
                }
            }
        }, 200);
    },

    _onSuccess: function (scenario, index, action) {
        var result = {
            id: index,
            passed: 0,
            failed: 0,
            total: 0,
            name: action.name,
            items: []
        };
        result.passed++;
        this.results.passed++;
        result.name = action.name;
        this.socket.emit("test-result", result);
        this.results.tests.push(action);
        this.results.total++;
    },

    _onError: function (scenario, index, action, e) {
        var result = {
            id: index,
            passed: 0,
            failed: 0,
            total: 0,
            name: this.currentTest + " -> " + action.name,
            items: []
        };
        result.failed++;

        result.items.push({
            passed: false,
            message: e ? e.message + "\n at " + action.callerLine : undefined,
            stack: e && e.stack ? e.stack : undefined
        });
        this.socket.emit("test-result", result);

        this.results.failed++;
        this.results.tests.push(action);
        this.results.total++;

        this.socket.emit("all-test-results", this.results);
    }
};

module.exports = Scenario;
