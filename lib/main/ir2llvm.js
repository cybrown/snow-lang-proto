var ir = require('./ir');
var types = require('./types');
var Ir2llvm = (function () {
    function Ir2llvm() {
        this._typeTranslator = new IrType2llvm();
        this._result = '';
    }
    Ir2llvm.prototype.translate = function (node) {
        if (node instanceof ir.IntegerConstant) {
            this.translateIntegerConstant(node);
        }
        else if (node instanceof ir.Func) {
            this.translateFunc(node);
        }
        else if (node instanceof ir.BasicBlock) {
            this.translateBasicBlock(node);
        }
        else if (node instanceof ir.ReturnValue) {
            this.translateReturnValue(node);
        }
        else if (node instanceof ir.Module) {
            this.translateModule(node);
        }
        else {
            throw new Error('Unknown node type: ' + Object.getPrototypeOf(node).constructor.name);
        }
    };
    Ir2llvm.prototype.get = function () {
        return this._result;
    };
    Ir2llvm.prototype.translateModule = function (node) {
        var _this = this;
        node.funcs.forEach(function (func) { return _this.translateFunc(func); });
    };
    Ir2llvm.prototype.translateIntegerConstant = function (node) {
        //this._result += '\n  ' + this.inline(node) + ' = ' + this._typeTranslator.translate(node.type) + ' ' + node.value;
    };
    Ir2llvm.prototype.translateFunc = function (node) {
        var _this = this;
        var name = node.name;
        if (name == null) {
            name = 'func' + node.id;
        }
        this._result = 'define ' + this._typeTranslator.translate(node.type.returnType) + ' @' + name + '(';
        var argIndex = 0;
        this._result += node.type.argumentsType.map(function (type) { return _this._typeTranslator.translate(type) + ' %arg' + argIndex++; }).join(', ');
        this._result += ') {';
        node.blocks.forEach(function (block) { return _this.translate(block); });
        this._result += '\n}';
    };
    Ir2llvm.prototype.translateBasicBlock = function (node) {
        var _this = this;
        node.values.forEach(function (node) {
            _this.translate(node);
        });
        this.translate(node.terminal);
    };
    Ir2llvm.prototype.translateReturnValue = function (node) {
        this.translate(node.value);
        this._result += '\n  ret ' + this._typeTranslator.translate(node.value.type) + ' ' + this.inline(node.value);
    };
    Ir2llvm.prototype.inline = function (node) {
        if (node instanceof ir.IntegerConstant) {
            return String(node.value);
        }
        else {
            throw new Error('Unknown type for inlining: ' + Object.getPrototypeOf(node).constructor.name);
        }
    };
    return Ir2llvm;
})();
exports.Ir2llvm = Ir2llvm;
var IrType2llvm = (function () {
    function IrType2llvm() {
    }
    IrType2llvm.prototype.translate = function (type) {
        if (type instanceof types.Integer) {
            return this.translateTypeInteger(type);
        }
        else {
            throw new Error('Unknown type');
        }
    };
    IrType2llvm.prototype.translateTypeInteger = function (type) {
        return 'i' + type.bits;
    };
    return IrType2llvm;
})();
exports.IrType2llvm = IrType2llvm;
