var Asserter = require('../../src/asserter');
var asserter = new Asserter(null);

// --- nodeLength
test("assert fail nodeLength should give us a human readable message", function() {
    var div = document.createElement('div');
    div.setAttribute('id', 'my-div');
    document.body.appendChild(div);

    try {
        asserter.expect('#my-div').to.have.nodeLength(2);
    } catch (e) {
        equal(e.message, 'Expect #my-div to match 2 node in the DOM');
    }

    document.body.removeChild(div);
});

test("assert fail not.nodeLength should give us a human readable message", function() {
    var div = document.createElement('div');
    div.setAttribute('id', 'my-div');
    document.body.appendChild(div);

    try {
        asserter.expect('#my-div').not.to.have.nodeLength(1);
    } catch (e) {
        equal(e.message, 'Expect #my-div NOT to match 1 node in the DOM');
    }

    document.body.removeChild(div);
});

// --- className
test("assert fail className should give us a human readable message", function() {
    var div = document.createElement('div');
    div.setAttribute('id', 'my-div');
    document.body.appendChild(div);

    try {
        asserter.expect('#my-div').to.have.className('titi');
    } catch (e) {
        equal(e.message, 'Expect #my-div to have class "titi"');
    }

    document.body.removeChild(div);
});

test("assert fail not.className should give us a human readable message", function() {
    var div = document.createElement('div');
    div.setAttribute('id', 'my-div');
    div.classList.add('titi');
    document.body.appendChild(div);

    try {
        asserter.expect('#my-div').not.to.have.className('titi');
    } catch (e) {
        equal(e.message, 'Expect #my-div not to have class "titi"');
    }

    document.body.removeChild(div);
});

// --- attr
test("assert fail attr should give us a human readable message", function() {
    try {
        asserter.expect('body').to.have.attr('toto');
    } catch (e) {
        equal(e.message, "Expect body to have attribute toto");
    }
});

test("assert fail not.attr should give us a human readable message", function() {
    document.body.setAttribute('toto');
    try {
        asserter.expect('body').not.to.have.attr('toto');
    } catch (e) {
        equal(e.message, "Expect body not to have attribute toto");
    }

    document.body.removeAttribute('toto');
});

// --- value
test("assert fail value should give us a human readable message", function() {
    var div = document.createElement('div');
    div.setAttribute('id', 'my-div');
    div.classList.add('titi');
    div.innerHTML = "<input type='text' id='my-input' />"
    document.body.appendChild(div);
    try {
        asserter.expect('#my-input').to.have.value('toto');
    } catch (e) {
        equal(e.message, 'Expect #my-input to have value "toto"');
    }
    document.body.removeChild(div);
});

test("assert fail not.value should give us a human readable message", function() {
    var div = document.createElement('div');
    div.setAttribute('id', 'my-div');
    div.classList.add('titi');
    div.innerHTML = "<input type='text' id='my-input' value='toto'/>"
    document.body.appendChild(div);

    try {
        asserter.expect('#my-input').to.not.have.value('toto');
    } catch (e) {
        equal(e.message, 'Expect #my-input not to have value "toto"');
    }

    document.body.removeChild(div);
});

// --- text
test("assert fail text should give us a human readable message", function() {
    try {
        asserter.expect('body').to.have.text('hello world !');
    } catch (e) {
        equal(e.message, 'Expect body to contain text "hello world !"');
    }
});
test("assert fail not.text should give us a human readable message", function() {
    var div = document.createElement('div');
    div.setAttribute('id', 'my-div');
    document.body.appendChild(div);
    document.getElementById('my-div').innerHTML = "hello world !";

    try {
        asserter.expect('body').not.to.have.text('hello world !');
    } catch (e) {
        equal(e.message, 'Expect body not to contain text "hello world !"');
    }

    document.body.removeChild(div);
});

// --- checked
test("assert fail checked shoud give us a human readable message", function() {
    var div = document.createElement('div');
    div.setAttribute('id', 'my-div');
    div.innerHTML = "<input type='radio' id='selected' value='1' /><input type='radio' id='not-selected' value='2'>";
    document.body.appendChild(div);

    try {
        asserter.expect('#selected').to.be.checked();
    } catch (e) {
        equal(e.message, "Expect #selected to be checked");
    }

    document.body.removeChild(div);
});

test("assert fail not.checked shoud give us a human readable message", function() {
    var div = document.createElement('div');
    div.setAttribute('id', 'my-div');
    div.innerHTML = "<input type='checkbox' id='selected' value='1' /><input type='checkbox' id='not-selected' value='2'>";
    document.body.appendChild(div);

    document.getElementById('selected').click();

    try {
        asserter.expect('#selected').not.to.be.checked();
    } catch (e) {
        equal(e.message, "Expect #selected not to be checked");
    }

    document.body.removeChild(div);
});

// --- selected
test("assert fail selected shoud give us a human readable message", function() {
    var div = document.createElement('div');
    div.setAttribute('id', 'my-div');
    var content = [
        "<select>",
        "<option id='not-selected' value='1'>1</option>",
        "<option id='selected' value='2'>2</option>",
        "</select>"
    ];
    div.innerHTML = content.join('');
    document.body.appendChild(div);

    try {
        asserter.expect('#selected').to.be.selected();
    } catch (e) {
        equal(e.message, "Expect #selected to be selected");
    }

    document.body.removeChild(div);
});

test("assert fail not.selected shoud give us a human readable message", function() {
    var div = document.createElement('div');
    div.setAttribute('id', 'my-div');
    var content = [
        "<select id='list'>",
        "<option id='not-selected' value='1'>1</option>",
        "<option id='selected' value='2'>2</option>",
        "</select>"
    ];
    div.innerHTML = content.join('');
    document.body.appendChild(div);

    var list = document.getElementById('list');
    list.click();
    document.getElementById('selected').click();
    list.selectedIndex = 1;

    try {
        asserter.expect('#selected').not.to.be.selected();
    } catch (e) {
        equal(e.message, "Expect #selected not to be selected");
    }

    document.body.removeChild(div);
});

// --- matchSelector
test("assert fail matchSelector should give us a human readable message", function() {
    var div = document.createElement('div');
    div.setAttribute('id', 'my-div');
    document.body.appendChild(div);

    try {
        asserter.expect('#my-div').to.matchSelector('#toto #my-div');
    } catch (e) {
        equal(e.message, 'Expect #my-div to match selector "#toto #my-div"');
    }

    document.body.removeChild(div);
});

test("assert fail not.matchSelector should give us a human readable message", function() {
    var div = document.createElement('div');
    div.setAttribute('id', 'my-div');
    document.body.appendChild(div);

    try {
        asserter.expect('#my-div').not.to.matchSelector('#my-div');
    } catch (e) {
        equal(e.message, 'Expect #my-div not to match selector "#my-div"');
    }

    document.body.removeChild(div);
});

// --- empty
test("assert fail empty should give us a human readable message", function() {
    var div = document.createElement('div');
    div.setAttribute('id', 'my-div');
    div.innerHTML = "toto";
    document.body.appendChild(div);

    try {
        asserter.expect('#my-div').to.be.empty();
    } catch (e) {
        equal(e.message, 'Expect #my-div to be empty');
    }

    document.body.removeChild(div);
});

test("assert fail not.empty should give us a human readable message", function() {
    var div = document.createElement('div');
    div.setAttribute('id', 'my-div');
    document.body.appendChild(div);

    try {
        asserter.expect('#my-div').not.to.be.empty();
    } catch (e) {
        equal(e.message, 'Expect #my-div not to be empty');
    }

    document.body.removeChild(div);
});

// --- exist
test("assert fail exist should give us a human readable message", function() {
    try {
        asserter.expect('#my-div').to.exist();
    } catch (e) {
        equal(e.message, "Expect #my-div to be in the DOM");
    }
});

test("assert fail not.exist should give us a human readable message", function() {
    try {
        asserter.expect('body').not.to.exist();
    } catch (e) {
        equal(e.message, "Expect body not to be in the DOM");
    }
});

// --- hidden
test("assert fail hidden should give us a human readable message", function() {
    var div = document.createElement('div');
    div.setAttribute('id', 'my-div');
    document.body.appendChild(div);

    try {
        asserter.expect('#my-div').to.be.hidden();
    } catch (e) {
        equal(e.message, 'Expect #my-div to be hidden');
    }

    document.body.removeChild(div);
});
test("assert fail not.hidden should give us a human readable message", function() {
    var div = document.createElement('div');
    div.setAttribute('id', 'my-div');
    div.style.display = "none";
    document.body.appendChild(div);

    try {
        asserter.expect('#my-div').not.to.be.hidden();
    } catch (e) {
        equal(e.message, 'Expect #my-div not to be hidden');
    }

    document.body.removeChild(div);
});

// --- visible
test("assert fail visible should give us a human readable message", function() {
    var div = document.createElement('div');
    div.setAttribute('id', 'my-div');
    div.style.display = "none";
    document.body.appendChild(div);

    try {
        asserter.expect('#my-div').to.be.visible();
    } catch (e) {
        equal(e.message, 'Expect #my-div to be visible');
    }

    document.body.removeChild(div);
});

test("assert fail not.visible should give us a human readable message", function() {
    var div = document.createElement('div');
    div.setAttribute('id', 'my-div');
    document.body.appendChild(div);

    try {
        asserter.expect('#my-div').not.to.be.visible();
    } catch (e) {
        equal(e.message, 'Expect #my-div not to be visible');
    }

    document.body.removeChild(div);
});

// --- html
test("assert fail html should give us a human readable message", function() {
    var div = document.createElement('div');
    div.setAttribute('id', 'my-div');
    document.body.appendChild(div);

    try {
        asserter.expect('#my-div').to.have.html("<input />");
    } catch (e) {
        equal(e.message, 'Expect #my-div to contain html "<input />"');
    }

    document.body.removeChild(div);
});

test("assert fail not.html should give us a human readable message", function() {
    var div = document.createElement('div');
    div.setAttribute('id', 'my-div');
    div.innerHTML = "<div></div>";
    document.body.appendChild(div);

    try {
        asserter.expect('#my-div').not.to.have.html("<div></div>");
    } catch (e) {
        equal(e.message, 'Expect #my-div not to contain html "<div></div>"');
    }

    document.body.removeChild(div);
});

// --- returnTrue

// --- returnFalse