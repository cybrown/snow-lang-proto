import nodes = require('./ast');
import ir = require('./ir');

export class AstTranslator {

    public translate (node: nodes.AstNode): ir.IrNode {
        if (node instanceof nodes.LiteralExpression) {
            return this.translateLiteralExpression(<nodes.LiteralExpression> node);
        } else if (node instanceof nodes.BuiltinExpression) {
            return this.translateBuiltinExpression(<nodes.BuiltinExpression> node);
        } else {
            throw new Error('Ast node type not supported');
        }
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
