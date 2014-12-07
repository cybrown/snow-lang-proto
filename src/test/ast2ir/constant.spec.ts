import assert = require('assert');

import ast = require('../../main/ast');
import ir = require('../../main/ir');
import ast2ir = require('../../main/ast2ir');

describe('Ast to Constant', () => {

    var translator: ast2ir.AstTranslator;

    beforeEach(() => {
        translator = new ast2ir.AstTranslator();
    });

    it('1', () => {
        var constantAstNode = new ast.LiteralExpression('1');
        var constantIrNode = <ir.IntegerConstant> translator.translateLiteralExpression(constantAstNode);
        assert.equal(1, constantIrNode.value);
    });

    it('42', () => {
        var constantAstNode = new ast.LiteralExpression('42');
        var constantIrNode = <ir.IntegerConstant> translator.translateLiteralExpression(constantAstNode);
        assert.equal(42, constantIrNode.value);
    });
});
