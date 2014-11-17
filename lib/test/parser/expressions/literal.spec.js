var assert = require('assert');
var parser = require('../../../main/parser/index');
var ast = require('../../../main/ast');
describe('Literals', function () {
    describe('Integer literals', function () {
        it('1', function () {
            var exprStm = parser.parse('1;').declarations[0];
            assert.ok(exprStm instanceof ast.ExpressionStatement);
            var expr = exprStm.expression;
            assert.ok(expr instanceof ast.LiteralExpression);
            assert.strictEqual('1', expr.raw);
        });
        it('42', function () {
            var exprStm = parser.parse('42;').declarations[0];
            assert.ok(exprStm instanceof ast.ExpressionStatement);
            var expr = exprStm.expression;
            assert.ok(expr instanceof ast.LiteralExpression);
            assert.strictEqual('42', expr.raw);
        });
    });
    describe('Float literals', function () {
        it('3.14', function () {
            var exprStm = parser.parse('3.14;').declarations[0];
            assert.ok(exprStm instanceof ast.ExpressionStatement);
            var expr = exprStm.expression;
            assert.ok(expr instanceof ast.LiteralExpression);
            assert.strictEqual('3.14', expr.raw);
        });
    });
});
