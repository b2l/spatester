;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
var TestSuite = require('../src/testSuite').TestSuite;

var demoTestSuite = new TestSuite("demo test suite", {
    setUp: function() {
        var input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('id', 'my-input');
        document.body.appendChild(input);

        var div = document.createElement('div');
        div.setAttribute('id', 'my-div');
        document.body.appendChild(div);
    },
    tearDown: function() {
        var input = document.getElementById('my-input');
        var div = document.getElementById('my-div');
        document.body.removeChild(input);
        document.body.removeChild(div);
    }
});

Testem.useCustomAdapter(function (socket) {
    demoTestSuite.setSocket(socket);
});


demoTestSuite.addTest("test form input value", function (scenario, asserter) {
    // Given

    // When
    scenario
        .fill('#my-input', 'toto');

    // Then
    asserter.assertThat('#my-input').to.have.value('toto', "value should be toto");
});

demoTestSuite.addTest("test form input value with the not operator", function (scenario, asserter) {
    // Given

    // When
    scenario
        .fill('#my-input', 'toto');

    // Then
    asserter.assertThat('#my-input').not.to.have.value('titi', "value should be toto");
});

demoTestSuite.addTest("test node attribute", function (scenario, asserter) {
    // Given

    // When
    scenario.exec(function() {
        document.querySelector('#my-div').setAttribute('title', 'toto');
    });

    // Then
    asserter.assertThat('#my-div').to.have.attr('title');
    asserter.assertThat('#my-div').to.have.attr('title', "toto");
});

demoTestSuite.addTest("test node attribute with the not operator", function (scenario, asserter) {
    asserter.assertThat('#my-div').not.to.have.attr('title');

    scenario.exec(function() {
        document.querySelector('#my-div').setAttribute('title', 'toto');
    });

    asserter.assertThat('#my-div').not.to.have.attr('title', 'titi');
});

demoTestSuite.addTest("test node contains text ", function(scenario, asserter) {
    // given
    scenario.exec(function() {
        document.getElementById('my-div').innerHTML = "<div class='tototiti'>tata</div>";
    });

    // Then
    asserter.assertThat('#my-div').to.have.text('tata');
    asserter.assertThat('#my-div').not.to.have.text('toto');
});
demoTestSuite.addTest("test form radio is checked", function(scenario, asserter) {
    // Given
    scenario.exec(function() {
        var content = "<input type='radio' value='toto' id='not-checked' /> <input tpye='radio' value='titi' id='checked' checked='checked' />";
        document.getElementById('my-div').innerHTML = content;
    });

    // Then
    asserter.assertThat('#not-checked').not.to.have.checked();
    asserter.assertThat('#checked').to.have.checked();
});

//demoTestSuite.addTest("test form radio is not checked", function(scenario, asserter) {
//
//});
//demoTestSuite.addTest("test option is selected", function(scenario, asserter) {
//
//});
//demoTestSuite.addTest("test option is not selected", function(scenario, asserter) {
//
//});
//demoTestSuite.addTest("test node match selector", function(scenario, asserter) {
//
//});
//demoTestSuite.addTest("test node does not match selector", function(scenario, asserter) {
//
//});
//demoTestSuite.addTest("test node content is empty", function(scenario, asserter) {
//
//});
//demoTestSuite.addTest("test node content is not empty", function(scenario, asserter) {
//
//});
//demoTestSuite.addTest("test node exist", function(scenario, asserter) {
//
//});
//demoTestSuite.addTest("test node does not exist", function(scenario, asserter) {
//
//});
//demoTestSuite.addTest("test node is hidden", function(scenario, asserter) {
//
//});
//demoTestSuite.addTest("test node is visible", function(scenario, asserter) {
//
//});
//demoTestSuite.addTest("test node contains html", function(scenario, asserter) {
//
//});

window.onload = function() {
    setTimeout(function() {
        demoTestSuite.run();
    }, 500);
}

},{"../src/testSuite":2}],3:[function(require,module,exports){

function Asserter (scenario) {
    this.scenario = scenario;
}


Asserter.prototype.assertThat = function assertThat(selector) {
    return new Assertion(selector, this.scenario);
};

/**
 * test utility
 *
 * return a function wich throw an error if the assertion is not validate
 */
function assert(assertion, flags, message) {
    return function() {
        var ok = flags.not ? !assertion() : assertion();
        if (!ok) {
            throw new Error(message);
        }
    }

}

/**
 * Tag chaining possibility
 */
var _flags = {
    'to': ['have', 'not'],
    'have': ['not', 'to'],
    'not': ['to', 'have', 'be'],
    'be': ['not']
}

/**
 * Assertion constructor
 *
 * @param selector
 * @param scenario
 * @param flag
 * @param parent
 * @returns {*}
 * @constructor
 */
function Assertion(selector, scenario, flag, parent) {
    this.selector = selector;
    this.flags = {};
    this.scenario = scenario;

    // Add sub property in flags for fluent api
    if (undefined != parent) {
        this.flags[flag] = true;

        // Set flag property on the parent
        for (var i in parent.flags) {
            if (parent.flags.hasOwnProperty(i)) {
                this.flags[i] = true;
            }
        }
    }

    var flags = flag ? _flags[flag] : Object.keys(_flags);
    var self = this;

    if (flags) {
        for (var i = 0; i < flags.length; i++) {
            // No recursion
            if (this.flags[flags[i]]) continue;

            var name = flags[i];
            var assertion = new Assertion(selector, scenario, name, this);

            if ('function' == typeof Assertion.prototype[name]) {
                // Clone the method. make sure we don't touch the prototype reference
                var old = this[name];
                this[name] = function() {
                    return old.apply(self, arguments);
                }

                for (var fn in Assertion.prototype) {
                    if (Assertion.prototype.hasOwnProperty(fn) && fn != name) {
                        this[name][fn] = assertion[fn].bind(assertion);
                    }
                }
            } else {
                this[name] = assertion;
            }
        }
    }

    return this;
}

/**
 * Attribute check
 *
 * Check if the given attribute is present
 * if expected if given, check that attribute equal expected
 *
 * @param attrName
 * @param expected
 * @returns {*}
 */
Assertion.prototype.attr = function(attrName, expected) {
    var selector = this.selector;
    var assertion;
    var description;

    if (undefined === expected) {
        assertion = assert(
            function() {
                return document.querySelector(selector).hasAttribute(attrName);
            },
            this.flags,
            ""
        );
        description = "expect attr " + attrName + " to be set";
    } else {
        assertion = assert(
            function() {
                return document.querySelector(selector).getAttribute(attrName) === expected;
            },
            this.flags,
            ""
        );
        description = "expect attr " + attrName + " to have value " + expected;
    }
    this.scenario.pushAssert(assertion, description);
};

/**
 * Value check
 *
 * Check if the selector (should be a form field) has the expected value
 *
 * @param expected
 * @param description
 * @returns {*}
 */
Assertion.prototype.value = function(expected, description) {
    var selector = this.selector;
    var assertion = assert(
        function() {
            return document.querySelector(selector).value === expected;
        },
        this.flags,
        description
    );
    this.scenario.pushAssert(assertion,  description);
};

/**
 * Text check
 *
 * Check that the node contains the text
 *
 * @param extectedText : text that the node should contain
 * @param description
 */
Assertion.prototype.text = function text(expectedText, description) {
    var selector = this.selector;
    var assertion = assert(
        function() {
            var regexp = new RegExp('.*' + expectedText + '.*');
            return regexp.test(document.querySelector(selector).textContent);
        },
        this.flags,
        description
    );
    this.scenario.pushAssert(assertion, description);
};

/**
 * Checked check
 *
 * Check that the node (an input type radio) is checked
 *
 * @param description
 */
Assertion.prototype.checked = function checked(description) {
    var selector = this.selector;
    var assertion = assert(
        function() {
            return document.querySelector(selector).hasAttribute('checked');
        },
        this.flags,
        description
    );
    this.scenario.pushAssert(assertion, "Expect " + selector + " to be checked ");
};

/**
 * Selected check
 *
 * Check that the node (an option node) is selected
 *
 * @param description
 */
Assertion.prototype.selected = function selected() {
    var selector = this.selector;
    var assertion = assert(
        function() {
            return document.querySelector(selector).hasAttribute('selected');
        },
        this.flags,
        description
    );
    this.scenario.pushAssert(assertion, "Expect " + selector + " to be checked ");
};

Assertion.prototype.matchSelector = function matchSelector() {
}
Assertion.prototype.empty = function empty() {
}
Assertion.prototype.exist = function exist() {
}
Assertion.prototype.hidden = function hidden() {
}
Assertion.prototype.visible = function visible() {
}
Assertion.prototype.html = function html() {
}

module.exports = Asserter;
},{}],2:[function(require,module,exports){
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
    this.setUp = params.setUp || function(){};
    this.tearDown = params.tearDown || function(){};

    this.tests = [];
};

TestSuite.prototype.setSocket = function(socket) {
    this.scenario = new Scenario(name,socket);
    this.asserter = new Asserter(this.scenario);

    this.scenario.on('tests-start', this.onTestsStart);
    this.scenario.on('tests-end', this.onTestsEnd);
    this.scenario.on('test-success', this.onTestSuccess);
    this.scenario.on('test-error', this.onTestFail);
    this.scenario.on('error', this.onProcessError);
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

},{"./asserter":3,"./scenario":4,"microee":5}],6:[function(require,module,exports){

/**
 * Action class
 * @abstract
 *
 * All possible action in a scenario should create an instance of an Action subtypes
 * Those subtype must define an _exec method
 */

var actions = {};

function Action() {
}
Action.prototype = {
    exec: function () {
        if (!this._exec) {
            throw new Error("Trying to exec an action which doesn't inherit from Action Class");
        }

        this._exec();
    }
};

/**
 * WaitAction class
 * @extend Action
 *
 * Delay the execution until the given selector is found in the DOM
 */
function WaitAction(selector, callerLine) {
    this.waitFor = function () {
        return document.querySelector(selector);
    };
    this.name = "Wait for an element matching the selector " + selector;
    this.callerLine = callerLine;
}
WaitAction.prototype = new Action();
WaitAction.constructor = WaitAction;
WaitAction.prototype._exec = function () {
};

actions.WaitAction = WaitAction;

/**
 * ExecAction class
 * @extend Action
 *
 * Execute a function in the DOM
 */
function ExecAction(fn) {
    this._exec = function () {
        fn();
    };
}
ExecAction.prototype = new Action();
ExecAction.constructor = ExecAction;

actions.ExecAction = ExecAction;

/**
 * ClickAction class
 * @extend Action
 *
 * Click on a given selector
 */
function ClickAction(selector, waitFor, callerLine) {
    this.selector = selector;
    this.waitFor = waitFor;
    this.name = "click on element matching selector " + selector;
    this.callerLine = callerLine;
}
ClickAction.prototype = new Action();
ClickAction.constructor = ClickAction;
ClickAction.prototype._exec = function () {
    try {
        document.querySelectorAll(this.selector)[0].click();
    } catch (e) {
        throw new Error('Can\'t click on element: ' + this.selector, e);
    }
};

actions.ClickAction = ClickAction;

/**
 * KeyboardAction class
 * @extend Action
 *
 * Keyboard action on a given selector
 */
function KeyboardAction(selector, action, chromeCode, ffCode, callerLine) {
    this.selector = selector;
    this.action = action;
    this.chromeCode = chromeCode;
    this.ffCode = ffCode;
    this.name = action + " on element matching selector " + selector;
    this.callerLine = callerLine;
}
KeyboardAction.prototype = new Action();
KeyboardAction.constructor = KeyboardAction;
KeyboardAction.prototype._exec = function () {
    try {
        var event = document.createEvent("KeyboardEvent");
        if (event.initKeyboardEvent) {  // Chrome, IE
            event.initKeyboardEvent(this.action, true, true, document.defaultView, this.chromeCode, 0, "", false, "");
        } else { // FF
            event.initKeyEvent(this.action, true, true, document.defaultView, false, false, false, false, this.ffCode, 0);
        }
        document.querySelector(this.selector).dispatchEvent(event);
    } catch (e) {
        throw new Error('Can\'t ' + this.action + ' on element: ' + this.selector, e);
    }
};

actions.KeyboardAction = KeyboardAction;

/**
 * SelectAction class
 * @extend Action
 *
 * Select the given value from the given list
 */
function SelectAction(selector, value, waitFor, callerLine) {
    this.selector = selector;
    this.value = value;
    this.waitFor = waitFor;
    this.name = "Select option with value " + value + " in the list matching the selector " + selector;
    this.callerLine = callerLine;
}
SelectAction.prototype = new Action();
SelectAction.constructor = SelectAction;
SelectAction.prototype._exec = function () {
    try {
        // Simulate the click to allow custom js to execute
        var list = document.querySelector(this.selector);
        var option = document.querySelector(this.selector + " option[value='" + this.value + "']");
        list.click();
        option.click();

        // Really select the value
        list.selectedIndex = option.index;
    } catch (e) {
        throw new Error("Can't select the value " + this.value + " in list " + this.selector, e);
    }
};

actions.SelectAction = SelectAction;

/**
 * FillAction class
 * @extend Action
 *
 * Set the value of a given field with the given value
 */
function FillAction(selector, value, waitFor, callerLine) {
    this.selector = selector;
    this.value = value;
    this.waitFor = waitFor;
    this.name = "Fill input matching selector " + selector + " with value " + value;
    this.callerLine = callerLine;
}
FillAction.prototype = new Action();
FillAction.constructor = FillAction;
FillAction.prototype._exec = function () {
    try {
        document.querySelector(this.selector).setAttribute('value', this.value);
    } catch (e) {
        throw new Error('Can\'t fill element: ' + this.selector + ' with value ' + this.value, e);
    }
};

actions.FillAction = FillAction;


//TODO A supprimer
/**
 * TestAction class
 * @extend Action
 *
 * Run a given assertion
 */
function TestAction(assertion, callerLine) {
    this.assertion = assertion;
    this.callerLine = callerLine;
    this.name = assertion.description;
    this.waitFor = assertion.waitFor;
}
TestAction.prototype = new Action();
TestAction.constructor = TestAction;
TestAction.prototype._exec = function () {
    this.assertion.test();
};

actions.TestAction = TestAction;

module.exports = actions;

},{}],5:[function(require,module,exports){
function M() { this._events = {}; }
M.prototype = {
  on: function(ev, cb) {
    this._events || (this._events = {});
    var e = this._events;
    (e[ev] || (e[ev] = [])).push(cb);
    return this;
  },
  removeListener: function(ev, cb) {
    var e = this._events[ev] || [], i;
    for(i = e.length-1; i >= 0 && e[i]; i--){
      if(e[i] === cb || e[i].cb === cb) { e.splice(i, 1); }
    }
  },
  removeAllListeners: function(ev) {
    if(!ev) { this._events = {}; }
    else { this._events[ev] && (this._events[ev] = []); }
  },
  emit: function(ev) {
    this._events || (this._events = {});
    var args = Array.prototype.slice.call(arguments, 1), i, e = this._events[ev] || [];
    for(i = e.length-1; i >= 0 && e[i]; i--){
      e[i].apply(this, args);
    }
    return this;
  },
  when: function(ev, cb) {
    return this.once(ev, cb, true);
  },
  once: function(ev, cb, when) {
    if(!cb) return this;
    function c() {
      if(!when) this.removeListener(ev, c);
      if(cb.apply(this, arguments) && when) this.removeListener(ev, c);
    }
    c.cb = cb;
    this.on(ev, c);
    return this;
  }
};
M.mixin = function(dest) {
  var o = M.prototype, k;
  for (k in o) {
    o.hasOwnProperty(k) && (dest.prototype[k] = o[k]);
  }
};
module.exports = M;

},{}],4:[function(require,module,exports){
var actions = require('./actions');
var MicroEE = require('microee');

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
            action.exec();
            scenario._process(index + 1);
        } catch (e) {
            this._onError(scenario, index, action, e);
        }
    },

    _processTestAction: function (scenario, index, action) {
        try {
            action.exec();
            this.emit('test-success', action);
            scenario._process(index + 1);
        } catch (e) {
            this.emit('test-error', action);
        }
    },

    _processWaitFor: function (scenario, index, action) {
        var start = new Date().getTime();
        var that = this;
        setTimeout(function timeout() {
            try {
                action.waitFor();
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
    },

    _onError: function (scenario, index, action, e) {
        this.emit('error', action, e);
    }
};

MicroEE.mixin(Scenario);

module.exports = Scenario;
},{"./actions":6,"microee":5}]},{},[1])
;