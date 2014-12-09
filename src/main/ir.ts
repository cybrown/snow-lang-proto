import types = require('./types');
import Signal = require('./signal');

export class IrNode {

    static currentIrNodeId = 1;

    public _id: number;

    constructor () {
        this._id = IrNode.currentIrNodeId++;
    }

    get id () { return this._id; }
}

export class Module extends IrNode {
    funcs: Func[];
}

export class Func extends IrNode {

    constructor (
        private _module: Module,
        private _blocks: BasicBlock[],
        private _type: types.Func,
        private _name: string = null,
        private _argsName: string[] = null
    ) {
        super();
    }

    get type () { return this._type; }
    get blocks () { return this._blocks; }
    get name () { return this._name; }
    get argsName () { return this._argsName; }
}

export class BasicBlock extends IrNode {

    constructor (
        private _func: Func,
        private _values: ValueIrNode[],
        private _terminal: TerminalIrNode
    ) {
        super();
    }

    get func () { return this._func; }
    get values () { return this._values; }
    get terminal () { return this._terminal; }
}

//region TerminalIrNode
export class TerminalIrNode extends IrNode {

    constructor () {
        super();
    }
}

export class Jump extends TerminalIrNode {

    constructor (
        private _destination: BasicBlock
    ) {
        super();
    }

    get destination () {
        return this._destination;
    }
}

export class ConditionalJump extends TerminalIrNode {

    constructor (
        private _destinationTrue: BasicBlock,
        private _destinationFalse: BasicBlock
    ) {
        super();
    }

    get destinationTrue () {
        return this._destinationTrue;
    }

    get destinationFalse () {
        return this._destinationFalse;
    }
}

export class ReturnVoid extends TerminalIrNode {

    constructor () {
        super();
    }
}

export class ReturnValue extends TerminalIrNode {

    constructor (
        private _value: ValueIrNode
    ) {
        super();
    }

    get value() { return this._value; }
}
//endregion

//region ValueIrNode
export class ValueIrNode extends IrNode {

    public _type: types.Type;

    constructor () {
        super();
    }

    get type () { return this._type; }
}

export class Call extends ValueIrNode {

    constructor (
        private _func: Func,
        private _args: IrNode[]
    ) {
        super();
    }

    get func () { return this._func; }
    get args () { return this._args; }
}

export class IntegerConstant extends ValueIrNode {

    constructor (private _value: number) {
        super();
        this._type = types.Integer.INT32;
    }

    get value () { return this._value; }
}

export class Add extends ValueIrNode {

    constructor (
        private _left: IrNode,
        private _right: IrNode
        ) {
        super();
    }

    get left () { return this._left; }
    get right () { return this._right; }
}

export class Sub extends ValueIrNode {

    constructor (
        private _left: IrNode,
        private _right: IrNode
        ) {
        super();
    }

    get left () { return this._left; }
    get right () { return this._right; }
}
//endregion
