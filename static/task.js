var searchButton = document.getElementById('search-button'),
    inputField = document.getElementById('lookup-search')
    resultContainer = document.getElementById('result-section');

searchButton.onclick = function(event) {
    var nodeValue = inputField.value;
    if (!nodeValue){
        resultContainer.innerHTML = 'Please provide an input';
        return
    }
    resultContainer.innerHTML = 'Searching....';
    var nodeSearch = new OneCom.SearchNode(nodeValue);

    setTimeout(function(){
        resultContainer.innerHTML = nodeSearch.getPath();
    }, 500)

};



OneCom = {};

OneCom.Node = function(nodeValue, parentNode) {
    this.node = nodeValue;
    this.parentNode = parentNode;
}


OneCom.SearchNode = function(node) {
    this.node = node;
    this.lookup = new TreeLookup();
    this.visitedNodes = new Set();
    this.queue = [];
    this.rootNode = new OneCom.Node('/', null);
    this.foundNode = null;
    this.promises = [];
    this.lookup.getChildrenAsCallback(this.rootNode.node, function(err, nodes) {
        if (typeof(err)=='undefined') {
            return
        }
        this.performSearch(nodes, this.rootNode);
    }.bind(this));
}

OneCom.SearchNode.prototype.addToQueue = function(element) {
    if (!this.visitedNodes.has(element.node)) {
        this.visitedNodes.add(element.node);
        this.queue.push(element)
    }
}

OneCom.SearchNode.prototype.removeFromQueue = function() {
    return this.queue.shift();
}

OneCom.SearchNode.prototype.performSearch = function(nodes, parentNode) {
    var foundNode = false;
    for(var i=0; i<nodes.length; i++) {
        var element = new OneCom.Node(nodes[i], parentNode);

        this.addToQueue(element);
        if (element.node == this.node) {
            this.foundNode = element;
            foundNode = true;
            break;
        }
    }
    if (!foundNode) {
        var element = this.removeFromQueue();
        if (element === undefined) {
            return
        }
        var promise = this.lookup.getChildrenAsPromise('/' + element.node)
        this.promises.push(promise);
        promise.then(function(nodes) {
            this.performSearch(nodes, element);
        }.bind(this));
    }
}

OneCom.SearchNode.prototype.getPath = function() {
    if (this.foundNode) {
        var path = [];
        var node = this.foundNode;
        while(node.parentNode != null) {
            path.unshift(node.node);
            node = node.parentNode;
        }
        return '{Root} --> ' + path.join(' --> ')
    }
    return 'Searched item not available'
}
