var TestSuite = require('../src/testSuite').TestSuite;
require('../src/testem-adapter.js');

var demoTestSuite = new TestSuite("demo test suite", {
    setUp: function () {
        var input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('id', 'my-input');
        document.body.appendChild(input);

        var div = document.createElement('div');
        div.setAttribute('id', 'my-div');
        document.body.appendChild(div);
    },
    tearDown: function () {
        var input = document.getElementById('my-input');
        var div = document.getElementById('my-div');
        document.body.removeChild(input);
        document.body.removeChild(div);
    }
});

demoTestSuite.addTest("test form input value", function (scenario, asserter) {
    // Given

    // When
    scenario
        .fill('#my-input', 'toto');

    // Then
    asserter.expect('#my-input').to.have.value('toto');
});

demoTestSuite.addTest("test form input value with the not operator", function (scenario, asserter) {
    // Given

    // When
    scenario
        .fill('#my-input', 'toto');

    // Then
    asserter.expect('#my-input').not.to.have.value('titi');
});

demoTestSuite.addTest("test node attribute", function (scenario, asserter) {
    // Given

    // When
    scenario.exec(function () {
        document.querySelector('#my-div').setAttribute('title', 'toto');
    });

    // Then
    asserter.expect('#my-div').to.have.attr('title');
    asserter.expect('#my-div').to.have.attr('title', "toto");
});

demoTestSuite.addTest("test node attribute with the not operator", function (scenario, asserter) {
    asserter.expect('#my-div').not.to.have.attr('title');

    scenario.exec(function () {
        document.querySelector('#my-div').setAttribute('title', 'toto');
    });

    asserter.expect('#my-div').not.to.have.attr('title', 'titi');
});

demoTestSuite.addTest("test node contains text ", function (scenario, asserter) {
    // given
    scenario.exec(function () {
        document.getElementById('my-div').innerHTML = "<div class='tototiti'>tata</div>";
    });

    // Then
    asserter.expect('#my-div').to.have.text('tata');
    asserter.expect('#my-div').not.to.have.text('toto');
});
demoTestSuite.addTest("test form radio is checked", function (scenario, asserter) {
    // Given
    scenario.exec(function () {
        var content = "<input type='chec' value='toto' id='not-checked' /> <input tpye='radio' value='titi' id='checked' checked='checked' />";
        document.getElementById('my-div').innerHTML = content;
    });

    // Then
    asserter.expect('#not-checked').not.to.be.checked();
    asserter.expect('#checked').to.be.checked();
});

demoTestSuite.addTest("test option is selected", function (scenario, asserter) {
    // Given
    scenario.exec(function () {
        var content = "<select id='select'><option value='toto' id='option-toto'>Toto</option><option value='titi' id='option-titi'>Titi</option></select>";
        document.getElementById('my-div').innerHTML = content;
    });

    // When
    scenario.select('#select', 'titi');

    // Then
    asserter.expect('#option-titi').to.be.selected();
    asserter.expect('#option-toto').not.to.be.selected();
});

demoTestSuite.addTest("test node match selector", function (scenario, asserter) {
    // Given
    scenario.exec(function () {
        var content = "<div class='titi'><a class='my-button' id='button'>Button</a></div>";
        document.getElementById('my-div').innerHTML = content;
    });

    // Then
    asserter.expect('#button').to.matchSelector('#my-div .titi .my-button');
    asserter.expect('#button').not.to.matchSelector('#my-div #toto .titi .my-button');
});

demoTestSuite.addTest("test node content is empty", function (scenario, asserter) {
    scenario.exec(function () {
        var content = "toto<div class='titi'><a class='my-button' id='button'></a></div>";
        document.getElementById('my-div').innerHTML = content;
    });

    asserter.expect('#my-div').not.to.have.empty();
//    asserter.expect('#my-button').to.have.empty();
});

demoTestSuite.addTest("test node exist", function (scenario, asserter) {
    asserter.expect('#my-div').to.exist();

    scenario.exec(function () {
        // Create the element, but don't insert it in the dom
        var elem = document.createElement('div');
        elem.setAttribute('id', 'not-in-dom');
    });

    asserter.expect('#not-in-dom').not.to.exist();
});

demoTestSuite.addTest("test node is hidden ", function (scenario, asserter) {

    scenario.exec(function () {
        document.getElementById('my-div').innerHTML = "<p>Toto, il y a du contenu dans ma div</p>";
    });
    asserter.expect('#my-div').not.to.be.hidden();

    scenario.exec(function () {
        document.querySelector('#my-div').style.display = 'none';
    });

    asserter.expect('#my-div').to.be.hidden();

    scenario.exec(function () {
        document.querySelector('#my-div').style.display = 'block';
        document.querySelector('#my-div').style.visibility = 'hidden';
    });

    asserter.expect('#my-div').to.be.hidden();
});

demoTestSuite.addTest("test node is visible", function (scenario, asserter) {
    asserter.expect('#my-div').to.be.visible();

    scenario.exec(function () {
        document.querySelector('#my-div').style.display = 'none';
    });

    asserter.expect('#my-div').not.to.have.visible();

    scenario.exec(function () {
        document.querySelector('#my-div').style.display = 'block';
        document.querySelector('#my-div').style.visibility = 'hidden';
    });

    asserter.expect('#my-div').not.to.have.visible();
});

demoTestSuite.addTest("test node contains html", function (scenario, asserter) {
    var expected = "<p>Toto, bli bla blou</p>";

    asserter.expect('#my-div').not.to.have.html(expected);

    scenario.exec(function () {
        document.getElementById('my-div').innerHTML = expected;
    });

    asserter.expect('#my-div').to.have.html(expected);
    asserter.expect('#my-div').to.have.html("<p>Toto.*</p>");
});


demoTestSuite.addTest("we should assert with function returning true", function (scenario, asserter) {
    asserter.expect('body').to.returnTrue(function (bodyNode) {
        return true;
    });
});

demoTestSuite.addTest("we should assert with function returning false", function (scenario, asserter) {
    asserter.expect('body').to.returnFalse(function (bodyNode) {
        return false;
    });
});

demoTestSuite.addTest("scenario.click must trigger click and mousedown events", function (scenario, asserter) {
    var clickInvoked = 0, mousedownInvoked = 0;
    scenario.exec(function () {
        document.getElementById('my-input').addEventListener('click', function() {
            clickInvoked ++;
        });
        document.getElementById('my-input').addEventListener('mousedown', function() {
            mousedownInvoked ++;
        });
    });
    

    scenario.click('#my-input');

    asserter.assertTrue(function () {
        return clickInvoked === 1;
    }, "1 click expected, " + clickInvoked + " detected");
    asserter.assertTrue(function () {
        return mousedownInvoked === 1;
    }, "1 mousedown expected, " + mousedownInvoked + " detected");
});

demoTestSuite.addTest("scenario.wait shall wait for a selector to be visible", function (scenario, asserter) {

    // Given 

    scenario.exec(function () {
        var myDiv = document.getElementById('my-div');
        myDiv.innerHTML = "click me";
        myDiv.addEventListener('click', function(e) {
            setTimeout(function() {
                e.target.classList.add('clicked');
            }, 200);
        });
    });

    // When
    scenario.click("#my-div");

    // Then
    scenario.wait("#my-div.clicked");
    asserter.expect("#my-div.clicked").to.exist();


});

demoTestSuite.addTest("scenario.wait shall wait for a function to return true", function (scenario, asserter) {

    // Given 

    scenario.exec(function () {
        var myDiv = document.getElementById('my-div');
        myDiv.innerHTML = "click me";
        myDiv.addEventListener('click', function(e) {
            setTimeout(function() {
                e.target.classList.add('clicked');
            }, 200);
        });
    });

    // When
    scenario.click("#my-div");

    // Then
    scenario.wait(function() {
        var myDiv = document.getElementById('my-div');
        return myDiv.classList.contains("clicked");
    });
    asserter.expect("#my-div.clicked").to.exist();


});

window.onload = function () {
    setTimeout(function () {
        demoTestSuite.run();
    }, 500);
};