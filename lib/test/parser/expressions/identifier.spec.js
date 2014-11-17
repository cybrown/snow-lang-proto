var assert = require('assert');
var parser = require('../../../main/parser/index');
var ast = require('../../../main/ast');
describe('Identifiers', function () {
    it('foo', function () {
        var expr = parser.parse('foo;').declarations[0].expression;
        assert.ok(expr instanceof ast.IdentifierExpression);
        assert.strictEqual('foo', expr.name);
    });
});
