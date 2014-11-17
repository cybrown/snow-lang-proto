var Signal = (function () {
    function Signal() {
        this.callbacks = [];
    }
    Signal.prototype.add = function (callback) {
        if (this.callbacks.indexOf(callback) === -1) {
            this.callbacks.push(callback);
        }
        return this;
    };
    Signal.prototype.remove = function (callback) {
        var index = this.callbacks.indexOf(callback);
        if (index !== -1) {
            this.callbacks.splice(index, 1);
        }
        return this;
    };
    Signal.prototype.clear = function () {
        this.callbacks.length = 0;
        return this;
    };
    Signal.prototype.trigger = function (data) {
        this.callbacks.forEach(function (callback) { return callback(data); });
        return this;
    };
    return Signal;
})();
module.exports = Signal;
