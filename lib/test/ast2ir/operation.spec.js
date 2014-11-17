var assert = require('assert');
var ast = require('../../main/ast');
var ir = require('../../main/ir');
var ast2ir = require('../../main/ast2ir');
describe('Ast to IR Operation', function () {
    var translator;
    beforeEach(function () {
        translator = new ast2ir.AstTranslator();
    });
    it('#add(1, 2)', function () {
        var node = new ast.BuiltinExpression(0 /* ADD */, [
            new ast.LiteralExpression('1'),
            new ast.LiteralExpression('2')
        ]);
        var irNode = translator.translateBuiltinExpression(node);
        assert.ok(irNode instanceof ir.Add);
        assert.equal(1, irNode.left.value);
        assert.equal(2, irNode.right.value);
    });
    it('#add(7, 13)', function () {
        var node = new ast.BuiltinExpression(0 /* ADD */, [
            new ast.LiteralExpression('7'),
            new ast.LiteralExpression('13')
        ]);
        var irNode = translator.translateBuiltinExpression(node);
        assert.ok(irNode instanceof ir.Add);
        assert.equal(7, irNode.left.value);
        assert.equal(13, irNode.right.value);
    });
    it('#sub(7, 13)', function () {
        var node = new ast.BuiltinExpression(1 /* SUB */, [
            new ast.LiteralExpression('7'),
            new ast.LiteralExpression('13')
        ]);
        var irNode = translator.translateBuiltinExpression(node);
        assert.ok(irNode instanceof ir.Sub);
        assert.equal(7, irNode.left.value);
        assert.equal(13, irNode.right.value);
    });
});
