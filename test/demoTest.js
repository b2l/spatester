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
    asserter.assertThat('#my-div').to.have.attr('title', 'toto');
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
