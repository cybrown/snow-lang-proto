var assert = require('assert');
var parser = require('../../../main/parser/index');
var ast = require('../../../main/ast');
describe('Binary operators', function () {
    it('1 + 2', function () {
        var binary = parser.parse('1 + 2;').declarations[0].expression;
        assert.equal(ast.BinaryExpression.prototype, Object.getPrototypeOf(binary));
        assert.ok(binary.left instanceof ast.LiteralExpression);
        assert.ok(binary.right instanceof ast.LiteralExpression);
        assert.strictEqual('1', binary.left.raw);
        assert.strictEqual(0 /* ADD */, binary.operator);
        assert.strictEqual('2', binary.right.raw);
    });
    it('1 - 2', function () {
        var binary = parser.parse('1 - 2;').declarations[0].expression;
        assert.ok(binary instanceof ast.BinaryExpression);
        assert.ok(binary.left instanceof ast.LiteralExpression);
        assert.ok(binary.right instanceof ast.LiteralExpression);
        assert.strictEqual('1', binary.left.raw);
        assert.strictEqual(1 /* SUB */, binary.operator);
        assert.strictEqual('2', binary.right.raw);
    });
    it('1 * 2', function () {
        var binary = parser.parse('1 * 2;').declarations[0].expression;
        assert.ok(binary instanceof ast.BinaryExpression);
        assert.ok(binary.left instanceof ast.LiteralExpression);
        assert.ok(binary.right instanceof ast.LiteralExpression);
        assert.strictEqual('1', binary.left.raw);
        assert.strictEqual(2 /* MUL */, binary.operator);
        assert.strictEqual('2', binary.right.raw);
    });
    it('1 / 2', function () {
        var binary = parser.parse('1 / 2;').declarations[0].expression;
        assert.ok(binary instanceof ast.BinaryExpression);
        assert.ok(binary.left instanceof ast.LiteralExpression);
        assert.ok(binary.right instanceof ast.LiteralExpression);
        assert.strictEqual('1', binary.left.raw);
        assert.strictEqual(3 /* DIV */, binary.operator);
        assert.strictEqual('2', binary.right.raw);
    });
    it('1 % 2', function () {
        var binary = parser.parse('1 % 2;').declarations[0].expression;
        assert.ok(binary instanceof ast.BinaryExpression);
        assert.ok(binary.left instanceof ast.LiteralExpression);
        assert.ok(binary.right instanceof ast.LiteralExpression);
        assert.strictEqual('1', binary.left.raw);
        assert.strictEqual(4 /* REM */, binary.operator);
        assert.strictEqual('2', binary.right.raw);
    });
});
