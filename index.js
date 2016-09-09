'use strict';

let {
    findNode
} = require('find-dom-node');

let {
    map
} = require('bolzano');

/**
 *
 * action interface
 *
 *      waitTimeout
 *      waitTime
 *      refreshWaitTime
 *
 *      event
 *      source
 *      attachedUIStates
 */

let id = v => v;

module.exports = (action, {
    log = id
} = {}) => {
    let similarityFailThreshold = action.similarityFailThreshold || 0.05;

    // after before
    log('start to find target node');
    // step 1: find the target node
    let {
        node, degree
    } = findNode(action.source, {
        similarityFailThreshold,
        selector: action.selector
    });

    log(`find node with degree ${degree}`);
    // step2: apply some page states
    // ! must apply some states first, before
    // dispatch events.
    // eg: input event and target.value
    applyPageState(node, action.attachedUIStates);

    // step3: dispatch the event
    dispatchEvent(node, action.event);
};

let applyPageState = (node, attachedUIStates) => {
    let windowInfo = attachedUIStates.window;
    if (windowInfo) {
        window.scrollTo(windowInfo.pageXOffset, windowInfo.pageYOffset);
    }

    let current = attachedUIStates.current;
    if (current) {
        for (let name in current) {
            node[name] = current[name];
        }
    }
};

let dispatchEvent = (node, eInfo) => {
    let type = eInfo.type;
    // trigger event
    let EventClz = window[eInfo.__proto__source];
    let event = new EventClz(type, convertEventInfo(eInfo, node));
    // TODO bug
    //event.isTrusted = true;
    node.dispatchEvent(event);
};

let convertEventInfo = (eInfo, node) => {
    let type = eInfo.type;
    if (type === 'touchstart' ||
        type === 'touchmove' ||
        type === 'touchend' ||
        type === 'touchcancel') {

        eInfo.touches = getTouches(eInfo.touches, node);
        eInfo.changedTouches = getTouches(eInfo.changedTouches, node);
        eInfo.targetTouches = getTouches(eInfo.targetTouches, node);
    }
    return eInfo;
};

let getTouches = (touches = [], node) => {
    return map(touches, (touch) => {
        touch.target = node;
        return new Touch(touch);
    });
};
