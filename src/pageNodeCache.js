'use strict';

module.exports = () => {
    /**
     * nodeMap = {
     *     domNodeId: node
     * }
     *
     * used to cache finding results
     */
    let nodeMap = {};

    let setCache = (source, aliveNodeId) => {
        if (source.domNodeId) nodeMap[source.domNodeId] = aliveNodeId;
    };

    let getCachedNode = (source) => {
        return nodeMap[source.domNodeId] || false;
    };

    return {
        setCache,
        getCachedNode
    };
};
