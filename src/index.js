'use strict';

let {
    map
} = require('bolzano');

let {
    serializeNode
} = require('serialize-front');

let pageNodesCollector = require('./pageNodesCollector');

let PlayNodeCache = require('./playNodeCache');

let {
    findMostSimilarNode
} = require('dom-node-similarity');

let applyPageState = require('./applyPageState');

/**
 * play web action
 *
 * action interface
 *      event
 *      source
 *      attachedUIStates
 */

module.exports = () => {
    let {
        collectPageNodes, getNode
    } = pageNodesCollector();

    let {
        setCache, getCachedNode
    } = PlayNodeCache();

    let getNodeInfo = (aliveNodeId) => {
        // successfully find node
        let node = getNode(aliveNodeId);

        let nodeInfo = serializeNode(node, {
            style: true,
            textContent: true
        });

        nodeInfo.aliveNodeId = aliveNodeId;
        return nodeInfo;
    };

    let restoreNodeState = (aliveNodeId, action) => {
        // set cache
        setCache(action.source, aliveNodeId);

        let node = getNode(aliveNodeId);

        // this will happen when page freshed
        // TODO using lambda to connect queryNode and applyAction
        if (!node) return;

        // apply some page states
        // ! must apply some states first, before
        // dispatch events.
        // eg: input event and target.value
        applyPageState(node, action);
    };

    let dispatchEvent = (aliveNodeId, action) => {
        let node = getNode(aliveNodeId);

        // this will happen when page freshed
        // TODO using lambda to connect queryNode and applyAction
        if (!node) return;

        // step3: dispatch the event
        triggerEvent(node, action.event);
    };

    let findNode = (nodeInfos, action, similarityFailThreshold = 0) => {
        // find the most possibility one
        let {
            index, degree
        } = findMostSimilarNode(nodeInfos, action.source);

        if (degree < similarityFailThreshold) {
            throw new Error(`node similarity degree is ${degree} lower than ${similarityFailThreshold}. finded node is ${nodeInfos[index]}, source is ${JSON.stringify(action.source)}`);
        }

        let aliveNodeId = nodeInfos[index].aliveNodeId;

        return {
            index, degree, aliveNodeId
        };
    };

    return {
        restoreNodeState,
        dispatchEvent,
        getCachedNode,
        collectPageNodes,
        getNodeInfo,
        findNode
    };
};

let triggerEvent = (node, eInfo) => {
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
