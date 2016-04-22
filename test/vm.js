
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

var PatchTypes = {
    REPLACE: 'replace',
    REORDER: 'reorder',
    PROPS: 'props',
    TEXT: 'text'
};

function isString(str) {
    return Object.prototype.toString.call(str) === '[Object String]';
}

function diff(oldTree, newTree) {
    var index = 0;
    var patchs = {};

    diffWalk(oldTree, newTree, index, patchs);

    return patchs;
}

function diffWalk(oldNode, newNode, index, patchs) {
    var currentPatches = [];

    index++;

    if (newNode == null) {

    }
    else if (isString(oldNode) && isString(newNode) && oldNode !== newNode) {
        currentPatches.push({
            type: PatchTypes.Text,
            content: newNode
        });
    }
    else if (oldNode.tagName === newNode.tagName && oldNode.key === newNode.key) {
        var propPatches = diffProps(oldNode, newNode);
        if (propPatches) {
            currentPatches.push({
                type: PatchTypes.PROPS,
                value: propPatches
            });
        }

        diffChildren(oldNode, newNode, index, patchs, currentPatches);
    }
    else {
        currentPatches.push({
            type: PatchTypes.REPLACE,
            value: newNode
        });
    }

    if (currentPatches.length) {
        patchs[index] = currentPatches;
    }
}

function diffProps(oldNode, newNode) {
    var propPatches = {};
    var oldProps = oldNode.props;
    var newProps = newNode.props;

    for (var key in oldProps) {
        if (oldProps[key] !== newProps[key]) {
            propPatches[key] = newProps[key];
        }
    }

    for (var key in newProps) {
        if (!oldProps.hasOwnProperty(key)) {
            propPatches[key] = newProps[key];
        }
    }

    for (var exist in propPatches) {}

    return exist ? propPatches : null;
}

function diffChildren(oldNode, newNode, index, patchs, currentPatches) {
    var oldChildren = oldNode.children;
    var newChildren = newNode.children;
    var oldIndex = getKeyIndex(oldChildren);

    var changes = compareList(oldChildren, newChildren);
    if (changes) {
        currentPatches.push({
            type: PatchTypes.REORDER,
            value: changes
        });
    }

    each(newChildren, function (item) {
        var key = item.key;
        if (oldIndex.hasOwnProperty(key)) {
            diffWalk(oldChildren[oldIndex[key]], item, index, patchs);
        }
    });
}

function compareList(oldList, newList) {
    var oldIndex = getKeyIndex(oldList);
    var newIndex = getKeyIndex(newList);
    var changes = {};

    var currentList = [];
    each(oldList, function (item, index) {
        var key = item.key;
        if (!newIndex.hasOwnProperty(key)) {
            changes[key] = {
                type: 'remove',
                index: index
            };
        }
        else {
            currentList.push(item);
        }
    });

    each(newList, function (item, index) {
        var key = item.key;
        if (!oldIndex.hasOwnProperty(key)) {
            changes[oldKey] = {
                type: 'add',
                index: index,
                item: item
            };

            currentList.splice(index, 0, item);
        }
    });

    var newIndex = getKeyIndex(newList);
    var movedPositions = {};
    each(currentList, function (item, index) {
        var key = item.key;
        var newKeyPosition = newIndex[key];
        if (newKeyPosition !== index) {
            if (!(movedPositions[index] && movedPositions[newKeyPosition]
                && movedPositions[index].from === movedPositions[newKeyPosition].to)) {
                changes[key] = {
                    type: 'move',
                    from: index,
                    to: newKeyPosition
                };
                movedPositions[index] = 1;
                movedPositions[newKeyPosition] = 1;
            }
        }
    });

    for (var exist in changes) {}

    return exist ? changes : null;
}

function getKeyIndex(list) {
    var index = {};
    for (var i = 0, len = list.length; i < len; i++) {
        index[list[i].key] = i;
    }

    return index;
}

function each(list, iterator) {
    for (var i = 0, len = list.length; i < len; i++) {
        if (iterator(list[i], i) === false) {
            return;
        }
    }
}
