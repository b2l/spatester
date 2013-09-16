
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
    'have': ['attr', 'value'],
    'not': ['to', 'have'],
    'be': ['not', 'checked', 'selected']
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
Assertion.prototype.attr = function (attrName, expected) {
    console.log("youhou !!!", attrName, expected);
    var selector = this.selector;
    var assertion;

    if (undefined == expected) {
        assertion = assert(
            function() {
                return document.querySelector(selector).hasAttribute(attrName);
            },
            this.flags,
            ""
        );
    } else {
        assertion = assert(
            function() {
                return document.querySelector(selector).getAttribute(attrName) === expected;
            },
            this.flags,
            ""
        );
    }
    this.scenario.pushAssert(assertion);


    return this;
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
Assertion.prototype.value = function value(expected, description) {
    var selector = this.selector;
    var assertion = assert(
        function() {
            return document.querySelector(selector).value === expected;
        },
        this.flags,
        description
    );
    this.scenario.pushAssert(assertion,  description);

    return this;
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