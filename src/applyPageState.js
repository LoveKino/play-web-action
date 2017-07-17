'use strict';

let {
    contain
} = require('bolzano');

module.exports = (node, action) => {
    let {
        attachedUIStates
    } = action;
    let windowInfo = attachedUIStates.window;

    // apply scoll information
    if (windowInfo) {
        window.scrollTo(windowInfo.pageXOffset, windowInfo.pageYOffset);
    }

    // apply page states
    let current = attachedUIStates.current;
    if (current) {
        let number = current.number;
        node.scrollLeft = current.scrollLeft;
        node.scrollTop = current.scrollTop;

        if (action.event.type === 'click' && isInputNumberNode(node) && number) {
            if (number.direction === 'up') {
                upInputNumber(node, current.value);
            } else if (number.direction === 'down') {
                downInputNumber(node, current.value);
            } else {
                node.value = current.value;
            }
        } else {
            if (isInputNumberNode(node) &&
                number &&
                !contain(['keyup', 'keydown', 'keypress'], action.event.type)
            ) {
                // just ignore
            } else {
                node.value = current.value;
            }
        }
    }
};

let isInputNumberNode = (node) => {
    return node.tagName === 'INPUT' && node.type === 'number';
};

let upInputNumber = (node, cur) => {
    let step = node.step || 1;
    let oldValue = Number(node.value);
    if (isNaN(oldValue)) {
        node.value = cur;
        return cur;
    }
    let value = Number(node.value) + step;
    if (node.max !== null &&
        node.max !== undefined &&
        !isNaN(Number(node.max))) {
        value = Math.min(Number(node.max), value);
    }

    node.value = value;
    return value;
};

let downInputNumber = (node, cur) => {
    let step = node.step || 1;
    let oldValue = Number(node.value);
    if (isNaN(oldValue)) {
        node.value = cur;
        return cur;
    }
    let value = Number(node.value) - step;
    if (node.min !== null &&
        node.min !== undefined &&
        !isNaN(Number(node.min))) {
        value = Math.max(Number(node.min), value);
    }

    node.value = value;
    return value;
};
