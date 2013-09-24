
function Asserter(scenario) {
    this.scenario = scenario;
}


Asserter.prototype.assertThat = function assertThat(selector) {
    return new Assertion(selector, this.scenario, null, null);
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
    'to': ['have', 'not', 'be'],
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
 */
Assertion.prototype.selected = function selected() {
    var selector = this.selector;
    var assertion = assert(
        function() {
            var selectNode = null;
            var node = document.querySelector(selector);
            while(!selectNode && node) {
                if (node.tagName.toLowerCase() === 'select') {
                    selectNode = node;
                }

                node = node.parentNode || null;
            }

            var selectedOptions
            if (selectNode.selectedOptions) {
                var selectedOptions = selectNode.selectedOptions;
            } else { // FF does not implement selectedOptions for now
                selectedOptions  = new Array(selectNode.children[selectNode.selectedIndex]);
            }
            var contains = false;

            var expectedOption = document.querySelector(selector);
            Array.prototype.forEach.call(selectedOptions, function(option) {
                if (expectedOption === option) {
                    contains = true;
                }
            });
            return contains;
        },
        this.flags,
        ""
    );
    this.scenario.pushAssert(assertion, "Expect " + selector + " to be selected ");
};

/**
 * Selector check
 *
 * Check that the node match the given selector
 *
 * @param expectedSelector
 */
Assertion.prototype.matchSelector = function matchSelector(expectedSelector) {
    var selector = this.selector;
    var assertion = assert(
        function() {
            var nodeList = document.querySelectorAll(selector);
            for (var index in nodeList) {
                return nodeList[index] === document.querySelector(expectedSelector);
            }
        },
        this.flags,
        ""
    );

    this.scenario.pushAssert(assertion, "Expect node " + selector + " to match selector " + expectedSelector);

};

/**
 * Empty check
 *
 * Check that the node content is empty
 */
Assertion.prototype.empty = function empty() {
    var selector = this.selector;
    var assertion = assert(
        function() {
            return document.querySelector(selector).textContent === "";
        },
        this.flags,
        ""
    );
    this.scenario.pushAssert(assertion, "Expect node " + selector + " to be empty");
};

/**
 * Exist check
 *
 * Check that the node is in the DOM
 */
Assertion.prototype.exist = function exist() {
    var selector = this.selector;
    var assertion = assert(
        function() {
            return null !== document.querySelector(selector);
        },
        this.flags,
        ""
    );
    this.scenario.pushAssert(assertion, "Expect node " + selector + " to be present");
};

// Function for testing node visibility
function isVisible(node) {
    if ('input' === node.tagName.toLowerCase() && 'hidden' === node.getAttribute('type')) {
        return false;
    }

    return !!((node.offsetWidth > 0 || node.offsetHeight > 0 )&& 'none' !== node.style.display && 'hidden' !== node.style.visibility);
}


/**
 * Hidden check
 *
 * Check that the node is in the DOM but hidden
 */
Assertion.prototype.hidden = function hidden() {
    var selector = this.selector;
    var assertion = assert(
        function() {
            return !isVisible(document.querySelector(selector));
        },
        this.flags,
        ""
    );
    this.scenario.pushAssert(assertion, "Expect node " + selector + " to be hidden");
};

/**
 * Visible check
 *
 * Check that the node is in the DOM and visible
 */
Assertion.prototype.visible = function visible() {
    var selector = this.selector;
    var assertion = assert(
        function() {
            return isVisible.call(this, document.querySelector(selector));
        },
        this.flags,
        ""
    );
    this.scenario.pushAssert(assertion, "Expect node " + selector + " to be visible");
};

Assertion.prototype.html = function html(expectedHTML) {
    var selector = this.selector;
    var assertion = assert(
        function() {
            return new RegExp(expectedHTML).test(document.querySelector(selector).innerHTML);
        },
        this.flags,
        ""
    );
    this.scenario.pushAssert(assertion, "Expect node " + selector + " to have html " + expectedHTML);
};


module.exports = Asserter;