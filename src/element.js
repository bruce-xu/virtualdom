
function VirtualNode(tagName, props, children) {
    if (props instanceof Array) {
        children = props;
        props = {};
    }

    this.tagName = tagName.toLowerCase();
    this.props = props || {};
    this.children = children || [];
    this.key = this.props.key;

    var count = 0;
    var child;
    for (var i = 0, len = this.children.length; i < len; i++) {
        child = this.children[i];
        if (child instanceof VirtualNode) {
            count += child.count;
        }
        else {
            this.children[i] = '' + child;
        }
        count++;
    }

    this.count = count;
}

VirtualNode.prototype.addChild = function (child) {
    this.children.push(child);
};

VirtualNode.prototype.render = function () {
    var ele = document.createElement(this.tagName);

    var props = this.props;
    for (var key in props) {
        if (props.hasOwnProperty(key)) {
            setProperty(ele, key, props[key]);
        }
    }

    var children = this.children;
    var child;
    for (var i = 0, len = children.length; i < len; i++) {
        child = children[i];
        if (child instanceof VirtualNode) {
            child = child.render();
        }
        else {
            child = document.createTextNode(child);
        }

        ele.appendChild(child);
    }

    return ele;
};

function setProperty(ele, name, value) {
    switch (name) {
        case 'class':
            ele.className = value;
            break;
        case 'style':
            ele.style.cssText = value;
            break;
        case 'value':
            if (/^input|textarea$/i.test(ele.tagName)) {
                ele.value = value;
            }
            else {
                ele.setAttribute(name, value);
            }
            break;
        default:
            ele.setAttribute(name, value);
            break;
    }
}

module.exports = VirtualNode;
