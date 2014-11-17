var assert = require('assert');
var parser = require('../../../main/parser/index');
var ast = require('../../../main/ast');
describe('Call', function () {
    it('add(1, 2)', function () {
        var call = parser.parse('add(1, 2);').declarations[0].expression;
        assert.ok(call instanceof ast.CallExpression);
        assert.ok(call.callee instanceof ast.IdentifierExpression);
        assert.ok(call.args[0] instanceof ast.LiteralExpression);
        assert.ok(call.args[1] instanceof ast.LiteralExpression);
        assert.strictEqual('add', call.callee.name);
        assert.strictEqual('1', call.args[0].raw);
        assert.strictEqual('2', call.args[1].raw);
    });
});
