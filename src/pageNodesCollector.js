'use strict';

let {
    getAttributes, serializeStyle
} = require('serialize-front');

let {
    getNodeText
} = require('page-text');

let {
    contain, map
} = require('bolzano');

let idgener = require('idgener');

/**
 * get all nodes of the page and retrive it by id
 */
module.exports = () => {
    let nodeMap = {};

    // TODO nodeInfos may very big, so send it by block
    let collectPageNodes = () => {
        let nodeInfos = getAllNodeInfos(document, [], 0, nodeMap);

        nodeInfos = map(nodeInfos, (item) => {
            item.path = formatPath(item.path);
            return item;
        });

        return nodeInfos;
    };

    let getNode = (aliveNodeId) => {
        return nodeMap[aliveNodeId];
    };

    return {
        collectPageNodes,
        getNode
    };
};

const filterTags = ['HEAD', 'SCRIPT', 'LINK', 'META', 'NOSCRIPT', 'STYLE', 'TITLE', 'BASE'];

let getBaisicNodeInfo = (node, index) => {
    let tagName = node.tagName || node.nodeName;
    let nodeType = node.nodeType;
    let attributes = getAttributes(node);

    return {
        tagName,
        nodeType,
        index,
        attributes,
        style: serializeStyle(node)
    };
};

let getAllNodeInfos = (node, path = [], index = 0, nodeMap) => {
    let rets = [];

    let children = node.childNodes;
    let childLen = children.length;
    let textContent = getNodeText(node);

    let nodeInfo = getBaisicNodeInfo(node, index);

    for (let i = 0; i < childLen; i++) {
        let child = children[i];
        if (child.nodeType === 3) { // text node
            textContent += child.textContent || '';
        } else if (!contain(filterTags, child.tagName) && child.nodeType === 1) {
            let passPath = path.slice(0);
            passPath.unshift(nodeInfo);

            let childRets = getAllNodeInfos(child, passPath, i, nodeMap);
            let childInfo = childRets[childRets.length - 1];
            let childStyle = childInfo.node.style;

            if (!childStyle || childStyle.style.display !== 'none') {
                textContent += childInfo.node.textContent;
            }

            rets = rets.concat(childRets);
        }
    }

    nodeInfo.textContent = textContent;

    let aliveNodeId = idgener();

    // push current node info as last one
    rets.push({
        node: nodeInfo,
        path,
        aliveNodeId
    });

    // cache node
    nodeMap[aliveNodeId] = node;
    return rets;
};

let formatPath = (path) => {
    return map(path, ({
        attributes, index, nodeType, tagName, textContent
    }, i) => {
        return i > 2 ? {
            attributes,
            index, nodeType, tagName
        } : {
            attributes,
            index, nodeType, tagName, textContent
        };
    });
};
