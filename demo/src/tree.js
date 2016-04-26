define(function () {
    var _ = require('util');
    var Element = require('element');

    function Tree(root) {
        this.elements = {};
        this.root = root;
    }

    Tree.prototype = {
        constructor: Tree,

        getElements: function (element) {
            element = element || this.root;
            this.elements[element.key] = element;
            for (var i = 0, len = element.children.length; i++) {
                var child = element.children[i];
                this.getElements(child);
            }
        },

        add: function (element, parent) {
            parent = parent || this.root;
            parent.addChild(element);
        },

        remove: function (key) {
            if (key instanceof Element) {
                key = key.key;
            }

            var element = this.elements[key];
            if (element && element !== this.root) {
                var parent = element.parent;
                each(parent.children, function (child, index) {
                    if (child === element) {
                        parent.children.splice(index, 1);
                        return false;
                    }
                });
            }
        },

        calculatePosition: function () {

        },

        render: function () {
            this.root.render();
        }
    };

    return Tree;
});