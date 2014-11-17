var assert = require('assert');
var parser = require('../../../main/parser/index');
var ast = require('../../../main/ast');
describe('Builtin', function () {
    it('#add(1, 2)', function () {
        var builtin = parser.parse('#add(1, 2);').declarations[0].expression;
        assert.ok(builtin instanceof ast.BuiltinExpression);
        assert.ok(builtin.args[0] instanceof ast.LiteralExpression);
        assert.ok(builtin.args[1] instanceof ast.LiteralExpression);
        assert.strictEqual(0 /* ADD */, builtin.builtin);
        assert.strictEqual('1', builtin.args[0].raw);
        assert.strictEqual('2', builtin.args[1].raw);
    });
});
