var Event = function() {
    this.id = 0;
    this.handlers = {};
}

Event.prototype.add = function(callback) {
    var id = ++this.id;
    this.handlers[id] = callback;
    return id;
}

Event.prototype.remove = function(id) {
    delete this.handlers[id];
}

Event.prototype.fire = function() {
    for (var key in this.handlers) {
        if (this.handlers.hasOwnProperty(key)) {
            this.handlers[key].apply(this, arguments);
        }
    }
}

module.exports = Event;
