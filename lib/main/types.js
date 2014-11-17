var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Type = (function () {
    function Type() {
    }
    Type.prototype.serialize = function () {
        return '';
    };
    return Type;
})();
exports.Type = Type;
var Void = (function (_super) {
    __extends(Void, _super);
    function Void() {
        _super.apply(this, arguments);
    }
    Void.prototype.serialize = function () {
        return 'V';
    };
    Void.instance = new Void();
    return Void;
})(Type);
exports.Void = Void;
var Integer = (function (_super) {
    __extends(Integer, _super);
    function Integer(_bits, _signed) {
        _super.call(this);
        this._bits = _bits;
        this._signed = _signed;
    }
    Integer.prototype.serialize = function () {
        return (this._signed ? 'I' : 'U') + this._bits;
    };
    Integer.INT32 = new Integer(32, true);
    Integer.INT64 = new Integer(64, true);
    Integer.UINT32 = new Integer(32, false);
    Integer.UINT64 = new Integer(64, false);
    return Integer;
})(Type);
exports.Integer = Integer;
var Float = (function (_super) {
    __extends(Float, _super);
    function Float(_bits) {
        _super.call(this);
        this._bits = _bits;
    }
    Float.prototype.serialize = function () {
        return 'F' + this._bits;
    };
    Float.FLOAT32 = new Float(32);
    Float.FLOAT64 = new Float(64);
    return Float;
})(Type);
exports.Float = Float;
var Array = (function (_super) {
    __extends(Array, _super);
    function Array(_baseType) {
        _super.call(this);
        this._baseType = _baseType;
    }
    Array.prototype.serialize = function () {
        return '[' + this._baseType.serialize() + ']';
    };
    return Array;
})(Type);
exports.Array = Array;
var Tuple = (function (_super) {
    __extends(Tuple, _super);
    function Tuple(_types) {
        _super.call(this);
        this._types = _types;
    }
    Tuple.prototype.serialize = function () {
        return '(' + this._types.map(function (type) { return type.serialize(); }).join(',') + ')';
    };
    return Tuple;
})(Type);
exports.Tuple = Tuple;
var Func = (function (_super) {
    __extends(Func, _super);
    function Func(_args, _returnType) {
        _super.call(this);
        this._args = _args;
        this._returnType = _returnType;
    }
    Func.prototype.serialize = function () {
        return 'F(' + this._args.map(function (type) { return type.serialize(); }).join(',') + ')=>' + this._returnType.serialize();
    };
    return Func;
})(Type);
exports.Func = Func;
var Structure = (function (_super) {
    __extends(Structure, _super);
    function Structure(_types) {
        _super.call(this);
        this._types = _types;
    }
    Structure.prototype.serialize = function () {
        var _this = this;
        return 'S(' + Object.keys(this._types).map(function (key) { return key + ':' + _this._types[key].serialize(); }).join(',') + ')';
    };
    return Structure;
})(Type);
exports.Structure = Structure;
var Optionnal = (function (_super) {
    __extends(Optionnal, _super);
    function Optionnal(_type) {
        _super.call(this);
        this._type = _type;
    }
    Optionnal.prototype.serialize = function () {
        return 'O(' + this._type.serialize() + ')';
    };
    return Optionnal;
})(Type);
exports.Optionnal = Optionnal;
var ManagedReference = (function (_super) {
    __extends(ManagedReference, _super);
    function ManagedReference(_type) {
        _super.call(this);
        this._type = _type;
    }
    ManagedReference.prototype.serialize = function () {
        return 'R(' + this._type.serialize() + ')';
    };
    return ManagedReference;
})(Type);
var Qualified = (function (_super) {
    __extends(Qualified, _super);
    function Qualified() {
        _super.apply(this, arguments);
    }
    return Qualified;
})(Type);
var Interface = (function (_super) {
    __extends(Interface, _super);
    function Interface() {
        _super.apply(this, arguments);
    }
    return Interface;
})(Type);
var Class = (function (_super) {
    __extends(Class, _super);
    function Class() {
        _super.apply(this, arguments);
    }
    return Class;
})(Type);
var Generic = (function (_super) {
    __extends(Generic, _super);
    function Generic() {
        _super.apply(this, arguments);
    }
    return Generic;
})(Type);
