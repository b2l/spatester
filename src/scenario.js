var actions = require('./actions');
var MicroEE = require('microee');

function Scenario(label, params) {
    params = params || {};

    this.label = label;
    this._actions = [];
    this.timeout = params.timeout;
    this.verbose = params.verbose;
}

Scenario.prototype = {
    click: function (selector) {
        var callerLine = this._getCallerLine(new Error());
        this._actions.push(new actions.ClickAction(selector, callerLine));
        return this;
    },
	dblclick: function (selector) {
        var callerLine = this._getCallerLine(new Error());
        this._actions.push(new actions.DoubleClickAction(selector, callerLine));
        return this;
    },
    keyboard: function (selector, action, chromeCode, ffCode) {
        var callerLine = this._getCallerLine(new Error());
        this._actions.push(new actions.KeyboardAction(selector, action, chromeCode, ffCode, shiftKeyArg, callerLine));
        return this;
    },
    // Feature detection - soit faire en sorte que scenario.keyboard marche bien tout le temps, soit fournir une api de feature detection
    keyboardNoChromeNoIE: function () { //FIXME les keyboards events ne fonctionnent pas bien sous IE et Chrome, il faudrait trouver un polyfill
        var event = document.createEvent("KeyboardEvent");
            return !event.initKeyboardEvent;
    },
    fill: function (selector, value) {
        var callerLine = this._getCallerLine(new Error());
        this._actions.push(new actions.FillAction(selector, value, callerLine));
        return this.wait(selector + "[value='" + value + "']", 3);
    },
    select: function (listSelector, value) {
        var callerLine = this._getCallerLine(new Error());
        this._actions.push(new actions.SelectAction(listSelector, value, callerLine));
        return this;
    },
    wait: function (selector, line) {
        line = line || 2;
        var callerLine = this._getCallerLine(new Error(), line);
        this._actions.push(new actions.WaitAction(selector, callerLine));
        return this;
    },
    exec: function (fn) {
        var callerLine = this._getCallerLine(new Error(), 2);
        this._actions.push(new actions.ExecAction(fn, callerLine));
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
        var callerLine = this._getCallerLine(new Error(), 3);
        this._actions.push(new actions.TestAction({ test: assertFunction, description: description}, callerLine));
        return this;
    },

    _getCallerLine: function (error, stackLine) {
        stackLine = stackLine || 1;
        if (error.stack) {
            // FF
            var trace = error.stack.split('\n');
            var matchingLine = trace.filter(function(line) {
                return /^\[1\].*/.test(line);
            })[0];
            if (!matchingLine) {
                matchingLine = error.stack.split("\n")[stackLine];
            }
            return matchingLine;
        } else {
            var callstack = [];
            var currentFunction = arguments.callee.caller;
            while (currentFunction) {
                var fn = currentFunction.toString();
                var fname = fn.substring(fn.indexOf('"function"') + 8, fn.indexOf('')) || 'anonymous';
                callstack.push(fname);
                currentFunction = currentFunction.caller;
            }
        }
        return "\nNo stack trace available on IE";
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
        if (this.verbose) {
            console.log(action.toString());
        }
        try {
            action.exec();
            scenario._process(index + 1);
        } catch (e) {
            action.name = scenario.currentTest;
            this.emit('exec-error', action, e);
            scenario._process(index + 1);
            // On ne continue pas après une erreur d'execution
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
        this.emit('exec-error', action, e);
    }
};

MicroEE.mixin(Scenario);

module.exports = Scenario;