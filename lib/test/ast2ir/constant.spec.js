var assert = require('assert');
var ast = require('../../main/ast');
var ast2ir = require('../../main/ast2ir');
describe('Ast to Constant', function () {
    var translator;
    beforeEach(function () {
        translator = new ast2ir.AstTranslator();
    });
    it('1', function () {
        var constantAstNode = new ast.LiteralExpression('1');
        var constantIrNode = translator.translateLiteralExpression(constantAstNode);
        assert.equal(1, constantIrNode.value);
    });
    it('42', function () {
        var constantAstNode = new ast.LiteralExpression('42');
        var constantIrNode = translator.translateLiteralExpression(constantAstNode);
        assert.equal(42, constantIrNode.value);
    });
});
