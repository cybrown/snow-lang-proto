import assert = require('assert');

import parser = require('../../../main/parser/index');
import ast = require('../../../main/ast');

describe('Binary operators', () => {

    it ('1 + 2', () => {
        var binary = (<ast.BinaryExpression> (<ast.ExpressionStatement> parser.parse('1 + 2;').declarations[0]).expression);
        assert.equal(ast.BinaryExpression.prototype, Object.getPrototypeOf(binary));
        assert.ok(binary.left instanceof ast.LiteralExpression);
        assert.ok(binary.right instanceof ast.LiteralExpression);
        assert.strictEqual('1', (<ast.LiteralExpression> binary.left).raw);
        assert.strictEqual(ast.BinaryOperator.ADD, binary.operator);
        assert.strictEqual('2', (<ast.LiteralExpression> binary.right).raw);
    });

    it ('1 - 2', () => {
        var binary = (<ast.BinaryExpression> (<ast.ExpressionStatement> parser.parse('1 - 2;').declarations[0]).expression);
        assert.ok(binary instanceof ast.BinaryExpression);
        assert.ok(binary.left instanceof ast.LiteralExpression);
        assert.ok(binary.right instanceof ast.LiteralExpression);
        assert.strictEqual('1', (<ast.LiteralExpression> binary.left).raw);
        assert.strictEqual(ast.BinaryOperator.SUB, binary.operator);
        assert.strictEqual('2', (<ast.LiteralExpression> binary.right).raw);
    });

    it ('1 * 2', () => {
        var binary = (<ast.BinaryExpression> (<ast.ExpressionStatement> parser.parse('1 * 2;').declarations[0]).expression);
        assert.ok(binary instanceof ast.BinaryExpression);
        assert.ok(binary.left instanceof ast.LiteralExpression);
        assert.ok(binary.right instanceof ast.LiteralExpression);
        assert.strictEqual('1', (<ast.LiteralExpression> binary.left).raw);
        assert.strictEqual(ast.BinaryOperator.MUL, binary.operator);
        assert.strictEqual('2', (<ast.LiteralExpression> binary.right).raw);
    });

    it ('1 / 2', () => {
        var binary = (<ast.BinaryExpression> (<ast.ExpressionStatement> parser.parse('1 / 2;').declarations[0]).expression);
        assert.ok(binary instanceof ast.BinaryExpression);
        assert.ok(binary.left instanceof ast.LiteralExpression);
        assert.ok(binary.right instanceof ast.LiteralExpression);
        assert.strictEqual('1', (<ast.LiteralExpression> binary.left).raw);
        assert.strictEqual(ast.BinaryOperator.DIV, binary.operator);
        assert.strictEqual('2', (<ast.LiteralExpression> binary.right).raw);
    });

    it ('1 % 2', () => {
        var binary = (<ast.BinaryExpression> (<ast.ExpressionStatement> parser.parse('1 % 2;').declarations[0]).expression);
        assert.ok(binary instanceof ast.BinaryExpression);
        assert.ok(binary.left instanceof ast.LiteralExpression);
        assert.ok(binary.right instanceof ast.LiteralExpression);
        assert.strictEqual('1', (<ast.LiteralExpression> binary.left).raw);
        assert.strictEqual(ast.BinaryOperator.REM, binary.operator);
        assert.strictEqual('2', (<ast.LiteralExpression> binary.right).raw);
    });
});
