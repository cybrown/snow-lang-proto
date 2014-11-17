import assert = require('assert');

import parser = require('../../../main/parser/index');
import ast = require('../../../main/ast');

describe('Identifiers', () => {

    it ('foo', () => {
        var expr = (<ast.IdentifierExpression> (<ast.ExpressionStatement> parser.parse('foo;').declarations[0]).expression);
        assert.ok(expr instanceof ast.IdentifierExpression);
        assert.strictEqual('foo', expr.name);
    });
});
