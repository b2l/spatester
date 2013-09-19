
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
        document.querySelector(this.selector).click();
    } catch (e) {
        throw new Error('Can\'t click on element: ' + this.selector, e);
    }
};

actions.ClickAction = ClickAction;

/**
 * DoubleClickAction class
 * @extend Action
 *
 * DoubleClick on a given selector
 */
function DoubleClickAction(selector, waitFor, callerLine) {
    this.selector = selector;
    this.waitFor = waitFor;
    this.name = "double click on element matching selector " + selector;
    this.callerLine = callerLine;
}
DoubleClickAction.prototype = new Action();
DoubleClickAction.constructor = DoubleClickAction;
DoubleClickAction.prototype._exec = function () {
    try {
        var dblClickEvent = new MouseEvent("MouseEvent");
        dblClickEvent.initEvent('dblclick', true, true);
        document.querySelector(this.selector).dispatchEvent(dblClickEvent);
    } catch (e) {
        throw new Error('Can\'t double click on element: ' + this.selector, e);
    }
};

actions.DoubleClickAction = DoubleClickAction;

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
