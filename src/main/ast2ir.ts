import nodes = require('./ast');
import ir = require('./ir');
import types = require('./types');

export class AstTranslator {

    public translate (node: nodes.AstNode): ir.IrNode {
        if (node instanceof nodes.LiteralExpression) {
            return this.translateLiteralExpression(<nodes.LiteralExpression> node);
        } else if (node instanceof nodes.BuiltinExpression) {
            return this.translateBuiltinExpression(<nodes.BuiltinExpression> node);
        } else if (node instanceof nodes.Program) {
            return this.translateProgram(<nodes.Program> node);
        } else if (node instanceof nodes.ExpressionStatement) {
            return this.translateExpressionStatement(<nodes.ExpressionStatement> node);
        } else if (node instanceof nodes.ReturnStatement) {
            return this.translateReturnStatement(<nodes.ReturnStatement> node);
        } else {
            throw new Error('Ast node type not supported: ' + Object.getPrototypeOf(node).constructor.name);
        }
    }

    public translateProgram (node: nodes.Program): ir.IrNode {
        var mod = new ir.Module();
        var declarations = [];
        var blocks: ir.BasicBlock[] = [];
        node.declarations.forEach(decl => {
            if (decl instanceof nodes.Statement) {
                blocks.push(this.translate(decl));
            } else if (decl instanceof nodes.Declaration) {
                declarations.push(this.translate(decl));
            } else {
                throw new Error('Must be a declaration or a statement');
            }
        });
        var func = new ir.Func(mod, blocks, new types.Func([], types.Integer.INT32), 'main');
        mod.funcs = [func];
        return mod;
    }

    public translateExpressionStatement (node: nodes.ExpressionStatement): ir.IrNode {
        return this.translate(node.expression);
    }

    public translateReturnStatement (node: nodes.ReturnStatement): ir.IrNode {
        var irNode: ir.IrNode;
        if (node.hasExpression) {
            var expr = <ir.ValueIrNode> this.translate(node.expression);
            irNode = new ir.ReturnValue(expr);
        } else {
            irNode = new ir.ReturnVoid();
        }
        return irNode;
    }

    public translateLiteralExpression (node: nodes.LiteralExpression): ir.IrNode {
        var irnode = new ir.IntegerConstant(Number(node.raw));
        return irnode;
    }

    public translateBuiltinExpression (node: nodes.BuiltinExpression): ir.IrNode {
        var irArgs = node.args.map(astNode => this.translate(astNode));
        switch (node.builtin) {
            case nodes.Builtin.ADD:
                return new ir.Add(irArgs[0], irArgs[1]);
            case nodes.Builtin.SUB:
                return new ir.Sub(irArgs[0], irArgs[1]);
            default:
                throw new Error('Builtin not supported');
        }
    }
}
