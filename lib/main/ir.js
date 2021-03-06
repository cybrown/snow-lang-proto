var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var types = require('./types');
var IrNode = (function () {
    function IrNode() {
        this._id = IrNode.currentIrNodeId++;
    }
    Object.defineProperty(IrNode.prototype, "id", {
        get: function () {
            return this._id;
        },
        enumerable: true,
        configurable: true
    });
    IrNode.currentIrNodeId = 1;
    return IrNode;
})();
exports.IrNode = IrNode;
var Module = (function () {
    function Module() {
    }
    return Module;
})();
exports.Module = Module;
var Func = (function (_super) {
    __extends(Func, _super);
    function Func(_module, _blocks, _type) {
        _super.call(this);
        this._module = _module;
        this._blocks = _blocks;
        this._type = _type;
    }
    Object.defineProperty(Func.prototype, "type", {
        get: function () {
            return this._type;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Func.prototype, "blocks", {
        get: function () {
            return this._blocks;
        },
        enumerable: true,
        configurable: true
    });
    return Func;
})(IrNode);
exports.Func = Func;
var BasicBlock = (function (_super) {
    __extends(BasicBlock, _super);
    function BasicBlock(_func, _values, _terminal) {
        _super.call(this);
        this._func = _func;
        this._values = _values;
        this._terminal = _terminal;
    }
    Object.defineProperty(BasicBlock.prototype, "func", {
        get: function () {
            return this._func;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BasicBlock.prototype, "values", {
        get: function () {
            return this._values;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BasicBlock.prototype, "terminal", {
        get: function () {
            return this._terminal;
        },
        enumerable: true,
        configurable: true
    });
    return BasicBlock;
})(IrNode);
exports.BasicBlock = BasicBlock;
//region TerminalIrNode
var TerminalIrNode = (function (_super) {
    __extends(TerminalIrNode, _super);
    function TerminalIrNode() {
        _super.call(this);
    }
    return TerminalIrNode;
})(IrNode);
exports.TerminalIrNode = TerminalIrNode;
var Jump = (function (_super) {
    __extends(Jump, _super);
    function Jump(_destination) {
        _super.call(this);
        this._destination = _destination;
    }
    Object.defineProperty(Jump.prototype, "destination", {
        get: function () {
            return this._destination;
        },
        enumerable: true,
        configurable: true
    });
    return Jump;
})(TerminalIrNode);
exports.Jump = Jump;
var ConditionalJump = (function (_super) {
    __extends(ConditionalJump, _super);
    function ConditionalJump(_destinationTrue, _destinationFalse) {
        _super.call(this);
        this._destinationTrue = _destinationTrue;
        this._destinationFalse = _destinationFalse;
    }
    Object.defineProperty(ConditionalJump.prototype, "destinationTrue", {
        get: function () {
            return this._destinationTrue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConditionalJump.prototype, "destinationFalse", {
        get: function () {
            return this._destinationFalse;
        },
        enumerable: true,
        configurable: true
    });
    return ConditionalJump;
})(TerminalIrNode);
exports.ConditionalJump = ConditionalJump;
var ReturnVoid = (function (_super) {
    __extends(ReturnVoid, _super);
    function ReturnVoid() {
        _super.call(this);
    }
    return ReturnVoid;
})(TerminalIrNode);
exports.ReturnVoid = ReturnVoid;
var ReturnValue = (function (_super) {
    __extends(ReturnValue, _super);
    function ReturnValue(_value) {
        _super.call(this);
        this._value = _value;
    }
    Object.defineProperty(ReturnValue.prototype, "value", {
        get: function () {
            return this._value;
        },
        enumerable: true,
        configurable: true
    });
    return ReturnValue;
})(TerminalIrNode);
exports.ReturnValue = ReturnValue;
//endregion
//region ValueIrNode
var ValueIrNode = (function (_super) {
    __extends(ValueIrNode, _super);
    function ValueIrNode() {
        _super.call(this);
    }
    return ValueIrNode;
})(IrNode);
exports.ValueIrNode = ValueIrNode;
var Call = (function (_super) {
    __extends(Call, _super);
    function Call(_func, _args) {
        _super.call(this);
        this._func = _func;
        this._args = _args;
    }
    Object.defineProperty(Call.prototype, "func", {
        get: function () {
            return this._func;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Call.prototype, "args", {
        get: function () {
            return this._args;
        },
        enumerable: true,
        configurable: true
    });
    return Call;
})(ValueIrNode);
exports.Call = Call;
var IntegerConstant = (function (_super) {
    __extends(IntegerConstant, _super);
    function IntegerConstant(_value) {
        _super.call(this);
        this._value = _value;
        this._type = types.Integer.INT32;
    }
    Object.defineProperty(IntegerConstant.prototype, "value", {
        get: function () {
            return this._value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IntegerConstant.prototype, "type", {
        get: function () {
            return this._type;
        },
        enumerable: true,
        configurable: true
    });
    return IntegerConstant;
})(ValueIrNode);
exports.IntegerConstant = IntegerConstant;
var Add = (function (_super) {
    __extends(Add, _super);
    function Add(_left, _right) {
        _super.call(this);
        this._left = _left;
        this._right = _right;
    }
    Object.defineProperty(Add.prototype, "left", {
        get: function () {
            return this._left;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Add.prototype, "right", {
        get: function () {
            return this._right;
        },
        enumerable: true,
        configurable: true
    });
    return Add;
})(ValueIrNode);
exports.Add = Add;
var Sub = (function (_super) {
    __extends(Sub, _super);
    function Sub(_left, _right) {
        _super.call(this);
        this._left = _left;
        this._right = _right;
    }
    Object.defineProperty(Sub.prototype, "left", {
        get: function () {
            return this._left;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sub.prototype, "right", {
        get: function () {
            return this._right;
        },
        enumerable: true,
        configurable: true
    });
    return Sub;
})(ValueIrNode);
exports.Sub = Sub;
