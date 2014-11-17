import assert = require('assert');

import parser = require('../../../main/parser/index');
import ast = require('../../../main/ast');

describe('Builtin', () => {

    it ('#add(1, 2)', () => {
        var builtin = (<ast.BuiltinExpression> (<ast.ExpressionStatement> parser.parse('#add(1, 2);').declarations[0]).expression);
        assert.ok(builtin instanceof ast.BuiltinExpression);
        assert.ok(builtin.args[0] instanceof ast.LiteralExpression);
        assert.ok(builtin.args[1] instanceof ast.LiteralExpression);
        assert.strictEqual(ast.Builtin.ADD, builtin.builtin);
        assert.strictEqual('1', (<ast.LiteralExpression> builtin.args[0]).raw);
        assert.strictEqual('2', (<ast.LiteralExpression> builtin.args[1]).raw);
    });
});
