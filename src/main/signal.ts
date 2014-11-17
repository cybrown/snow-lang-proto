class Signal <T> {

    private callbacks: {(data: T): void}[] = [];

    add (callback: (data: T) => void) {
        if (this.callbacks.indexOf(callback) === -1) {
            this.callbacks.push(callback);
        }
        return this;
    }

    remove (callback: (data: T) => void) {
        var index = this.callbacks.indexOf(callback);
        if (index !== -1) {
            this.callbacks.splice(index, 1);
        }
        return this;
    }

    clear () {
        this.callbacks.length = 0;
        return this;
    }

    trigger (data: T) {
        this.callbacks.forEach(callback => callback(data));
        return this;
    }
}

export = Signal;
