var irWalker = require('./ir-walker');
var Typer = (function () {
    function Typer() {
    }
    Typer.prototype.type = function (node) {
        var walker = new irWalker.IrWalker(new TyperDelegate());
        walker.walk(node);
    };
    return Typer;
})();
exports.Typer = Typer;
var TyperDelegate = (function () {
    function TyperDelegate() {
    }
    TyperDelegate.prototype.walkModuleBegin = function (node) {
    };
    TyperDelegate.prototype.walkModuleEnd = function (node) {
    };
    TyperDelegate.prototype.walkFuncBegin = function (node) {
    };
    TyperDelegate.prototype.walkFuncEnd = function (node) {
    };
    TyperDelegate.prototype.walkBasicBlockBegin = function (node) {
    };
    TyperDelegate.prototype.walkBasicBlockEnd = function (node) {
    };
    TyperDelegate.prototype.walkJumpBegin = function (node) {
    };
    TyperDelegate.prototype.walkJumpEnd = function (node) {
    };
    TyperDelegate.prototype.walkConditionalJumpBegin = function (node) {
    };
    TyperDelegate.prototype.walkConditionalJumpEnd = function (node) {
    };
    TyperDelegate.prototype.walkReturnVoidBegin = function (node) {
    };
    TyperDelegate.prototype.walkReturnVoidEnd = function (node) {
    };
    TyperDelegate.prototype.walkReturnValueBegin = function (node) {
    };
    TyperDelegate.prototype.walkReturnValueEnd = function (node) {
    };
    TyperDelegate.prototype.walkCallBegin = function (node) {
    };
    TyperDelegate.prototype.walkCallEnd = function (node) {
    };
    TyperDelegate.prototype.walkIntegerConstantBegin = function (node) {
    };
    TyperDelegate.prototype.walkIntegerConstantEnd = function (node) {
    };
    TyperDelegate.prototype.walkAddBegin = function (node) {
    };
    TyperDelegate.prototype.walkAddEnd = function (node) {
        // TODO Verification
        node.type = node.left.type;
    };
    TyperDelegate.prototype.walkSubBegin = function (node) {
    };
    TyperDelegate.prototype.walkSubEnd = function (node) {
    };
    return TyperDelegate;
})();
