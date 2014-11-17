import assert = require('assert');

import ast = require('../../main/ast');
import ir = require('../../main/ir');
import ast2ir = require('../../main/ast2ir');


describe('Ast to IR Operation', () => {

    var translator: ast2ir.AstTranslator;

    beforeEach(() => {
        translator = new ast2ir.AstTranslator();
    });

    it('#add(1, 2)', () => {
        var node = new ast.BuiltinExpression(
            ast.Builtin.ADD,
            [
                new ast.LiteralExpression('1'),
                new ast.LiteralExpression('2')
            ]
        );
        var irNode = <ir.Add> translator.translateBuiltinExpression(node);
        assert.ok(irNode instanceof ir.Add);
        assert.equal(1, (<ir.IntegerConstant> irNode.left).value);
        assert.equal(2, (<ir.IntegerConstant> irNode.right).value);
    });

    it('#add(7, 13)', () => {
        var node = new ast.BuiltinExpression(
            ast.Builtin.ADD,
            [
                new ast.LiteralExpression('7'),
                new ast.LiteralExpression('13')
            ]
        );
        var irNode = <ir.Add> translator.translateBuiltinExpression(node);
        assert.ok(irNode instanceof ir.Add);
        assert.equal(7, (<ir.IntegerConstant> irNode.left).value);
        assert.equal(13, (<ir.IntegerConstant> irNode.right).value);
    });

    it('#sub(7, 13)', () => {
        var node = new ast.BuiltinExpression(
            ast.Builtin.SUB,
            [
                new ast.LiteralExpression('7'),
                new ast.LiteralExpression('13')
            ]
        );
        var irNode = <ir.Sub> translator.translateBuiltinExpression(node);
        assert.ok(irNode instanceof ir.Sub);
        assert.equal(7, (<ir.IntegerConstant> irNode.left).value);
        assert.equal(13, (<ir.IntegerConstant> irNode.right).value);
    });
});
