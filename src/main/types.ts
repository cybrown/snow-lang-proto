export class Type {
    serialize(): string {
        return '';
    }
    /**
     * Size on stack
     * Size on heap
     */
}

export class Void extends Type {

    serialize () {
        return 'V';
    }

    static instance = new Void();
}

export class Integer extends Type {

    constructor (private _bits: number, private _signed: boolean) {
        super();
    }

    serialize () {
        return (this._signed ? 'I' : 'U') + this._bits;
    }

    static INT32 = new Integer(32, true);
    static INT64 = new Integer(64, true);
    static UINT32 = new Integer(32, false);
    static UINT64 = new Integer(64, false);
}

export class Float extends Type {

    constructor (private _bits: number) {
        super();
    }

    serialize () {
        return 'F' + this._bits;
    }

    static FLOAT32 = new Float(32);
    static FLOAT64 = new Float(64);
}

export class Array extends Type {

    constructor (private _baseType: Type) {
        super();
    }

    serialize () {
        return '[' + this._baseType.serialize() + ']';
    }
}

export class Tuple extends Type {

    constructor (private _types: Type[]) {
        super();
    }

    serialize () {
        return '(' + this._types.map(type => type.serialize()).join(',') + ')';
    }
}

export class Func extends Type {

    constructor (
        private _args: Type[],
        private _returnType: Type
    ) {
        super();
    }

    serialize () {
        return 'F(' + this._args.map(type => type.serialize()).join(',') + ')=>' + this._returnType.serialize();
    }
}

export class Structure extends Type {

    constructor (private _types: {[key: string]: Type}) {
        super();
    }

    serialize () {
        return 'S(' + Object.keys(this._types).map(key => key + ':' + this._types[key].serialize()).join(',') + ')';
    }
    /**
     * List of types with names
     * Compute length
     * Compactness
     *
     * Limitations: Can not be recursive
     */
}

export class Optionnal extends Type {

    constructor (private _type: Type) {
        super();
    }

    serialize () {
        return 'O(' + this._type.serialize() + ')';
    }
}

class ManagedReference extends Type {

    constructor (private _type: Type) {
        super();
    }

    serialize () {
        return 'R(' + this._type.serialize() + ')';
    }
}

class Qualified extends Type {
    /**
     * Base type, qualifier
     */
}

class Interface extends Type {
    /**
     * Extended interfaces
     */
}

class Class extends Type {
    /**
     * Super class
     * Implemented interfaces
     * List of types with names
     * List of methods
     */
}

class Generic extends Type {
}
