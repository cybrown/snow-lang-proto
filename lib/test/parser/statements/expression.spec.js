var assert = require('assert');
var parser = require('../../../main/parser/index');
var ast = require('../../../main/ast');
describe('Expression statement', function () {
    describe('Integer literals', function () {
        it('1', function () {
            var exprStm = parser.parse('1;').declarations[0];
            assert.ok(exprStm instanceof ast.ExpressionStatement);
            var expr = exprStm;
            assert.ok(expr instanceof ast.ExpressionStatement);
        });
    });
});
