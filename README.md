asserter
========

expect(domSelector)

vocabulaire

    .to.be
    .not.to.be

    .to.have
    .not.to.have

    .be

test :

    attr(attrName [, expectedAttrValue])
    className(expectedClass, [description])
    value(expectedValue [, description])
    text(expectedText [, description]) => check si le noeud contient le texte (n'importe où)
    checked([description])
    selected([description])
    matchSelector(selector [, description])
    empty([description]) => check si le noeud ne contient pas de text
    exist([description])
    hidden([description])
    visible([description])
    html(expectedHTML [, description]) => check si le noeud contient le code html en paramètre
    returnTrue(fn [, description]) => appel la function, passe si elle renvoie true
    returnFalse(fn [, description]) => appel la function, passe si elle renvoie false
    nodeLength(expectedNodeLength [, description]) => Nombre d'element matchant le selecteur
