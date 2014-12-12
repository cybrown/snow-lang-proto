var ir = require('./ir');
var IrWalker = (function () {
    function IrWalker(delegate) {
        this.delegate = delegate;
    }
    IrWalker.prototype.walk = function (node) {
        var _this = this;
        if (node instanceof ir.Module) {
            this.delegate.walkModuleBegin(node);
            node.funcs.forEach(function (func) { return _this.walk(func); });
            this.delegate.walkModuleEnd(node);
        }
        else if (node instanceof ir.Func) {
            this.delegate.walkFuncBegin(node);
            node.blocks.forEach(function (block) { return _this.walk(block); });
            this.delegate.walkFuncEnd(node);
        }
        else if (node instanceof ir.BasicBlock) {
            this.delegate.walkBasicBlockBegin(node);
            node.values.forEach(function (value) { return _this.walk(value); });
            this.walk(node.terminal);
            this.delegate.walkBasicBlockEnd(node);
        }
        else if (node instanceof ir.Jump) {
            this.delegate.walkJumpBegin(node);
            this.delegate.walkJumpEnd(node);
        }
        else if (node instanceof ir.ConditionalJump) {
            this.delegate.walkConditionalJumpBegin(node);
            this.walk(node.condition);
            this.delegate.walkConditionalJumpEnd(node);
        }
        else if (node instanceof ir.ReturnVoid) {
            this.delegate.walkReturnVoidBegin(node);
            this.delegate.walkReturnVoidEnd(node);
        }
        else if (node instanceof ir.ReturnValue) {
            this.delegate.walkReturnValueBegin(node);
            this.walk(node.value);
            this.delegate.walkReturnValueEnd(node);
        }
        else if (node instanceof ir.Call) {
            this.delegate.walkCallBegin(node);
            node.args.forEach(function (arg) { return _this.walk(arg); });
            this.delegate.walkCallEnd(node);
        }
        else if (node instanceof ir.IntegerConstant) {
            this.delegate.walkIntegerConstantBegin(node);
            this.delegate.walkIntegerConstantEnd(node);
        }
        else if (node instanceof ir.Add) {
            this.delegate.walkAddBegin(node);
            this.walk(node.left);
            this.walk(node.right);
            this.delegate.walkAddEnd(node);
        }
        else if (node instanceof ir.Sub) {
            this.delegate.walkSubBegin(node);
            this.walk(node.left);
            this.walk(node.right);
            this.delegate.walkSubEnd(node);
        }
        else {
            throw new Error('IrWalkerError: Unknown type to walk: ' + Object.getPrototypeOf(node).constructor.name);
        }
    };
    return IrWalker;
})();
exports.IrWalker = IrWalker;
