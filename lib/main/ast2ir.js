var nodes = require('./ast');
var ir = require('./ir');
var AstTranslator = (function () {
    function AstTranslator() {
    }
    AstTranslator.prototype.translate = function (node) {
        if (node instanceof nodes.LiteralExpression) {
            return this.translateLiteralExpression(node);
        }
        else if (node instanceof nodes.BuiltinExpression) {
            return this.translateBuiltinExpression(node);
        }
        else {
            throw new Error('Ast node type not supported');
        }
    };
    AstTranslator.prototype.translateLiteralExpression = function (node) {
        var irnode = new ir.IntegerConstant(Number(node.raw));
        return irnode;
    };
    AstTranslator.prototype.translateBuiltinExpression = function (node) {
        var _this = this;
        var irArgs = node.args.map(function (astNode) { return _this.translate(astNode); });
        switch (node.builtin) {
            case 0 /* ADD */:
                return new ir.Add(irArgs[0], irArgs[1]);
            case 1 /* SUB */:
                return new ir.Sub(irArgs[0], irArgs[1]);
            default:
                throw new Error('Builtin not supported');
        }
    };
    return AstTranslator;
})();
exports.AstTranslator = AstTranslator;
