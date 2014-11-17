import assert = require('assert');

import parser = require('../../../main/parser/index');
import ast = require('../../../main/ast');

describe('Call', () => {

    it ('add(1, 2)', () => {
        var call = (<ast.CallExpression> (<ast.ExpressionStatement> parser.parse('add(1, 2);').declarations[0]).expression);
        assert.ok(call instanceof ast.CallExpression);
        assert.ok(call.callee instanceof ast.IdentifierExpression);
        assert.ok(call.args[0] instanceof ast.LiteralExpression);
        assert.ok(call.args[1] instanceof ast.LiteralExpression);
        assert.strictEqual('add', (<ast.IdentifierExpression> call.callee).name);
        assert.strictEqual('1', (<ast.LiteralExpression> call.args[0]).raw);
        assert.strictEqual('2', (<ast.LiteralExpression> call.args[1]).raw);
    });
});
