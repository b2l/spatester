function Asserter(scenario) {
    this.scenario = scenario;
}

Asserter.prototype.expect = function assertThat(selector) {
    return new Assertion(selector, this.scenario, null, null);
};

Asserter.prototype.assertTrue = function assertTrue(fn, msg) {
    return this.expect().to.returnTrue(fn, msg);
};

/**
 * test utility
 *
 * return a function wich throw an error if the assertion is not validate
 */
function assert(assertion, flags, messageOK, messageNOK) {
    return function () {
        var ok = flags.not ? !assertion() : assertion();
        var msg = flags.not ? messageNOK : messageOK;
        if (!ok) {
            throw new Error(msg);
        }
    };

}

/**
 * Tag chaining possibility
 */
var _flags = {
    'to': ['have', 'not', 'be'],
    'have': ['not', 'to'],
    'not': ['to', 'have', 'be'],
    'be': ['not']
};

/**
 * Assertion constructor
 *
 * @param selector
 * @param scenario
 * @param flag
 * @param parent
 * @constructor
 */
function Assertion(selector, scenario, flag, parent) {
    this.selector = selector;
    this.flags = {};
    this.scenario = scenario;

    // Add sub property in flags for fluent api
    if (parent) {
        this.flags[flag] = true;

        // Set flag property on the parent
        for (var prop in parent.flags) {
            if (parent.flags.hasOwnProperty(prop)) {
                this.flags[prop] = true;
            }
        }
    }

    var flags = flag ? _flags[flag] : Object.keys(_flags);
    var self = this;

    if (flags) {
        var i = 0;
        for (i; i < flags.length; i++) {
            // No recursion
            if (this.flags[flags[i]]) {
                continue;
            }

            var name = flags[i];
            var assertion = new Assertion(selector, scenario, name, this);

            if ('function' == typeof Assertion.prototype[name]) {
                // Clone the method. make sure we don't touch the prototype reference
                var old = this[name];
                this[name] = function () {
                    return old.apply(self, arguments);
                };

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

Assertion.prototype.execAssertion = function (assertion, description) {
    if (this.scenario)
        this.scenario.pushAssert(assertion, description);
    else
        assertion();
};

function isNode(selector) {
    return !selector instanceof String;
}

Assertion.prototype.children = function children(childrenSelector) {
    var selector = this.selector + " " + childrenSelector;
    return new Assertion(selector, this.scenario, null, null);
};

Assertion.prototype.child = function child(childrenSelector) {
    var selector = this.selector + " " + childrenSelector;
    return new Assertion(selector, this.scenario, null, null);
};

/**
 * nodeLength check
 *
 * Check is querySelectorAll(this.selector) return the expected number of node
 *
 * @param expectedLength
 * @param description
 */
Assertion.prototype.nodeLength = function nodeLength(expectedLength, description) {
    var selector = this.selector;

    var assertion = assert(
        function () {
            return document.querySelectorAll(selector).length === expectedLength;
        },
        this.flags,
        "Expect " + selector + " to match " + expectedLength + " node in the DOM",
        "Expect " + selector + " NOT to match " + expectedLength + " node in the DOM"
    );

    this.execAssertion(assertion, description)
};

/**
 * Class check
 *
 * Check if the given class is present
 *
 * @param className
 * @param description
 */
Assertion.prototype.className = function (className, description) {
    var selector = this.selector;

    var assertion = assert(
        function () {
            return document.querySelector(selector).classList.contains(className);
        },
        this.flags,
        'Expect ' + selector + ' to have class "' + className + '"',
        'Expect ' + selector + ' not to have class "' + className + '"'
    );
    this.execAssertion(assertion, description)
};

/**
 * Attribute check
 *
 * Check if the given attribute is present
 * if expected if given, check that attribute equal expected
 *
 * @param attrName
 * @param expected
 * @param description
 */
Assertion.prototype.attr = function (attrName, expected, description) {
    var selector = this.selector;
    var assertion;

    if (arguments.length >= 2) {
        assertion = assert(
            function () {
                return isNode(selector) ?
                    selector.getAttribute(attrName) === expected :
                    document.querySelector(selector).getAttribute(attrName) === expected;
            },
            this.flags,
            "Expect " + selector + " to have attribute " + attrName + " with value " + expected,
            "Expect " + selector + " to have attribute " + attrName + " with value different than " + expected
        );
    } else {
        assertion = assert(
            function () {
                return isNode(selector) ?
                    selector.hasAttribute(attrName) :
                    document.querySelector(selector).hasAttribute(attrName);


            },
            this.flags,
            "Expect " + selector + " to have attribute " + attrName,
            "Expect " + selector + " not to have attribute " + attrName
        );
    }
    this.execAssertion(assertion, description)
};

/**
 * Value check
 *
 * Check if the selector (should be a form field) has the expected value
 *
 * @param expected
 * @param description
 */
Assertion.prototype.value = function (expected, description) {
    var selector = this.selector;
    var assertion = assert(
        function () {
            return document.querySelector(selector).value === expected;
        },
        this.flags,
        'Expect ' + selector + ' to have value "' + expected + '"',
        'Expect ' + selector + ' not to have value "' + expected + '"'
    );
    this.execAssertion(assertion, description);
};

/**
 * Text check
 *
 * Check that the node contains the text
 *
 * @param expectedText : text that the node should contain
 * @param description
 */
Assertion.prototype.text = function text(expectedText, description) {
    var selector = this.selector;
    var assertion = assert(
        function () {
            var regexp = new RegExp('.*' + expectedText + '.*');

            return isNode(selector) ?
                regexp.test(selector.textContent) :
                regexp.test(document.querySelector(selector).textContent);
        },
        this.flags,
        "Expect " + selector + " to contain text \"" + expectedText + "\"",
        "Expect " + selector + " not to contain text \"" + expectedText + "\""
    );
    this.execAssertion(assertion, description);
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
        function () {
            return isNode(selector) ?
                selector.checked :
                document.querySelector(selector).checked;
        },
        this.flags,
        "Expect " + selector + " to be checked",
        "Expect " + selector + " not to be checked"
    );
    this.execAssertion(assertion, description);
};

/**
 * Selected check
 *
 * Check that the node (an option node) is selected
 *
 * @param description
 */
Assertion.prototype.selected = function selected(description) {
    var selector = this.selector;
    var assertion = assert(
        function () {
            var selectNode = null;
            var node = isNode(selector) ? selector : document.querySelector(selector);

            while (!selectNode && node) {
                if (node.tagName.toLowerCase() === 'select') {
                    selectNode = node;
                }

                node = node.parentNode || null;
            }

            var selectedOptions;
            if (selectNode.selectedOptions) {
                selectedOptions = selectNode.selectedOptions;
            } else { // FF does not implement selectedOptions for now
                selectedOptions = new Array(selectNode.children[selectNode.selectedIndex]);
            }
            var contains = false;

            var expectedOption = document.querySelector(selector);
            Array.prototype.forEach.call(selectedOptions, function (option) {
                if (expectedOption === option) {
                    contains = true;
                }
            });
            return contains;
        },
        this.flags,
        "Expect " + selector + " to be selected",
        "Expect " + selector + " not to be selected"
    );
    this.execAssertion(assertion, description);
};

/**
 * Selector check
 *
 * Check that the node match the given selector
 *
 * @param expectedSelector
 * @param description
 */
Assertion.prototype.matchSelector = function matchSelector(expectedSelector, description) {
    var selector = this.selector;
    var assertion = assert(
        function () {
            var nodeList = document.querySelectorAll(selector);
            for (var index in nodeList) {
                return nodeList[index] === document.querySelector(expectedSelector);
            }
        },
        this.flags,
        'Expect ' + selector + ' to match selector "' + expectedSelector + '"',
        'Expect ' + selector + ' not to match selector "' + expectedSelector + '"'
    );

    this.execAssertion(assertion, description);

};

/**
 * Empty check
 *
 * Check that the node content is empty
 *
 * @param description
 */
Assertion.prototype.empty = function empty(description) {
    var selector = this.selector;
    var assertion = assert(
        function () {
            return isNode(selector) ?
                selector.textContent === "" :
                document.querySelector(selector).textContent === "";
        },
        this.flags,
        "Expect " + selector + " to be empty",
        "Expect " + selector + " not to be empty"
    );
    this.execAssertion(assertion, description);
};

/**
 * Exist check
 *
 * Check that the node is in the DOM
 *
 * @param description
 */
Assertion.prototype.exist = function exist(description) {
    var selector = this.selector;
    var assertion = assert(
        function () {
            return null !== document.querySelector(selector);
        },
        this.flags,
        "Expect " + selector + " to be in the DOM",
        "Expect " + selector + " not to be in the DOM"
    );
    this.execAssertion(assertion, description);
};

// Function for testing node visibility
function isVisible(node) {
    if ('input' === node.tagName.toLowerCase() && 'hidden' === node.getAttribute('type')) {
        return false;
    }

    return !!((node.offsetWidth > 0 || node.offsetHeight > 0 ) && 'none' !== node.style.display && 'hidden' !== node.style.visibility);
}


/**
 * Hidden check
 *
 * Check that the node is in the DOM but hidden
 *
 * @param description
 */
Assertion.prototype.hidden = function hidden(description) {
    var selector = this.selector;
    var assertion = assert(
        function () {
            return isNode(selector) ?
                !isVisible(selector) :
                !isVisible(document.querySelector(selector));
        },
        this.flags,
        "Expect " + selector + " to be hidden",
        "Expect " + selector + " not to be hidden"
    );
    this.execAssertion(assertion, description);
};

/**
 * Visible check
 *
 * Check that the node is in the DOM and visible
 *
 * @param description
 */
Assertion.prototype.visible = function visible(description) {
    var selector = this.selector;
    var assertion = assert(
        function () {
            return isNode(selector) ?
                isVisible(selector) :
                isVisible(document.querySelector(selector));
        },
        this.flags,
        "Expect " + selector + " to be visible",
        "Expect " + selector + " not to be visible"
    );
    this.execAssertion(assertion, description);
};

/**
 * html check
 *
 * Check that the node contains the given html
 *
 * @param expectedHTML
 * @param description
 */
Assertion.prototype.html = function html(expectedHTML, description) {
    var selector = this.selector;
    var assertion = assert(
        function () {
            return isNode(selector) ?
                new RegExp(expectedHTML).test(selector.innerHTML) :
                new RegExp(expectedHTML).test(document.querySelector(selector).innerHTML);
        },
        this.flags,
        'Expect ' + selector + ' to contain html "' + expectedHTML+ '"',
        'Expect ' + selector + ' not to contain html "' + expectedHTML+ '"'
    );
    this.execAssertion(assertion, description);
};

/**
 * returnTrue check
 *
 * Check that the given function return true
 *
 * @param fn
 * @param description
 */
Assertion.prototype.returnTrue = function (fn, description) {
    var selector = this.selector;
    var assertion = assert(
        function () {
            return fn.call(this, selector);
        },
        this.flags,
        "expect function " + fn + " to return true",
        "expect function " + fn + " to return false"
    );
    this.execAssertion(assertion, description)
};

/**
 * returnFalse check
 *
 * Check that the given function return false
 *
 * @param fn
 * @param description
 */
Assertion.prototype.returnFalse = function (fn, description) {
    var selector = this.selector;
    var assertion = assert(
        function () {
            return !fn.call(this, selector);
        },
        this.flags,
        "expect function " + fn + " to return false",
        "expect function " + fn + " to return true"
    );
    this.execAssertion(assertion, description)
};

module.exports = Asserter;