var nodes = require('./ast');
var ir = require('./ir');
var types = require('./types');
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
        else if (node instanceof nodes.Program) {
            return this.translateProgram(node);
        }
        else if (node instanceof nodes.ExpressionStatement) {
            return this.translateExpressionStatement(node);
        }
        else if (node instanceof nodes.ReturnStatement) {
            return this.translateReturnStatement(node);
        }
        else {
            throw new Error('Ast node type not supported: ' + Object.getPrototypeOf(node).constructor.name);
        }
    };
    AstTranslator.prototype.translateProgram = function (node) {
        var _this = this;
        var mod = new ir.Module();
        var declarations = [];
        var blocks = [];
        node.declarations.forEach(function (decl) {
            if (decl instanceof nodes.Statement) {
                blocks.push(_this.translate(decl));
            }
            else if (decl instanceof nodes.Declaration) {
                declarations.push(_this.translate(decl));
            }
            else {
                throw new Error('Must be a declaration or a statement');
            }
        });
        var func = new ir.Func(mod, blocks, new types.Func([], types.Integer.INT32), 'main');
        mod.funcs = [func];
        return mod;
    };
    AstTranslator.prototype.translateExpressionStatement = function (node) {
        return this.translate(node.expression);
    };
    AstTranslator.prototype.translateReturnStatement = function (node) {
        var irNode;
        if (node.hasExpression) {
            var expr = this.translate(node.expression);
            irNode = new ir.ReturnValue(expr);
        }
        else {
            irNode = new ir.ReturnVoid();
        }
        return irNode;
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
